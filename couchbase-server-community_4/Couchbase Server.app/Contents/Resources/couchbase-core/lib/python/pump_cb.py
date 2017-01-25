#!/usr/bin/env python

import logging
import json
import time
import urllib

import couchbaseConstants
import pump
import pump_mc
import cluster_manager


class CBSink(pump_mc.MCSink):
    DDOC_HEAD = "_design/"

    """Smart client sink to couchbase cluster."""
    def __init__(self, opts, spec, source_bucket, source_node,
                 source_map, sink_map, ctl, cur):
        if spec.startswith("https://"):
            setattr(opts, "ssl", True)
        super(CBSink, self).__init__(opts, spec, source_bucket, source_node,
                                     source_map, sink_map, ctl, cur)

        self.rehash = opts.extra.get("rehash", 0)

    def add_start_event(self, conn):
        sasl_user = str(self.source_bucket.get("name", pump.get_username(self.opts.username)))
        event = {"timestamp": self.get_timestamp(),
                 "real_userid": {"source": "internal",
                                 "user": sasl_user,
                                },
                 "mode": getattr(self.opts, "mode", "diff"),
                 "source_bucket": self.source_bucket['name'],
                 "source_node": self.source_node['hostname'],
                 "target_bucket": self.sink_map['buckets'][0]['name']
                }
        if conn:
            try:
                conn.audit(couchbaseConstants.AUDIT_EVENT_RESTORE_SINK_START, json.dumps(event))
            except Exception, e:
                logging.warn("auditing error: %s" % e)
        return 0

    def add_stop_event(self, conn):
        sasl_user = str(self.source_bucket.get("name", pump.get_username(self.opts.username)))
        event = {"timestamp": self.get_timestamp(),
                 "real_userid": {"source": "internal",
                                 "user": sasl_user
                                },
                 "source_bucket": self.source_bucket['name'],
                 "source_node": self.source_node['hostname'],
                 "target_bucket": self.sink_map['buckets'][0]['name']
                }
        if conn:
            try:
                conn.audit(couchbaseConstants.AUDIT_EVENT_RESTORE_SINK_STOP, json.dumps(event))
            except Exception, e:
                logging.warn("auditing error: %s" % e)
        return 0

    def scatter_gather(self, mconns, batch):
        sink_map_buckets = self.sink_map['buckets']
        if len(sink_map_buckets) != 1:
            return "error: CBSink.run() expected 1 bucket in sink_map", None, None

        vbuckets_num = len(sink_map_buckets[0]['vBucketServerMap']['vBucketMap'])
        vbuckets = batch.group_by_vbucket_id(vbuckets_num, self.rehash)

        # Scatter or send phase.
        for vbucket_id, msgs in vbuckets.iteritems():
            rv, conn = self.find_conn(mconns, vbucket_id, msgs)
            if rv != 0:
                return rv, None, None
            rv = self.send_msgs(conn, msgs, self.operation(),
                                vbucket_id=vbucket_id)
            if rv != 0:
                return rv, None, None

        # Yield to let other threads do stuff while server's processing.
        time.sleep(0.01)

        retry_batch = None
        need_refresh = False

        # Gather or recv phase.
        for vbucket_id, msgs in vbuckets.iteritems():
            rv, conn = self.find_conn(mconns, vbucket_id, msgs)
            if rv != 0:
                return rv, None, None
            rv, retry, refresh = self.recv_msgs(conn, msgs, vbucket_id=vbucket_id)
            if rv != 0:
                return rv, None, None
            if retry:
                retry_batch = batch
            if refresh:
                need_refresh = True

        if need_refresh:
            self.refresh_sink_map()

        return 0, retry_batch, retry_batch and not need_refresh

    @staticmethod
    def can_handle(opts, spec):
        return (spec.startswith("http://") or
                spec.startswith("couchbase://") or
                spec.startswith("https://"))

    @staticmethod
    def check_source(opts, source_class, source_spec, sink_class, sink_spec):
        if (source_spec.startswith("http://") or
            source_spec.startswith("couchbase://")):
            return None
        return pump.Sink.check_source(opts, source_class, source_spec,
                                      sink_class, sink_spec)

    @staticmethod
    def check(opts, spec, source_map):
        rv, sink_map = pump.rest_couchbase(opts, spec)
        if rv != 0:
            return rv, None

        rv, source_bucket_name = pump.find_source_bucket_name(opts, source_map)
        if rv != 0:
            return rv, None
        rv, sink_bucket_name = pump.find_sink_bucket_name(opts, source_bucket_name)
        if rv != 0:
            return rv, None

        # Adjust sink_map['buckets'] to have only our sink_bucket.
        sink_buckets = [bucket for bucket in sink_map['buckets']
                        if bucket['name'] == sink_bucket_name]
        if not sink_buckets:
            return "error: missing bucket-destination: " + sink_bucket_name + \
                " at destination: " + spec + \
                "; perhaps your username/password is missing or incorrect", None
        if len(sink_buckets) != 1:
            return "error: multiple buckets with name: " + sink_bucket_name + \
                " at destination: " + spec, None
        sink_map['buckets'] = sink_buckets

        return 0, sink_map

    def refresh_sink_map(self):
        """Grab a new vbucket-server-map."""
        logging.warn("refreshing sink map: %s" % (self.spec))
        rv, new_sink_map = CBSink.check(self.opts, self.spec, self.source_map)
        if rv == 0:
            self.sink_map = new_sink_map
        return rv

    @staticmethod
    def consume_index(opts, sink_spec, sink_map,
                       source_bucket, source_map, source_design):
        if not source_design:
            return 0
        try:
            sd = json.loads(source_design)
            if not sd:
               return 0
        except ValueError, e:
            return "error: could not parse source design; exception: %s" % (e)

        err, index_server = pump.filter_server(opts, sink_spec, 'index')
        if err or not index_server:
            logging.error("could not find index server")
            return 0

        spec_parts = pump.parse_spec(opts, sink_spec, 8091)
        if not spec_parts:
            return "error: design sink no spec_parts: " + sink_spec
        host, port, user, pswd, path = spec_parts
        host,port = pump.hostport(index_server)
        sink_bucket = sink_map['buckets'][0]
        url = "/restoreIndexMetadata?bucket=%s" % sink_bucket['name']
        err, conn, response = \
            pump.rest_request(host, couchbaseConstants.INDEX_PORT, user, pswd, opts.ssl,
                              url, method='POST',
                              #body=urllib.urlencode(sd),
                              body=json.dumps(sd),
                              #headers=post_headers,
                              reason='restore index')
        logging.debug(response)
        return 0

    @staticmethod
    def consume_design(opts, sink_spec, sink_map,
                       source_bucket, source_map, source_design):
        if not source_design:
            return 0
        try:
            sd = json.loads(source_design)
        except ValueError, e:
            return "error: could not parse source design; exception: %s" % (e)
        if not sd:
            return 0

        if (not sink_map['buckets'] or
            len(sink_map['buckets']) != 1 or
            not sink_map['buckets'][0] or
            not sink_map['buckets'][0]['name']):
            return "error: design sink incorrect sink_map bucket"
        spec_parts = pump.parse_spec(opts, sink_spec, 8091)
        if not spec_parts:
            return "error: design sink no spec_parts: " + sink_spec
        sink_bucket = sink_map['buckets'][0]
        sink_nodes = pump.filter_bucket_nodes(sink_bucket, spec_parts) or \
            sink_bucket['nodes']
        if not sink_nodes:
            return "error: design sink nodes missing"
        couch_api_base = sink_nodes[0].get('couchApiBase')
        if not couch_api_base:
            return "error: cannot restore bucket design" \
                " on a couchbase cluster that does not support couch API;" \
                " the couchbase cluster may be an older, pre-2.0 version;" \
                " please check your cluster URL: " + sink_spec
        host, port, user, pswd, path = \
            pump.parse_spec(opts, couch_api_base, 8092)
        if user is None:
            user = spec_parts[2] # Default to the main REST user/pwsd.
            pswd = spec_parts[3]
        if type(sd) is dict:

            id = sd.get('_id', None)
            if id:
                err, conn, response = \
                    pump.rest_request(host, int(port), user, pswd, opts.ssl,
                                      path + "/" + id, method='PUT', body=source_design,
                                      reason="consume_design")
                if conn:
                    conn.close()
                if err:
                    return ("error: could not restore design doc id: %s" +
                            "; response: %s; err: %s") % (id, response, err)
            else:
                stmts = sd.get('statements', [])
                cm = cluster_manager.ClusterManager(spec_parts[0], spec_parts[1], user, pswd, opts.ssl)
                try:
                    for stmt in stmts:
                        result, errors = cm.n1ql_query(stmt['statement'], stmt.get('args', None))
                        if errors:
                            logging.error('N1QL query %s failed due to %s' % (stmt['statement'], errors))

                        if result and 'errors' in result:
                            for error in result['errors']:
                                logging.error('N1QL query %s failed due to error `%s`' % (stmt['statement'], error['msg']))
                except cluster_manager.ServiceNotAvailableException, e:
                    logging.error("Failed to restore indexes, cluster does not contain a" +
                                  " query node")
        elif type(sd) is list:
            for row in sd:
                logging.debug("design_doc row: " + str(row))

                doc = row.get('doc', None)
                if not doc:
                    stmt = row.get('statement', None)
                    if not stmt:
                        return "error: missing design doc or index statement in row: %s" % (row)
                    else:
                        #publish index
                        return 0

                if 'json' in doc and 'meta' in doc:
                    js = doc['json']
                    id = doc['meta'].get('id', None)
                    if not id:
                        return "error: missing id for design doc: %s" % (row)
                else:
                    # Handle design-doc from 2.0DP4.
                    js = doc
                    if '_rev' in js:
                        del js['_rev']
                    id = row.get('id', None)
                    if not id:
                        return "error: missing id for row: %s" % (row)

                js_doc = json.dumps(js)
                if id.startswith(CBSink.DDOC_HEAD):
                    id = CBSink.DDOC_HEAD + urllib.quote(id[len(CBSink.DDOC_HEAD):], '')
                else:
                    id = urllib.quote(id, '')
                logging.debug("design_doc: " + js_doc)
                logging.debug("design_doc id: " + id + " at: " + path + "/" + id)

                try:
                    err, conn, response = \
                        pump.rest_request(host, int(port), user, pswd, opts.ssl,
                                          path + "/" + id, method='PUT', body=js_doc,
                                          reason="consume_design")
                    if conn:
                        conn.close()
                    if err:
                        return ("error: could not restore design doc id: %s" +
                                "; response: %s; err: %s") % (id, response, err)
                except Exception, e:
                    return ("error: design sink exception: %s" +
                            "; couch_api_base: %s") % (e, couch_api_base)

                logging.debug("design_doc created at: " + path + "/" + id)

        return 0

    def find_conn(self, mconns, vbucket_id, msgs):
        bucket = self.sink_map['buckets'][0]

        vBucketMap = bucket['vBucketServerMap']['vBucketMap']
        serverList = bucket['vBucketServerMap']['serverList']

        if vbucket_id > len(vBucketMap):
            return "error: map missing vbucket_id: " + str(vbucket_id) + \
                "; perhaps your source does not have vbuckets" + \
                "; if so, try using moxi (HOST:11211) as a destination", None

        # Primary server for a vbucket_id is the 0'th entry.
        host_port = serverList[vBucketMap[vbucket_id][0]]

        conn = mconns.get(host_port, None)
        if not conn:
            host, port = pump.hostport(host_port, 11210)
            if self.opts.ssl:
                port = couchbaseConstants.SSL_PORT
            user = bucket['name']
            pswd = bucket['saslPassword']
            rv, conn = CBSink.connect_mc(host, port, user, pswd)
            if rv != 0:
                logging.error("error: CBSink.connect() for send: " + rv)
                return rv, None
            mconns[host_port] = conn

            #check if we need to calll hello command
            for i, msg in enumerate(msgs):
                msg_format_length = len(msg)
                if msg_format_length > 8:
                    try:
                        conn.hello()
                    except Exception, e:
                        logging.warn("fail to call hello command, maybe it is not supported")
                        pass
                break

            self.add_start_event(conn)
        return 0, conn

/**
   Copyright 2015 Couchbase, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 **/
function mnMockRouting() {
  this.hookParams = {};
  this.login = true;
}

mnMockRouting.fullReplyClass = function () {};
mnMockRouting.delayClass = function () {};

;(function () {
  function __create(p, a) {
    return _.extend((_.create || Object.create)(p.prototype), a);
  }

  function fullReply(status, data, headers) {
    return __create(mnMockRouting.fullReplyClass, {
      status: status,
      data: data || {},
      headers: headers || {}
    });
  }

  function e400(arg, extra, headers) {
    return fullReply((extra || {})['status'] || 400, arg, headers);
  }

  function delayBy(delay, response) {
    return __create(mnMockRouting.delayClass, {
      delay: delay,
      response: response
    });
  }

  mnMockRouting.e400 = e400;
  mnMockRouting.delayBy = delayBy;
  mnMockRouting.fullReply = fullReply;
})();

mnMockRouting.tsToISO = function(ts) {
  return JSON.parse(JSON.stringify(new Date(ts)));
}

mnMockRouting.r = {};

mnMockRouting.r.logs = {
  list: [{
    type: "info",
    code: 1,
    module: "ns_config_log",
    tstamp: 1265358398000,
    shortText: "message",
    text: "config changed",
    serverTime: mnMockRouting.tsToISO(1265358398000)
  }, {
    type: "info",
    code: 1,
    module: "ns_node_disco",
    tstamp: 1265358398000,
    shortText: "message",
    text: "otp cookie generated: bloeahcdnsddpotx",
    serverTime: mnMockRouting.tsToISO(1265358398000)
  }, {
    type: "info",
    code: 1,
    module: "ns_config_log",
    tstamp: 1265358398000,
    shortText: "message",
    text: "config changed",
    serverTime: mnMockRouting.tsToISO(1265358398000)
  }, {
    type: "info",
    code: 1,
    module: "ns_config_log",
    tstamp: 1265358399000,
    shortText: "message",
    text: "config changed",
    serverTime: mnMockRouting.tsToISO(1265358399000)
  }]
};

mnMockRouting.r.alerts = {
  limit: 15,
  settings: {
    updateURI: "/alerts/settings"
  },
  list: [{
    number: 3,
    type: "info",
    tstamp: 1259836260000,
    shortText: "Above Average Operations per Second",
    text: "Licensing, capacity, Couchbase issues, etc.",
    serverTime: mnMockRouting.tsToISO(1259836260000)
  }, {
    number: 2,
    type: "attention",
    tstamp: 1259836260000,
    shortText: "New Node Joined Pool",
    text: "A new node is now online",
    serverTime: mnMockRouting.tsToISO(1259836260000)
  }, {
    number: 1,
    type: "warning",
    tstamp: 1259836260000,
    shortText: "Server Node Down",
    text: "Server node is no longer available",
    serverTime: mnMockRouting.tsToISO(1259836260000)
  }]
};

mnMockRouting.r.settingsAdvanced = {
  alerts: {
    email: "alk@tut.by",
    sender: "alk@tut.by",
    email_server: {
      user: "",
      pass: "",
      addr: "",
      port: "",
      encrypt: "0"
    },
    sendAlerts: "0",
    alerts: {
      server_down: "1",
      server_unresponsive: "1",
      server_up: "1",
      server_joined: "1",
      server_left: "1",
      bucket_created: "0",
      bucket_deleted: "1",
      bucket_auth_failed: "1"
    }
  },
  ports: {
    proxyPort: 11213,
    directPort: 11212
  }
};

mnMockRouting.r.statsDirectory = {
  "blocks": [{
    "blockName": "Server Resources",
    "serverResources": true,
    "stats": [{
      "specificStatsURL": "/pools/default/buckets/default/stats/swap_used",
      "name": "swap_used",
      "title": "swap usage",
      "desc": "Amount of swap space in use on this server (B=bytes, M=megabytes, G=gigabytes)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/mem_actual_free",
      "name": "mem_actual_free",
      "title": "free RAM",
      "desc": "Amount of RAM available on this server (B=bytes, M=megabytes, G=gigabytes)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/cpu_utilization_rate",
      "name": "cpu_utilization_rate",
      "title": "CPU utilization %",
      "desc": "Percentage of CPU in use across all available cores on this server",
      "maxY": 100
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/curr_connections",
      "name": "curr_connections",
      "title": "connections",
      "desc": "Number of connections to this server including connections from external drivers, proxies, TAP requests and internal statistic gathering (measured from curr_connections)"
    }]
  }, {
    "blockName": "Summary",
    "stats": [{
      "specificStatsURL": "/pools/default/buckets/default/stats/ops",
      "title": "ops per second",
      "name": "ops",
      "desc": "Total amount of operations per second to this bucket (measured from cmd_get + cmd_set + incr_misses + incr_hits + decr_misses + decr_hits + delete_misses + delete_hits)",
      "default": true
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_cache_miss_rate",
      "title": "cache miss ratio",
      "name": "ep_cache_miss_rate",
      "desc": "Percentage of reads per second to this bucket from disk as opposed to RAM (measured from 100 - (gets - ep_bg_fetches) * 100 / gets)",
      "maxY": 100
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_ops_create",
      "title": "creates per sec.",
      "name": "ep_ops_create",
      "desc": "Number of new items created per second in this bucket (measured from vb_active_ops_create + vb_replica_ops_create + vb_pending_ops_create)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_ops_update",
      "title": "updates per sec.",
      "name": "ep_ops_update",
      "desc": "Number of existing items mutated per second in this bucket (measured from vb_active_ops_update + vb_replica_ops_update + vb_pending_ops_update)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_bg_fetched",
      "title": "disk reads per sec.",
      "name": "ep_bg_fetched",
      "desc": "Number of reads per second from disk for this bucket (measured from ep_bg_fetched)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tmp_oom_errors",
      "title": "temp OOM per sec.",
      "name": "ep_tmp_oom_errors",
      "desc": "Number of back-offs sent per second to drivers due to \"out of memory\" situations from this bucket (measured from ep_tmp_oom_errors)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/cmd_get",
      "title": "gets per sec.",
      "name": "cmd_get",
      "desc": "Number of reads (get operations) per second from this bucket (measured from cmd_get)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/cmd_set",
      "title": "sets per sec.",
      "name": "cmd_set",
      "desc": "Number of writes (set operations) per second to this bucket (measured from cmd_set)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/cas_hits",
      "title": "CAS ops per sec.",
      "name": "cas_hits",
      "desc": "Number of operations with a CAS id per second for this bucket (measured from cas_hits)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/delete_hits",
      "title": "deletes per sec.",
      "name": "delete_hits",
      "desc": "Number of delete operations per second for this bucket (measured from delete_hits)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/curr_items",
      "title": "items",
      "name": "curr_items",
      "desc": "Number of unique items in this bucket - only active items, not replica (measured from curr_items)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/disk_write_queue",
      "title": "disk write queue",
      "name": "disk_write_queue",
      "desc": "Number of items waiting to be written to disk in this bucket (measured from ep_queue_size+ep_flusher_todo)"
    }]
  }, {
    "blockName": "vBucket Resources",
    "extraCSSClasses": "dynamic_withtotal dynamic_closed",
    "columns": ["Active", "Replica", "Pending", "Total"],
    "stats": [{
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_num",
      "title": "vBuckets",
      "name": "vb_active_num",
      "desc": "Number of vBuckets in the \"active\" state for this bucket (measured from vb_active_num)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_num",
      "title": "vBuckets",
      "name": "vb_replica_num",
      "desc": "Number of vBuckets in the \"replica\" state for this bucket (measured from vb_replica_num)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_num",
      "title": "vBuckets",
      "name": "vb_pending_num",
      "desc": "Number of vBuckets in the \"pending\" state for this bucket and should be transient during rebalancing (measured from vb_pending_num)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_vb_total",
      "title": "vBuckets",
      "name": "ep_vb_total",
      "desc": "Total number of vBuckets for this bucket (measured from ep_vb_total)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/curr_items",
      "title": "items",
      "name": "curr_items",
      "desc": "Number of items in \"active\" vBuckets in this bucket (measured from curr_items)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_curr_items",
      "title": "items",
      "name": "vb_replica_curr_items",
      "desc": "Number of items in \"replica\" vBuckets in this bucket (measured from vb_replica_curr_items)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_curr_items",
      "title": "items",
      "name": "vb_pending_curr_items",
      "desc": "Number of items in \"pending\" vBuckets in this bucket and should be transient during rebalancing (measured from vb_pending_curr_items)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/curr_items_tot",
      "title": "items",
      "name": "curr_items_tot",
      "desc": "Total number of items in this bucket (measured from curr_items_tot)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_resident_items_ratio",
      "title": "resident %",
      "name": "vb_active_resident_items_ratio",
      "desc": "Percentage of active items cached in RAM in this bucket (measured from vb_active_resident_items_ratio)",
      "maxY": 100
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_resident_items_ratio",
      "title": "resident %",
      "name": "vb_replica_resident_items_ratio",
      "desc": "Percentage of replica items cached in RAM in this bucket (measured from vb_replica_resident_items_ratio)",
      "maxY": 100
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_resident_items_ratio",
      "title": "resident %",
      "name": "vb_pending_resident_items_ratio",
      "desc": "Percentage of replica items cached in RAM in this bucket (measured from vb_replica_resident_items_ratio)",
      "maxY": 100
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_resident_items_rate",
      "title": "resident %",
      "name": "ep_resident_items_rate",
      "desc": "Percentage of all items cached in RAM in this bucket (measured from ep_resident_items_rate)",
      "maxY": 100
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_ops_create",
      "title": "new items per sec.",
      "name": "vb_active_ops_create",
      "desc": "New items per second being inserted into \"active\" vBuckets in this bucket (measured from vb_active_ops_create)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_ops_create",
      "title": "new items per sec.",
      "name": "vb_replica_ops_create",
      "desc": "New items per second being inserted into \"replica\" vBuckets in this bucket (measured from vb_replica_ops_create"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_ops_create",
      "title": "new items per sec.",
      "name": "vb_pending_ops_create",
      "desc": "New items per second being instead into \"pending\" vBuckets in this bucket and should be transient during rebalancing (measured from vb_pending_ops_create)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_ops_create",
      "title": "new items per sec.",
      "name": "ep_ops_create",
      "desc": "Total number of new items being inserted into this bucket (measured from ep_ops_create)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_eject",
      "title": "ejections per sec.",
      "name": "vb_active_eject",
      "desc": "Number of items per second being ejected to disk from \"active\" vBuckets in this bucket (measured from vb_active_eject)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_eject",
      "title": "ejections per sec.",
      "name": "vb_replica_eject",
      "desc": "Number of items per second being ejected to disk from \"replica\" vBuckets in this bucket (measured from vb_replica_eject)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_eject",
      "title": "ejections per sec.",
      "name": "vb_pending_eject",
      "desc": "Number of items per second being ejected to disk from \"pending\" vBuckets in this bucket and should be transient during rebalancing (measured from vb_pending_eject)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_num_value_ejects",
      "title": "ejections per sec.",
      "name": "ep_num_value_ejects",
      "desc": "Total number of items per second being ejected to disk in this bucket (measured from ep_num_value_ejects)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_itm_memory",
      "title": "user data in RAM",
      "name": "vb_active_itm_memory",
      "desc": "Amount of active user data cached in RAM in this bucket (measured from vb_active_itm_memory)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_itm_memory",
      "title": "user data in RAM",
      "name": "vb_replica_itm_memory",
      "desc": "Amount of replica user data cached in RAM in this bucket (measured from vb_replica_itm_memory)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_itm_memory",
      "title": "user data in RAM",
      "name": "vb_pending_itm_memory",
      "desc": "Amount of pending user data cached in RAM in this bucket and should be transient during rebalancing (measured from vb_pending_itm_memory)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_kv_size",
      "title": "user data in RAM",
      "name": "ep_kv_size",
      "desc": "Total amount of user data cached in RAM in this bucket (measured from ep_kv_size)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_meta_data_memory",
      "title": "metadata in RAM",
      "name": "vb_active_meta_data_memory",
      "desc": "Amount of active item metadata consuming RAM in this bucket (measured from vb_active_meta_data_memory)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_meta_data_memory",
      "title": "metadata in RAM",
      "name": "vb_replica_meta_data_memory",
      "desc": "Amount of replica item metadata consuming in RAM in this bucket (measured from vb_replica_meta_memory)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_meta_data_memory",
      "title": "metadata in RAM",
      "name": "vb_pending_meta_data_memory",
      "desc": "Amount of pending item metadata consuming RAM in this bucket and should be transient during rebalancing (measured from vb_pending_meta_memory)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_meta_data_memory",
      "title": "metadata in RAM",
      "name": "ep_meta_data_memory",
      "desc": "Total amount of item  metadata consuming RAM in this bucket (measured from ep_meta_data_memory)"
    }]
  }, {
    "blockName": "Disk Queues",
    "extraCSSClasses": "dynamic_withtotal dynamic_closed",
    "columns": ["Active", "Replica", "Pending", "Total"],
    "stats": [{
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_queue_size",
      "title": "items",
      "name": "vb_active_queue_size",
      "desc": "Number of active items waiting to be written to disk in this bucket (measured from vb_active_queue_size)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_queue_size",
      "title": "items",
      "name": "vb_replica_queue_size",
      "desc": "Number of replica items waiting to be written to disk in this bucket (measured from vb_replica_queue_size)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_queue_size",
      "title": "items",
      "name": "vb_pending_queue_size",
      "desc": "Number of pending items waiting to be written to disk in this bucket and should be transient during rebalancing  (measured from vb_pending_queue_size)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_diskqueue_items",
      "title": "items",
      "name": "ep_diskqueue_items",
      "desc": "Total number of items waiting to be written to disk in this bucket (measured from ep_diskqueue_items)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_queue_fill",
      "title": "fill rate",
      "name": "vb_active_queue_fill",
      "desc": "Number of active items per second being put on the active item disk queue in this bucket (measured from vb_active_queue_fill)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_queue_fill",
      "title": "fill rate",
      "name": "vb_replica_queue_fill",
      "desc": "Number of replica items per second being put on the replica item disk queue in this bucket (measured from vb_replica_queue_fill)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_queue_fill",
      "title": "fill rate",
      "name": "vb_pending_queue_fill",
      "desc": "Number of pending items per second being put on the pending item disk queue in this bucket and should be transient during rebalancing (measured from vb_pending_queue_fill)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_diskqueue_fill",
      "title": "fill rate",
      "name": "ep_diskqueue_fill",
      "desc": "Total number of items per second being put on the disk queue in this bucket (measured from ep_diskqueue_fill)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_active_queue_drain",
      "title": "drain rate",
      "name": "vb_active_queue_drain",
      "desc": "Number of active items per second being written to disk in this bucket (measured from vb_pending_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_replica_queue_drain",
      "title": "drain rate",
      "name": "vb_replica_queue_drain",
      "desc": "Number of replica items per second being written to disk in this bucket (measured from vb_replica_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_pending_queue_drain",
      "title": "drain rate",
      "name": "vb_pending_queue_drain",
      "desc": "Number of pending items per second being written to disk in this bucket and should be transient during rebalancing (measured from vb_pending_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_diskqueue_drain",
      "title": "drain rate",
      "name": "ep_diskqueue_drain",
      "desc": "Total number of items per second being written to disk in this bucket (measured from ep_diskqueue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_avg_active_queue_age",
      "title": "average age",
      "name": "vb_avg_active_queue_age",
      "desc": "Average age in seconds of active items in the active item queue for this bucket (measured from vb_avg_active_queue_age)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_avg_replica_queue_age",
      "title": "average age",
      "name": "vb_avg_replica_queue_age",
      "desc": "Average age in seconds of replica items in the replica item queue for this bucket (measured from vb_avg_replica_queue_age)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_avg_pending_queue_age",
      "title": "average age",
      "name": "vb_avg_pending_queue_age",
      "desc": "Average age in seconds of pending items in the pending item queue for this bucket and should be transient during rebalancing (measured from vb_avg_pending_queue_age)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/vb_avg_total_queue_age",
      "title": "average age",
      "name": "vb_avg_total_queue_age",
      "desc": "Average age in seconds of all items in the disk write queue for this bucket (measured from vb_avg_total_queue_age)"
    }]
  }, {
    "blockName": "Tap Queues",
    "extraCSSClasses": "dynamic_withtotal dynamic_closed",
    "columns": ["Replication", "Rebalance", "Clients", "Total"],
    "stats": [{
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_replica_count",
      "title": "TAP senders",
      "name": "ep_tap_replica_count",
      "desc": "Number of internal replication TAP queues in this bucket (measured from ep_tap_replica_count)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_rebalance_count",
      "title": "TAP senders",
      "name": "ep_tap_rebalance_count",
      "desc": "Number of internal rebalancing TAP queues in this bucket (measured from ep_tap_rebalance_count)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_user_count",
      "title": "TAP senders",
      "name": "ep_tap_user_count",
      "desc": "Number of internal \"user\" TAP queues in this bucket (measured from ep_tap_user_count)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_total_count",
      "title": "TAP senders",
      "name": "ep_tap_total_count",
      "desc": "Total number of internal TAP queues in this bucket (measured from ep_tap_total_count)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_replica_qlen",
      "title": "items",
      "name": "ep_tap_replica_qlen",
      "desc": "Number of items in the replication TAP queues in this bucket (measured from ep_tap_replica_qlen)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_rebalance_qlen",
      "title": "items",
      "name": "ep_tap_rebalance_qlen",
      "desc": "Number of items in the rebalance TAP queues in this bucket (measured from ep_tap_rebalance_qlen)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_user_qlen",
      "title": "items",
      "name": "ep_tap_user_qlen",
      "desc": "Number of items in \"user\" TAP queues in this bucket (measured from ep_tap_user_qlen)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_total_qlen",
      "title": "items",
      "name": "ep_tap_total_qlen",
      "desc": "Total number of items in TAP queues in this bucket (measured from ep_tap_total_qlen)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_replica_queue_drain",
      "title": "drain rate",
      "name": "ep_tap_replica_queue_drain",
      "desc": "Number of items per second being sent over replication TAP connections to this bucket, i.e. removed from queue (measured from ep_tap_replica_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_rebalance_queue_drain",
      "title": "drain rate",
      "name": "ep_tap_rebalance_queue_drain",
      "desc": "Number of items per second being sent over rebalancing TAP connections to this bucket, i.e. removed from queue (measured from ep_tap_rebalance_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_user_queue_drain",
      "title": "drain rate",
      "name": "ep_tap_user_queue_drain",
      "desc": "Number of items per second being sent over \"user\" TAP connections to this bucket, i.e. removed from queue (measured from ep_tap_user_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_total_queue_drain",
      "title": "drain rate",
      "name": "ep_tap_total_queue_drain",
      "desc": "Total number of items per second being sent over TAP connections to this bucket (measured from ep_tap_total_queue_drain)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_replica_queue_backoff",
      "title": "back-off rate",
      "name": "ep_tap_replica_queue_backoff",
      "desc": "Number of back-offs received per second while sending data over replication TAP connections to this bucket (measured from ep_tap_replica_queue_backoff)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_rebalance_queue_backoff",
      "title": "back-off rate",
      "name": "ep_tap_rebalance_queue_backoff",
      "desc": "Number of back-offs received per second while sending data over rebalancing TAP connections to this bucket (measured from ep_tap_rebalance_queue_backoff)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_user_queue_backoff",
      "title": "back-off rate",
      "name": "ep_tap_user_queue_backoff",
      "desc": "Number of back-offs received per second while sending data over \"user\" TAP connections to this bucket (measured from ep_tap_user_queue_backoff)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_total_queue_backoff",
      "title": "back-off rate",
      "name": "ep_tap_total_queue_backoff",
      "desc": "Total number of back-offs received per second while sending data over TAP connections to this bucket (measured from ep_tap_total_queue_backoff)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_replica_queue_backfillremaining",
      "title": "backfill remaining",
      "name": "ep_tap_replica_queue_backfillremaining",
      "desc": "Number of items in the backfill queues of replication TAP connections for this bucket (measured from ep_tap_replica_queue_backfillremaining)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_rebalance_queue_backfillremaining",
      "title": "backfill remaining",
      "name": "ep_tap_rebalance_queue_backfillremaining",
      "desc": "Number of items in the backfill queues of rebalancing TAP connections to this bucket (measured from ep_tap_rebalance_queue_backfillreamining)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_user_queue_backfillremaining",
      "title": "backfill remaining",
      "name": "ep_tap_user_queue_backfillremaining",
      "desc": "Number of items in the backfill queues of \"user\" TAP connections to this bucket (measured from ep_tap_user_queue_backfillremaining)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_total_queue_backfillremaining",
      "title": "backfill remaining",
      "name": "ep_tap_total_queue_backfillremaining",
      "desc": "Total number of items in the backfill queues of TAP connections to this bucket (measured from ep_tap_total_queue_backfillremaining)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_replica_queue_itemondisk",
      "title": "remaining on disk",
      "name": "ep_tap_replica_queue_itemondisk",
      "desc": "Number of items still on disk to be loaded for replication TAP connections to this bucket (measured from ep_tap_replica_queue_itemondisk)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_rebalance_queue_itemondisk",
      "title": "remaining on disk",
      "name": "ep_tap_rebalance_queue_itemondisk",
      "desc": "Number of items still on disk to be loaded for rebalancing TAP connections to this bucket (measured from ep_tap_rebalance_queue_itemondisk)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_user_queue_itemondisk",
      "title": "remaining on disk",
      "name": "ep_tap_user_queue_itemondisk",
      "desc": "Number of items still on disk to be loaded for \"client\" TAP connections to this bucket (measured from ep_tap_user_queue_itemondisk)"
    }, {
      "specificStatsURL": "/pools/default/buckets/default/stats/ep_tap_total_queue_itemondisk",
      "title": "remaining on disk",
      "name": "ep_tap_total_queue_itemondisk",
      "desc": "Total number of items still on disk to be loaded for TAP connections to this bucket (measured from ep_tao_total_queue_itemonsidk)"
    }]
  }]
};

mnMockRouting.r.ddocsList = function (x) {
  return {
    "rows": [{
      "doc": {
        "meta": {
          "id": "_design/dev_test_one",
          "rev": "1-d731dd66"
        },
        "json": {
          "views": {
            "view name": {
              "map": "function (doc, meta) {\n  emit(meta.id, null);\n}"
            }
          }
        }
      },
      "controllers": {
        "compact": "/pools/default/buckets/" + x + "/ddocs/_design%2Fdev_test_one/controller/compactView",
        "setUpdateMinChanges": "/pools/default/buckets/" + x + "/ddocs/_design%2Fdev_test_one/controller/setUpdateMinChanges"
      }
    }, {
      "doc": {
        "meta": {
          "id": "_design/dev_a",
          "rev": "1-2f4bc47d"
        },
        "json": {
          "views": {}
        }
      },
      "controllers": {
        "compact": "/pools/default/buckets/default/ddocs/_design%2Fdev_a/controller/compactView",
        "setUpdateMinChanges": "/pools/default/buckets/default/ddocs/_design%2Fdev_a/controller/setUpdateMinChanges"
      }
    }, {
      "doc": {
        "meta": {
          "id": "_design/a",
          "rev": "1-2f4bc47d"
        },
        "json": {
          "views": {
            "view name": {
              "map": "function (doc, meta) {\n  emit(meta.id, null);\n}"
            }
          }
        }
      },
      "controllers": {
        "compact": "/pools/default/buckets/default/ddocs/_design%2Fdev_a/controller/compactView",
        "setUpdateMinChanges": "/pools/default/buckets/default/ddocs/_design%2Fdev_a/controller/setUpdateMinChanges"
      }
    }]
  };
};

mnMockRouting.r.overviewStats = {
  "timestamp": [1281667776000.0, 1281667780000.0, 1281667784000.0, 1281667788000.0, 1281667792000.0,
                1281667796000.0, 1281667800000.0, 1281667804000.0, 1281667809100.0, 1281667812000.0,
                1281667816000.0, 1281667820000.0, 1281667824000.0, 1281667828000.0, 1281667832000.0,
                1281667836000.0, 1281667840000.0, 1281667844000.0, 1281667848000.0, 1281667852000.0,
                1281667856000.0, 1281667860000.0, 1281667864000.0, 1281667868000.0, 1281667872000.0,
                1281667876000.0, 1281667880000.0, 1281667884000.0, 1281667888000.0, 1281667892000.0,
                1281667896000.0, 1281667900000.0, 1281667904000.0, 1281667908000.0, 1281667912000.0,
                1281667916000.0, 1281667920000.0, 1281667924000.0, 1281667928000.0, 1281667932000.0,
                1281667936000.0, 1281667940000.0, 1281667944000.0, 1281667948000.0, 1281667952000.0,
                1281667956000.0, 1281667960000.0, 1281667964000.0, 1281667968000.0, 1281667972000.0,
                1281667976000.0, 1281667980000.0, 1281667984000.0, 1281667988000.0, 1281667992000.0,
                1281667996000.0, 1.281668e+12, 1281668004000.0, 1281668008000.0, 1281668012000.0,
                1281668016000.0, 1281668020000.0, 1281668024000.0, 1281668028000.0, 1281668032000.0,
                1281668036000.0, 1281668040000.0, 1281668044000.0, 1281668048000.0, 1281668052000.0,
                1281668056000.0, 1281668060000.0, 1281668064000.0, 1281668068000.0, 1281668072000.0,
                1281668076000.0, 1281668091000.0, 1281668084000.0, 1281668088000.0, 1281668092000.0,
                1281668096000.0, 1281668100000.0, 1281668104000.0, 1281668108000.0, 1281668112000.0,
                1281668116000.0, 1281668120000.0, 1281668124000.0, 1281668128000.0, 1281668132000.0,
                1281668136000.0, 1281668140000.0, 1281668144000.0, 1281668148000.0, 1281668152000.0,
                1281668156000.0, 1281668160000.0, 1281668164000.0, 1281668168000.0, 1281668172000.0,
                1281668176000.0, 1281668180000.0, 1281668184000.0, 1281668188000.0, 1281668192000.0,
                1281668196000.0, 1281668200000.0, 1281668204000.0, 1281668208000.0, 1281668212000.0,
                1281668216000.0, 1281668220000.0, 1281668224000.0, 1281668228000.0, 1281668232000.0,
                1281668236000.0, 1281668240000.0, 1281668244000.0, 1281668248000.0, 1281668252000.0,
                1281668256000.0, 1281668260000.0, 1281668264000.0, 1281668268000.0, 1281668272000.0,
                1281668276000.0, 1281668280000.0, 1281668284000.0, 1281668288000.0, 1281668292000.0,
                1281668296000.0, 1281668300000.0, 1281668304000.0, 1281668308000.0, 1281668312000.0,
                1281668316000.0, 1281668320000.0, 1281668324000.0, 1281668328000.0, 1281668332000.0,
                1281668336000.0, 1281668340000.0, 1281668344000.0, 1281668348000.0, 1281668352000.0,
                1281668356000.0, 1281668360000.0, 1281668364000.0, 1281668368000.0, 1281668372000.0,
                1281668376000.0, 1281668380000.0, 1281668384000.0, 1281668388000.0, 1281668392000.0,
                1281668396000.0, 1281668400000.0, 1281668404000.0, 1281668408000.0, 1281668412000.0,
                1281668416000.0, 1281668420000.0, 1281668424000.0, 1281668428000.0, 1281668432000.0,
                1281668436000.0, 1281668440000.0, 1281668444000.0, 1281668448000.0, 1281668452000.0,
                1281668456000.0, 1281668460000.0, 1281668464000.0, 1281668468000.0, 1281668472000.0,
                1281668476000.0, 1281668480000.0, 1281668484000.0, 1281668488000.0, 1281668492000.0,
                1281668496000.0, 1281668500000.0, 1281668504000.0, 1281668508000.0, 1281668512000.0,
                1281668516000.0, 1281668520000.0, 1281668524000.0, 1281668528000.0, 1281668532000.0,
                1281668536000.0, 1281668540000.0, 1281668544000.0, 1281668548000.0, 1281668552000.0,
                1281668556000.0, 1281668560000.0, 1281668564000.0, 1281668568000.0, 1281668572000.0,
                1281668576000.0, 1281668580000.0, 1281668584000.0, 1281668588000.0, 1281668592000.0,
                1281668596000.0, 1281668600000.0, 1281668604000.0, 1281668608000.0, 1281668612000.0,
                1281668616000.0, 1281668620000.0, 1281668624000.0, 1281668628000.0, 1281668632000.0,
                1281668636000.0, 1281668640000.0, 1281668644000.0, 1281668648000.0, 1281668652000.0,
                1281668656000.0, 1281668660000.0, 1281668664000.0, 1281668668000.0, 1281668672000.0,
                1281668676000.0, 1281668680000.0, 1281668684000.0, 1281668688000.0, 1281668692000.0,
                1281668696000.0, 1281668700000.0, 1281668704000.0, 1281668708000.0, 1281668712000.0,
                1281668716000.0, 1281668720000.0, 1281668724000.0, 1281668728000.0, 1281668732000.0,
                1281668736000.0, 1281668740000.0, 1281668744000.0, 1281668748000.0, 1281668752000.0,
                1281668756000.0, 1281668760000.0, 1281668764000.0, 1281668768000.0, 1281668772000.0,
                1281668776000.0, 1281668780000.0, 1281668784000.0, 1281668788000.0, 1281668792000.0,
                1281668796000.0, 1281668800000.0, 1281668804000.0, 1281668809100.0, 1281668812000.0,
                1281668816000.0, 1281668820000.0, 1281668824000.0, 1281668828000.0, 1281668832000.0,
                1281668836000.0, 1281668840000.0, 1281668844000.0, 1281668848000.0, 1281668852000.0,
                1281668856000.0, 1281668860000.0, 1281668864000.0, 1281668868000.0, 1281668872000.0,
                1281668876000.0, 1281668880000.0, 1281668884000.0, 1281668888000.0, 1281668892000.0,
                1281668896000.0, 1281668900000.0, 1281668904000.0, 1281668908000.0, 1281668912000.0,
                1281668916000.0, 1281668920000.0, 1281668924000.0, 1281668928000.0, 1281668932000.0,
                1281668936000.0, 1281668940000.0, 1281668944000.0, 1281668948000.0, 1281668952000.0,
                1281668956000.0, 1281668960000.0, 1281668964000.0, 1281668968000.0, 1281668972000.0,
                1281668976000.0, 1281668980000.0, 1281668984000.0, 1281668988000.0, 1281668992000.0
               ],
  "ops": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2607.5, 9020.0,
          9854.25, 9710.5, 8918.75, 9594.75, 8892.25, 9434.75, 6967.25, 3639.0, 9177.5, 9377.75, 9011.25,
          9519.0, 9223.5, 1474.5, 7498.5, 8855.0, 9326.0, 9154.5, 8642.0, 5101.5, 8223.5, 9365.0, 9382.0,
          8912.5, 8975.75, 5141.25, 5978.5, 9366.0, 8729.25, 9159.0, 8897.0, 7870.25, 3584.75, 8533.5,
          8677.75, 8836.0, 8885.75, 9119.5, 3759.0, 8833.25, 9235.25, 8318.75, 8637.0, 8976.25, 4603.25,
          8219.25, 8751.5, 9161.25, 8839.25, 8876.25, 6152.5, 5223.75, 9226.5, 9223.75, 8431.5, 9095.75,
          8554.25, 3864.5, 9203.25, 8962.25, 8850.25, 8731.5, 9253.5, 2675.0, 9208.75, 8651.75, 8958.75,
          8933.25, 8400.75, 4551.0, 6564.5, 8662.75, 8657.5, 8600.5, 9229.75, 8285.0, 5497.5, 8542.0, 9196.75,
          8838.0, 8805.25, 8741.0, 3923.75, 9271.25, 8916.25, 9351.25, 9078.75, 8897.25, 2241.5, 8890.5, 8607.0,
          8596.25, 8435.75, 8671.75, 5498.25, 7683.5, 8346.25, 9087.25, 9102.5, 7829.25, 7951.25, 5585.75,
          8435.5, 9001.25, 8609.5, 8536.25, 8901.25, 4348.25, 8974.25, 9055.0, 9155.25, 9091.75, 8643.0,
          2927.5, 8781.0, 9307.75, 9121.25, 8985.75, 9093.25, 3446.5, 8158.25, 8935.75, 8025.5, 8921.0,
          9183.25, 6776.25, 5491.25, 8852.25, 8514.75, 8944.25, 8591.0, 8656.25, 4389.75, 8868.5, 8933.5,
          8726.25, 8529.0, 8509.75, 4243.25, 8847.5, 8535.5, 8988.0, 8977.5, 8698.5, 4703.25, 7823.75,
          8614.0, 9149.25, 8647.0, 8827.75, 6938.25, 5126.75, 8301.0, 8555.25, 8338.5, 8132.5, 7734.25, 7414.75,
          8530.75, 8274.25, 7758.25, 7860.0, 8174.25, 6468.0, 7481.0, 7969.25, 7764.75, 7741.0, 7914.0, 7798.25,
          2663.25, 5062.75, 8624.0, 8028.25, 7736.25, 7854.5, 7438.5, 5255.75, 48.0, 6522.0, 7001.0, 7395.75,
          7438.0, 6927.75, 7679.0, 6988.5, 3196.25, 8477.5, 8109.5, 8637.0, 8067.75, 7672.75, 5839.25, 239.25,
          7365.5, 6984.75, 7577.0, 6840.5, 7509.25, 6461.75, 7022.0, 801.5, 7687.5, 8098.5, 7434.25, 7997.75, 7649.5,
          8449.5, 3099.5, 8252.75, 8485.75, 8341.75, 8545.5, 8138.5, 7017.75, 4279.75, 8176.75, 7353.75, 8477.0,
          7935.75, 8380.75, 5396.25, 2635.0, 7837.75, 8505.0, 8109.5, 8591.0, 8218.75, 7315.25, 8358.25, 8457.25,
          8379.25, 8091.75, 8337.75, 7163.5, 6448.5, 7495.0, 7386.75, 7522.75, 8416.75, 8004.25, 4726.0, 464.5,
          6259.25, 6514.0, 6658.25, 5956.5, 6643.25, 7106.25, 6884.25, 3513.75, 4060.25, 7883.75, 7754.0, 7629.75,
          8199.25, 8085.75, 6387.25, 947.0, 7891.25, 8236.25, 8317.25, 8401.25, 8291.5, 7915.5, 7297.0, 8308.75,
          8717.0, 8071.0, 7919.0, 8393.25, 6234.75, 8740.5, 8073.75, 8237.75, 8824.5, 8586.25, 5796.25, 9188.5,
          8442.75, 8501.25, 8275.75, 8754.25, 4835.5, 8464.5, 9132.25, 7576.25, 8036.25, 7586.5
         ],
  "ep_bg_fetched": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
};

mnMockRouting.r.nodeInfo = {
  "availableStorage": {
    "hdd": [{
      "path": "/",
      "sizeKBytes": 42288960,
      "usagePercent": 35
    }, {
      "path": "/dev",
      "sizeKBytes": 3014292,
      "usagePercent": 1
    }, {
      "path": "/run",
      "sizeKBytes": 1209244,
      "usagePercent": 1
    }, {
      "path": "/run/lock",
      "sizeKBytes": 5120,
      "usagePercent": 0
    }, {
      "path": "/run/shm",
      "sizeKBytes": 3023104,
      "usagePercent": 1
    }, {
      "path": "/home",
      "sizeKBytes": 259326248,
      "usagePercent": 17
    }]
  },
  "memoryQuota": 3542,
  "storageTotals": {
    "ram": {
      "total": 6191316992,
      "quotaTotal": 3714056192,
      "quotaUsed": 0,
      "quotaTotalPerNode": 3714056192 / 5,
      "quotaUsedPerNode": 0,
      "used": 3929251840,
      "usedByData": 0
    },
    "hdd": {
      "total": 265550077952,
      "quotaTotal": 265550077952,
      "used": 45143513251,
      "usedByData": 0,
      "free": 220406564701
    }
  },
  "storage": {
    "ssd": [],
    "hdd": [{
      "path": "/home/pavel/projects/couchbase-rel-2.2.0/ns_server/data/n_0/data",
      "index_path": "/home/pavel/projects/couchbase-rel-2.2.0/ns_server/data/n_0/data",
      "quotaMb": "none",
      "state": "ok"
    }]
  },
  "systemStats": {
    "cpu_utilization_rate": 11.6751269035533,
    "swap_total": 6291451904,
    "swap_used": 0,
    "mem_total": 6191316992,
    "mem_free": 3679035392
  },
  "interestingStats": {},
  "uptime": "4370",
  "memoryTotal": 6191316992,
  "memoryFree": 3679035392,
  "mcdMemoryReserved": 4723,
  "mcdMemoryAllocated": 4723,
  "couchApiBase": "http://127.0.0.1:9500/",
  "otpCookie": "owqsknzuatijcqxe",
  "clusterMembership": "active",
  "group": "Group 3",
  "status": "healthy",
  "otpNode": "n_0@127.0.0.1",
  "thisNode": true,
  "hostname": "127.0.0.1:9000",
  "recoveryType": "none",
  "clusterCompatibility": 196608,
  "version": "3.0.0r-460-g364b167",
  "os": "x86_64-pc-linux-gnu",
  "ports": {
    "proxy": 12001,
    "direct": 12000
  }
};

_.extend(mnMockRouting.prototype, {
  // borrowed from MIT-licensed prototype.js http://www.prototypejs.org/
  functionArgumentNames: function (f) {
    var names = f.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },
  deserializeQueryString: function (dataString) {
    return _.reduce(dataString.split('&'), function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!_.isArray(hash[key]))
            hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    }, {});
  },
  getResponse: function (method, path, query) {
    var length = this.routes.length;
    var i;
    var action;
    var xPresent;
    for (i = 0; i < length; i++) {
      var xValue;
      xPresent = false;
      var rt = this.routes[i];
      if (rt[0][0] != method) {
        continue;
      }
      var pattern = rt[0][1];
      if (pattern.length != path.length) {
        continue;
      }
      var j;
      for (j = 0; j < pattern.length; j++) {
        var patItem = pattern[j];
        if (patItem === this.routes.x) {
          xValue = patItem;
          xPresent = true;
        } else if (patItem !== path[j]) {
          break;
        }
      }
      if (j < pattern.length) {
        continue;
      }
      var protoReq = {
        path: path,
        pattern: pattern,
        query: query
      };
      if (xPresent) {
        protoReq.x = xValue;
      }
      return this.wrapAction(protoReq, rt[1]);
    }
  },
  runAction: function (action, req) {
    if (!_.isFunction(action)) {
      return action;
    }
    return action.call(this, req);
  },
  wrapAction: function(protoReq, action) {
    var self = this;
    return function (data, headers) {
      var req = _.clone(protoReq);
      req.data = data;
      if (_.isString(req.data)) {
        req.data = self.deserializeQueryString(data || "");
      }
      req.headers = headers;

      var rv = self.runAction(action, req);

      var delay = 0;
      if (rv instanceof mnMockRouting.delayClass) {
        delay = rv.delay;
        rv = rv.response;
      }
      if (rv instanceof mnMockRouting.fullReplyClass) {
        return [delay, rv.status, rv.data, rv.headers];
      }
      return [delay, 200, rv, {}];
    };
  },
  __defineRoutes: function () {
    var x = {}

    function mkHTTPMethod(method) {
      return function () {
        return [method, _.toArray(arguments)];
      }
    }

    var get = mkHTTPMethod("GET");
    var post = mkHTTPMethod("POST");
    var del = mkHTTPMethod("DELETE");
    var put = mkHTTPMethod("PUT");

    function method(name) {
      return function () {
        return this[name].apply(this, arguments);
      }
    }

    // for optional params
    function opt(name) {
      name = new String(name);
      name.__opt = true;
      return name;
    }

    function expectParams() {
      var expectedParams = _.toArray(arguments);

      var chainedRoute = expectedParams[0];
      if (!_.isString(chainedRoute))
        expectedParams.shift();
      else
        chainedRoute = null;

      var mustParams = [],
        optionalParams = [];
      _.each(expectedParams, function (p) {
        if (p.__opt)
          optionalParams.push(p.valueOf());
        else
          mustParams.push(p);
      });

      var difference = function (a, b) {
        return _.reject(a, function (e) {
          return _.include(b, e);
        });
      }

      var expectParamsFn = function (req) {
        var params = req.data;
        var keys = _.keys(params);

        var missingParams = difference(mustParams, keys);
        if (missingParams.length) {
          var msg = "Missing required parameter(s): " + missingParams.join(', ') + '\nHave: ' + keys.join(',');
          alert("hooks.js: " + msg);
          throw new Error(msg);
        }

        var unexpectedParams = difference(difference(keys, mustParams), optionalParams);
        if (unexpectedParams.length) {
          var msg = "Post has unexpected parameter(s): " + unexpectedParams.join(', ');
          alert("hooks.js: " + msg);
          throw new Error(msg);
        }

        return this.runAction(chainedRoute, req);
      }

      return expectParamsFn;
    }

    var rv = [
      [get("sampleBuckets"), [{
        installed: false,
        name: "beer-sample",
        quotaNeeded: 104857600
      }, {
        installed: true,
        name: "gamesim-sample",
        quotaNeeded: 104857600
      }]],
      [post("settings", "readOnlyUser"), function () {
        return mnMockRouting.e400({"errors":{"username":"Username must not be empty","password":"The password must be at least six characters."}});
      }],
      [del("settings", "readOnlyUser"), function () {
        this.readOnlyAdminName = null;
        return {};
      }],
      [get("pools", "default", "certificate"), "CERT"],
      [get("pools", "default", "serverGroups"), function () {
        var allNodes =  _.clone(this.allNodes);
        var groups = [{addNodeURI: "pools/default/serverGroups/0/addNode", name: "Group 1 (default)", uri: "/pools/default/serverGroups/0", nodes: [allNodes[0], allNodes[1]]},
                      {addNodeURI: "pools/default/serverGroups/232/addNode", name: "Group 2", uri: "/pools/default/serverGroups/232", nodes: [allNodes[3], allNodes[2]]},
                      {addNodeURI: "pools/default/serverGroups/343/addNode", name: "Group 3", uri: "/pools/default/serverGroups/343", nodes: [allNodes[4]]},
                      {addNodeURI: "pools/default/serverGroups/443/addNode", name: "Group 4", uri: "/pools/default/serverGroups/443", nodes: []}];

        return {groups: groups, uri: "/pools/default/serverGroups?rev=3"};
      }],
      [put("pools", "default", "serverGroups"), function () {
        return mnMockRouting.e400({"error": "revision mismatch"}, {status: 409});
      }],
      [post("pools", "default", "serverGroups"), function () {
        return mnMockRouting.e400({"name": "Name already exist"}, {status: 400});
      }],
      [put("pools", "default", "serverGroups", x), function () {
        return mnMockRouting.e400({"name": "Name already exist"}, {status: 400});
      }],
      [del("pools", "default", "serverGroups", x), function () {
        return {};
      }],
      [get("settings", "autoCompaction"), {
        "autoCompactionSettings": {
          "parallelDBAndViewCompaction": false,
          "databaseFragmentationThreshold": {
            "percentage": 30,
            "size": "undefined"
          },
          "viewFragmentationThreshold": {
            "percentage": 30,
            "size": "undefined"
          }
        },
        "purgeInterval": 3
      }],
      [get("settings", "readOnlyAdminName"), function () {
        return this.readOnlyAdminName || mnMockRouting.e400("Requested resource not found.", {
          status: 404
        });
      }],
      [get("settings", "replications"), {}],
      [post("uilogin"), expectParams(method("handleLogin"), "user", "password")],
      [post("uilogout"), method("handleLogout")],
      [get("internalSettings"), {
        "indexAwareRebalanceDisabled": true,
        "rebalanceIndexWaitingDisabled": false,
        "rebalanceIndexPausingDisabled": true
      }],
      [post("internalSettings"), method('doNothingPOST')],
      [post("logClientError"), method('doNothingPOST')],
      [get("logs"), mnMockRouting.r.logs],
      [get("alerts"), mnMockRouting.r.alerts],
      [get("settings", "web"), {
        port: 8091,
        username: "admin",
        password: ""
      }],
      [get("settings", "advanced"), mnMockRouting.r.settingsAdvanced],
      [get("settings", "stats"), {
        sendStats: false
      }],
      [get("internalSettings", "visual"), function () {
        return this.clusterVisualSettings;
      }],
      [post("internalSettings", "visual"), expectParams(function (req) {
        var len = req.data.windowOutlineHex.length;
        if (len === 0 || len === 3 || len === 6) {
          this.clusterVisualSettings = data;
          return {
            "errors": null
          };
        }
        return mnMockRouting.e400({"errors": {"windowOutlineHex": "Acceptable format is RRGGBB or RGB"}});
      }, opt("tabName"), opt("windowOutlineHex"), opt("memoryQuota"))],
      [post("settings", "autoFailover"), {
        "responseText": JSON.stringify({"errors": {"timeout": "The value of \"timeout\" must be a positive integer in a range from 30 to 3600"}})
      }],
      [get("settings", "autoFailover"), {
        "enabled": false,
        "timeout": 30,
        "count": 0
      }],
      [post("settings", "alerts"), {
        "responseText": JSON.stringify({
          "errors": {
            "email_port":"emailPort must be a positive integer less than 65536.","sender":"sender must be a valid email address."
          }
        })
      }],
      [get("settings", "alerts"), {
        "recipients": ["root@localhost"],
        "sender": "membase@localhost",
        "enabled": true,
        "emailServer": {
          "user": "",
          "pass": "",
          "host": "localhost",
          "port": 25,
          "encrypt": false
        },
        "alerts": ["auto_failover_node", "auto_failover_maximum_reached", "auto_failover_other_nodes_down", "auto_failover_cluster_too_small", "auto_failover_disabled"]
      }],
      [get("pools"),
        function () {
          return this.pools(this);
        }
      ],
      [get("pools", x),
        function (req) {
          var rv = this.poolDetails();
          if (req.query.indexOf("etag") >= 0) {
            return mnMockRouting.delayBy(20000, rv);
          }
          return rv;
        }
      ],
      [get("nodeStatuses"), function () {
        return this.nodeStatuses();
      }],
      [get("pools", "default", "tasks"), function () {
        return _.map(this.tasks.tasks(), function (task) {
          return _.clone(task);
        })
      }],
      [get("pools", "default", "buckets"), function () {
        return this.bucketsList();
      }],
      [get("pools", "default", "buckets", x), function (req) {
        return this.bucketDetails(req.path);
      }],
      [get("pools", "default", "buckets", x, "ddocs"), mnMockRouting.r.ddocsList],
      [get("pools", "default", "buckets", x, "statsDirectory"), mnMockRouting.r.statsDirectory],
      [get("pools", "default", "buckets", x, "stats"), method('handleStats')],
      [get("pools", "default", "buckets", x, "nodes"), {
        servers: [{
          "hostname": "ns_1@127.0.0.1",
          "uri": "/pools/default/buckets/default/nodes/ns_1@127.0.0.1",
          "stats": {
            "uri": "/pools/default/buckets/default/nodes/ns_1%40127.0.0.1/stats"
          }
        }]
      }],
      [get("pools", "default", "buckets", x, "nodes", x), {
        hostname: "ns_1@127.0.0.1",
        stats: {
          uri: '/pools/default/buckets/4/nodes/ns_1@127.0.0.1/stats'
        }
      }],
      [get("pools", "default", "buckets", x, "nodes", x, "stats"), {
        server: "ns_1@127.0.0.1",
        op: {
          samples: {
            timestamp: [1281667776000.0, 1281667780000.0, 1281667784000.0, 1281667788000.0,
              1281667796000.0, 1281667800000.0, 1281667804000.0, 1281667809100.0
            ],
            "hit_ratio": [0, 0, 0, 0, 0, 0, 100.0, 100.0],
            "ep_cache_hit_rate": [0, 0, 0, 0, 0, 0, 100.0, 100.0],
            "ep_resident_items_rate": [12.283674058456635, 12.283674058456635, 12.283674058456635, 12.283674058456635, 12.283674058456635, 12.283674058456635, 12.283674058456635]
          },
          samplesCount: 60,
          isPersistent: true,
          lastTStamp: 0,
          interval: 1000
        }
      }],
      [get("pools", "default", "remoteClusters"), [{
        name: "kyiv",
        uri: "/pools/default/remoteClusters/kyiv",
        validateURI: "/pools/default/remoteClusters/kyiv?just_validate=1",
        hostname: "kyiv-mb01.yyy.com",
        username: "yaraslau-the-wise"
      }, {
        name: "london",
        uri: "/pools/default/remoteClusters/london",
        validateURI: "/pools/default/remoteClusters/london?just_validate=1",
        hostname: "london-mb04.yyy.com:80",
        username: "victoria"
      }]],
      [del("pools", "default", "remoteClusters", x), method('doNothingPOST')],
      [post("pools", "default", "remoteClusters", x), method('doNothingPOST')],
      [post("pools", "default", "remoteClusters"), method('doNothingPOST')],
      [get("pools", "default", "overviewStats"), mnMockRouting.r.overviewStats],
      [post("pools", "default"), method('handlePoolsDefaultPost')],
      [post("pools", "default", "buckets"), method('handleBucketsPost')],
      [post("pools", "default", "buckets", x), method('handleBucketsPost')],
      [post("pools", "default", "buckets", x, "controller", "doFlush"), method('doNothingPOST')],
      [del("pools", "default", "buckets", x), method('handleBucketRemoval')],
      [get("pools", "default", "buckets", x, "localRandomKey"), function () {
        return mnMockRouting.e400({
          "ok": false,
          "error": "fallback_to_all_docs"
        }, {status: 404});
      }],
      [get("nodes", x), mnMockRouting.r.nodeInfo],
      [post("nodes", x, "controller", "settings"), expectParams(function (req) {
        var data = req.data;
        if (data.memoryQuota && data.memoryQuota != 'unlimited' && !(/^[0-9]+$/.exec(data.memoryQuota))) {
          mnMockRouting.e400(["invalid memory quota", "second message"]);
        }
      }, opt("memoryQuota"), opt("path"), opt('db_path'), opt('index_path'))], //missing

      [post("node", "controller", "doJoinCluster"), expectParams(method('handleJoinCluster'),
        "clusterMemberHostIp", "clusterMemberPort",
        "user", "password")],
      [post("node", "controller", "rename"), function () {}],
      [post("controller", "createReplication"),
        function (req) {
          return this.handleCreateReplication(req.data);
        }
      ],
      [post("controller", "setAutoCompaction"), function () {
        return mnMockRouting.e400({"errors":{"databaseFragmentationThreshold[percentage]":"database fragmentation must be an integer","allowedTimePeriod[fromHour]":"from hour must be an integer","allowedTimePeriod[toHour]":"to hour must be an integer","allowedTimePeriod[fromMinute]":"from minute must be an integer","allowedTimePeriod[toMinute]":"to minute must be an integer","databaseFragmentationThreshold[size]":"database fragmentation size is too small. Allowed range is 1 - infinity","viewFragmentationThreshold[size]":"view fragmentation size is too small. Allowed range is 1 - infinity","purgeInterval":"metadata purge interval is too small. Allowed range is 1 - 60"}});
      }],
      [post("controller", "ejectNode"), expectParams(method('doNothingPOST'), "otpNode")],

      // params are otpNodes of nodes to be kept/ejected
      [post("controller", "rebalance"), expectParams(function () {
        this.runRebalance();
      }, "knownNodes", "ejectedNodes")],
      [post("controller", "stopRebalance"), method("doNothingPOST")],

      [post("controller", "addNode"), expectParams(method("doNothingPOST"), "hostname", "user", "password")],
      [post("poosl", "default", "serverGroups", x, "addNode"), expectParams(method("doNothingPOST"), "hostname", "user", "password")],
      [post("controller", "failOver"), expectParams(method("doNothingPOST"), "otpNode")],
      [post("controller", "startGracefulFailover"), function () {
        this.runRebalance("gracefulFailOver");
      }],
      [post("controller", "setRecoveryType"), expectParams(method("doNothingPOST"), "otpNode", "recoveryType")],
      [post("settings", "web"), expectParams(method("doNothingPOST"), "port", "username", "password")],
      [post("settings", "stats"), function () {}],
      [post("settings", "replications", x), function () {
        return mnMockRouting.e400({
          "workerBatchSize":"The value must be an integer between 500 and 10000",
          "checkpointInterval":"The value must be an integer between 60 and 14400",
          "maxConcurrentReps":"The value must be an integer between 2 and 256"
        });
      }],
      [get("settings", "replications", x), {
          checkpointInterval: "1800a",
          docBatchSizeKb: "2048a",
          failureRestartInterval: "30a",
          maxConcurrentReps: 32,
          optimisticReplicationThreshold: 256,
          workerBatchSize: 500
      }],
      [get("pools", "default", "buckets", x, "docs"), method("handleAllDocs")],
      [get("couchBase", x, "_design", x), function () {
        var data = this.handleAllDocs();
        var headers = {
          "X-Couchbase-Meta": JSON.stringify({"id":"3","rev":"1-000003dd0d54cfa20000000000000000","expiration":0,"flags":0,"type":"json"})
        };
        return mnMockRouting.fullReply(200, data, headers);
      }],
      [get("pools", "default", "buckets", x, "docs", x), function () {
        var meta = {"id":"3","rev":"1-000003dd0d54cfa20000000000000000","expiration":0,"flags":0,"type":"json"};
        var body = this.handleAnyDoc();
        return {meta: meta, json: body};
      }]
    ];

    rv.x = x;
    if (Object.freeze) {
      Object.freeze(rv);
      _.each(mnMockRouting.r, function (v) {
        Object.freeze(v);
      });
    }
    return rv;
  },

  handleLogin: function (req) {
    var params = req.data;
    if (params["user"] == "Administrator" && params["password"] == "asdasd") {
      this.login = true;
      return "";
    } else {
      return mnMockRouting.e400({});
    }
  },
  handleLogout: function () {
    this.login = false;
    return "";
  },
  handleStats: function (req) {
    var params = req['data'];
    var zoom = params['zoom'] || 'minute'
    var samplesSelection = [
      [3, 14, 23, 52, 45, 25, 23, 22, 50, 67, 59, 55, 54, 41, 36, 35, 26, 61, 72, 49, 60, 52, 45, 25, 23, 22, 50, 67, 59, 55, 14, 23, 52, 45, 25, 23, 22, 50, 67, 59, 55, 54, 41, 36, 35, 26, 61, 72, 49, 60, 52, 45, 25, 23, 22, 50, 67, 59, 55],
      [23, 14, 45, 64, 41, 45, 43, 25, 14, 11, 18, 36, 64, 76, 86, 86, 79, 78, 55, 59, 49, 52, 45, 25, 23, 22, 50, 67, 59, 55, 14, 45, 64, 41, 45, 43, 25, 14, 11, 18, 36, 64, 76, 86, 86, 79, 78, 55, 59, 49, 52, 45, 25, 23, 22, 50, 67, 59, 55],
      [42, 65, 42, 63, 81, 87, 74, 84, 56, 44, 71, 64, 49, 48, 55, 46, 37, 46, 64, 33, 18, 52, 45, 25, 23, 22, 50, 67, 59, 55, 65, 42, 63, 81, 87, 74, 84, 56, 44, 71, 64, 49, 48, 55, 46, 37, 46, 64, 33, 18, 52, 45, 25, 23, 22, 50, 67, 59, 55],
      [61, 65, 64, 75, 77, 57, 68, 76, 64, 61, 66, 63, 68, 37, 32, 60, 72, 54, 43, 41, 55, 52, 45, 25, 23, 22, 50, 67, 59, 55, 65, 64, 75, 77, 57, 68, 76, 64, 61, 66, 63, 68, 37, 32, 60, 72, 54, 43, 41, 55, 52, 45, 25, 23, 22, 50, 67, 59, 55]
    ];
    var samples = {};
    var statsDirectory = mnMockRouting.r.statsDirectory;
    var allStatsInfos = [].concat.apply([], _.pluck(statsDirectory.blocks, 'stats'));

    _.each(allStatsInfos, function (info, idx) {
      var si = (idx + zoom.charCodeAt(0)) % 4;
      var data = samplesSelection[si];
      if (info.maxY) {
        data = _.clone(data);
      } else {
        data = _.map(data, function (v) {return v * 1E9;});
      }
      samples[info.name] = data;
    });
    var samplesSize = samplesSelection[0].length;

    var samplesInterval = 1000;

    switch (zoom) {
    case 'minute':
      break;
    case 'hour':
      samplesInterval = 60000;
      break;
    default:
      samplesInterval = 1440000;
    }

    var now = (new Date()).valueOf();
    var lastSampleTstamp = Math.floor(now / 1000) * 1000;

    var lastSampleT = params['haveTStamp'];
    if (lastSampleT) {
      lastSampleT = parseInt(lastSampleT, 10);
    }
    var delayReply = false;
    if (samplesInterval == 1000) {
      var rotates = ((now / 1000) >> 0) % samplesSize;

      if (lastSampleT === lastSampleTstamp) {
        lastSampleTstamp += 1000;
        rotates += 1;
        delayReply = true;
      }

      var newSamples = {};
      for (var k in samples) {
        var data = samples[k];
        newSamples[k] = data.concat(data).slice(rotates, rotates + samplesSize);
      }
      samples = newSamples;
    }

    samples.timestamp = _.map(_.range(samplesSelection[0].length).reverse(), function (i) {
      return lastSampleTstamp - i * samplesInterval;
    });

    if (lastSampleT) {
      var index = _.lastIndexOf(samples.timestamp, lastSampleT);
      if (index == samples.timestamp.length - 1) {
        throw new Error();
      }
      if (index >= 0) {
        for (var statName in samples) {
          samples[statName] = samples[statName].slice(index);
        }
      }
    }

    if (zoom == 'month') {
      for (var key in samples) {
        samples[key] = [];
      }
    }

    var rv = {
      hot_keys: [{
        name: "user:image:value",
        ops: 10000,
        evictions: 10,
        ratio: 0.89,
        bucket: "Excerciser application"
      }, {
        name: "user:image:value2",
        ops: 10000,
        ratio: 0.90,
        evictions: 11,
        bucket: "Excerciser application"
      }, {
        name: "user:image:value3",
        ops: 10000,
        ratio: 0.91,
        evictions: 12,
        bucket: "Excerciser application"
      }, {
        name: "user:image:value4",
        ops: 10000,
        ratio: 0.92,
        evictions: 13,
        bucket: "Excerciser application"
      }],
      op: {
        isPersistent: true,
        lastTStamp: samples.timestamp.slice(-1)[0],
        interval: samplesInterval,
        samplesCount: 60,
        samples: samples
      }
    };

    if (delayReply) {
      return mnMockRouting.delayBy(1000, rv);
    }
    return rv;
  },
  handlePoolsDefaultPost: function (req) {
    var params = req.data;
    var errors = {};

    if (isBlank(params['memoryQuota'])) {
      errors.memoryQuota = 'must have a memory quota';
    }

    if (_.keys(errors).length) {
      return mnMockRouting.e400(errors);
    }

    return "";
  },

  handleJoinCluster: function (req) {
    var params = req.data;
    console.log("params: ", params);
    var ok = true;

    _.each(('clusterMemberHostIp clusterMemberPort user password').split(' '), function (name) {
      if (!params[name] || !params[name].length) {
        ok = false;
      }
    });

    if (ok) {
      return "";
    } else
      return mnMockRouting.e400(['error1', 'error2']);
  },

  doNothingPOST: function () {},

  setRebalanceStatus: function (status) {
    this.basePoolDetails.rebalanceStatus = status;
  },
  runRebalance: function (rebalanceType) {
    if (this.hookParams['rebalanceMismatch']) {
      return mnMockRouting.e400({
        mismatch: 1
      });
    }

    this.tasks.enableGracefulRebalance(rebalanceType === "gracefulFailOver");

    var percent = 0.001;
    var rebalanceRunning = this.tasks.getTask("rebalanceRunning");

    var intervalID = setInterval(function () {
      rebalanceRunning.progress += percent;
      rebalanceRunning.perNode["n_1@127.0.0.1"].progress += percent;
      rebalanceRunning.perNode["n_2@127.0.0.1"].progress += percent;
    }, 50);

    this.setRebalanceStatus('running');
    this.tasks.toggle(["rebalanceNotRunning", "rebalanceRunning"]);

    _.delay(function () {
      console.log("rebalance delay hit!");

      clearInterval(intervalID);

      this.setRebalanceStatus('none');
      this.tasks.toggle(["rebalanceNotRunning", "rebalanceRunning"]);
    }, 80000);
  },
  clusterVisualSettings: {
    tabName: "",
    windowOutlineHex: ""
  },
  tasks: (function () {
    var currentTasks = {
      rebalanceNotRunning: true,
      xdcrRunning: true,
      warmup1: true,
      warmup2: true,
      warmup3: true,
      warmup4: true,
      warmup5: true,
      warmup6: true,
      warmup7: true
    };

    var setTask = function (task) {
      currentTasks[task] = !currentTasks[task];
    };

    var warmupTask = function (bucket, node, state) {
      return {
        "bucket": bucket,
        "node": node,
        "recommendedRefreshPeriod": 2,
        "stats": {
          "ep_warmup_estimated_key_count": "1048382",
          "ep_warmup_estimated_value_count": "1048382",
          "ep_warmup_key_count": "12345",
          "ep_warmup_state": state,
          "ep_warmup_value_count": "17097"
        },
        "status": "running",
        "type": "warming_up"
      };
    };

    var knownTasks = {
      rebalanceNotRunning: {
        "type": "rebalance",
        "status": "notRunning"
      },
      rebalanceRunning: {
        "type": "rebalance",
        "recommendedRefreshPeriod": 0.25,
        "status": "running",
        "progress": 3.776041666666669,
        "perNode": {
          "n_1@127.0.0.1": {
            "progress": 5.6640625
          },
          "n_2@127.0.0.1": {
            "progress": 1.888020833333337
          }
        },
        "detailedProgress": {
          "bucket": "default",
          "bucketNumber": 1,
          "bucketsCount": 1,
          "perNode": {
            "n_1@127.0.0.1": {
              "ingoing": {
                "docsTotal": 1024,
                "docsTransferred": 64,
                "activeVBucketsLeft": 483,
                "replicaVBucketsLeft": 512
              },
              "outgoing": {
                "docsTotal": 0,
                "docsTransferred": 0,
                "activeVBucketsLeft": 0,
                "replicaVBucketsLeft": 0
              }
            },
            "n_2@127.0.0.1": {
              "ingoing": {
                "docsTotal": 0,
                "docsTransferred": 0,
                "activeVBucketsLeft": 0,
                "replicaVBucketsLeft": 483
              },
              "outgoing": {
                "docsTotal": 1024,
                "docsTransferred": 64,
                "activeVBucketsLeft": 483,
                "replicaVBucketsLeft": 0
              }
            }
          }
        }
      },
      xdcrRunning: {
        cancelURI: "/controller/cancelXDCR/0086ba3eea4e5412a7e5d4d8224157be%2Fdefault%2Fdefault",
        changesLeft: 0,
        continuous: true,
        docsChecked: 0,
        docsWritten: 0,
        errors: [],
        id: "0086ba3eea4e5412a7e5d4d8224157be/default/default",
        maxVBReps: 16,
        recommendedRefreshPeriod: 10,
        replicationType: "xmem",
        settingsURI: "/settings/replications/0086ba3eea4e5412a7e5d4d8224157be%2Fdefault%2Fdefault",
        source: "default",
        status: "running",
        target: "/remoteClusters/0086ba3eea4e5412a7e5d4d8224157be/buckets/default",
        type: "xdcr"
      },
      replicationRunning: {
        "cancelURI": "/controller/cancelXDCR/5a863c7488c147d2f08c1209b9f1650f%2Fdefault%2Fdefault",
        "settingsURI": "/settings/replications/5a863c7488c147d2f08c1209b9f1650f%2Fdefault%2Fdefault",
        "status": "running",
        "replicationType": "xmem",
        "id": "5a863c7488c147d2f08c1209b9f1650f/default/default",
        "source": "default",
        "target": "/remoteClusters/5a863c7488c147d2f08c1209b9f1650f/buckets/default",
        "continuous": true,
        "type": "xdcr",
        "recommendedRefreshPeriod": 10.0,
        "changesLeft": 0,
        "docsChecked": 1,
        "docsWritten": 1
      },
      warmup1: warmupTask("default", "n_4@127.0.0.1", "loading keys"),
      warmup2: warmupTask("default", "n_1@127.0.0.1", "loading data"),
      warmup3: warmupTask("default", "n_2@127.0.0.1", "some other status"),
      warmup4: warmupTask("default", "n_3@127.0.0.1", "whatever"),
      warmup5: warmupTask("default1", "n_1@127.0.0.1", "loading keys"),
      warmup6: warmupTask("default2", "n_1@127.0.0.1", "loading data"),
      warmup7: warmupTask("default3", "n_1@127.0.0.1", "loading data")
    };

    return {
      enableGracefulRebalance: function (enableDisable) {
        knownTasks.rebalanceRunning.subtype = enableDisable ? "gracefulFailover" : "rebalance";
      },
      toggle: function (task) {
        if (_.isArray(task) && task.length) {
          _.each(task, setTask);
        }
        if (_.isString(task)) {
          setTask(task)
        }
      },
      tasks: function () {
        var rv = [];
        var i;

        for (i in currentTasks) {
          if (currentTasks[i]) {
            rv.push(knownTasks[i]);
          }
        }

        return rv;
      },
      toggleWarmups: function () {
        var self = this;
        _.range(1, 8).each(function (i) {
          self.toggle("warmup" + i);
        });
      },
      getTask: function (task) {
        return knownTasks[task];
      }
    }
  })(),
  readOnlyAdminName: "read_only_admin_name",
  allNodes: [{
    "systemStats": {
      "cpu_utilization_rate": 42.5,
      "swap_total": 3221225472,
      "swap_used": 2969329664,
      "mem_total": 3121225472,
      "mem_free": 1221225472
    },
    "interestingStats": {
      "cmd_get": 0.0,
      "couch_docs_actual_disk_size": 8449574,
      "couch_docs_data_size": 8435712,
      "couch_views_actual_disk_size": 0,
      "couch_views_data_size": 0,
      "curr_items": 0,
      "curr_items_tot": 0,
      "ep_bg_fetched": 0.0,
      "get_hits": 0.0,
      "mem_used": 27347928,
      "ops": 0.0,
      "vb_replica_curr_items": 0
    },
    "uptime": "810",
    "memoryTotal": 2032574464,
    "memoryFree": 1589864960,
    "mcdMemoryReserved": 4723,
    "mcdMemoryAllocated": 4723,
    "couchApiBase": "/couchBase/",
    "clusterMembership": "inactiveAdded",
    "status": "healthy",
    "otpNode": "n_0@127.0.0.1",
    "thisNode": true,
    "hostname": "127.0.0.1:9000",
    "recoveryType": "full",
    "clusterCompatibility": 196608,
    "version": "only-web.rb",
    "os": "x86_64-pc-linux-gnu",
    "ports": {
      "proxy": 12001,
      "direct": 12000
    },
    "services": ["kv"]
  },
  {
    "systemStats": {
      "cpu_utilization_rate": 20,
      "swap_total": 2547232212,
      "swap_used": 1296642969,
      "mem_total": 6191321088,
      "mem_free": 3639218176
    },
    "interestingStats": {
      "cmd_get": 0.0,
      "couch_docs_actual_disk_size": 8449574,
      "couch_docs_data_size": 8435712,
      "couch_views_actual_disk_size": 0,
      "couch_views_data_size": 0,
      "curr_items": 0,
      "curr_items_tot": 0,
      "ep_bg_fetched": 0.0,
      "get_hits": 0.0,
      "mem_used": 27347928,
      "ops": 0.0,
      "vb_replica_curr_items": 0
    },
    "uptime": "810",
    "memoryTotal": 2032574464,
    "memoryFree": 89864960,
    "mcdMemoryReserved": 4723,
    "mcdMemoryAllocated": 4723,
    "couchApiBase": "/couchBase/",
    "clusterMembership": "inactiveFailed",
    "status": "healthy",
    "otpNode": "n_1@127.0.0.1",
    "thisNode": true,
    "hostname": "127.0.0.1:9001",
    "recoveryType": "none",
    "clusterCompatibility": 196608,
    "version": "only-web.rb",
    "os": "x86_64-pc-linux-gnu",
    "ports": {
      "proxy": 12001,
      "direct": 12000
    },
    "services": ["kv", "n1ql", "moxi"]
  },{
    "systemStats": {
      "cpu_utilization_rate": 20,
      "swap_total": 2521247232,
      "swap_used": 1296329669,
      "mem_total": 6191321088,
      "mem_free": 3639218176
    },
    "interestingStats": {
      "cmd_get": 0.0,
      "couch_docs_actual_disk_size": 8449574,
      "couch_docs_data_size": 8435712,
      "couch_views_actual_disk_size": 0,
      "couch_views_data_size": 0,
      "curr_items": 0,
      "curr_items_tot": 0,
      "ep_bg_fetched": 0.0,
      "get_hits": 0.0,
      "mem_used": 27347928,
      "ops": 0.0,
      "vb_replica_curr_items": 0
    },
    "uptime": "810",
    "memoryTotal": 2032574464,
    "memoryFree": 89864960,
    "mcdMemoryReserved": 4723,
    "mcdMemoryAllocated": 4723,
    "couchApiBase": "/couchBase/",
    "clusterMembership": "inactiveFailed",
    "isDeltaRecoveryPossible": true,
    "status": "healthy",
    "otpNode": "n_2@127.0.0.1",
    "thisNode": true,
    "hostname": "127.0.0.1:9002",
    "recoveryType": "none",
    "clusterCompatibility": 196608,
    "version": "only-web.rb",
    "os": "x86_64-pc-linux-gnu",
    "ports": {
      "proxy": 12001,
      "direct": 12000
    },
    "services": ["kv"]
  },{
    "systemStats": {
      "cpu_utilization_rate": 20,
      "swap_total": 2521247232,
      "swap_used": 1296329669,
      "mem_total": 6191321088,
      "mem_free": 3639218176
    },
    "interestingStats": {
      "cmd_get": 0.0,
      "couch_docs_actual_disk_size": 8449574,
      "couch_docs_data_size": 8435712,
      "couch_views_actual_disk_size": 0,
      "couch_views_data_size": 0,
      "curr_items": 0,
      "curr_items_tot": 0,
      "ep_bg_fetched": 0.0,
      "get_hits": 0.0,
      "mem_used": 27347928,
      "ops": 0.0,
      "vb_replica_curr_items": 0
    },
    "uptime": "810",
    "memoryTotal": 2032574464,
    "memoryFree": 89864960,
    "mcdMemoryReserved": 4723,
    "mcdMemoryAllocated": 4723,
    "couchApiBase": "/couchBase/",
    "clusterMembership": "active",
    "status": "healthy",
    "otpNode": "n_3@127.0.0.1",
    "thisNode": true,
    "hostname": "127.0.0.1:9003",
    "recoveryType": "none",
    "clusterCompatibility": 196608,
    "version": "only-web.rb",
    "os": "x86_64-pc-linux-gnu",
    "ports": {
      "proxy": 12001,
      "direct": 12000
    },
    "services": ["kv", "n1ql"]
  },{
    "systemStats": {
      "cpu_utilization_rate": 14.136125654450261,
      "swap_total": 6291451904,
      "swap_used": 0,
      "mem_total": 6191321088,
      "mem_free": 3639218176
    },
    "interestingStats": {
      "cmd_get": 0.0,
      "couch_docs_actual_disk_size": 8449574,
      "couch_docs_data_size": 8435712,
      "couch_views_actual_disk_size": 0,
      "couch_views_data_size": 0,
      "curr_items": 0,
      "curr_items_tot": 0,
      "ep_bg_fetched": 0.0,
      "get_hits": 0.0,
      "mem_used": 27347928,
      "ops": 0.0,
      "vb_replica_curr_items": 0
    },
    "uptime": "810",
    "memoryTotal": 6191321088,
    "memoryFree": 3639218176,
    "mcdMemoryReserved": 4723,
    "mcdMemoryAllocated": 4723,
    "couchApiBase": "/couchBase/",
    "clusterMembership": "inactiveFailed",
    "status": "unhealthy",
    "otpNode": "n_4@127.0.0.1",
    "thisNode": true,
    "hostname": "127.0.0.1:9004",
    "recoveryType": "none",
    "clusterCompatibility": 196608,
    "version": "only-web.rb",
    "os": "x86_64-pc-linux-gnu",
    "ports": {
      "proxy": 12001,
      "direct": 12000
    },
    "services": ["kv", "n1ql", "moxi"]
  }],
  basePoolDetails: {
    "etag": "83993131",
    "storageTotals": {
      "ram": {
        "total": 6191321088,
        "quotaTotal": 314572800,
        "quotaUsed": 214572800,
        "quotaTotalPerNode": 314572800 / 5,
        "quotaUsedPerNode": 214572800 / 5,
        "used": 4421844992,
        "usedByData": 27347928
      },
      "hdd": {
        "total": 265550077952,
        "quotaTotal": 265550077952,
        "used": 45143513251,
        "usedByData": 27353372,
        "free": 220406564701
      }
    },
    "balanced": false,
    "failoverWarnings": ["hardNodesNeeded"],
    "name": "default",
    "alerts": [],
    "alertsSilenceURL": "/controller/resetAlerts?token=0",
    "serverGroupsUri": "/pools/default/serverGroups?v=a",
    "nodes": [{
      "systemStats": {
        "cpu_utilization_rate": 9.137055837563452,
        "swap_total": 6291451904,
        "swap_used": 0,
        "mem_total": 6191321088,
        "mem_free": 3484368896
      },
      "interestingStats": {
        "cmd_get": 0.0,
        "couch_docs_actual_disk_size": 27340295,
        "couch_docs_data_size": 27310080,
        "couch_views_actual_disk_size": 13077,
        "couch_views_data_size": 13077,
        "curr_items": 0,
        "curr_items_tot": 0,
        "ep_bg_fetched": 0.0,
        "get_hits": 0.0,
        "mem_used": 27347928,
        "ops": 0.0,
        "vb_replica_curr_items": 0
      },
      "uptime": "1768",
      "memoryTotal": 6191321088,
      "memoryFree": 3484368896,
      "mcdMemoryReserved": 4723,
      "mcdMemoryAllocated": 4723,
      "couchApiBase": "/couchBase/",
      "clusterMembership": "active",
      "status": "healthy",
      "otpNode": "n_0@127.0.0.1",
      "thisNode": true,
      "hostname": "127.0.0.1:9000",
      "recoveryType": "none",
      "clusterCompatibility": 196608,
      "version": "2.2.0r_172_gbe4b1cd",
      "os": "x86_64-pc-linux-gnu",
      "ports": {
        "proxy": 12001,
        "direct": 12000
      }
    }],
    "buckets": {
      "uri": "/pools/default/buckets?v=6308748"
    },
    "remoteClusters": {
      "uri": "/pools/default/remoteClusters",
      "validateURI": "/pools/default/remoteClusters?just_validate=1"
    },
    "controllers": {
      "addNode": {
        "uri": "/controller/addNode"
      },
      "rebalance": {
        "uri": "/controller/rebalance"
      },
      "startGracefulFailover": {
        "uri": "/controller/startGracefulFailover"
      },
      "failOver": {
        "uri": "/controller/failOver"
      },
      "reAddNode": {
        "uri": "/controller/reAddNode"
      },
      "ejectNode": {
        "uri": "/controller/ejectNode"
      },
      "setRecoveryType": {
        "uri": "/controller/setRecoveryType"
      },
      "setAutoCompaction": {
        "uri": "/controller/setAutoCompaction",
        "validateURI": "/controller/setAutoCompaction?just_validate=1"
      },
      "replication": {
        "createURI": "/controller/createReplication",
        "validateURI": "/controller/createReplication?just_validate=1"
      }
    },
    "rebalanceStatus": "none",
    "rebalanceProgressUri": "/pools/default/rebalanceProgress",
    "stopRebalanceUri": "/controller/stopRebalance",
    "nodeStatusesUri": "/nodeStatuses",
    "maxBucketCount": 10,
    "autoCompactionSettings": {
      "parallelDBAndViewCompaction": false,
      "databaseFragmentationThreshold": {
        "percentage": 30,
        "size": "undefined"
      },
      "viewFragmentationThreshold": {
        "percentage": 30,
        "size": "undefined"
      }
    },
    "tasks": {
      "uri": "/pools/default/tasks?v=133172395"
    },
    "counters": {}
  },
  "baseBuckets": [{
    "name": "default",
    "bucketType": "membase",
    "authType": "sasl",
    "saslPassword": "",
    "proxyPort": 0,
    "replicaIndex": false,
    "uri": "/pools/default/buckets/default",
    "streamingUri": "/pools/default/bucketsStreaming/default",
    "localRandomKeyUri": "/pools/default/buckets/default/localRandomKey",
    "controllers": {
      "compactAll": "/pools/default/buckets/default/controller/compactBucket",
      "compactDB": "/pools/default/buckets/default/controller/compactDatabases",
      "purgeDeletes": "/pools/default/buckets/default/controller/unsafePurgeBucket",
      "startRecovery": "/pools/default/buckets/default/controller/startRecovery"
    },
    "nodes": [{

      "couchApiBase": "http://127.0.0.1:9500/default",
      "systemStats": {
        "cpu_utilization_rate": 24.747474747474747,
        "swap_total": 6291451904,
        "swap_used": 0,
        "mem_total": 6191321088,
        "mem_free": 4217733120
      },
      "interestingStats": {
        "cmd_get": 0.0,
        "couch_docs_actual_disk_size": 14757383,
        "couch_docs_data_size": 14727168,
        "couch_views_actual_disk_size": 13077,
        "couch_views_data_size": 13077,
        "curr_items": 0,
        "curr_items_tot": 0,
        "ep_bg_fetched": 0.0,
        "get_hits": 0.0,
        "mem_used": 27347928,
        "ops": 0.0,
        "vb_replica_curr_items": 0
      },
      "uptime": "783",
      "memoryTotal": 6191321088,
      "memoryFree": 4217733120,
      "mcdMemoryReserved": 4723,
      "mcdMemoryAllocated": 4723,
      "replication": 0.0,
      "clusterMembership": "active",
      "group": "Group 3",
      "status": "healthy",
      "otpNode": "n_0@127.0.0.1",
      "thisNode": true,
      "hostname": "127.0.0.1:9000",
      "recoveryType": "none",
      "clusterCompatibility": 196608,
      "version": "2.2.0r_172_gbe4b1cd",
      "os": "x86_64-pc-linux-gnu",
      "ports": {
        "proxy": 12001,
        "direct": 12000
      }
    }],
    "stats": {
      "uri": "/pools/default/buckets/default/stats",
      "directoryURI": "/pools/default/buckets/default/statsDirectory",
      "nodeStatsListURI": "/pools/default/buckets/default/nodes"
    },
    "ddocs": {
      "uri": "/pools/default/buckets/default/ddocs"
    },
    "nodeLocator": "vbucket",
    "autoCompactionSettings": false,
    "uuid": "ebb026fbdbd6177e549b26950ff7b41e",
    "evictionPolicy": "valueOnly",
    "vBucketServerMap": {
      "hashAlgorithm": "CRC",
      "numReplicas": 1,
      "serverList": ["127.0.0.1:12000"],
      "vBucketMap": [
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
        [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1],
      ]
    },
    "replicaNumber": 1,
    "threadsNumber": 3,
    "quota": {
      "ram": 157286400,
      "rawRAM": 157286400
    },
    "basicStats": {
      "storageTotals": {
        "ram": {
          "total": 6191321088,
          "quotaTotal": 314572800,
          "quotaUsed": 314572800,
          "quotaTotalPerNode": 314572800 / 5,
          "quotaUsedPerNode": 314572800 / 5,
          "used": 3304505344,
          "usedByData": 27347928
        },
        "hdd": {
          "total": 265550077952,
          "quotaTotal": 265550077952,
          "used": 45143513251,
          "usedByData": 14770460,
          "free": 220406564701
        }
      },
      "quotaPercentUsed": 17.387344360351563,
      "opsPerSec": 0.0,
      "diskFetches": 0.0,
      "itemCount": 0,
      "diskUsed": 14770460,
      "dataUsed": 14727168,
      "memUsed": 27347928
    },
    "bucketCapabilitiesVer": "",
    "bucketCapabilities": ["touch", "couchapi"]
  }, {
    "name": "mcd",
    "bucketType": "memcached",
    "authType": "sasl",
    "saslPassword": "",
    "proxyPort": 0,
    "replicaIndex": true,
    "uri": "/pools/default/buckets/mcd",
    "streamingUri": "/pools/default/bucketsStreaming/mcd",
    "localRandomKeyUri": "/pools/default/buckets/mcd/localRandomKey",
    "controllers": {
      "compactAll": "/pools/default/buckets/mcd/controller/compactBucket",
      "compactDB": "/pools/default/buckets/default/controller/compactDatabases",
      "purgeDeletes": "/pools/default/buckets/mcd/controller/unsafePurgeBucket",
      "startRecovery": "/pools/default/buckets/mcd/controller/startRecovery"
    },
    "nodes": [{
      "systemStats": {
        "cpu_utilization_rate": 24.747474747474747,
        "swap_total": 6291451904,
        "swap_used": 0,
        "mem_total": 6191321088,
        "mem_free": 4217733120
      },
      "interestingStats": {
        "cmd_get": 0.0,
        "couch_docs_actual_disk_size": 14757383,
        "couch_docs_data_size": 14727168,
        "couch_views_actual_disk_size": 13077,
        "couch_views_data_size": 13077,
        "curr_items": 0,
        "curr_items_tot": 0,
        "ep_bg_fetched": 0.0,
        "get_hits": 0.0,
        "mem_used": 27347928,
        "ops": 0.0,
        "vb_replica_curr_items": 0
      },
      "uptime": "783",
      "memoryTotal": 6191321088,
      "memoryFree": 4217733120,
      "mcdMemoryReserved": 4723,
      "mcdMemoryAllocated": 4723,
      "replication": 1.0,
      "clusterMembership": "active",
      "group": "Group 3",
      "status": "healthy",
      "otpNode": "n_0@127.0.0.1",
      "thisNode": true,
      "hostname": "127.0.0.1:9000",
      "recoveryType": "none",
      "clusterCompatibility": 196608,
      "version": "2.2.0r_172_gbe4b1cd",
      "os": "x86_64-pc-linux-gnu",
      "ports": {
        "proxy": 12001,
        "direct": 12000
      }
    }],
    "stats": {
      "uri": "/pools/default/buckets/mcd/stats",
      "directoryURI": "/pools/default/buckets/mcd/statsDirectory",
      "nodeStatsListURI": "/pools/default/buckets/mcd/nodes"
    },
    "ddocs": {
      "uri": "/pools/default/buckets/mcd/ddocs"
    },
    "nodeLocator": "ketama",
    "autoCompactionSettings": false,
    "uuid": "357548f0d9f345f28396bf7571058629",
    "replicaNumber": 0,
    "threadsNumber": 3,
    "quota": {
      "ram": 157286400,
      "rawRAM": 157286400
    },
    "basicStats": {
      "storageTotals": {
        "ram": {
          "total": 6191321088,
          "quotaTotal": 314572800,
          "quotaUsed": 314572800,
          "quotaTotalPerNode": 314572800 / 5,
          "quotaUsedPerNode": 314572800 / 5,
          "used": 3304505344,
          "usedByData": 27347928
        },
        "hdd": {
          "total": 265550077952,
          "quotaTotal": 265550077952,
          "used": 45143513251,
          "usedByData": 14770460,
          "free": 220406564701
        }
      },
      "quotaPercentUsed": 0.0,
      "opsPerSec": 0.0,
      "hitRatio": 0,
      "itemCount": 0,
      "memUsed": 0
    },
    "bucketCapabilitiesVer": "",
    "bucketCapabilities": []
  }],
  pools: function () {
    var rv = {
      "pools": [{
        "name": "default",
        "uri": "/pools/default",
        "streamingUri": "/poolsStreaming/default"
      }],
      "isAdminCreds": !!(this.login),
      "isROAdminCreds": false,
      "settings": {
        "maxParallelIndexers": "/settings/maxParallelIndexers?uuid=5b68b24087dce882bcff9013699a603e",
        "viewUpdateDaemon": "/settings/viewUpdateDaemon?uuid=5b68b24087dce882bcff9013699a603e"
      },
      "uuid": "5b68b24087dce882bcff9013699a603e",
      "implementationVersion": "3.0.0r-460-g364b167",
      "componentsVersion": {
        "public_key": "0.13",
        "asn1": "1.6.18",
        "lhttpc": "1.3.0",
        "ale": "8ca6d2a",
        "os_mon": "2.2.7",
        "couch_set_view": "1.2.0a-386be73-git",
        "compiler": "4.7.5",
        "inets": "5.7.1",
        "couch": "1.2.0a-386be73-git",
        "mapreduce": "1.0.0",
        "couch_index_merger": "1.2.0a-386be73-git",
        "kernel": "2.14.5",
        "crypto": "2.0.4",
        "ssl": "4.1.6",
        "sasl": "2.1.10",
        "couch_view_parser": "1.0.0",
        "ns_server": "2.2.0r_172_gbe4b1cd",
        "mochiweb": "2.4.2",
        "syntax_tools": "1.6.7.1",
        "xmerl": "1.2.10",
        "oauth": "7d85d3ef",
        "stdlib": "1.17.5"
      }
    };
    if (this.hookParams['forceWiz']) {
      rv.pools.length = 0;
    }
    return rv;
  },
  poolDetails: function () {
    var rv = _.clone(this.basePoolDetails);
    rv.nodes = _.clone(this.allNodes);
    rv.etag = "asdasd";
    return rv;
  },
  nodeStatuses: function () {
    var rv = {}

    _.each(this.allNodes, function (nodes) {
      rv[nodes.hostname] = {
        gracefulFailoverPossible: true,
        otpNode: nodes.otpNode,
        replication: 1,
        status: nodes.status
      }
    });

    return rv;
  },
  bucketsList: function () {
    var self = this;
    var rv = _.clone(self.baseBuckets);
    _.each(rv, function (ninfo) {
      ninfo.nodes = _.clone(self.allNodes)
    });
    return rv;
  },
  bucketDetails: function (path) {
    path = "/" + path.join("/");
    var rv = _.detect(this.baseBuckets, function (binfo) {
      console.log(binfo.uri, path)
      return binfo.uri + "&basic_stats=true" === path;
    });
    if (!rv) {
      BUG();
    }
    rv.nodes = _.clone(this.allNodes);
    return rv;
  },
  handleBucketRemoval: function () {
    return {};
  },
  handleBucketsPost: function () {
    var errors = {};

    // if (isBlank(params['name'])) {
    //   errors.name = 'name cannot be blank';
    // } else if (params['name'] != 'new-name') {
    //   errors.name = 'name has already been taken';
    // }

    // if (!(/^\d+$/.exec(params['ramQuotaMB']))) {
    //   errors.ramQuotaMB = "RAM quota size must be an integer";
    // }

    // if (!(/^\d+$/.exec(params['hddQuotaGB']))) {
    //   errors.hddQuotaGB = "Disk quota size must be an integer";
    // }

    // var authType = params['authType'];
    // if (authType == 'none') {
    //   if (!(/^\d+$/.exec(params['proxyPort']))) {
    //     errors.proxyPort = 'bad'
    //   }
    // } else if (authType == 'sasl') {
    // } else {
    //   errors.authType = 'unknown auth type'
    // }

    // if (_.keys(errors).length) {
    //   return this.errorResponse(errors);
    // }

    var rv = {
      "errors": {},
      "summaries": {
        "ramSummary": {
          "total": 629145600,
          "otherBuckets": 0,
          "nodesCount": 1,
          "perNodeMegs": 300,
          "thisAlloc": 314572800,
          "thisUsed": 0,
          "free": 314572800
        },
        "hddSummary": {
          "total": 249064775680,
          "otherData": 239102184652,
          "otherBuckets": 0,
          "thisUsed": 0,
          "free": 9962591028
        }
      }
    }

    return rv;
  },
  handleCreateReplication: function (args) {
    if (this.hookParams['validateReplicationWorks'] == 'false') {
      return mnMockRouting.e400({
        bucketFrom: "source bucket is invalid"
      });
    }

    var errors = {};
    var hadError = false;
    _.each(("fromBucket toBucket replicationType toCluster").split(" "), function (field) {
      if (args[field] == null || args[field] === '') {
        hadError = true;
        errors[field] = field + ' cannot be empty';
      }
    });
    if (hadError) {
      mnMockRouting.e400(errors);
    } else {
      return "";
    }
  },
  handleAllDocs: function () {
    var rv = {
      "total_rows": 3,
      "rows": [
        {
          "id": "3",
          "key": "3",
          "value": {
            "rev": "1-000003dd0d54cfa20000000000000000"
          },
          "doc": {
            "meta": {
              "id": "3",
              "rev": "1-000003dd0d54cfa20000000000000000",
              "expiration": 0,
              "flags": 0
            },
            "json": {
              "click": "to edit",
              "new in 2.0": "there are no reserved field names"
            }
          }
        },
        {
          "id": "c",
          "key": "c",
          "value": {
            "rev": "1-000003f96139dea10000000000000000"
          },
          "doc": {
            "meta": {
              "id": "c",
              "rev": "1-000003f96139dea10000000000000000",
              "expiration": 0,
              "flags": 0
            },
            "json": {
              "click": "to edit",
              "new in 2.0": "there are no reserved field names"
            }
          }
        },
        {
          "id": "ojojo",
          "key": "ojojo",
          "value": {
            "rev": "1-000009e90060509f0000000000000000"
          },
          "doc": {
            "meta": {
              "id": "ojojo",
              "rev": "1-000009e90060509f0000000000000000",
              "expiration": 0,
              "flags": 0
            },
            "json": {
              "click": "to edit",
              "new in 2.0": "there are no reserved field names"
            }
          }
        }
      ]
    };
    console.log(rv)
    return rv;
  },
  handleAnyDoc: function () {
    var all = [{"click":"to edit","new in 2.0":"there are no reserved field names"}];
    return all[(Math.random() * all.length) >> 0];
  },
  handleReplicatorInfos: function () {
    return {
      "rows": [{
        "key": [
          "missing-rep_2"
        ],
        "value": {
          "_replication_state": "completed",
          "_replication_state_time": "2011-10-18T15:49:45Z",
          "_replication_fields": {
            "_id": "missing-rep_2",
            "source": "default",
            "target": "/remoteClusters/other.local/buckets/other-bucket",
            "continuous": false
          },
          "have_replicator_doc": false,
          "count": 2
        }
      }, {
        "key": [
          "rep_1"
        ],
        "value": {
          "_replication_state": "triggered",
          "_replication_state_time": "2011-10-18T15:52:44Z",
          "_replication_fields": {
            "_id": "rep_1",
            "source": "default",
            "target": "/remoteClusters/kyiv/buckets/default",
            "continuous": false
          },
          "have_replicator_doc": true,
          "count": 2
        }
      }, {
        "key": [
          "rep_2"
        ],
        "value": {
          "_replication_state": "completed",
          "_replication_state_time": "2011-10-18T15:51:44Z",
          "_replication_fields": {
            "_id": "rep_2",
            "source": "other-bucket",
            "target": "/remoteClusters/london/buckets/very-other-bucket",
            "continuous": true
          },
          "have_replicator_doc": true,
          "count": 2
        }
      }]
    }
  }
});

mnMockRouting.prototype.routes = mnMockRouting.prototype.__defineRoutes();

// code below is only for Cells ui
if (('Cell' in window) && ('OverviewSection' in window)) {(function () {
  var TestingSupervisor = {
    installInterceptor: function (wrapperName, obj, methodName) {
      var self = this;
      var method = obj[methodName];
      var rv = obj[methodName] = function () {
        var args = [method].concat(_.toArray(arguments));
        return self[wrapperName].apply(self, args);
      }
      rv.originalMethod = method;
      return rv;
    },
    interceptAjax: function () {
      this.installInterceptor('interceptedAjax', $, 'ajax');
    },
    interceptedAjax: function (original, options) {
      console.log("intercepted ajax:", options.url, options);
      (new MockedRequest(options)).respond();
    }
  };

  var ajaxRespondDelay = 100;

  function dateToFakeRFC1123(date) {
    function twoDigits(n) {
      return String(100 + n).slice(1);
    }
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return ['XXX, ', twoDigits(date.getUTCDate()), ' ',
            monthNames[date.getUTCMonth()], ' ', date.getUTCFullYear(), ' ',
            twoDigits(date.getUTCHours()), ':', twoDigits(date.getUTCMinutes()), ':', twoDigits(date.getUTCSeconds()),
            ' GMT'].join('');
  }

  var MockedRequest = mkClass({
    initialize: function (options) {
      if (options.type == null) {
        options = _.clone(options);
        options.type = 'GET';
      }
      options.type = options.type.toUpperCase();
      if (options.type != 'GET' && options.type != 'POST' && options.type != 'DELETE' && options.type != 'PUT') {
        throw new Error("unknown method: " + options.type);
      }

      this.options = options;

      this.fakeXHR = {
        responseHeaders: {
          "date": dateToFakeRFC1123(new Date())
        },
        requestHeaders: [],
        setRequestHeader: function () {
          this.requestHeaders.push(_.toArray(arguments));
        },
        setResponseHeader: function (header, value) {
          this.responseHeaders[header.toLowerCase()] = value;
        },
        getResponseHeader: function (header) {
          return this.responseHeaders[header.toLowerCase()];
        }
      }

      this.backtrace = getBacktrace();

      var url = options.url;
      var hostPrefix = document.location.protocol + ":/" + document.location.host;
      if (url.indexOf(hostPrefix) == 0)
        url = url.substring(hostPrefix);
      if (url.indexOf("/") == 0)
        url = url.substring(1);
      if (url.lastIndexOf("/") == url.length - 1)
        url = url.substring(0, url.length - 1);

      this.url = url;

      var path = url.split('?')[0].split("/")
      this.path = path;
    },

    respond: function () {
      var self = this;
      var query = (self.url.match(/(\?.*)/) || [])[1] || "";
      var respAction = TestingSupervisor.routing.getResponse(self.options.type, self.path, query);
      var resp = [0, 404, "", {}];
      if (respAction) {
        resp = respAction(self.options.data, {});
      }
      function deepclone(v) {
        return JSON.parse(JSON.stringify(v));
      }
      var delay = resp[0];
      var status = resp[1];
      var data =  deepclone(resp[2]);
      var headers = deepclone(resp[3]);

      this.fakeXHR.status = status;
      this.fakeXHR.responseText = JSON.stringify(data || []);
      _.each(headers, function (value, name) {
        self.fakeXHR.setResponseHeader(name, value);
      });

      function doResponse() {
        console.log("sending response (" + self.url + "). Status: " + status + ". ", data);
        if (status == 200) {
          self.options.success && self.options.success(data, 'success', self.fakeXHR);
          self.options.complete && self.options.complete(data, 'success', self.fakeXHR);
        } else {
          self.options.complete && self.options.complete(self, 'error');
          self.options.error && self.options.error(self, 'error');
        }
      }

      if (self.options.async === false) {
        doResponse();
      } else {
        _.delay(function () {
          doResponse();
        }, delay + ajaxRespondDelay);
      }
    }
  });

  TestingSupervisor.interceptAjax();

  (function () {
    var routing = TestingSupervisor.routing = new mnMockRouting();

    var href = window.location.href;
    var match = /\?(.*?)(?:$|#)/.exec(href);
    if (!match) {
      return;
    }
    var params = deserializeQueryString(match[1]);
    routing.hookParams = params;

    console.log("params", params);

    // if (params['auth'] == '1')
    //   MockedRequest.prototype.checkAuth = MockedRequest.prototype.checkAuthReal;

    if (params['ajaxDelay']) {
      ajaxRespondDelay = parseInt(params['ajaxDelay'], 10);
    }

    // I believe it's broken anyways
    //
    // if (params['nowiz']) {
    //   DAL.login = 'Administrator'
    //   DAL.password = 'asdasd';
    // }

    if (params['noWarmup']) {
      routing.tasks.toggleWarmups();
    }

    if (params['single']) {
      routing.allNodes = routing.allNodes.slice(-1);
    }

    if (params['healthy']) {
      _.each(routing.allNodes, function (ninfo) {
        ninfo.status = "healthy";
      });
    }

    if (params['rebalanceStatus']) {
      routing.setRebalanceStatus(params['rebalanceStatus']);
    }

    if (params['dialog']) {
      $(function () {
        $($i(params['dialog'])).show();
      });
    }
  })();

  window.TestingSupervisor = TestingSupervisor;
  window.MockedRequest = MockedRequest;
  window.ajaxRespondDelay = ajaxRespondDelay;

})();}

// this is for angular's E2E $httpBackend
if ('angular' in window) {(function () {

  angular.module("mnHooks", ['ngMockE2E']).run(function wireHTTPBackend ($httpBackend) {
    mnMockRouting.instance = new mnMockRouting();
    function respondFn(method, url, data, headers) {
      var path = url.split('?')[0].split("/");
      var query = (url.match(/(\?.*)/) || [])[1] || "";
      if (path[0] === "") {
        path.shift();
      }
      var action = mnMockRouting.instance.getResponse(method, path, query);
      var resp = action(data, headers);
      var status = resp[1];
      var data = resp[2];
      var headers = resp[3];

      console.log("intercepted xhr: ", method, url, data, headers);

      return [status, JSON.stringify(data), headers];
    }
    var tester = {
      test: function () {return true;}
    };
    $httpBackend.whenGET(/^\/angular/).passThrough();
    $httpBackend.whenGET(new RegExp("^[^/]")).passThrough();
    _.each("GET POST PUT DELETE".split(" "), function (m) {
      $httpBackend.when(m, tester).respond(respondFn);
    });
  });

  angular.module("appDev", ["app", "mnHooks"]);

// end of if ('angular' in window)
})();}

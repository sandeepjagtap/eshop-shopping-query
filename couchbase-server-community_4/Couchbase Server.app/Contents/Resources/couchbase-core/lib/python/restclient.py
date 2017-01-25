#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
  methods for contacting to a HTTP server, sending REST commands
  and processing the JSON response
"""

import sys
import socket
import httplib
import urllib
import base64
import json
import string


class RestClient:
    def __init__(self, server, port, opts= {}):
        self.server = server
        self.port = port
        self.debug = opts.get('debug', False)
        self.uri = '/pools'
        self.method = 'GET'
        self.params = {}
        self.user = ''
        self.password = ''
        self.body = ''
        self.clientConnect(server, int(port))

    def clientConnect(self, server, port):
        error_connect = "Unable to connect to %s" % self.server
        try:
            self.conn = httplib.HTTPConnection(server, port)
        except httplib.NotConnected:
            print error_connect
            sys.exit(2)
        except httplib.HTTPException:
            print error_connect
            sys.exit(2)
        except socket.error:
            print error_connect
            sys.exit(2)
        except socket.gaierror:
            print error_connect
            sys.exit(2)

    def setParam(self, param, value):
        self.params[param] = value

    def setPayload(self, payload):
        self.body = payload

    def getParam(self, param):
        return self.params[param]

    def handleResponse(self,
                       method,
                       response,
                       opts={ 'success_msg':'',
                              'error_msg':'' }):
        """ parse response in standard way.
            """
        if response.status in [200, 201, 202, 204, 302]:
            if method == 'GET' or not opts['success_msg']:
                return response.read()

            return "SUCCESS: %s" % opts['success_msg']

        if response.status == 401:
            print 'ERROR: unable to access the REST API - please check your username (-u) and password (-p)'
            sys.exit(2)

        print 'ERROR: %s (%d) %s' % (opts['error_msg'],
                                     response.status, response.reason)
        print response.read()

        sys.exit(2)

    def bootStrap(self, headers):
        """ First REST call needed for info for later REST calls.
            """
        self.conn.request('GET', '/pools', '', headers)
        response = self.conn.getresponse()

        opts = {'error_msg':'bootstrap failed'}
        return self.handleResponse('GET', response, opts)

    def sendCmd(self, method, uri,
                user='', password='', opts = {}):
        """
            sendCmd()
            This method handles accessing the REST API and returning
            either data, if a GET, or a success or error message if a POST
            """
        data = ''
        headers = {}
        encoded_params = ''

        if user and password:
            self.user = user
            self.password = password

            auth = ('Basic ' +
                    string.strip(base64.encodestring(user + ':' + password)))

            headers['Authorization'] = auth

        self.bootStrap(headers)

        if method == 'POST':
            if self.body:
                headers['Content-type'] = 'application/json;charset=UTF-8'
                encoded_params = self.body
            elif self.params:
                encoded_params = urllib.urlencode(self.params)
                headers['Content-type'] = 'application/x-www-form-urlencoded'
        elif method == 'DELETE':
            encoded_params = urllib.urlencode(self.params)
            headers['Content-type'] = 'application/x-www-form-urlencoded'
        elif method == 'PUT':
            if self.body:
                headers['Content-type'] = 'application/json;charset=UTF-8'
                encoded_params = self.body
            elif self.params:
                headers['Content-type'] = 'application/x-www-form-urlencoded'
                encoded_params = urllib.urlencode(self.params)
            else:
                print "ERROR: no input parameters for PUT request"
                return None
        else:
            if self.params:
                uri = uri, '?', urllib.urlencode(self.params)

        if self.debug:
            print "METHOD: %s" % method
            print "PARAMS: ", self.params
            print "ENCODED_PARAMS: %s" % encoded_params
            print "REST CMD: %s %s" % (method,uri)

        self.makeRequest(method, uri, encoded_params, headers)
        response = self.conn.getresponse()
        if self.debug:
            print "response.status: %s" % response.status
        return response

    def makeRequest(self, method, uri, encoded_params, headers):
        error_connect = "ERROR: unable to connect to %s:%d" % (self.server, self.port)
        try:
            self.conn.request(method, uri, encoded_params, headers)
        except httplib.NotConnected:
            print error_connect
            sys.exit(2)
        except httplib.HTTPException:
            print error_connect
            sys.exit(2)
        except socket.error:
            print error_connect
            sys.exit(2)
        except socket.gaierror:
            print error_connect
            sys.exit(2)

    def getJson(self, data):
        return json.loads(data)

    def jsonMessage(self, data):
        return json.JSONEncoder().encode(data)

    def restCmd(self, method, uri, user='', password='', opts={}):
        if method == None:
            method = 'GET'

        response = self.sendCmd(method, uri,
                                user, password, opts)

        return self.handleResponse(method, response, opts)

class SslRestClient(RestClient):
    def clientConnect(self, server, port):
        error_connect = "Unable to connect to %s as SSL client" % self.server
        try:
            self.conn = httplib.HTTPSConnection(server, port)
        except httplib.NotConnected:
            print error_connect
            sys.exit(2)
        except httplib.HTTPException:
            print error_connect
            sys.exit(2)
        except socket.error:
            print error_connect
            sys.exit(2)
        except socket.gaierror:
            print error_connect
            sys.exit(2)
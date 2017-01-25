{application,ns_ssl_proxy,
             [{description,"Couchbase ssl proxy"},
              {vsn,"0.0.0"},
              {registered,[]},
              {applications,[kernel,stdlib]},
              {mod,{ns_ssl_proxy,[]}},
              {modules,[ns_ssl,ns_ssl_downstream_proxy_listener,ns_ssl_proxy,
                        ns_ssl_proxy_server,ns_ssl_proxy_server_sup,
                        ns_ssl_proxy_sup,ns_ssl_upstream_proxy_listener]}]}.

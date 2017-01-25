var ftsAppName = 'fts';
var ftsPrefix = 'fts';

// -------------------------------------------------------

(function () {
  "use strict";

  angular
    .module(ftsAppName,
            ["ui.router", "mnPluggableUiRegistry", "mnJquery", "ngRoute", "ui.tree"])
    .config(function($stateProvider, mnPluggableUiRegistryProvider) {
      $stateProvider
            .state('app.admin.indexes.fts_list', {
                url: '/fts_list',
                controller: 'IndexesCtrlFT_NS',
                templateUrl: '/_p/ui/fts/fts_list.html'
            })
            .state('app.admin.indexes.fts_view', {
                url: '/fts_view/:indexName?tabName',
                controller: 'IndexCtrlFT_NS',
                templateUrl: '/_p/ui/fts/fts_view.html'
            })
            .state('app.admin.indexes.fts_new', {
                url: '/fts_new/?indexType&sourceType',
                controller: 'IndexNewCtrlFT_NS',
                templateUrl: '/_p/ui/fts/fts_new.html'
            })
            .state('app.admin.indexes.fts_edit', {
                url: '/fts_edit/:indexName/_edit',
                controller: 'IndexNewCtrlFT_NS',
                templateUrl: '/_p/ui/fts/fts_new.html'
            })
            .state('app.admin.indexes.fts_clone', {
                url: '/fts_clone/:indexName/_clone',
                controller: 'IndexNewCtrlFT_NS',
                templateUrl: '/_p/ui/fts/fts_new.html'
            })
            .state('app.admin.indexes.fts_search', {
                url: '/fts_search/:indexName/_search?query',
                controller: 'IndexSearchCtrlFT_NS',
                templateUrl: '/_p/ui/fts/fts_search.html'
            });

        mnPluggableUiRegistryProvider.registerConfig({
            name: 'Full Text',
            state: 'app.admin.indexes.fts_list',
            plugIn: 'indexesTab'
        });
    });

  angular.module('mnAdmin').requires.push('fts');

  angular.module(ftsAppName).
        controller('IndexesCtrlFT_NS', IndexesCtrlFT_NS).
        controller('IndexCtrlFT_NS', IndexCtrlFT_NS).
        controller('IndexNewCtrlFT_NS', IndexNewCtrlFT_NS).
        controller('IndexSearchCtrlFT_NS', IndexSearchCtrlFT_NS);
}());

// ----------------------------------------------

function IndexesCtrlFT_NS($scope, $http, $stateParams,
                          $log, $sce, $location, mnServersService) {
    var $routeParams = $stateParams;
    var http = prefixedHttp($http, '/_p/' + ftsPrefix);
    $scope.ftsChecking = true;
    $scope.ftsAvailable = false;
    $scope.ftsCheckError = "";
    $scope.ftsNodes = [];
    http.get("/api/runtime")
    .success(function(data, status, headers, config) {
      $scope.ftsAvailable = true;
      $scope.ftsChecking = false;
    })
    .error(function(data, status, headers, config) {
      $scope.ftsChecking = false;
      // if we got a 404, there is no fts service on this node.
      // let's go through the list of nodes
      // and see which ones have a fts service
      if (status == 404) {
        mnServersService.getNodes().then(function (resp) {
          var nodes = resp.allNodes;
          for (var i = 0; i < nodes.length; i++) {
            if (_.contains(nodes[i].services,"fts")) {
              $scope.ftsNodes.push("http://" + nodes[i].hostname + "/ui/index.html#/fts_list");
            }
          }
        });
      } else {
        // some other error to show
        $scope.ftsCheckError = data;
      }
    });

    return IndexesCtrl($scope, http, $routeParams, $log, $sce, $location);
}

function IndexCtrlFT_NS($scope, $http, $route, $stateParams,
                        $location, $log, $sce, $uibModal) {
    var $routeParams = $stateParams;

    var http = prefixedHttp($http, '/_p/' + ftsPrefix)

    $scope.progress = "";
    $scope.sourceDocCount = "";

    $scope.loadDocCount = function() {
        $scope.loadIndexDocCount();
        $scope.loadSourceDocCount();
    }

    $scope.loadSourceDocCount = function() {
        $scope.sourceDocCount = "..."
        $scope.errorMessage = null;
        $scope.errorMessageFull = null;

        http.get('/api/stats/sourceStats/' + $scope.indexName).
        success(function(data) {
            if (data) {
                $scope.sourceDocCount = data.docCount;
                updateProgressPct();
            }
        }).
        error(function(data, code) {
            $scope.sourceDocCount = "error"
            updateProgressPct();
        });
    }

    function updateProgressPct() {
        $scope.progressPct = "";
        var i = parseInt($scope.indexDocCount);
        var s = parseInt($scope.sourceDocCount);
        if (i >= 0 && s > 0) {
            $scope.progressPct = Math.round(((1.0 * i) / s) * 10000) / 100.0;
        }
    }

    IndexCtrl($scope, http, $route, $routeParams,
              $location, $log, $sce, $uibModal);

    if ($scope.tab === "summary") {
        $scope.loadDocCount();
    }

    ftsServiceHostPort($scope, $http, $location);
}

function IndexNewCtrlFT_NS($scope, $http, $route, $stateParams,
                           $location, $log, $sce, $uibModal,
                           $q, mnBucketsService) {
    mnBucketsService.getBucketsByType(true).then(function(buckets) {
        $scope.buckets = buckets;
        $scope.bucketNames = [];
        for (var i = 0; i < buckets.length; i++) {
            $scope.bucketNames.push(buckets[i].name);
        }

        var $routeParams = $stateParams;

        var $locationRewrite = {
            host: $location.host,
            path: function(p) {
                if (!p) {
                    return $location.path();
                }
                return $location.path(p.replace(/^\/indexes\//, "/fts_view/"))
            }
        }

        IndexNewCtrlFT($scope,
                       prefixedHttp($http, '/_p/' + ftsPrefix),
                       $route, $routeParams,
                       $locationRewrite, $log, $sce, $uibModal,
                       finishIndexNewCtrlFTInit)

        function finishIndexNewCtrlFTInit() {
            var putIndexOrig = $scope.putIndex;

            $scope.putIndex = function(newIndexName,
                                       newIndexType, newIndexParams,
                                       newSourceType, newSourceName,
                                       newSourceUUID, newSourceParams,
                                       newPlanParams, prevIndexUUID) {
                $scope.errorFields = {};
                $scope.errorMessage = null;
                $scope.errorMessageFull = null;

                var errs = [];

                if (!newIndexName) {
                    $scope.errorFields["indexName"] = true;
                    errs.push("index name is required");
                } else if ($scope.meta &&
                           $scope.meta.indexNameRE &&
                           !newIndexName.match($scope.meta.indexNameRE)) {
                    $scope.errorFields["indexName"] = true;
                    errs.push("index name '" + newIndexName + "'" +
                              " must start with an alphabetic character, and" +
                              " must only use alphanumeric or '-' or '_' characters");
                }

                if (errs.length > 0) {
                    $scope.errorMessage =
                        (errs.length > 1 ? "errors: " : "error: ") + errs.join("; ");
                    return
                }

                if (!newSourceUUID) {
                    for (var i = 0; i < buckets.length; i++) {
                        if (newSourceName == buckets[i].name) {
                            newSourceUUID = buckets[i].uuid;
                        }
                    }
                }

                return putIndexOrig(newIndexName,
                                    newIndexType, newIndexParams,
                                    newSourceType, newSourceName,
                                    newSourceUUID, newSourceParams,
                                    newPlanParams, prevIndexUUID);
            };
        }
    });
}

function IndexSearchCtrlFT_NS($scope, $http, $stateParams, $log, $sce, $location) {
    var $routeParams = $stateParams;

    $scope.indexName = $stateParams.indexName;

    $scope.decorateSearchHit = function(hit) {
      hit.docIDLink = "/_p/fts/api/nsSearchResultRedirect/" + hit.index + "/" + hit.id;
    };

    $scope.static_base = "/_p/ui/fts";

    $scope.query = $routeParams.query || "";
    $scope.page = $routeParams.page || 1;

    if (!$location.search().q) {
        $location.search("q", $scope.query);
    }
    if (!$location.search().page) {
        $location.search("p", $scope.page);
    }

    QueryCtrl($scope,
              prefixedHttp($http, '/_p/' + ftsPrefix, true),
              $routeParams, $log, $sce, $location);

    ftsServiceHostPort($scope, $http, $location);
}

// -------------------------------------------------------

function bleveNewIndexMapping() {
    return {
        "types": {},
        "default_mapping": {
            "enabled": true,
            "dynamic": true
        },
        "type_field": "type",
        "default_type": "_default",
        "default_analyzer": "standard",
        "default_datetime_parser": "dateTimeOptional",
        "default_field": "_all",
        "byte_array_converter": "json",
        "analysis": {
            "analyzers": {},
            "char_filters": {},
            "tokenizers": {},
            "token_filters": {},
            "token_maps": {}
        },
        "store_dynamic": false,
        "index_dynamic": true
    }
};

function blevePIndexInitController(initKind, indexParams, indexUI,
    $scope, $http, $route, $routeParams, $location, $log, $sce, $uibModal) {
    if (initKind == "view") {
        $scope.viewOnly = true;
    }

    $scope.static_prefix = "/_p/ui/fts/static-bleve-mapping";

    $scope.indexTemplates = $scope.indexTemplates || {};
    $scope.indexTemplates["fulltext-index"] =
        $scope.static_prefix + "/partials/mapping/index-mapping.html";

    var mapping = bleveNewIndexMapping();
    if (indexParams &&
        indexParams.mapping) {
        mapping = indexParams.mapping;
    }

    var imc = initBleveIndexMappingController(
        $scope, $http, $log, $uibModal, mapping,
        {
            analyzerNames: null,
            dateTypeParserNames: null,
            byteArrayConverterNames: null,
            defaultFieldStore: false
        });

    $scope.bleveIndexMapping = function() {
        return imc.indexMapping();
    }
}

function blevePIndexDoneController(doneKind, indexParams, indexUI,
    $scope, $http, $route, $routeParams, $location, $log, $sce, $uibModal) {
    if (indexParams) {
        indexParams.mapping = $scope.bleveIndexMapping();
    }
}

angular.module(ftsAppName).
    controller('BleveAnalyzerModalCtrl',
               BleveAnalyzerModalCtrl_NS).
    controller('BleveCharFilterModalCtrl',
               BleveCharFilterModalCtrl_NS).
    controller('BleveTokenizerModalCtrl',
               BleveTokenizerModalCtrl_NS).
    controller('BleveTokenFilterModalCtrl',
               BleveTokenFilterModalCtrl_NS).
    controller('BleveWordListModalCtrl',
               BleveWordListModalCtrl_NS);

// ----------------------------------------------

function BleveAnalyzerModalCtrl_NS($scope, $uibModalInstance, $http,
                                   name, value, mapping, static_prefix) {
    return BleveAnalyzerModalCtrl($scope, $uibModalInstance,
                                  prefixedHttp($http, '/_p/' + ftsPrefix),
                                  name, value, mapping, static_prefix);
}

function BleveCharFilterModalCtrl_NS($scope, $uibModalInstance, $http,
                                     name, value, mapping, static_prefix) {
    return BleveCharFilterModalCtrl($scope, $uibModalInstance,
                                    prefixedHttp($http, '/_p/' + ftsPrefix),
                                    name, value, mapping, static_prefix);
}

function BleveTokenFilterModalCtrl_NS($scope, $uibModalInstance, $http,
                                      name, value, mapping, static_prefix) {
    return BleveTokenFilterModalCtrl($scope, $uibModalInstance,
                                     prefixedHttp($http, '/_p/' + ftsPrefix),
                                     name, value, mapping, static_prefix);
}

function BleveTokenizerModalCtrl_NS($scope, $uibModalInstance, $http,
                                    name, value, mapping, static_prefix) {
    return BleveTokenizerModalCtrl($scope, $uibModalInstance,
                                   prefixedHttp($http, '/_p/' + ftsPrefix),
                                   name, value, mapping, static_prefix);
}

function BleveWordListModalCtrl_NS($scope, $uibModalInstance,
                                   name, words, mapping, static_prefix) {
    return BleveWordListModalCtrl($scope, $uibModalInstance,
                                  name, words, mapping, static_prefix);
}

// ----------------------------------------------

function IndexNewCtrlFT($scope, $http, $route, $routeParams,
                        $location, $log, $sce, $uibModal, andThen) {
    $scope.indexDefs = null;

    $http.get('/api/index').
    success(function(data) {
        var indexDefs = $scope.indexDefs =
            data && data.indexDefs && data.indexDefs.indexDefs;

        var origIndexDef = indexDefs && indexDefs[$routeParams.indexName];

        var isAlias =
            ($routeParams.indexType == 'fulltext-alias') ||
            (origIndexDef && origIndexDef.type == 'fulltext-alias');
        if (isAlias) {
            // The aliasTargets will be the union of currently available
            // indexes (and aliases) and the existing targets of the alias.
            // Note that existing targets may have been deleted, but we
            // we will still offer them as options.
            $scope.aliasTargets = [];
            for (var indexName in indexDefs) {
                $scope.aliasTargets.push(indexName);
            }

            $scope.selectedTargetIndexes = [];
            if (origIndexDef) {
                var origTargets = (origIndexDef.params || {}).targets;
                for (var origTarget in origTargets) {
                    if (!indexDefs[origTarget]) {
                        $scope.aliasTargets.push(origTarget);
                    }

                    $scope.selectedTargetIndexes.push(origTarget);
                }
            }

            $scope.putIndexAlias =
                function(newIndexName,
                         newIndexType, newIndexParams,
                         newSourceType, newSourceName,
                         newSourceUUID, newSourceParams,
                         newPlanParams, prevIndexUUID,
                         selectedTargetIndexes) {
                    var aliasTargets = {};

                    for (var i = 0; i < selectedTargetIndexes.length; i++) {
                        var selectedTargetIndex = selectedTargetIndexes[i];

                        aliasTargets[selectedTargetIndex] = {};
                    }

                    newIndexParams["fulltext-alias"] = {
                        "targets": JSON.stringify(aliasTargets)
                    };

                    $scope.putIndex(newIndexName,
                                    newIndexType, newIndexParams,
                                    newSourceType, newSourceName,
                                    newSourceUUID, newSourceParams,
                                    newPlanParams, prevIndexUUID);
                };
        }

        IndexNewCtrl($scope, $http, $route, $routeParams,
                     $location, $log, $sce, $uibModal);

        if (andThen) {
            andThen();
        }
    });
}

// ----------------------------------------------

function prefixedHttp($http, prefix, dataNoJSONify) {
    var needDecorate = {
        "get": true, "put": true, "post": true, "delete": true
    };

    var rv = {}
    for (var k in $http) {
        rv[k] = $http[k];
        if (needDecorate[k]) {
            decorate(k);
        }
    }
    return rv;

    function decorate(k) {
        var orig = rv[k];

        rv[k] = function(path, data, config) {
            config = config || {};
            config.mnHttp = config.mnHttp || {};
            config.mnHttp.isNotForm = true;

            return orig.call($http, prefix + path, data, config);
        }
    }
}

function errorMessage(errorMessageFull, code) {

    if (code == 403 && typeof errorMessageFull == "object") {
      rv = errorMessageFull.message + ": ";
      for (var x in errorMessageFull.permissions) {
        rv += errorMessageFull.permissions[x];
      }
      return rv;
    }
    console.log("errorMessageFull", errorMessageFull, code);
    var a = (errorMessageFull || (code + "")).split("err: ");
    return a[a.length - 1];
}

// -------------------------------------------------------

function ftsServiceHostPort($scope, $http, $location) {
    $scope.hostPort = $location.host() + ":FTS_PORT";

    $http.get("/pools/default/nodeServices").then(function(resp) {
        var nodes = resp.data.nodesExt;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].services && nodes[i].services.fts) {
                $scope.hostPort = $location.host() + ":" + nodes[i].services.fts;
                return;
            }
        }
    });
}

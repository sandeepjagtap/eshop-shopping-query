(function () {
  "use strict";

  angular.module('mnSettingsClusterService', [
  ]).factory('mnSettingsClusterService', mnSettingsClusterServiceFactory);

  function mnSettingsClusterServiceFactory($http, $q, IEC) {
    var mnSettingsClusterService = {
      postPoolsDefault: postPoolsDefault,
      getIndexSettings: getIndexSettings,
      postIndexSettings: postIndexSettings
    };

    return mnSettingsClusterService;

    function postPoolsDefault(memoryQuotaConfig, justValidate, clusterName) {
      var data = {
        memoryQuota: memoryQuotaConfig.memoryQuota === null ? "" : memoryQuotaConfig.memoryQuota,
        indexMemoryQuota: memoryQuotaConfig.indexMemoryQuota === null ? "" : memoryQuotaConfig.indexMemoryQuota,
        ftsMemoryQuota: memoryQuotaConfig.ftsMemoryQuota === null ? "" : memoryQuotaConfig.ftsMemoryQuota,
        clusterName: clusterName
      }
      var config = {
        method: 'POST',
        url: '/pools/default',
        data: data
      };
      if (justValidate) {
        config.params = {
          just_validate: 1
        };
      }
      return $http(config);
    }
    function getIndexSettings() {
      return $http.get("/settings/indexes").then(function (resp) {
        return resp.data;
      });
    }
    function postIndexSettings(data, justValidate) {
      var config = {
        method: 'POST',
        url: '/settings/indexes',
        data: {
          indexerThreads: data.indexerThreads,
          logLevel:  data.logLevel,
          maxRollbackPoints:  data.maxRollbackPoints,
          storageMode:  data.storageMode
        }
      };
      if (justValidate) {
        config.params = {
          just_validate: 1
        };
      }
      return $http(config);
    }
  }
})();

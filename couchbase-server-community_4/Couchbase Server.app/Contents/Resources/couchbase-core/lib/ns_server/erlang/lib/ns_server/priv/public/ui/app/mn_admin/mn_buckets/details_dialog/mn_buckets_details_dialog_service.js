(function () {
  angular.module('mnBucketsDetailsDialogService', [
    'mnFilters',
    'mnPoolDefault',
    'mnServersService',
    'mnBucketsDetailsService',
    'mnSettingsAutoCompactionService',
    'mnAlertsService'
  ]).factory('mnBucketsDetailsDialogService', mnBucketsDetailsDialogServiceFactory);

  function mnBucketsDetailsDialogServiceFactory($http, $q, mnBytesToMBFilter, mnCountFilter, mnSettingsAutoCompactionService, mnPoolDefault, mnServersService, bucketsFormConfiguration, mnBucketsDetailsService) {
    var mnBucketsDetailsDialogService = {
      prepareBucketConfigForSaving: prepareBucketConfigForSaving,
      adaptValidationResult: adaptValidationResult,
      getNewBucketConf: getNewBucketConf,
      reviewBucketConf: reviewBucketConf,
      postBuckets: postBuckets
    };

    return mnBucketsDetailsDialogService;

    function postBuckets(data, uri) {
      return $http({
        data: data,
        method: 'POST',
        url: uri
      });
    }
    function prepareBucketConfigForSaving(bucketConf, autoCompactionSettings) {
      var conf = {};
      angular.forEach(['bucketType', 'ramQuotaMB', 'name', 'evictionPolicy', 'authType', 'saslPassword', 'proxyPort', 'replicaNumber', 'replicaIndex', 'threadsNumber', 'flushEnabled', 'autoCompactionDefined', 'otherBucketsRamQuotaMB'], function (fieldName) {
        if (bucketConf[fieldName] !== undefined) {
          conf[fieldName] = bucketConf[fieldName];
        }
      });
      if (conf.autoCompactionDefined) {
        _.extend(conf, mnSettingsAutoCompactionService.prepareSettingsForSaving(autoCompactionSettings));
      }
      return conf;
    }
    function adaptValidationResult(result) {
      var ramSummary = result.summaries.ramSummary;

      return {
        totalBucketSize: mnBytesToMBFilter(ramSummary.thisAlloc),
        nodeCount: mnCountFilter(ramSummary.nodesCount, 'node'),
        perNodeMegs: ramSummary.perNodeMegs,
        guageConfig: mnBucketsDetailsService.getBucketRamGuageConfig(ramSummary),
        errors: mnSettingsAutoCompactionService.prepareErrorsForView(result.errors)
      };
    }
    function getNewBucketConf() {
      return $q.all([
        mnServersService.getNodes(),
        mnPoolDefault.get()
      ]).then(function (resp) {
        var activeServersLength = resp[0].active.length;
        var totals = resp[1].storageTotals;
        var bucketConf = _.clone(bucketsFormConfiguration);
        bucketConf.isNew = true;
        bucketConf.ramQuotaMB = mnBytesToMBFilter(Math.floor((totals.ram.quotaTotal - totals.ram.quotaUsed) / activeServersLength));
        return bucketConf;
      });
    }
    function reviewBucketConf(bucketDetails) {
      return mnBucketsDetailsService.doGetDetails(bucketDetails).then(function (bucketConf) {
        bucketConf.ramQuotaMB = mnBytesToMBFilter(bucketConf.quota.rawRAM);
        bucketConf.isDefault = bucketConf.name === 'default';
        bucketConf.replicaIndex = bucketConf.replicaIndex ? 1 : 0;
        bucketConf.flushEnabled = (bucketConf.controllers !== undefined && bucketConf.controllers.flush !== undefined) ? 1 : 0;
        return bucketConf;
      });
    }
  }
})();

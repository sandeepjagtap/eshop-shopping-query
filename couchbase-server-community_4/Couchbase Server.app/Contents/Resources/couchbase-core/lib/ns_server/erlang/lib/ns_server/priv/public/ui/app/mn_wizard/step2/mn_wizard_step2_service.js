(function () {
  "use strict";

  angular.module('mnWizardStep2Service', [
  ]).factory('mnWizardStep2Service', mnWizardStep2ServiceFactory);

  function mnWizardStep2ServiceFactory($http) {
    var mnWizardStep2Service = {
      setSelected: setSelected,
      getSelectedBuckets: getSelectedBuckets,
      getSampleBucketsRAMQuota: getSampleBucketsRAMQuota,
      isSomeBucketSelected: isSomeBucketSelected
    };
    var selectedSamples = {};

    return mnWizardStep2Service;

    function getSelectedBuckets() {
      return selectedSamples;
    }
    function setSelected(selected) {
      selectedSamples = selected;
    }
    function getSampleBucketsRAMQuota() {
      return _.reduce(selectedSamples, function (memo, num) {
        return memo + Number(num);
      }, 0);
    }
    function isSomeBucketSelected() {
      return getSampleBucketsRAMQuota() !== 0;
    }
  }
})();

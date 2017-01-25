(function () {
  "use strict";

  angular
    .module('mnBuckets')
    .controller('mnBucketsDetailsDialogController', mnBucketsDetailsDialogController);

  function mnBucketsDetailsDialogController($scope, $rootScope, $state, mnBucketsDetailsDialogService, bucketConf, autoCompactionSettings, mnHelper, mnPromiseHelper, $uibModalInstance, mnAlertsService) {
    var vm = this;
    bucketConf.autoCompactionDefined = !!bucketConf.autoCompactionSettings;
    vm.bucketConf = bucketConf;
    vm.autoCompactionSettings = autoCompactionSettings;
    vm.validationKeeper = {};
    vm.onSubmit = onSubmit;

    function onSubmit() {
      var data = mnBucketsDetailsDialogService.prepareBucketConfigForSaving(vm.bucketConf, vm.autoCompactionSettings);
      var promise = mnBucketsDetailsDialogService.postBuckets(data, vm.bucketConf.uri);

      mnPromiseHelper(vm, promise)
        .showErrorsSensitiveSpinner()
        .catchErrors(function (result) {
          if (result) {
            if (result.summaries) {
              vm.validationResult = mnBucketsDetailsDialogService.adaptValidationResult(result);
            } else {
              mnAlertsService.showAlertInPopup(result, "error");
            }
          }
        })
        .onSuccess(function (result) {
          if (!result.data) {
            $uibModalInstance.close();
            $rootScope.$broadcast("reloadBucketsPoller");
          }
        });
    };
  }
})();

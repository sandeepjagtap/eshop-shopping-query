(function () {
  "use strict";

  angular
    .module('mnGroups')
    .controller('mnGroupsDeleteDialogController', mnGroupsDeleteDialogController);

  function mnGroupsDeleteDialogController($scope, $uibModalInstance, mnGroupsService, mnPromiseHelper, group) {
    var vm = this;

    vm.onSubmit = onSubmit;

    function onSubmit() {
      if (vm.viewLoading) {
        return;
      }

      var promise = mnGroupsService.deleteGroup(group.uri);
      mnPromiseHelper(vm, promise, $uibModalInstance)
        .showSpinner()
        .catchErrors()
        .closeFinally()
        .reloadState();
    }
  }
})();

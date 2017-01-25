(function () {
  "use strict";

  angular
    .module("mnViews")
    .controller("mnViewsCopyDialogController", mnViewsCopyDialogController);

  function mnViewsCopyDialogController($scope, $uibModal, $state, mnViewsListService, mnPromiseHelper, $uibModalInstance, currentDdoc) {
    var vm = this;

    vm.ddoc = {};
    vm.ddoc.name = mnViewsListService.cutOffDesignPrefix(currentDdoc.meta.id);
    vm.onSubmit = onSubmit;

    function onSubmit() {
      var url = mnViewsListService.getDdocUrl($state.params.viewsBucket, "_design/dev_" + vm.ddoc.name);
      var copy = prepareToCopy(url, currentDdoc);
      var promise = mnViewsListService.getDdoc(url).then(function (presentDdoc) {
        return $uibModal.open({
          templateUrl: 'app/mn_admin/mn_indexes/mn_views/confirm_dialogs/mn_views_confirm_override_dialog.html'
        }).result.then(copy);
      }, copy);

      mnPromiseHelper(vm, promise)
        .showSpinner()
        ;
    }
    function prepareToCopy(url, ddoc) {
      return function () {
        return mnPromiseHelper(vm, mnViewsListService.createDdoc(url, ddoc.json), $uibModalInstance)
          .closeOnSuccess()
          .onSuccess(function () {
            $state.go('app.admin.indexes.views.list', {
              type: 'development'
            });
          })
          .getPromise();
      };
    }
  }
})();

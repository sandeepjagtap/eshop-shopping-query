(function () {
  "use strict";

  angular
    .module("mnDocuments")
    .controller("mnDocumentsControlController", mnDocumentsControlController);

  function mnDocumentsControlController($scope, $state, mnPoller, mnDocumentsListService) {
    var vm = this;

    vm.nextPage = nextPage;
    vm.prevPage = prevPage;
    vm.isPrevDisabled = isPrevDisabled;
    vm.isNextDisabled = isNextDisabled;
    vm.onSelectPageLimits = onSelectPageLimits;
    vm.isEmptyState = isEmptyState

    activate();

    function isEmptyState() {
      return !vm.state || vm.state.isEmptyState;
    }
    function isPrevDisabled() {
      return isEmptyState() || vm.state.pageNumber === 0;
    }
    function isNextDisabled() {
      return isEmptyState() || vm.state.isNextDisabled;
    }
    function nextPage() {
      $state.go('app.admin.documents.control.list', {
        pageNumber: vm.state.pageNumber + 1
      });
    }
    function prevPage() {
      var prevPage = vm.state.pageNumber - 1;
      prevPage = prevPage < 0 ? 0 : prevPage;
      $state.go('app.admin.documents.control.list', {
        pageNumber: prevPage
      });
    }
    function onSelectPageLimits(pageLimit) {
      $state.go('app.admin.documents.control.list', {
        pageLimit: pageLimit
      });
    }
    function activate() {
      var poller = new mnPoller($scope, function () {
          return mnDocumentsListService.getDocumentsListState($state.params);
        })
        .setInterval(10000)
        .subscribe("state", vm)
        .reloadOnScopeEvent("reloadDocumentsPoller", vm);
    }
  }
})();

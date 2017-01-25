(function () {
  "use strict";

  angular.module('mnIndexes', [
    'mnViews',
    'mnGsi',
    'mnPluggableUiRegistry'
  ]).config(mnIndexesConfig);

  function mnIndexesConfig($stateProvider, mnHelperProvider) {
    $stateProvider
      .state('app.admin.indexes', {
        abstract: true,
        controller: "mnIndexesController as indexesCtl",
        templateUrl: "app/mn_admin/mn_indexes/mn_indexes.html"
      })
      .state('app.admin.indexes.views', {
        abstract: true,
        url: '/views?viewsBucket',
        params: {
          viewsBucket: {
            value: null
          }
        },
        resolve: {
          setDefaultBucketName: mnHelperProvider.setDefaultBucketName("viewsBucket", 'app.admin.indexes.views.list')
        },
        templateUrl: 'app/mn_admin/mn_indexes/mn_views/mn_views.html',
        controller: 'mnViewsController as viewsCtl'
      })
      .state('app.admin.indexes.views.list', {
        url: "?type",
        params: {
          type: {
            value: 'development'
          }
        },
        controller: 'mnViewsListController as viewsListCtl',
        templateUrl: 'app/mn_admin/mn_indexes/mn_views/list/mn_views_list.html'
      })
      .state('app.admin.indexes.views.editing', {
        abstract: true,
        url: '/:documentId?viewId&{isSpatial:bool}&sampleDocumentId',
        controller: 'mnViewsEditingController as viewsEditingCtl',
        templateUrl: 'app/mn_admin/mn_indexes/mn_views/editing/mn_views_editing.html'
      })
      .state('app.admin.indexes.views.editing.result', {
        url: '?subset&{pageNumber:int}&viewsParams',
        params: {
          full_set: {
            value: null
          },
          pageNumber: {
            value: 0
          },
          activate: {
            value: null,
            dynamic: true
          }
        },
        controller: 'mnViewsEditingResultController as viewsEditingResultCtl',
        templateUrl: 'app/mn_admin/mn_indexes/mn_views/editing/mn_views_editing_result.html'
      })
      .state('app.admin.indexes.gsi', {
        url: "/index?openedIndex",
        params: {
          openedIndex: {
            array: true,
            dynamic: true
          }
        },
        controller: "mnGsiController as gsiCtl",
        templateUrl: "app/mn_admin/mn_indexes/mn_gsi/mn_gsi.html"
      });
  }

})();
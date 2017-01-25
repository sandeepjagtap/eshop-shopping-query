/**
   Copyright 2015 Couchbase, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 **/
var ServersSection = {
  hostnameComparator: mkComparatorByProp('hostname', naturalSort),
  warmupKeyComparator: mkComparatorByProp('bucket', naturalSort),
  pendingEject: [], // nodes to eject on next rebalance
  pending: [], // nodes for pending tab
  active: [], // nodes for active tab
  allNodes: [], // all known nodes

  visitTab: function (tabName) {
    if (ThePage.currentSection != 'servers') {
      $('html, body').animate({scrollTop: 0}, 250);
    }
    ThePage.ensureSection('servers');
    this.tabs.setValue(tabName);
  },
  updateData: function () {
    var self = this;
    var serversValue = self.serversCell.value || {};

    _.each("pendingEject pending active allNodes".split(' '), function (attr) {
      self[attr] = serversValue[attr] || [];
    });
  },
  renderEverything: function () {
    this.detailsWidget.prepareDrawing();

    var details = this.poolDetails.value;
    var rebalancing = details && details.rebalanceStatus != 'none';

    var inRecovery = this.inRecoveryModeCell.value;
    var loadingSamples = this.isLoadingSamplesCell.value;

    var pending = _.clone(this.pending);
    var active = _.clone(this.active);

    this.serversQ.find('.add_button').toggle(!!(details && !rebalancing));
    this.serversQ.find('.stop_recovery_button').toggle(!!inRecovery);

    var mayRebalance = DAL.cells.mayRebalanceWithoutSampleLoadingCell.value && !loadingSamples && !DAL.cells.isOrphanBucketTaskCell.value

    var rebalanceButton = this.serversQ.find('.rebalance_button').toggle(!!details);
    rebalanceButton.toggleClass('dynamic_disabled', !mayRebalance);

    if (details && !rebalancing) {
      $('#rebalance_tab .badge span').text(pending.length);
      $('#rebalance_tab').toggleClass('badge_display', !!pending.length);
    } else {
      $('#rebalance_tab').toggleClass('badge_display', false);
    }

    this.serversQ.toggleClass('rebalancing', !!rebalancing);

    if (!details)
      return;

    if (active.length) {
      var sortBy = this.serversTableSortByCell.value;
      var sortDescending = this.serversTableSortDescendingCell.value;
      if (sortBy == "services") {
        function sortByServices(a, b) {
          return naturalSort(ViewHelpers.formatServices(a), ViewHelpers.formatServices(b));
        }
        active.sort(mkComparatorByProp(sortBy, sortByServices));
        pending.sort(mkComparatorByProp(sortBy, sortByServices));
      } else {
        active.sort(mkComparatorByProp(sortBy, naturalSort));
        pending.sort(mkComparatorByProp(sortBy, naturalSort));
      }
      if (sortDescending === "true") {
        active.reverse();
        pending.reverse();
      }

      renderTemplate('manage_server_list', {
        rows: active,
        expandingAllowed: !IOCenter.staleness.value,
        isGroupRaw: !!active[0].group
      }, $i('active_server_list_container'));

      renderTemplate('manage_server_list', {
        rows: pending,
        expandingAllowed: true,
        isGroupRaw: !!active[0].group
      }, $i('pending_server_list_container'));

      activateSortableControls($("#active_server_list_container"), this.serversTableSortByCell, this.serversTableSortDescendingCell);
      activateSortableControls($("#pending_server_list_container"), this.serversTableSortByCell, this.serversTableSortDescendingCell);
    }

    if (rebalancing) {
      $('#js_servers .add_button').hide();
      this.renderRebalance(details);
    }

    if (IOCenter.staleness.value) {
      $('#js_servers .staleness-notice').show();
      $('#js_servers').find('.add_button, .rebalance_button, #js_server_groups_tab').hide();
      $('#active_server_list_container, #pending_server_list_container').find('.re_add_button, .eject_server, .failover_server, .remove_from_list').addClass('dynamic_disabled');
    } else {
      $('#js_servers .staleness-notice').hide();
      $('#js_servers').find('.rebalance_button').show();
      $('#js_servers .add_button')[rebalancing ? 'hide' : 'show']();
    }

    $('#active_server_list_container .last-active').find('.eject_server').addClass('dynamic_disabled').end()
      .find('.failover_server').addClass('dynamic_disabled');

    $('#active_server_list_container .server_down .eject_server').addClass('dynamic_disabled');
    $('.failed_over .eject_server, .failed_over .failover_server').hide();

    if (inRecovery) {
      $('#active_server_list_container, #pending_server_list_container').find('.re_add_button, .eject_server, .failover_server, .remove_from_list').addClass('dynamic_disabled');
    }
  },
  renderServerDetails: function (item) {
    return this.detailsWidget.renderItemDetails(item);
  },
  renderRebalance: function (details) {
    var progress = this.rebalanceProgress.value;
    if (progress) {
      progress = progress.perNode;
    }
    if (!progress) {
      progress = {};
    }
    nodes = _.clone(details.nodes);
    nodes.sort(this.hostnameComparator);
    var emptyProgress = {progress: 0};
    _.each(nodes, function (n) {
      if (_.indexOf(n.services, "kv") === -1) {
        $($i(n.otpNode.replace('@', '-'))).find('.re_add_button, .eject_server, .failover_server, .remove_from_list').addClass('dynamic_disabled');
        return;
      }
      var p = progress[n.otpNode];
      if (!p)
        p = emptyProgress;
      n.progress = p.progress;
      n.percent = truncateTo3Digits(n.progress);
      $($i(n.otpNode.replace('@', '-'))).find('.actions').html('<span class="usage_info">' + escapeHTML(n.percent) + '% Complete</span><span class="server_usage"><span style="width: ' + escapeHTML(n.percent) + '%;"></span></span>');
    });
  },
  refreshEverything: function () {
    this.updateData();
    this.renderEverything();
    // It displays the status of auto-failover, hence we need to refresh
    // it to get the current values
    AutoFailoverSection.refreshStatus();
  },
  onRebalanceProgress: function () {
    var value = this.rebalanceProgress.value;
    if (value.status !== 'running') {
      // if state is not running due to error message and we started
      // that past rebalance
      if (this.sawRebalanceRunning && value.errorMessage) {
        // display message
        this.sawRebalanceRunning = false;
        displayNotice(value.errorMessage, true);
      }
      // and regardless of displaying that error message, exit if not
      // rebalancing
      return;
    }
    this.sawRebalanceRunning = true;

    this.renderRebalance(this.poolDetails.value);
  },
  init: function () {
    var self = this;

    self.poolDetails = DAL.cells.currentPoolDetailsCell;
    self.inRecoveryModeCell = DAL.cells.inRecoveryModeCell;
    self.stopRecoveryURI = Cell.computeEager(function (v) {
      // tasksRecoveryCell may be null to indicate that we know that
      // there's no recovery versus not having value yet
      return (v.need(DAL.cells.tasksRecoveryCell) || {}).stopURI;
    });

    self.isLoadingSamplesCell = DAL.cells.isLoadingSamplesCell;

    self.tabs = new TabsCell("serversTab",
                             "#js_servers .tabs",
                             "#js_servers .panes > div",
                             ["active", "pending"]);

    var detailsWidget = self.detailsWidget = new MultiDrawersWidget({
      hashFragmentParam: 'openedServers',
      template: 'server_details',
      elementKey: 'otpNode',
      placeholderCSS: '#js_servers .settings-placeholder',
      actionLink: 'openServer',
      actionLinkCallback: function () {
        ThePage.ensureSection('servers');
      },
      detailsCellMaker: function (nodeInfo, nodeName) {
        var rebalanceTaskCell = Cell.compute(function (v) {
          var progresses = v.need(DAL.cells.tasksProgressCell);
          return _.find(progresses, function (task) {
            return task.type === 'rebalance' && task.status === 'running';
          }) || undefined;
        });

        var thisNodeWarmupTaskCell = Cell.compute(function (v) {
          var progresses = v.need(DAL.cells.tasksProgressCell);
          return _.filter(progresses, function (task) {
            return task.type === 'warming_up' && task.status === 'running' && task.node === nodeInfo.otpNode;
          });
        });

        var rawNodeDetails = Cell.compute(function (v) {
          return future.get({url:  "/nodes/" + encodeURIComponent(nodeInfo.otpNode)});
        });
        rawNodeDetails.keepValueDuringAsync = true;

        var rv = Cell.compute(function (v) {
          var data = _.clone(v.need(rawNodeDetails));
          var rebalanceTask = v(rebalanceTaskCell);
          var warmupTasks = v.need(thisNodeWarmupTaskCell);

          if (warmupTasks.length) {
            data.thisNodeWarmupTasks = formatWarmupMessages(warmupTasks, ServersSection.warmupKeyComparator, "bucket");
          } else {
            data.thisNodeWarmupTasks = false;
          }

          if (rebalanceTask &&
              rebalanceTask.detailedProgress &&
              rebalanceTask.detailedProgress.bucket &&
              rebalanceTask.detailedProgress.bucketNumber !== undefined &&
              rebalanceTask.detailedProgress.bucketsCount !== undefined &&
              rebalanceTask.detailedProgress.perNode &&
              rebalanceTask.detailedProgress.perNode[nodeName]) {
            data.detailedProgress = {};

            var ingoing = rebalanceTask.detailedProgress.perNode[nodeName].ingoing;
            if (ingoing.activeVBucketsLeft != 0 ||
                ingoing.replicaVBucketsLeft != 0 ||
                ingoing.docsTotal != 0 ||
                ingoing.docsTransferred != 0) {
              data.detailedProgress.ingoing = ingoing;
            } else {
              data.detailedProgress.ingoing = false;
            }

            var outgoing = rebalanceTask.detailedProgress.perNode[nodeName].outgoing;
            if (outgoing.activeVBucketsLeft != 0 ||
                outgoing.replicaVBucketsLeft != 0 ||
                outgoing.docsTotal != 0 ||
                outgoing.docsTransferred != 0) {
              data.detailedProgress.outgoing = outgoing;
            } else {
              data.detailedProgress.outgoing = false;
            }

            data.detailedProgress.bucket = rebalanceTask.detailedProgress.bucket;
            data.detailedProgress.bucketNumber = rebalanceTask.detailedProgress.bucketNumber;
            data.detailedProgress.bucketsCount = rebalanceTask.detailedProgress.bucketsCount;
          } else {
            data.detailedProgress = false;
          }

          return data;
        });

        rv.delegateInvalidationMethods(rawNodeDetails);

        return rv;
      },
      valueTransformer: function (nodeInfo, nodeSettings) {
        return _.extend({}, nodeInfo, nodeSettings);
      },
      listCell: Cell.compute(function (v) {
        var serversCell = v.need(DAL.cells.serversCell);
        return serversCell.active.concat(serversCell.pending);
      }),
      aroundRendering: function (originalRender, cell, container) {
        originalRender();
        $(container).closest('tr').prev().find('.node_name .expander').toggleClass('closed', !cell.interested.value);
      }
    });

    self.serversCell = DAL.cells.serversCell;
    self.serversTableSortByCell = new Cell();
    self.serversTableSortByCell.setValue('hostname');
    self.serversTableSortDescendingCell = new Cell();

    var groupsSelector = $("#js_servers_group_select");
    Cell.subscribeMultipleValues(function (groups, enabled) {
      if (!enabled || !groups) {
        return;
      }
      groupsSelector.empty();
      _.each(groups.groups, function (group, index) {
         groupsSelector.append($("<option></option>").attr("value", group.addNodeURI).text(group.name));
      });
    }, DAL.cells.groupsUpdatedByRevisionCell, DAL.cells.groupsAvailableCell);

    self.poolDetails.subscribeValue(function (poolDetails) {
      $($.makeArray($('#js_servers .failover_warning')).slice(1)).remove();
      var warning = $('#js_servers .failover_warning');

      if (!poolDetails || poolDetails.rebalanceStatus != 'none') {
        return;
      }

      function showWarning(text) {
        warning.after(warning.clone().find('.warning-text').text(text).end().css('display', 'block'));
      }

      _.each(poolDetails.failoverWarnings, function (failoverWarning) {
        switch (failoverWarning) {
        case 'failoverNeeded':
          break;
        case 'rebalanceNeeded':
          showWarning('Rebalance required, some data is not currently replicated!');
          break;
        case 'hardNodesNeeded':
          showWarning('At least two servers with the data service are required to provide replication!');
          break;
        case 'softNodesNeeded':
          showWarning('Additional active servers required to provide the desired number of replicas!');
          break;
        case 'softRebalanceNeeded':
          showWarning('Rebalance recommended, some data does not have the desired replicas configuration!');
          break;
        default:
          console.log('Got unknown failover warning: ' + failoverSafety);
        }
      });
    });

    Cell.subscribeMultipleValues(function () {
      self.refreshEverything();
    }, self.serversCell, self.inRecoveryModeCell, self.isLoadingSamplesCell, DAL.cells.mayRebalanceWithoutSampleLoadingCell, self.serversTableSortByCell, self.serversTableSortDescendingCell);

    Cell.subscribeMultipleValues(function (currentSection, isSampleLoading, mayRebalanceWithoutSampleLoading) {
      if (currentSection !== "servers") {
        return;
      }

      $("#js_rebalance_during_sample_load").toggle(!!mayRebalanceWithoutSampleLoading && !!isSampleLoading);

    }, DAL.cells.mode, self.isLoadingSamplesCell, DAL.cells.mayRebalanceWithoutSampleLoadingCell);

    prepareTemplateForCell('active_server_list', self.serversCell);
    prepareTemplateForCell('pending_server_list', self.serversCell);

    var serversQ = self.serversQ = $('#js_servers');

    serversQ.find('.rebalance_button').live('click', self.accountForDisabled($m(self, 'onRebalance')));
    serversQ.find('.add_button').live('click', $m(self, 'onAdd'));
    serversQ.find('.stop_rebalance_button').live('click', $m(self, 'onStopRebalance'));
    serversQ.find('.stop_recovery_button').live('click', $m(self, 'onStopRecovery'));

    function mkServerRowHandler(handler) {
      return function (e) {
        var serverRow = $(this).closest('.server_row').find('td:first-child').data('server') || $(this).closest('.add_back_row').next().find('td:first-child').data('server');
        return handler.call(this, e, serverRow);
      }
    }

    function mkServerAction(handler) {
      return ServersSection.accountForDisabled(mkServerRowHandler(function (e, serverRow) {
        e.preventDefault();
        return handler(serverRow.hostname, $(this).data('recovery-type'));
      }));
    }

    serversQ.find('.add_back_btn').live('click', mkServerAction($m(self, 'reAddNode')));
    serversQ.find('.eject_server').live('click', mkServerAction($m(self, 'ejectNode')));
    serversQ.find('.failover_server').live('click', mkServerAction($m(self, 'failoverNode')));
    serversQ.find('.remove_from_list').live('click', mkServerAction($m(self, 'removeFromList')));

    self.rebalanceProgress = Cell.needing(DAL.cells.tasksProgressCell).computeEager(function (v, tasks) {
      for (var i = tasks.length; --i >= 0;) {
        var taskInfo = tasks[i];
        if (taskInfo.type === 'rebalance') {
          return taskInfo;
        }
      }
    }).name("rebalanceProgress");
    self.rebalanceProgress.equality = _.isEqual;
    self.rebalanceProgress.subscribe($m(self, 'onRebalanceProgress'));

    (function () {
      Cell.computeEager(function (v) {
        return v.need(DAL.cells.tasksRebalanceCell).subtype === "gracefulFailover";
      }).subscribeValue(function (toggle) {
        $("#js_rebalance_btn_text").text(toggle ? "Stop Fail Over": "Stop Rebalance");
      });

      DAL.cells.inRebalanceCell.subscribeValue(function (toggle) {
        serversQ.find('.stop_rebalance_button').toggle(!!toggle);
      });
    })();
  },
  accountForDisabled: function (handler) {
    return function (e) {
      if ($(e.currentTarget).hasClass('dynamic_disabled')) {
        e.preventDefault();
        return;
      }
      return handler.call(this, e);
    }
  },
  renderUsage: function (e, totals, withQuotaTotal, isQueryOnlyNode) {
    var options = {
      topAttrs: {'class': "usage-block"},
      topRight: ['Total', ViewHelpers.formatMemSize(totals.total)],
      items: [
        {name: 'Other Data',
         value: totals.used - totals.usedByData,
         attrs: {style:"background-color:#FDC90D"},
         tdAttrs: {style: "color:#C19710;"}},
        {name: 'Free',
         value: totals.total - totals.used}
      ],
      markers: []
    };
    if (!isQueryOnlyNode) {
      options.items.unshift({
        name: 'In Use',
        value: totals.usedByData,
        attrs: {style: 'background-color:#00BCE9'},
        tdAttrs: {style: "color:#1878A2;"}
      });
    }
    if (withQuotaTotal && !isQueryOnlyNode) {
      options.topLeft = ['Couchbase Quota', ViewHelpers.formatMemSize(totals.quotaTotal)];
      options.markers.push({value: totals.quotaTotal,
                            attrs: {style: "background-color:#E43A1B;"}});
    }
    $(e).replaceWith(memorySizesGaugeHTML(options));
  },
  onEnter: function () {
    // we need this 'cause switchSection clears rebalancing class
    this.refreshEverything();
  },
  onLeave: function () {
    this.detailsWidget.reset();
  },
  onRebalance: function () {
    var self = this;

    if (!self.poolDetails.value) {
      return;
    }

    self.postAndReload(self.poolDetails.value.controllers.rebalance.uri,
                       {knownNodes: _.pluck(self.allNodes, 'otpNode').join(','),
                        ejectedNodes: _.pluck(self.pendingEject, 'otpNode').join(',')});
    self.poolDetails.getValue(function () {
      // switch to active server tab when poolDetails reload is complete
      self.tabs.setValue("active");
    });
  },
  onStopRebalance: function () {
    var self = this;

    if (!self.poolDetails.value) {
      return;
    }

    var uri = self.poolDetails.value.stopRebalanceUri;
    var modal;
    sendStop(uri + "&onlyIfSafe=1");
    return;

    function sendStop(url) {
      modal = new ModalAction();
      self.poolDetails.setValue(undefined);
      $.ajax({url: url,
              type: 'POST',
              success: afterSend,
              error: afterSend});
    }

    function afterSend(data, textStatus) {
      self.poolDetails.invalidate();
      modal.finish();

      if (textStatus == "success") {
        // done
        return;
      }

      var status = 0;
      try {
        status = data.status;
      } catch (e) {}

      if (status != 400) {
        displayNotice("Request failed. Check logs.", true);
        return;
      }

      // for 400 we assume "stop rebalance is not safe" answer

      showDialogHijackingSave(
        "stop_rebalance_confirmation_dialog", ".save_button",
        function () {
          sendStop(uri);
        });
    }
  },
  onStopRecovery: function () {
    var uri = this.stopRecoveryURI.value;
    if (!uri) {
      return;
    }

    this.postAndReload(uri, "");
  },
  bindIndexAndN1qlCheckboxesOnCE: function (root) {
    if (DAL.cells.isEnterpriseCell.value) {
      return;
    }
    $(root + " [name='services']").unbind("change").change(function (e) {
      e.preventDefault();
      $(root + " [value=index]").prop("checked", $(this).prop("checked"));
      $(root + " [value=n1ql]").prop("checked", $(this).prop("checked"));
    });
  },
  getCheckedServices: function (context) {
    return $("[name=services]:checked", context).map(function () {
      return this.value;
    }).get().join(',');
  },
  validateJoinClusterParams: function (form) {
    var data = {}
    _.each("hostname user password".split(' '), function (name) {
      data[name] = form.find('[name=' + name + ']').val();
    });

    data.services = ServersSection.getCheckedServices(form);

    var errors = [];
    if (data['services'] == "") {
      errors.push("Please specify a Service(s) for this node.");
    }
    if (data['hostname'] == "") {
      errors.push("Server IP Address cannot be blank.");
    }
    if (!data['user'] || !data['password']) {
      data['user'] = '';
      data['password'] = '';
    }

    if (!errors.length) {
      return data;
    }
    return errors;
  },
  onAdd: function () {
    var self = this;

    if (!self.poolDetails.value) {
      return;
    }

    var dialog = $('#join_cluster_dialog');
    var form = dialog.find('form');
    $('#join_cluster_dialog_errors_container').empty();
    $('#join_cluster_dialog form').get(0).reset();
    dialog.find("input:not([type]), input[type=text], input[type=password]").val('');
    dialog.find('[name=user]').val('Administrator');
    dialog.find(".when-groups").toggle(!!DAL.cells.groupsAvailableCell.value);
    dialog.find("[name=services]").prop("checked", true);
    if (!DAL.cells.isEnterpriseCell.value) {
      dialog.find("[value=kv]").prop("disabled", true);
    }
    ServersSection.bindIndexAndN1qlCheckboxesOnCE("#join_cluster_dialog");

    showDialog('join_cluster_dialog', {
      onHide: function () {
        form.unbind('submit');
      }});
    form.bind('submit', function (e) {
      e.preventDefault();

      var errorsOrData = self.validateJoinClusterParams(form);
      if (errorsOrData.length) {
        renderTemplate('join_cluster_dialog_errors', errorsOrData);
        return;
      }

      if (!DAL.cells.is40СompatibleCell.value) {
        delete errorsOrData.services;
      }

      var confirmed;

      $('#join_cluster_dialog').addClass('overlayed').dialog('option', 'closeOnEscape', false);

      $('#join_cluster_dialog_errors_container').empty();
      var overlay = overlayWithSpinner($($i('join_cluster_dialog')));
      var uri = $("#js_servers_group_select").val() || self.poolDetails.value.controllers.addNode.uri;

      self.poolDetails.setValue(undefined);

      jsonPostWithErrors(uri, $.param(errorsOrData), function (data, status) {
        self.poolDetails.invalidate();
        if (status != 'success') {
          overlay.remove();
          renderTemplate('join_cluster_dialog_errors', data);
        } else {
          self.poolDetails.getValue(function (poolData) {
            overlay.remove();
            hideDialog('join_cluster_dialog');
            if (ServersSection.isOnlyOneNodeWithService(poolData.nodes, errorsOrData, 'index')) {
              var settings = ClusterSection.prepareClusterQuotaSettings(
                'add_node_memory_quota',
                poolData,
                errorsOrData.services.indexOf('kv') > -1
              );
              var memoryQuotaWidget = new MemoryQuotaSettingsWidget(settings, $('#js_add_node_memory_quota_holder'));
              showDialog('js_memory_quota_dialog', {
                closeOnEscape: false,
                eventBindings: [['form', 'submit', function (e) {
                  e.preventDefault();
                  var overlay = overlayWithSpinner($('#js_memory_quota_dialog'));
                  memoryQuotaWidget.tryToSaveMemoryQuota().done(function () {
                    hideDialog('js_memory_quota_dialog');
                    self.poolDetails.setValue(undefined);
                    self.poolDetails.invalidate();
                  }).always(function () {
                    overlay.remove();
                  });
                }]]
              });
            }
          });
        }
      });
    });
  },
  findNode: function (hostname) {
    return _.detect(this.allNodes, function (n) {
      return n.hostname == hostname;
    });
  },
  mustFindNode: function (hostname) {
    var rv = this.findNode(hostname);
    if (!rv) {
      throw new Error("failed to find node info for: " + hostname);
    }
    return rv;
  },
  reDraw: function () {
    this.serversCell.invalidate();
  },
  ejectNode: function (hostname) {
    var self = this;

    var node = self.mustFindNode(hostname);
    if (node.pendingEject)
      return;

    if (!self.poolDetails.value) {
      return;
    }

    // somebody hit cancel button for node that's pending recovery. We
    // don't need to confirm placing node back into failed over state
    if (node.clusterMembership == 'inactiveAdded' && node.recoveryType != 'none') {
      self.postAndReload(self.poolDetails.value.controllers.reFailOver.uri,
                         {otpNode: node.otpNode});
      return;
    }

    if (node.clusterMembership == 'inactiveAdded') {
      self.postAndReload(self.poolDetails.value.controllers.ejectNode.uri,
                         {otpNode: node.otpNode});
      return;
    }

    $.ajax({
      url: 'indexStatus',
      type: 'GET',
      success: afterSend
    });

    function afterSend(resp) {
      var warningFlags = {
        isLastIndex: ServersSection.isOnlyOneActiveNodeWithService(ServersSection.allNodes, node, 'index'),
        isLastQuery: ServersSection.isOnlyOneActiveNodeWithService(ServersSection.allNodes, node, 'n1ql'),
        isLastFullText: ServersSection.isOnlyOneActiveNodeWithService(ServersSection.allNodes, node, 'fts'),
        isThereIndex: !!_.find(resp.indexes, function (index) {
          return _.indexOf(index.hosts, hostname) > -1;
        }),
        isKv: _.indexOf(node.services, 'kv') > -1
      };
      if (_.some(_.values(warningFlags))) {
        renderTemplate("eject_confirmation_dialog", warningFlags);
        showDialogHijackingSave("eject_confirmation_dialog", ".save_button", function () {
          self.pendingEject.push(node);
          self.reDraw();
        });
      } else {
        self.pendingEject.push(node);
        self.reDraw();
      }
    }
  },
  isOnlyOneNodeWithService: function (nodes, node, service) {
    var nodesCount = 0;
    var indexExists = _.each(nodes, function (node) {
      nodesCount += (_.indexOf(node.services, service) > -1);
    });
    return nodesCount === 1 && node.services.indexOf(service) > -1;
  },
  isOnlyOneActiveNodeWithService: function (nodes, node, service) {
    var nodesCount = 0;
    var indexExists = _.each(nodes, function (node) {
      nodesCount += node.clusterMembership === 'active' && !node.pendingEject && (_.indexOf(node.services, service) > -1);
    });
    return nodesCount === 1 && _.indexOf(node.services, service) > -1;
  },
  failoverNode: function (hostname) {
    var self = this;
    var node;
    var dialog = $('#failover_confirmation_dialog');
    var visibleWarning;
    showDialogHijackingSave("failover_confirmation_dialog", ".save_button", function () {
      if (!node)
        throw new Error("must not happen!");
      if (!self.poolDetails.value) {
        return;
      }
      var url = self.poolDetails.value.controllers[$("input[name=failOver]:checked", visibleWarning).val()].uri;
      self.postAndReload(url, {otpNode: node.otpNode}, undefined, {timeout: 120000});
    });
    if (!self.failoverDialogInitTitle) {
      self.failoverDialogInitTitle = dialog.dialog("option", "title");
    }
    dialog.dialog("option", "title", self.failoverDialogInitTitle + " for " + hostname);
    var overlay = overlayWithSpinner(dialog.find('.content').need(1));
    var statusesCell = DAL.cells.nodeStatusesCell;
    statusesCell.setValue(undefined);
    statusesCell.invalidate();
    statusesCell.changedSlot.subscribeOnce(function () {
      overlay.remove();
      dialog.find('.failover_warning').hide();
      var statuses = statusesCell.value;
      node = statuses[hostname];
      if (!node) {
        hideDialog("failover_confirmation_dialog");
        return;
      }

      var backfill = node.replication < 1;
      var down = node.status != 'healthy';
      var subsectionType = ['.warning', down ? 'down' : 'up', backfill ? 'backfill' : 'no_backfill'].join('_');
      if (node.dataless) {
        subsectionType = '.warning_dataless';
      }
      visibleWarning = dialog.find(subsectionType).show();
      dialog.find('.backfill_percent').text(truncateTo3Digits(node.replication * 100));
      var confirmation = visibleWarning.find('[name=confirmation]');

      $(".js_gracefull_failover_message", visibleWarning).toggle(!node.gracefulFailoverPossible);
      $("input[name=failOver][value=startGracefulFailover]", visibleWarning).attr('disabled', !node.gracefulFailoverPossible);
      $("input[name=failOver][value=" + (node.gracefulFailoverPossible ? "startGracefulFailover" : "failOver") + "]", visibleWarning).attr('checked', true);

      if (down) {
        bindConfirmation();
      } else {
        $("input[name=failOver]", visibleWarning).unbind('change').change(function () {
          var isHardFailOver = $(this).val() === 'failOver';
          $(".js_warning", visibleWarning).toggle(isHardFailOver);
          isHardFailOver ? bindConfirmation() : unbindConfirmation();
        });
        $("input[name=failOver]:checked", visibleWarning).change();
      }

      function unbindConfirmation() {
        confirmation.unbind('change');
        dialog.find(".save_button").removeAttr("disabled");
      }

      function onConfirmChange() {
        var checked = !!confirmation.attr('checked');
        dialog.find('.save_button').boolAttr('disabled', !checked);
      }

      function bindConfirmation() {
        if (confirmation.length) {
          confirmation
            .boolAttr('checked', false)
            .unbind('change')
            .bind('change', onConfirmChange)
            .change();
        } else {
          unbindConfirmation();
        }
      }
    });
  },
  reAddNode: function (hostname, recoveryType) {
    if (!this.poolDetails.value) {
      return;
    }

    var node = this.mustFindNode(hostname);
    this.postAndReload(this.poolDetails.value.controllers.setRecoveryType.uri, {
      otpNode: node.otpNode,
      recoveryType: recoveryType
    });
  },
  removeFromList: function (hostname) {
    var node = this.mustFindNode(hostname);

    if (node.pendingEject) {
      this.serversCell.cancelPendingEject(node);
      return;
    }

    var ejectNodeURI = this.poolDetails.value.controllers.ejectNode.uri;
    this.postAndReload(ejectNodeURI, {otpNode: node.otpNode});
  },
  postAndReload: function (uri, data, errorMessage, ajaxOptions) {
    var self = this;
    // keep poolDetails undefined for now
    self.poolDetails.setValue(undefined);
    errorMessage = errorMessage || "Request failed. Check logs."
    jsonPostWithErrors(uri, $.param(data), function (data, status, errorObject) {
      // re-calc poolDetails according to it's formula
      self.poolDetails.invalidate();
      if (status == 'error') {
        if (errorObject && errorObject.mismatch) {
          self.serversCell.changedSlot.subscribeOnce(function () {
            var msg = "Could not Rebalance because the cluster configuration was modified by someone else.\nYou may want to verify the latest cluster configuration and, if necessary, please retry a Rebalance."
            alert(msg);
          });
        } else if (errorObject && errorObject.deltaRecoveryNotPossible) {
          self.serversCell.changedSlot.subscribeOnce(function () {
            var msg = "Could not Rebalance because requested delta recovery is not possible. You probably added more nodes to the cluster or changed server groups configuration.";
            alert(msg);
          });
        } else if (errorObject && errorObject.noKVNodesLeft) {
          self.serversCell.changedSlot.subscribeOnce(function () {
            var msg = "Could not Rebalance out last kv node(s).";
            alert(msg);
          });
        } else {
          displayNotice(errorMessage, true);
        }
      }
    }, ajaxOptions);
  }
};

configureActionHashParam('visitServersTab', $m(ServersSection, 'visitTab'));

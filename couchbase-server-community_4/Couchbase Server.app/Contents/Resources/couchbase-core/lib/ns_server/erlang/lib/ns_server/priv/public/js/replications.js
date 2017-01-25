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
var ReplicationsModel = {};

(function () {
  var model = ReplicationsModel;
  var remoteClustersListURICell = model.remoteClustersListURICell = Cell.compute(function (v) {
    if (v.need(DAL.cells.mode) != 'replications')
      return;
    return v.need(DAL.cells.currentPoolDetailsCell).remoteClusters.uri;
  });
  var rawRemoteClustersListCell = model.remoteClustersAllListCell = Cell.compute(function (v) {
    return future.get({url: v.need(remoteClustersListURICell)}, function (list) {
      return _.sortBy(list, function (info) {return info.name});
    });
  });
  rawRemoteClustersListCell.keepValueDuringAsync = true;

  var remoteClustersListCell = model.remoteClustersListCell = Cell.compute(function (v) {
    return _.filter(v.need(rawRemoteClustersListCell), function (info) { return !info.deleted });
  });
  remoteClustersListCell.keepValueDuringAsync = true;

  var createReplicationURICell = model.createReplicationURICell = Cell.computeEager(function (v) {
    return v.need(DAL.cells.currentPoolDetailsCell).controllers.replication.createURI;
  });

  model.refreshReplications = function (softly) {
    if (!softly) {
      remoteClustersListCell.setValue(undefined);
    }
    rawRemoteClustersListCell.invalidate();
    DAL.cells.tasksProgressCell.invalidate();
  }
})();

var ReplicationForm = mkClass({
  initialize: function () {
    var self = this;
    self.dialog = $('#create_replication_dialog');
    self.form = self.dialog.find('form');
    self.onSubmit = $m(self, 'onSubmit');
    self.form.bind('submit', self.onSubmit);
    self.advacedXDCRSettings = $("#js_xdcr_advaced_settings");
    self.advancedSettingsContainer = $("#js_xdcr_advaced_settings_container");

    var xdcrAdvacedSettingsBtn = $("#js_xdcr_advaced_settings_btn");

    self.advacedXDCRSvalidator = setupFormValidation(self.advacedXDCRSettings, "/settings/replications/?just_validate=1", function (status, errors) {
      ReplicationsSection.hideXDCRErrors(self.advacedXDCRSettings);
      if (status == "error") {
        ReplicationsSection.showXDCRErrors(errors, self.advacedXDCRSettings);
      }
    }, function () {
      return serializeForm(self.advacedXDCRSettings);
    });

    self.advacedXDCRSvalidator.pause();

    xdcrAdvacedSettingsBtn.click(function (e) {
      self.advancedSettingsContainer.toggle();
      self.maybeEnabeXDCRFormValidation();
    });

    DAL.cells.bucketsListCell.subscribeValue(function(buckets) {
      if (!buckets) {
        return;
      }
      var rb = $('#replication_from_bucket');
      rb.html('<option value="">select a bucket</option>');
      _.each(buckets.byType.membase, function (bucket) {
        rb.append('<option>' + escapeHTML(bucket.name) + '</option>');
      });
    });

    var advacedXDCRFiltering = jQuery("#js_xdcr_advaced_filtering");
    var testKeyResult = self.testKeyResult = jQuery('.js_test_key_result', advacedXDCRFiltering);
    var testKeyFocus = jQuery('.js_test_key_focus', advacedXDCRFiltering);
    var advancedXDCRFilteringContainer = self.advancedXDCRFilteringContainer = jQuery("#js_xdcr_advaced_filtering_container");
    var advancedXDCRFilteringBtn = self.advancedXDCRFilteringBtn = jQuery("#js_xdcr_advaced_filtering_btn");
    var regExpField = jQuery('#js_filter_expression');
    var matchIndicator = jQuery('#js_match_indicator');
    var regexpValidation;
    self.validateTestKey = validateTestKey;
    function sanitize(html) {
      return jQuery('<pre/>').text(html).html();
    }
    function doValidateOnOverLimit(text) {
      return getStringBytes(text) > 250;
    }
    function validateOnOverLimit(field, name) {
      if (doValidateOnOverLimit(field.text())) {
        ReplicationsSection.showXDCRErrors({
          filterExpression: name + ' should not have size more than 250 bytes'
        }, advancedXDCRFilteringContainer);
        return false;
      }
      return true;
    }
    function validateTestKeysOnOverlimit() {
      var rv = true;
      $.each(testKeyResult, function (index, testKey) {
        return rv = validateOnOverLimit(jQuery(testKey), 'Test key');
      });
      return rv;
    }
    function getTestKeys() {
      return testKeyResult.map(function() {
        return jQuery(this).text();
      });
    }
    function getRegexValue() {
      return regExpField.text();
    }
    var spinnerTimeout;
    function clearSpinnerTimeout() {
      if (spinnerTimeout) {
        clearTimeout(spinnerTimeout);
      }
    }
    function enableSpinnerTimeout() {
      spinnerTimeout = setTimeout(function() {
        matchIndicator.removeClass('dynamic_match').addClass('dynamic_spinner');
      }, 500);
    }
    function cancelXhr() {
      clearSpinnerTimeout();
      regexpValidation && regexpValidation.abort();
    }
    function validateTestKey() {
      cancelXhr();
      ReplicationsSection.hideXDCRErrors(advancedXDCRFilteringContainer);
      if (!getRegexValue() || !validateTestKeysOnOverlimit() || !validateOnOverLimit(regExpField, 'Regex')) {
        matchIndicator.removeClass('dynamic_match');
        return;
      }
      var noMatch = true;
      enableSpinnerTimeout();
      regexpValidation = jQuery.ajax({
        type: 'POST',
        data: {
          expression: getRegexValue(),
          keys: JSON.stringify(getTestKeys().filter(function (idx, val) {return !!val;}).get())
        },
        url: '/_goxdcr/regexpValidation',
        dataType: 'json',
        complete: function () {
          clearSpinnerTimeout();
          matchIndicator.removeClass('dynamic_spinner').toggleClass('dynamic_match', !noMatch);
        },
        success: function (data) {
          jQuery.each(data, function (key, pairs) {
            if (key === "") {
              return;
            }
            var result = "";
            var fullSetOfPairs = [];
            _.sortBy(pairs, 'startIndex');
            if (pairs[0] && pairs[0].startIndex != 0) {
              fullSetOfPairs.push({
                startIndex: 0,
                endIndex: pairs[0].startIndex
              });
            }
            jQuery.each(pairs, function (index, pair) {
              if (pair.endIndex !== pair.startIndex) {
                pair.backlight = true;
                fullSetOfPairs.push(pair);
              }
              var next = pairs[index + 1];
              if (next) {
                if (pair.endIndex !== next.startIndex) {
                  fullSetOfPairs.push({
                    startIndex: pair.endIndex,
                    endIndex: next.startIndex
                  });
                }
              } else {
                fullSetOfPairs.push({
                  startIndex: pair.endIndex,
                  endIndex: key.length
                });
              }
            });
            jQuery.each(fullSetOfPairs, function (index, pair) {
              var textPart = key.substring(pair.startIndex, pair.endIndex);
              textPart = sanitize(textPart);
              if (pair.backlight) {
                result += '<span>' + textPart + '</span>';
              } else {
                result += textPart;
              }
            });
            var target = testKeyResult.filter(function () {
              return jQuery(this).text() === key;
            });
            if (result) {
              noMatch = false;
              jQuery(target).each(function () {
                target = jQuery(this);
                if (!target.is(":focus")) {
                  target.addClass('dynamic_hightlight');
                  target.empty().html(result);
                }
              });
            }
          });
        },
        error: function (xhr) {
          ReplicationsSection.showXDCRErrors({
            filterExpression: xhr.responseText
          }, advancedXDCRFilteringContainer);
        }
      });
    }
    function clearFromNewLine(jqElement) {
      var value = jqElement.text();
      jqElement.empty().text(value);
    }
    function sanitizeOnPast(e) {
      var clipboardData = (e.originalEvent || e).clipboardData || window.clipboardData;
      try {
        var text = clipboardData.getData('text/plain');
        window.document.execCommand('insertText', false, text);
      } catch (_e) {
        var text = clipboardData.getData('Text');
        try {
          document.selection.createRange().pasteHTML(text);
        } catch (_e) {
          try {
            document.execCommand('InsertHTML', false, text);
          } catch (_e) {
            // if the getting text from clipboard fails we short-circuit return to allow
            // the browser handle the paste natively (i.e. we don't call preventDefault().)
            return;
          }
        }
      }
      e.preventDefault();
    }
    function contentEditableUsableTab(event) {
      //IE inserts tabulation in contenteditable tag instead of make focus on next element,
      //absolutely unfriendly when you have no mouse
      //but after text have selected and tabulation pressed it behaves like other browser
      //unfortunately works only when input has text
      if (event.keyCode == 9) {
        document.execCommand('selectAll', true, null);
      }
    }
    var throttled = _.throttle(validateTestKey, 500);
    var previousRegex;
    regExpField.keyup(function () {
      var currentRegex = getRegexValue();
      if (previousRegex === currentRegex) {
        return;
      }
      previousRegex = currentRegex;
      if (!doValidateOnOverLimit(currentRegex)) {
        localStorage.setItem('mn_xdcr_regex', currentRegex);
      }
      testKeyResult.removeClass('dynamic_hightlight');
      throttled();
    }).keydown(contentEditableUsableTab).blur(function () {
      clearFromNewLine(jQuery(this));
    }).bind('paste', sanitizeOnPast);
    testKeyResult.blur(function () {
      clearFromNewLine(jQuery(this));
      if (!doValidateOnOverLimit(jQuery(this).text())) {
        localStorage.setItem('mn_xdcr_testKeys', JSON.stringify(getTestKeys().get()));
      }
      validateTestKey();
    }).focus(function () {
      jQuery(this).removeClass('dynamic_hightlight');
    }).keydown(contentEditableUsableTab).bind('paste', sanitizeOnPast);
    advancedXDCRFilteringBtn.click(function (e) {
      advancedXDCRFilteringContainer.toggle();
    });
    try {
      regExpField.text(localStorage.getItem('mn_xdcr_regex'));
      var maybeTestKeys = JSON.parse(localStorage.getItem('mn_xdcr_testKeys'));
      jQuery(maybeTestKeys).each(function (index, key) {
        testKeyResult.eq(index).text(key);
      });
    } catch (_e) {}
  },
  maybeEnabeXDCRFormValidation: function () {
    var self = this;
    if (self.advancedSettingsContainer.is(":visible")) {
      self.advacedXDCRSvalidator.unpause();
    }
  },
  startCreate: function (callback) {
    var self = this;

    self.advancedSettingsContainer.hide();
    self.advancedXDCRFilteringContainer.hide();
    self.advancedXDCRFilteringBtn.attr('checked', false);
    self.advacedXDCRSettings.find("select option[value=xmem]").boolAttr('selected', true);

    self.closeCallback = callback;
    ReplicationsModel.remoteClustersListCell.getValue(function (remoteClusters) {
      self.fillClustersSelect(remoteClusters);
      SettingsSection.renderErrors({}, self.form);
      setFormValues(self.form, {
        fromBucket: '',
        toBucket: '',
        toCluster: '',
        replicationType: 'continuous'
      });
      showDialog('create_replication_dialog', {
        position: { my: "center top", at: "center bottom", of: $("#headerNav") },
        dialogClass: "absolute-positioned-dialog",
        open: function () {
          self.validateTestKey();
        },
        onHide: function () {
          ReplicationsSection.hideXDCRErrors(self.advancedXDCRFilteringContainer);
          self.testKeyResult.removeClass('dynamic_hightlight');
          self.advacedXDCRSvalidator.pause();
          ReplicationsSection.hideXDCRErrors(self.advacedXDCRSettings);
        }
      });
    });

    $.get("/settings/replications/", function (settings) {
      setFormValues(self.advacedXDCRSettings, settings);
      self.maybeEnabeXDCRFormValidation();
    });
  },
  close: function () {
    hideDialog('create_replication_dialog');
    var callback = this.closeCallback;
    this.closeCallback = null;
    if (callback) {
      callback.apply(this, arguments);
    }
  },
  onSubmit: function (e) {
    e.preventDefault();

    var self = this;
    var URI = ReplicationsModel.createReplicationURICell.value;
    if (!URI) {
      return;
    }
    var spinner = overlayWithSpinner(self.dialog, null, "Creating replication...");
    var isEnterprise = DAL.cells.isEnterpriseCell.value;
    var isGoXDCREnabled = DAL.cells.isGoXDCREnabledCell.value;
    var formValues;
    if (isGoXDCREnabled && isEnterprise && self.advancedXDCRFilteringBtn.attr('checked') === 'checked') {
      formValues = $.deparam(serializeForm(self.form));
      formValues.filterExpression = jQuery('#js_filter_expression').text();
      formValues = $.param(formValues);
    } else {
      formValues = serializeForm(self.form);
    }
    SettingsSection.renderErrors({}, self.form);
    jsonPostWithErrors(URI, formValues, function (data, status, errorObject) {
      spinner.remove();
      if (status == 'success') {
        self.close();
      } else {
        SettingsSection.renderErrors(errorObject || data, self.form, undefined, undefined, true);
      }
    });
  },
  fillClustersSelect: function (remoteClusters) {
    var toClusterSelect = $('#replication_to_cluster');
    toClusterSelect.html("<option value=''>Pick remote cluster</option>");
    _.map(remoteClusters, function (remoteCluster) {
      var option = $("<option></option>");
      option.text(remoteCluster.name);
      option.attr('value', remoteCluster.name);
      toClusterSelect.append(option);
    });
  }
});

// this turns ReplicationForm into lazily initialized singleton
mkClass.turnIntoLazySingleton(ReplicationForm);

ViewHelpers.formatReplicationStatus = function (info) {
  var rawStatus = '<span>' + escapeHTML(info.humanStatus) + '</span>';
  var errors = (info.errors || []);

  if (info.status !== 'notRunning') {
    rawStatus += '<span class="only-when-30 js_replication_control replication_control dynamic_' + info.status + '"></span>';
  }

  if (errors.length === 0) {
    return rawStatus;
  }

  var id = _.uniqueId('xdcr_errors');
  var rv = rawStatus + " <a onclick='showXDCRErrors(" + JSON.stringify(id) + ");'>Last " + ViewHelpers.count(errors.length, 'error');
  rv += "</a>"
  rv += "<script type='text/html' id='" + escapeHTML(id) + "'>"
  rv += JSON.stringify(errors)
  rv += "</script>"
  return rv;
}

function showXDCRErrors(id) {
  var text;
  try {
    text = document.getElementById(id).innerHTML;
  } catch (e) {
    console.log("apparently our data element is dead. Ignoring exception: ", e);
    return;
  }
  elements = JSON.parse(text);
  genericDialog({
    buttons: {ok: true},
    header: "XDCR Errors",
    textHTML: "<ul class=\"xdcr_errors break-word\">" + _.map(elements, function (anError) {return "<li>" + escapeHTML(anError) + "</li>"}).join('') + "</ul>"
  });
}

function mkReplicationSectionCell(ns, currentXDCRSettingsURI, tasksProgressCell, mode) {
  ns.maybeXDCRTaskCell = Cell.compute(function (v) {
    var progresses = v.need(tasksProgressCell);
    return _.filter(progresses, function (task) {
      return task.type === 'xdcr';
    });
  });
  ns.maybeXDCRTaskCell.equality = _.isEqual;

  // NOTE: code below is a bit complex. That's because we need to
  // fetch both global settings and per-replication settings every
  // time we need combined settings. There is other ways to do it but
  // cell holding cell seems simplest.
  //
  // Ideally given that we only need per-replication settings for
  // editing it in modal dialog, we'd not do it via cells, but that's
  // how this code is done already. And this code is already scheduled
  // for rewrite.
  //
  // Cell-of-cell trick ensures that every recalculation of this cell
  // will re-fetch both endpoints (because "inner cells" will be
  // totally new instances)
  ns.settingsCellCell = Cell.compute(function (v) {
    var uri = v.need(currentXDCRSettingsURI)
    if (!uri) {
      return
    }
    var globalSettingsCell = Cell.compute(function (v) {
      return future.get({url: "/settings/replications"});
    });
    var thisSettingsRawCell = Cell.compute(function () {
      return future.get({url: uri});
    });
    return Cell.compute(function (v) {
      var globalSettings = v(globalSettingsCell);
      var thisSettings = v(thisSettingsRawCell);
      if (!globalSettings || !thisSettings) {
        return;
      }
      return _.extend({}, globalSettings, thisSettings);
    });
  });

  ns.perReplicationSettingsCell = Cell.compute(function (v) {
    return v.need(v.need(ns.settingsCellCell));
  });
  ns.perReplicationSettingsCell.delegateInvalidationMethods(ns.settingsCellCell);

  ns.replicationRowsCell = Cell.compute(function (v) {
    if (v.need(mode) != 'replications') {
      return;
    }

    var replications = v.need(ns.maybeXDCRTaskCell);
    var clusters = v.need(ReplicationsModel.remoteClustersListCell);
    var rawClusters = v.need(ReplicationsModel.remoteClustersAllListCell);

    return _.map(replications, function (replication) {
      var clusterUUID = replication.id.split("/")[0];
      var cluster = _.filter(clusters, function (cluster) {
        return cluster.uuid === clusterUUID;
      })[0];

      var name;
      if (cluster) {
        name = '"' + cluster.name + '"';
      } else {
        cluster = _.filter(rawClusters, function (cluster) {
          return cluster.uuid === clusterUUID;
        })[0];
        if (cluster) {
          // if we found cluster among rawClusters we assume it was
          // deleted
          name = 'at ' + cluster.hostname;
        } else {
          name = '"unknown"';
        }
      }

      var protocolVersion = replication.replicationType === "xmem" ? "2" :
                            replication.replicationType === "capi" ? "1" : "unknown";

      var status = replication.status;
      var humanStatus = 'Starting Up';
      var pauseRequested = replication["pauseRequested"]
      if (status == 'running') {
        humanStatus = 'Replicating';
      } else if (status == 'paused') {
        humanStatus = 'Paused';
      }
      if (pauseRequested && status != 'paused') {
        status = 'spinner';
        humanStatus = 'Paused';
      }

      return {
        id: replication.id,
        protocol: "Version " + protocolVersion,
        bucket: replication.source,
        to: 'bucket "' + replication.target.split('buckets/')[1] + '" on cluster ' + name,
        status: status,
        humanStatus: humanStatus,
        when: replication.continuous ? "on change" : "one time sync",
        errors: replication.errors,
        cancelURI: replication.cancelURI,
        settingsURI: replication.settingsURI,
        filterExpression: replication.filterExpression
      }
    });
  });
}

var ReplicationsSection = {
  encriptionTextAreaDefaultValue: "Copy paste the Certificate information from Remote Cluster here. You can find the certificate information on Couchbase Admin UI under Settings -> Cluster tab.",
  doPausingPOST: function (repInfo, pause) {
    $.ajax({
      type: 'POST',
      url: repInfo.settingsURI,
      dataType: 'text',
      data: {"pauseRequested": pause},
      complete: onResult});
    return;

    function onResult() {
      DAL.cells.tasksProgressCell.invalidate();
    }
  },
  init: function () {
    renderCellTemplate(ReplicationsModel.remoteClustersListCell, 'cluster_reference_list');

    var self = this;
    var perSettingsDialog = $("#js_per_xdcr_settings_dialog");
    var perSettingsForm = $("#js_per_xdcr_settings_dialog form");
    var currentXDCRSettingsURICell = new Cell();
    currentXDCRSettingsURICell.equality = function () {return false};
    $("#demand_encryption_flag-2").bind("change", function () {
      $('#ssh_key_area-2')[$(this).prop('checked') ? 'show' : 'hide']();
    });

    mkReplicationSectionCell(self, currentXDCRSettingsURICell, DAL.cells.tasksProgressCell, DAL.cells.mode);

    self.perReplicationSettingsCell.changedSlot.subscribeOnce(function () {
      setupFormValidation(perSettingsDialog, "/settings/replications/?just_validate=1", function (status, errors) {
        ReplicationsSection.hideXDCRErrors(perSettingsDialog);
        if (status == "error") {
          ReplicationsSection.showXDCRErrors(errors, perSettingsDialog);
        }
      }, function () {
        return serializeForm(perSettingsForm);
      });
    });

    perSettingsForm.submit(function (e) {
      e.preventDefault();
      var spinner = overlayWithSpinner(perSettingsDialog);

      $.ajax({
        type: "POST",
        url: currentXDCRSettingsURICell.value,
        data: serializeForm(perSettingsForm),
        success: function () {
          hideDialog(perSettingsDialog);
        },
        error: function (resp) {
          ReplicationsSection.showXDCRErrors(JSON.parse(resp.responseText), perSettingsDialog);
        },
        complete: function () {
          spinner.remove();
        }
      })
    });

    self.perReplicationSettingsCell.subscribeValue(function (settings) {
      if (!settings) {
        return
      }
      setFormValues(perSettingsDialog, settings);
      showDialog(perSettingsDialog, {
        onHide: function () {
          self.hideXDCRErrors(perSettingsDialog)
        }
      });
    });

    self.replicationRowsCell.subscribeValue(function (rows) {
      if (!rows) {
        return;
      }
      renderTemplate('ongoing_replications_list', rows);
      $("#ongoing_replications_list_container .row").each(function (i, item) {
        $('.js_per_xdcr_settings', $(item)).click(function () {
          currentXDCRSettingsURICell.setValue(rows[i].settingsURI);
        });
        $('.js_replication_control', $(item)).click(function (e) {
          var button = $(this);

          if (button.is(".dynamic_spinner")) {
            return;
          }

          var paused = button.is(".dynamic_paused");

          button.removeClass("dynamic_paused").removeClass("dynamic_running").addClass("dynamic_spinner");

          var row = rows[i];

          ReplicationsSection.doPausingPOST(row, !paused);
        });
      });

    });

    $('#create_cluster_reference').click($m(this, 'startAddRemoteCluster'));
    $('#cluster_reference_list_container').delegate('.list_button.edit-button', 'click', function() {
      var name = $(this).closest('tr').attr('data-name');
      if (!name) {
        return;
      }
      ReplicationsSection.startEditRemoteCluster(name);
    }).delegate('.list_button.delete-button', 'click', function() {
      var name = $(this).closest('tr').attr('data-name');
      if (!name) {
        return;
      }
      ReplicationsSection.startDeleteRemoteCluster(name);
    });
    $('#create_replication').click($m(this, 'startCreateReplication'));
  },
  showXDCRErrors: function (errors, perSettingsForm) {
    var i;
    for (i in errors) {
      $("[name=" + i + "]", perSettingsForm).addClass("dynamic_error");
      $(".js_" + i, perSettingsForm).text(errors[i]);
    }
  },
  hideXDCRErrors: function (perSettingsForm) {
    $("input", perSettingsForm).removeClass("dynamic_error");
    $(".js_error", perSettingsForm).text("");
  },
  getRemoteCluster: function (name, body) {
    var self = this;
    var generation = {};
    self.getRemoteClusterGeneration = generation;
    ReplicationsModel.remoteClustersListCell.getValue(function (remoteClustersList) {
      if (generation !== self.getRemoteClusterGeneration) {
        return;
      }
      var remoteCluster = _.detect(remoteClustersList, function (candidate) {
        return (candidate.name === name)
      });
      body.call(self, remoteCluster);
    });
  },
  startEditRemoteCluster: function (name) {
    this.getRemoteCluster(name, function (remoteCluster) {
      if (!remoteCluster) {
        return;
      }
      editRemoteCluster(remoteCluster);
    });
    return;

    function editRemoteCluster(remoteCluster) {
      remoteCluster = _.clone(remoteCluster);
      var form = $('#create_cluster_reference_dialog form');
      if (!remoteCluster.certificate) {
        remoteCluster.certificate = ReplicationsSection.encriptionTextAreaDefaultValue;
        $('#demand_encryption_flag-2').prop('checked', false);
        $('#ssh_key_area-2').hide();
      } else {
        $('#ssh_key_area-2').show();
      }
      setFormValues(form, remoteCluster);
      $('#create_cluster_reference_dialog_errors_container').html('');
      showDialog('create_cluster_reference_dialog', {
        onHide: onHide
      });
      form.bind('submit', onSubmit);

      function onSubmit(e) {
        e.preventDefault();
        ReplicationsSection.submitRemoteCluster(remoteCluster.uri, form);
      }

      function onHide() {
        form.unbind('submit', onSubmit);
      }
    }
  },
  submitRemoteCluster: function (uri, form) {
    var spinner = overlayWithSpinner($('#create_cluster_reference_dialog'));
    var formValues = $.deparam(serializeForm(form));
    if ($.trim(formValues.certificate) === ReplicationsSection.encriptionTextAreaDefaultValue || !formValues.demandEncryption) {
      formValues.certificate = "";
    }
    if (formValues.hostname && !formValues.hostname.split(":")[1]) {
      formValues.hostname += ":8091";
    }
    jsonPostWithErrors(uri, $.param(formValues), function (data, status, errorObject) {
      spinner.remove();
      if (status == 'success') {
        hideDialog('create_cluster_reference_dialog');
        ReplicationsModel.refreshReplications();
        return;
      }
      renderTemplate('create_cluster_reference_dialog_errors', errorObject ? _.values(errorObject).sort() : data);
    })
  },
  startAddRemoteCluster: function () {
    var form = $('#create_cluster_reference_dialog form');
    form.find('input[type=text], input[type=number], input[type=password], input:not([type])').val('');
    $('#demand_encryption_flag-2').prop('checked', false);
    $('#ssh_key_area-2').val(ReplicationsSection.encriptionTextAreaDefaultValue);
    $('#ssh_key_area-2').hide();
    form.find('input[name=username]').val('Administrator');
    form.find('[name=demandEncryption]').attr('checked', false);
    $('#create_cluster_reference_dialog_errors_container').html('');
    form.bind('submit', onSubmit);
    showDialog('create_cluster_reference_dialog', {
      position: { my: "center top", at: "center bottom", of: $("#headerNav") },
      onHide: onHide
    });
    return;

    function onHide() {
      form.unbind('submit', onSubmit);
    }
    var lastGen;
    function onSubmit(e) {
      e.preventDefault();
      var gen = lastGen = {};
      ReplicationsModel.remoteClustersListURICell.getValue(function (url) {
        if (lastGen !== gen) {
          return;
        }
        ReplicationsSection.submitRemoteCluster(url, form);
      });
    }
  },
  startDeleteRemoteCluster: function (name) {
    var remoteCluster;
    this.getRemoteCluster(name, function (_remoteCluster) {
      remoteCluster = _remoteCluster;
      if (!remoteCluster) {
        return;
      }
      genericDialog({text: "Please, confirm deleting remote cluster reference '" + name + "'.",
                     callback: dialogCallback});
    });
    return;

    function dialogCallback(e, name, instance) {
      instance.close();
      if (name != 'ok') {
        return;
      }

      ReplicationsModel.remoteClustersListCell.setValue(undefined);

      $.ajax({
        type: 'DELETE',
        url: remoteCluster.uri,
        success: ajaxCallback,
        error: ajaxCallback
      });

      function ajaxCallback(xhr, statusMessage) {
        if (statusMessage === "error") {
          genericDialog({
            buttons: {ok: true},
            header: "Delete Cluster Reference Error",
            textHTML: _.reduce(JSON.parse(xhr.responseText), function (memo, value) {
              return memo + "<p class=\"warning\">" + value + "</p>";
            }, "")
          });
        }
        ReplicationsModel.refreshReplications();
      }
    }
  },
  startCreateReplication: function () {
    // TODO: disallow create when no remote clusters are defined
    ReplicationForm.instance().startCreate(function (status) {
      ReplicationsModel.refreshReplications();
    });
  },
  startDeleteReplication: function (cancelURI) {
    ThePage.ensureSection("replications");
    var startedDeleteReplication = ReplicationsSection.startedDeleteReplication = {};

    if (startedDeleteReplication !== ReplicationsSection.startedDeleteReplication) {
      // this guards us against a bunch of rapid delete button
      // presses. Only latest delete operation should pass through this gates
      return;
    }
    askDeleteConfirmation(cancelURI);
    return;

    function askDeleteConfirmation(cancelURI) {
      genericDialog({
        header: "Confirm Delete",
        text: "Please, confirm deleting this replication",
        callback: function (e, name, instance) {
          instance.close();
          if (name !== 'ok') {
            return;
          }
          doDelete(cancelURI);
        }
      });
    }

    function doDelete(cancelURI) {
      couchReq('POST', cancelURI, {}, function () {
        // this is success callback
        ReplicationsModel.refreshReplications();
      }, function (error, status, handleUnexpected) {
        if (status === 404) {
          ReplicationsModel.refreshReplications();
          return;
        }
        return handleUnexpected();
      });
    }
  },
  onEnter: function() {
    ReplicationsModel.refreshReplications(true);
  }
};

configureActionHashParam("deleteReplication", $m(ReplicationsSection, "startDeleteReplication"));

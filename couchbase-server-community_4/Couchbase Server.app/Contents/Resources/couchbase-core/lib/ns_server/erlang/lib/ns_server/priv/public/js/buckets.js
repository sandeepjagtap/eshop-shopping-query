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
function setupFormValidation(form, url, callback, getFormValues) {

  var idleTime = 250,
      oldValue,
      inFlightXHR,
      timeoutId;

  function timerFunction() {
    console.log("timerFunction!");

    timeoutId = undefined;
    inFlightXHR = $.ajax({
      type: 'POST',
      url: url,
      data: oldValue,
      dataType: 'json',
      error: xhrCallback,
      success: xhrCallback
    });
  }

  function xhrCallback(data, textStatus) {
    console.log("xhr done: ", data, textStatus);

    if (textStatus == 'success') {
      console.log("plan success");
      return callback('success', data);
    }

    var status = 0;
    try {
      status = data.status; // can raise exception on IE sometimes
    } catch (e) {
      // ignore
    }
    if (status >= 200 && status < 300 && data.responseText === '') {
      console.log("inplain success");
      return callback('success');
    }

    if (status != 400 || textStatus != 'error') {
      return; // onUnexpectedXHRError(data);
    }

    console.log("plain error");
    var errorsData = $.parseJSON(data.responseText);
    callback('error', errorsData);
  }

  function cancelXHR() {
    if (inFlightXHR) {
      Abortarium.abortRequest(inFlightXHR);
      inFlightXHR = null;
    }
  }

  var firstTime = true;

  function onPotentialChanges() {
    if (paused) {
      return;
    }

    var newValue = getFormValues();
    if (newValue == oldValue) {
      return;
    }
    oldValue = newValue;

    var wasFirstTime = firstTime;
    firstTime = false;

    if (timeoutId) {
      console.log("aborting next validation");
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(timerFunction, idleTime);
    cancelXHR();

    if (wasFirstTime) {
      cancelTimeout();
      timerFunction();
    }
  }

  function cancelTimeout() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  var observer = form.observePotentialChanges(onPotentialChanges),
      paused = false;

  return {
    abort: function () {
      cancelTimeout();
      cancelXHR();
      observer.stopObserving();
    },
    pause: function () {
      if (paused) {
        return;
      }
      paused = true;
      cancelXHR();
      cancelTimeout();
    },
    unpause: function () {
      paused = false;
      onPotentialChanges();
    }
  };
}

function setAutoCompactionSettingsFields(form, initValues) {
  var dbFragmentationCheck = form.find('.check-for-databaseFragmentationThresholdSize');
  dbFragmentationCheck.prop('checked', 'databaseFragmentationThreshold[size]' in initValues);

  var viewFragmentationCheck = form.find('.check-for-viewFragmentationThresholdSize');
  viewFragmentationCheck.prop('checked', 'viewFragmentationThreshold[size]' in initValues);

  var dbFragmentationPercCheck =
    form.find('.check-for-databaseFragmentationThresholdPercentage');
  dbFragmentationPercCheck.prop('checked',
                            'databaseFragmentationThreshold[percentage]' in initValues);
  var viewFragmentationPercCheck =
    form.find('.check-for-viewFragmentationThresholdPercentage');
  viewFragmentationPercCheck.prop('checked',
                              'viewFragmentationThreshold[percentage]' in initValues);

  var periodCheck = form.find('.check-for-allowedTimePeriod');
  periodCheck.prop('checked', 'allowedTimePeriod[fromHour]' in initValues);

  var dbInput = form.find('[name="databaseFragmentationThreshold[size]"]');
  var viewInput = form.find('[name="viewFragmentationThreshold[size]"]');
  var indexInput = form.find('[name="indexFragmentationThreshold[size]"]');
  var dbPercInput = form.find('[name="databaseFragmentationThreshold[percentage]"]');
  var viewPercInput = form.find('[name="viewFragmentationThreshold[percentage]"]');
  var indexPercInput = form.find('[name="indexFragmentationThreshold[percentage]"]');
  var allowedTimeInputs = form.find('[name^=allowedTimePeriod]');

  function observeFunction() {
    if (periodCheck.prop('disabled')) {
      return;
    }
    dbInput.prop('disabled', !dbFragmentationCheck.prop('checked'));
    viewInput.prop('disabled', !viewFragmentationCheck.prop('checked'));
    dbPercInput.prop('disabled', !dbFragmentationPercCheck.prop('checked'));
    viewPercInput.prop('disabled', !viewFragmentationPercCheck.prop('checked'));
    allowedTimeInputs.prop('disabled', !periodCheck.prop('checked'));
  }

  var observer = form.observePotentialChanges(observeFunction);
  observeFunction();

  return function () {
    observer.stopObserving();
  }
}

var BucketDetailsDialog = mkClass({
  initialize: function (initValues, isNew, options) {
    var self = this;

    this.isNew = isNew;
    this.initValues = initValues;

    _.each(["database", "view"], function (name) {
      renderTemplate('js_fragmentation_settings', {name: name}, $("#js_"+name+"_fragmentation_bucket_settings")[0])
    });

    initValues.ramQuotaMB = BytestoMB(initValues.quota.rawRAM);

    options = options || {};

    this.dialogID = options.id || 'bucket_details_dialog';

    this.refreshBuckets = options.refreshBuckets || $m(BucketsSection, 'refreshBuckets');

    this.formValidationCallback = options.formValidationCallback || function () {};

    this.getFormValues = options.getFormValues || AutoCompactionSection.serializeCompactionForm;

    this.onSuccess = options.onSuccess || function () {
      hideDialog(this.dialogID);
      DAL.cells.currentPoolDetailsCell.setValue(undefined);
      DAL.cells.currentPoolDetailsCell.invalidate();
    };

    this.doCreateBucket = options.doCreateBucket || function (uri, form, callback) {
       var data = self.getFormValues(form);
       jsonPostWithErrors(uri, data, callback);
    }

    var dialog = this.dialog = $('#' + this.dialogID);

    dialog.removeClass('editing').removeClass('creating');
    dialog.addClass(isNew ? 'creating' : 'editing');

    dialog.find('[name=name]').boolAttr('disabled', !isNew);

    dialog.find('[name=replicaIndex][type=checkbox]').boolAttr('disabled', !isNew);

    dialog.find('[name=ramQuotaMB][type=text]')
      .boolAttr('disabled', !isNew && (initValues.bucketType == 'memcached'));

    dialog.find('[name=ramQuotaMB][type=hidden]').val(initValues.ramQuotaMB);

    var flushEnabled = initValues.controllers !== undefined &&
          initValues.controllers.flush !== undefined;
    dialog.find('.for-enable-flush').boolAttr('checked', flushEnabled);
    dialog.find('.flush_button')[flushEnabled && !isNew ? 'show' : 'hide']();

    this.cleanups = [];

    (function () {
      var oldBucketType;
      return this.observePotentialChangesWithCleanup(function () {
        var newType = dialog.find('[name=bucketType]:checked').attr('value');
        if (newType == oldBucketType) {
          return;
        }
        var isPersistent = (newType == 'membase');
        if (oldBucketType === undefined) {
          dialog.find('.persistent-only')[isPersistent ? 'show' : 'hide']();
        }
        else {
          dialog.find('.persistent-only')[isPersistent ? 'slideDown' : 'slideUp']('fast');
        }
        dialog[isPersistent ? 'removeClass' : 'addClass']('bucket-is-non-persistent');
        dialog[isPersistent ? 'addClass' : 'removeClass']('bucket-is-persistent');
        oldBucketType = newType;
      });
    }).call(this);

    (function () {
      var oldReplicationEnabled;
      return this.observePotentialChangesWithCleanup(function () {
        var replicationEnabled = !!(dialog.find('.js_for-enable-replicas').attr('checked'));
        if (replicationEnabled === oldReplicationEnabled) {
          return;
        }
        oldReplicationEnabled = replicationEnabled;
        dialog.find('.for-replica-number')[replicationEnabled ? 'show' : 'hide']();
        dialog.find('[name=replicaIndex][type=checkbox]').boolAttr('disabled', !(isNew && replicationEnabled));
        dialog.find('.hidden-replica-number').need(1).boolAttr('disabled', replicationEnabled);
        dialog.find('.for-replica-number select').need(1).boolAttr('disabled', !replicationEnabled);
      });
    }).call(this);

    (function () {
      var oldAutoCompactionDefined;
      var checkbox = dialog.find('input[type=checkbox][name=autoCompactionDefined]');
      if (!checkbox.length) {
        return;
      }
      var oldDisabledness = {};
      var autoCompactionSettingsBlock = checkbox.closest('#js_bucket_auto_compaction_settings').find('.autocompaction-settings');
      var affectedInputs = autoCompactionSettingsBlock.find('input[type=checkbox], input[type=number], input[type=text], input:not([type])');
      ensureElementId(affectedInputs);

      function restoreDisabledness() {
        _.each(oldDisabledness, function (val, id) {
          $($i(id)).prop('disabled', !!val);
        });
        oldDisabledness = {};
      }

      this.cleanups.push(restoreDisabledness);
      this.observePotentialChangesWithCleanup(function () {
        var autoCompactionDefined = !!(checkbox.attr('checked'));
        if (autoCompactionDefined === oldAutoCompactionDefined) {
          return;
        }
        oldAutoCompactionDefined = autoCompactionDefined;

        autoCompactionSettingsBlock.stop(true, true);
        autoCompactionSettingsBlock[autoCompactionDefined? 'slideDown' : 'slideUp']();

        if (autoCompactionDefined) {
          restoreDisabledness();
        } else {
          oldDisabledness = {};
          _.each(affectedInputs, function (input) {
            input = $(input);
            oldDisabledness[input.attr('id')] = input.prop('disabled');
            input.prop('disabled', true);
          });
        }
      });
    }).call(this);

    (function () {
      var oldFlushEnabled;
      return this.observePotentialChangesWithCleanup(function () {
        var flushEnabled = !!(dialog.find('.for-enable-flush').attr('checked'));
        if (flushEnabled === oldFlushEnabled) {
          return;
        }
        oldFlushEnabled = flushEnabled;
      });
    }).call(this);

    this.setupDefaultNameReaction(dialog);

    var form = dialog.find('form');
    var validateURL = this.getValidateUrl();

    var errorsCell = this.errorsCell = new Cell();
    var errorsCellSubscription = errorsCell.subscribeValue($m(this, 'onValidationResult'));
    this.cleanups.push($m(errorsCellSubscription, 'cancel'));

    this.formValidator = setupFormValidation(form, validateURL,
      function (status, errors) {
        console.log("setting errors: ", errors);
        errorsCell.setValue(errors);
        self.formValidationCallback();
      }, function () {
        return self.getFormValues(form);
      }
    );

    this.cleanups.push($m(this.formValidator, 'abort'));
  },
  getValidateUrl: function () {
    var validateURL = this.initValues.validateURL;
    if (validateURL === undefined) {
      validateURL = this.initValues.uri;
      validateURL += (this.initValues.uri.match(/\?/)) ? '&': '?';
      validateURL += 'just_validate=1';
    }
    return validateURL;
  },
  observePotentialChangesWithCleanup: function (body) {
    var observer = this.dialog.observePotentialChanges(body);
    this.cleanups.push(function () {
      observer.stopObserving();
    });
  },
  setupDefaultNameReaction: function (dialog) {
    var preDefaultAuthType;

    // this code disables/enables authType radio button if bucket name
    // is/(not) "default"
    function nameObserver(value) {
      var forAsciiRadio = dialog.find('#js_bucket_details_auth_type');
      var forSASLRadio = dialog.find('#js_bucket_details_sasl_selected');
      var isDefault = (value == "default");

      dialog[isDefault ? 'addClass' : 'removeClass']('bucket-is-default');
      if (isDefault) {
        preDefaultAuthType = (forAsciiRadio.filter(':checked').length) ? '.for-ascii' : '.for-sasl-password';
        forAsciiRadio.boolAttr('disabled', true);
        forAsciiRadio.boolAttr('checked', false);
        forSASLRadio.boolAttr('checked', true);
      } else {
        forAsciiRadio.boolAttr('disabled', false);
        if (preDefaultAuthType) {
          var isAscii = (preDefaultAuthType == '.for-ascii');
          forAsciiRadio.boolAttr('checked', isAscii);
          forSASLRadio.boolAttr('checked', !isAscii);
        }
      }
    }

    var nameObserverHandle = dialog.find('[name=name]').observeInput(nameObserver);
    this.cleanups.push($m(nameObserverHandle, 'stopObserving'));

    nameObserver(this.initValues.name || '');
  },

  bindWithCleanup: function (jq, event, callback) {
    jq.bind(event, callback);
    return function () {
      jq.unbind(event, callback);
    };
  },

  startSubmit: function () {
    var warnings = [];
    var self = this;

    if (!self.isNew &&
        ((self.dialog.find('[name=threadsNumber]:checked').val() !=
          self.initValues.threadsNumber) ||
         (self.dialog.find('[name=evictionPolicy]:checked').val() !=
          self.initValues.evictionPolicy))) {
      warnings.push("Changing bucket priority or eviction policy will restart the bucket. This will lead to closing all open connections and some downtime.\nAre you sure that you want to continue?");
    }

    (function checkPurgeIntervalWarning() {
      if (self.isNew) {
        return;
      }
      var checkbox = self.dialog.find('input[type=checkbox][name=autoCompactionDefined]');
      if (!checkbox.length) {
        return;
      }
      if (!checkbox.attr('checked')) {
        return;
      }
      var newPurgeInterval = self.dialog.find('[name=purgeInterval]').val();
      if (newPurgeInterval != self.initValues.purgeInterval) {
        warnings.push(AutoCompactionSection.METADATA_PURGE_INTERVAL_WARNING);
      }
    })();

    if (!warnings.length) {
      return self.submit();
    }

    $('#bucket_change_warning_dialog .js-text').html(BRifyText(warnings.join("\n\n")));

    showDialogHijackingSave(
      'bucket_change_warning_dialog', ".save_button",
      function () {
        self.submit();
      });
  },

  submit: function () {
    var self = this,
        closeCleanup = self.bindWithCleanup(self.dialog.find('.close'),
                                            'click',
                                            function (e) {
                                              e.preventDefault();
                                              e.stopPropagation();
                                            });
    self.needBucketsRefresh = true;

    // we're going to disable hidden peristent-only inputs while
    // serializing form fields to be sent
    var disabledPersistendOnlyInputs = null;
    if (self.dialog.find('[name=bucketType]:checked').val() != 'membase') {
      disabledPersistendOnlyInputs = self.dialog.find('.persistent-only input').filter(':not([disabled])');
      disabledPersistendOnlyInputs.boolAttr('disabled', true);
    }

    self.formValidator.pause();

    self.doCreateBucket(self.initValues.uri, self.dialog.find("form"), function (data, status, errorObject) {
      if (status == 'success') {
        self.refreshBuckets(function () {
          self.needBucketsRefresh = false;
          enableForm();
          self.onSuccess();
        });
        return;
      }

      enableForm();

      var simpleErrors = data;
      self.errorsCell.setValue(errorObject);
      if (simpleErrors && simpleErrors.length) {
        genericDialog({buttons: {ok: true, cancel: false},
                       header: self.isNew ? "Failed to Create Bucket" : "Failed to Update Bucket",
                       text: simpleErrors.join(' and ')
                      });
      }
    });

    // and after form is sent we un-disable temporarily disabled
    // fields
    if (disabledPersistendOnlyInputs) {
      disabledPersistendOnlyInputs.boolAttr('disabled', false);
    }

    // while POST is in-flight we're disabling all not naturally disabled inputs
    var toDisable = self.dialog.find('input[type=text], input[type=radio], input:not([type]), input[type=checkbox]')
      .filter(':not([disabled])')
      .add(self.dialog.find('button'));

    // we need to disable after post is sent, 'cause disabled inputs are not sent
    toDisable.add(self.dialog).css('cursor', 'wait').boolAttr('disabled', true);

    // when POST reply is received enableForm will be called and it
    // will undo temporary disabling and other temporary things
    function enableForm() {
      self.formValidator.unpause();
      closeCleanup();
      toDisable.add(self.dialog)
        .boolAttr('disabled', false).css('cursor', 'auto');
    }
  },
  startForm: function () {
    var self = this,
        form = this.dialog.find('form');

    self.initValues = AutoCompactionSection.preProcessCompactionValues(self.initValues);
    setFormValues(form, self.initValues);

    form.find('[name=bucketType]').boolAttr('disabled', !self.isNew);
    form.find('.js_for-enable-replicas').prop('checked', self.initValues.replicaNumber != 0);

    var compactionCleanup = setAutoCompactionSettingsFields(form, self.initValues);
    self.cleanups.push(compactionCleanup);

    self.cleanups.push(self.bindWithCleanup(form, 'submit', function (e) {
      e.preventDefault();
      var url = self.getValidateUrl();
      jQuery.ajax({
        type: "POST",
        dataType: 'json',
        url: url.indexOf('ignore_warnings') > -1 ? url : url + "&ignore_warnings=1",
        data: self.getFormValues(form),
        success: function (resp) {
          if (!resp || !resp.errors || _.isEmpty(resp.errors)) {
            self.startSubmit();
          }
        },
        error: function () {

        }
      });
    }));
  },
  startDialog: function () {
    var self = this,
        dialog = $($i(this.dialogID));

    self.startForm();

    dialog.find('> h1').hide();
    showDialog(dialog, {
      title: dialog.find('> h1 span.when-' +
              (dialog.hasClass('creating') ? 'creating' : 'editing'))
              .html(),
      onHide: function () {
        self.cleanup();
        if (self.needBucketsRefresh) {
          DAL.cells.currentPoolDetailsCell.setValue(undefined);
          DAL.cells.currentPoolDetailsCell.invalidate();
        }
      }
    });
  },
  cleanup: function () {
    _.each(this.cleanups, function (c) {
      c();
    });
  },

  renderGauge: function (jq, total, thisBucket, otherBuckets) {
    var thisValue = thisBucket,
        formattedBucket = ViewHelpers.formatMemSize(thisBucket);

    if (_.isString(thisValue)) {
      formattedBucket = thisValue;
      thisValue = 0;
    }

    var options = {
      topAttrs: {'class': 'size-gauge for-ram'},
      topRight: ['Cluster quota', ViewHelpers.formatMemSize(total)],
      items: [
        {name: 'Other Buckets',
         value: otherBuckets,
         attrs: {style: 'background-color:#00BCE9'},
         tdAttrs: {style: 'color:#1878a2;'}},
        {name: 'This Bucket',
         value: thisValue,
         attrs: {style: 'background-color:#7EDB49'},
         tdAttrs: {style: 'color:#409f05;'}},
        {name: 'Free',
         value: total - otherBuckets - thisValue,
         attrs: {style: 'background-color:#E1E2E3'},
         tdAttrs: {style: 'color:#444245;'}}
      ],
      markers: []
    };

    if (options.items[2].value < 0) {
      options.items[1].value = total - otherBuckets;
      options.items[2] = {
        name: 'Overcommitted',
        value: otherBuckets + thisValue - total,
        attrs: {style: 'background-color: #F40015;'},
        tdAttrs: {style: 'color:#e43a1b;'}
      };
      options.markers.push({value: total,
                            attrs: {style: 'background-color:#444245;'}});
      options.markers.push({value: otherBuckets + thisValue,
                            attrs: {style: 'background-color:red;'}});
      options.topLeft = ['Total Allocated', ViewHelpers.formatMemSize(otherBuckets + thisValue)];
      options.topLeftAttrs = {style: 'color:#e43a1b;'};
    }

    jq.replaceWith(memorySizesGaugeHTML(options));
  },

  renderError: function (field, error) {
    var fieldClass = field.replace(/\[|\]/g, '-');
    this.dialog.find('.error-container.err-' + fieldClass).text(error || '')[error ? 'addClass' : 'removeClass']('active');
    this.dialog.find('[name="' + field + '"]')[error ? 'addClass' : 'removeClass']('invalid');
  },

  getFormData: function () {
    var form = this.dialog.find('form');
    return serializeForm(form, {});
  },

  // this updates our gauges and errors
  // we don't use it to set input values, 'cause for the later we need to do it once
  onValidationResult: function (result) {
    if (!result)
      return;

    var self = this,
        summaries = result.summaries || {},
        ramSummary = summaries.ramSummary,
        ramGauge = self.dialog.find(".size-gauge.for-ram"),
        memcachedSummaryJQ = self.dialog.find('.memcached-summary'),
        memcachedSummaryVisible = ramSummary && ramSummary.perNodeMegs,
        knownFields = ('name ramQuotaMB replicaNumber proxyPort databaseFragmentationThreshold[percentage] viewFragmentationThreshold[percentage] databaseFragmentationThreshold[size] viewFragmentationThreshold[size] allowedTimePeriod threadsNumber purgeInterval saslPassword evictionPolicy').split(' '),
        errors = result.errors || {};

    _.each(('to from').split(' '), function (p1) {
      _.each(('Hour Minute').split(' '), function (p2) {
        knownFields.push('allowedTimePeriod[' + p1 + p2 + ']');
      });
    });

    if (ramSummary) {
      self.renderGauge(ramGauge,
                       ramSummary.total,
                       ramSummary.thisAlloc,
                       ramSummary.otherBuckets);
    }
    ramGauge.css('visibility', ramSummary ? 'visible' : 'hidden');

    if (memcachedSummaryVisible) {
      memcachedSummaryJQ.text('Total bucket size = '
                              + BytestoMB(ramSummary.thisAlloc)
                              + ' MB ('
                              + ramSummary.perNodeMegs
                              + ' MB x ' + ViewHelpers.count(ramSummary.nodesCount, 'node') +')');
    }
    memcachedSummaryJQ.css('display', memcachedSummaryVisible ? 'block' : 'none');

    _.each(knownFields, function (name) {
      self.renderError(name, errors[name]);
    });
  }
});

var BucketsSection = {
  warmupKeyComparator: mkComparatorByProp('hostname', naturalSort),

  renderRAMDetailsGauge: function (e, details) {
    var ram = details.basicStats.storageTotals.ram;

    // not using ram.quotaUsed and ram.quotaTotel because they represents the sum of quotas
    // on alive nodes only
    BucketDetailsDialog.prototype.renderGauge($(e).find('.for-ram'),
                                              ram.quotaTotalPerNode * details.nodes.length,
                                              details.quota.ram,
                                              ram.quotaUsedPerNode * details.nodes.length - details.quota.ram);
  },

  renderDiskGauge: function (jq, total, thisBucket, otherBuckets, otherData) {
    var formattedBucket = ViewHelpers.formatMemSize(thisBucket),
        free = total - otherData - thisBucket - otherBuckets,
        options = {
                    topAttrs: {'class': 'size-gauge for-hdd'},
                    topLeft: ['Other Data', ViewHelpers.formatMemSize(otherData)],
                    topRight: ['Total Cluster Storage', ViewHelpers.formatMemSize(total)],
                    items: [
                      {name: null,
                       value: otherData,
                       attrs: {style:"background-color:#FDC90D"}},
                      {name: 'Other Buckets',
                       value: otherBuckets,
                       attrs: {style: 'background-color:#00BCE9'},
                       tdAttrs: {style: 'color:#1878a2;'}},
                      {name: 'This Bucket',
                       value: thisBucket,
                       attrs: {style: 'background-color:#7EDB49'},
                       tdAttrs: {style: 'color:#409f05;'}},
                      {name: 'Free',
                       value: free,
                       attrs: {style: 'background-color:#E1E2E3'},
                       tdAttrs: {style: 'color:#444245;'}}
                    ]
                  };

    jq.replaceWith(memorySizesGaugeHTML(options));
  },

  renderHDDDetailsGauge: function (e, details) {
    var jq = $(e).parent().find('.size-gauge.for-hdd'),
        hdd = details.basicStats.storageTotals.hdd;
    BucketsSection.renderDiskGauge(jq,
                                   hdd.total,
                                   details.basicStats.diskUsed,
                                   hdd.usedByData - details.basicStats.diskUsed,
                                   hdd.used - hdd.usedByData);
  },
  init: function () {
    var self = this;
    var bucketsListCell = DAL.cells.bucketsListCell;

    self.settingsWidget = new MultiDrawersWidget({
      hashFragmentParam: "buckets",
      template: "bucket_settings",
      placeholderCSS: '#js_buckets .settings-placeholder',
      elementKey: 'name',
      actionLink: 'visitBucket',
      actionLinkCallback: function () {
        ThePage.ensureSection('buckets');
      },
      valueTransformer: function (bucketInfo, bucketSettings) {
        var rv = _.extend({}, bucketInfo, bucketSettings);
        rv.storageInfoRelevant = (rv.bucketType == 'membase');

        return rv;
      },
      detailsCellMaker: function (bucketInfo, bucketName) {
        var maybeBucketCompactionTaskCell = Cell.compute(function (v) {
          var progresses = v.need(DAL.cells.tasksProgressCell);
          return _.find(progresses, function (task) {
            return task.type === 'bucket_compaction' && task.bucket === bucketName;
          }) || null;
        });
        var thisBucketWarmupTaskCell = Cell.compute(function (v) {
          var progresses = v.need(DAL.cells.tasksProgressCell);
          var details = v.need(DAL.cells.currentPoolDetailsCell);

          return _.filter(progresses, function (task) {
            var isNeeded = task.type === 'warming_up' && task.status === 'running' && task.bucket === bucketName;
            if (isNeeded) {
              task.hostname = _.find(details.nodes, function (n) {
                return n.otpNode === task.node;
              }).hostname;
            }
            return isNeeded;
          });
        });
        maybeBucketCompactionTaskCell.equality = _.isEqual;
        var compactionWasStartedCell = Cell.compute(function (v) {
          var compactURL = bucketInfo.controllers.compactAll;
          var allRecentCompactions = v.need(RecentlyCompacted.instance().startedCompactionsCell);
          return allRecentCompactions[compactURL] || false;
        });
        var compactionWasPausedCell = Cell.compute(function (v) {
          var task = v.need(maybeBucketCompactionTaskCell);
          if (!task || !task.cancelURI) {
            return false;
          }
          var allRecentPosts = v.need(RecentlyCompacted.instance().startedCompactionsCell);
          return allRecentPosts[task.cancelURI] || false;
        });
        var rawBucketDetails = Cell.compute(function (v) {
          return future.get({url: bucketInfo.uri + "&basic_stats=true&skipMap=true"});
        });
        var rv = Cell.compute(function (v) {
          var thisBucketCompactionTask = v.need(maybeBucketCompactionTaskCell);
          var recentlyCompacted = v.need(compactionWasStartedCell);
          var data = _.clone(v.need(rawBucketDetails));
          var warmupTasks = v.need(thisBucketWarmupTaskCell);

          if (warmupTasks.length) {
            data.thisBucketWarmupTasks = formatWarmupMessages(warmupTasks, BucketsSection.warmupKeyComparator, "hostname");
          } else {
            data.thisBucketWarmupTasks = false;
          }

          data.thisBucketCompactionTask = thisBucketCompactionTask;
          data.recentlyCompacted = recentlyCompacted;
          data.showCancel = false;
          data.disableCompact = false;
          data.noCompaction = false;
          data.disableCancel = false;
          if (thisBucketCompactionTask && !!thisBucketCompactionTask.cancelURI) {
            data.showCancel = true;
            data.disableCancel = v.need(compactionWasPausedCell);
          } else {
            data.disableCompact = recentlyCompacted || thisBucketCompactionTask;
          }
          if (data.bucketType !== 'membase') {
            data.noCompaction = true;
          }

          return data;
        });
        rv.delegateInvalidationMethods(rawBucketDetails);

        return rv;
      },
      listCell: bucketsListCell,
      aroundRendering: function (originalRender, cell, container) {
        originalRender();
        $(container).closest('tr').prev().find('.bucket_name .expander').toggleClass('closed', !cell.interested.value);
      }
    });

    function renderHealthStats() {
      _.each(bucketsListCell.value, function(bucketInfo) {
        var name = bucketInfo.name;

        var healthStats = _.clone(bucketInfo.healthStats);

        var total = _.inject(healthStats, function (a,b) {return a+b}, 0);

        var minimalAngle = Math.PI/180*30;
        var nodeSize = total < 1E-6 ? 0 : Math.PI*2/total;

        var stolenSize = 0;
        var maxAngle = 0;
        var maxIndex = -1;

        for (var i = healthStats.length; i--;) {
          var newValue = healthStats[i] * nodeSize;
          if (newValue != 0 && newValue < minimalAngle) {
            stolenSize += minimalAngle - newValue;
            newValue = minimalAngle;
          }
          healthStats[i] = newValue;
          if (newValue >= maxAngle) {
            maxAngle = newValue;
            maxIndex = i;
          }
        }

        if (maxIndex < 0) {
          BUG();
        }

        healthStats[maxIndex] -= stolenSize;

        $($i(name+'_health')).sparkline(healthStats, {
          type: 'pie',
          sliceColors: ['#4A0', '#fac344', '#f00'],
          height: (isCanvasSupported ? '1.5em' : 'auto'),
          disableTooltips: true
        }).mouseover(function(ev) {
          $(ev.target).attr('title',
              bucketInfo.healthStats[0] + ' healthy, ' +
              bucketInfo.healthStats[1] + ' unhealthy, ' +
              bucketInfo.healthStats[2] + ' down');
        });
      });
    }

    (function (cb) {
      var slave = bucketsListCell.subscribeAny(function () {
        return cb(bucketsListCell.value);
      });
      IOCenter.staleness.changedSlot.subscribeWithSlave(slave);
      IOCenter.staleness.undefinedSlot.subscribeWithSlave(slave);
    })(function (buckets) {
      self.settingsWidget.prepareDrawing();

      if (!buckets) {
        prepareAreaUpdate('#bucket_list_container');
        prepareAreaUpdate('#memcached_bucket_list_container');
        return;
      }

      renderTemplate('bucket_list', buckets.byType.membase, $i('bucket_list_container'));
      renderTemplate('bucket_list', buckets.byType.memcached, $i('memcached_bucket_list_container'));
      $('#memcached_buckets')[buckets.byType.memcached.length > 0 ? 'show' : 'hide']();

      renderHealthStats();
    });

    IOCenter.staleness.subscribeValue(function (staleness) {
      if (staleness === undefined) {
        return;
      }
      var notice = $('#js_buckets .staleness-notice');
      notice[staleness ? 'show' : 'hide']();
      $('.js_manage_buckets_top_bar .create-bucket-button')[staleness ? 'hide' : 'show']();
    });

    $('.create-bucket-button').live('click', function (e) {
      e.preventDefault();
      BucketsSection.startCreate();
    });

    $('#bucket_details_dialog .flush_button').bind('click', function (e) {
      e.preventDefault();
      $('#bucket_details_dialog').dialog('option', 'closeOnEscape', false);
      BucketsSection.startFlushingBucket();
    });

    $('#bucket_details_dialog .delete_button').bind('click', function (e) {
      e.preventDefault();
      $('#bucket_details_dialog').dialog('option', 'closeOnEscape', false);
      BucketsSection.startRemovingBucket();
    });

    $('.compact_btn').live('click', function (e) {
      if (!$(this).hasClass('dynamic_disabled')) {
        BucketsSection.compactBucket($(this).attr('data-uri'));
      }
    });
    $('.cancel_compact_btn').live('click', function (e) {
      if (!$(this).hasClass('dynamic_disabled')) {
        BucketsSection.cancelCompactBucket($(this).attr('data-uri'));
      }
    });
  },
  renderBucketDetails: function (item) {
    return this.settingsWidget.renderItemDetails(item);
  },
  refreshBuckets: function (callback) {
    return DAL.cells.bucketsListCell.refresh(callback);
  },
  withBucket: function (uri, body) {
    var value = DAL.cells.bucketsListCell.value;
    if (!value) {
      return;
    }
    var bucketInfo = _.detect(value, function (info) {
      return info.uri == uri;
    });

    if (!bucketInfo) {
      console.log("Not found bucket for uri:", uri);
      return null;
    }

    return body.call(this, bucketInfo);
  },
  findBucket: function (uri) {
    return this.withBucket(uri, function (r) {return r;});
  },
  cancelCompactBucket: function (uri) {
    if (!uri) {
      return;
    }
    RecentlyCompacted.instance().registerAsTriggered(uri);
    $.post(uri);
  },
  compactBucket: function (uri) {
    if (!uri) {
      return;
    }
    $.post(uri);
    RecentlyCompacted.instance().registerAsTriggered(uri);
  },
  showBucket: function (uri) {
    ThePage.ensureSection('buckets');
    // we don't care about value, but we care if it's defined
    DAL.cells.bucketsListCell.getValue(function (buckets) {
      var bucketDetails = _.detect(buckets, function (info) {return info.uri === uri;});
      if (!bucketDetails) {
        return;
      }
      var modalSpinner = (function () {
        var timeoutId = setTimeout(function () {
          var d = genericDialog({
            buttons: {},
            closeOnEscape: false,
            width: 320,
            showCloseButton: false
          });
          d.spinner = overlayWithSpinner(d.dialog);
          instance.close = function () {
            d.spinner.remove();
            d.close();
          }
        }, 100);
        var instance = {
          close: function () {
            clearTimeout(timeoutId);
          }
        };
        return instance;
      })();

      BucketsSection.settingsWidget.detailsMap.getValue(function (mapValue) {
        var fullDetailsCell = mapValue.get(bucketDetails);
        console.log(bucketDetails, fullDetailsCell.value)
        if (!fullDetailsCell) {
          return;
        }

        var autoCompactionSettingsCell = Cell.compute(function (v) {
          return AutoCompactionSection.getSettingsFuture();
        });

        var fullerDetailsCell = Cell.compute(function (v) {
          var rv = _.extend({}, bucketDetails, v.need(fullDetailsCell));
          var autoCompactionSettings = rv.autoCompactionSettings;
          rv.autoCompactionDefined = ((autoCompactionSettings || false) !== false);
          if (!autoCompactionSettings) {
            var globalSettings = v.need(autoCompactionSettingsCell);
            _.extend(rv, globalSettings);
          }
          return rv;
        });

        fullDetailsCell.setValue(undefined);
        BucketsSection.settingsWidget.openElement(bucketDetails.name);
        fullerDetailsCell.changedSlot.subscribeOnce(withDetails);
        fullDetailsCell.invalidate();

        return;

        function withDetails() {
          var initValues = _.clone(fullerDetailsCell.value);
          var autoCompactionSettings = initValues.autoCompactionSettings;
          _.each(autoCompactionSettings, function (value, k) {
            if (value instanceof Object) {
              _.each(value, function (subVal, subK) {
                initValues[k+'['+subK+']'] = subVal;
              });
            } else {
              initValues[k] = value;
            }
          });

          modalSpinner.close();

          var dialog = new BucketDetailsDialog(initValues, false);

          BucketsSection.currentlyShownBucket = bucketDetails;
          dialog.startDialog();
        };
      });
    });
  },
  getPoolNodesCount: function () {
    return DAL.cells.currentPoolDetailsCell.value.nodes.length;
  },
  onEnter: function () {
    this.refreshBuckets();
  },
  onLeave: function () {
    this.settingsWidget.reset();
  },
  startCreate: function () {
    if (DAL.cells.inRebalanceCell.value) {
      genericDialog({
        buttons: {ok: true, cancel: false},
        header: 'Failed to Create Bucket',
        text: 'Cannot create buckets while rebalance is running.'
      });
      return;
    }
    var poolDetailsCells = DAL.cells.currentPoolDetailsCell;
    poolDetailsCells.setValue(undefined);
    poolDetailsCells.invalidate();
    poolDetailsCells.getValue(function (poolDetails) {
      var totals = poolDetails.storageTotals;

      if (totals.ram.quotaTotal == totals.ram.quotaUsed) {
        console.log('full');
        genericDialog({
          buttons: {ok: true, cancel: false},
          header: 'Cluster Memory Fully Allocated',
          text: 'All the RAM in the cluster is already allocated to existing buckets.\n\nDelete some buckets or change bucket sizes to make RAM available for additional buckets.'
        });
        return;
      }

      var maxBucketCount = poolDetails.maxBucketCount;

      DAL.cells.bucketsListCell.getValue(function (buckets) {
        if (buckets.length >= maxBucketCount) {
          genericDialog({
            buttons: {ok: true, cancel: false},
            header: 'Maximum Bucket Count Reached',
            text: 'Maximum number of buckets has been reached.\n\nFor optimal performance, no more than ' + maxBucketCount + ' buckets are allowed.'
          });
          return;
        }

        DAL.cells.serversCell.getValue(function (servers) {
          var activeServersLength = servers.active.length;
          var rawRAM = Math.floor((totals.ram.quotaTotal - totals.ram.quotaUsed) / activeServersLength);

          (new BucketDetailsDialog({
            uri: '/pools/default/buckets',
            bucketType: 'membase',
            authType: 'sasl',
            quota: {
              rawRAM: rawRAM
            },
            replicaIndex: false,
            replicaNumber: 1,
            threadsNumber: 3,
            evictionPolicy: 'valueOnly'
          }, true)).startDialog();
        });
      });
    });
  },
  startRemovingBucket: function () {
    if (!this.currentlyShownBucket) {
      return;
    }

    $('#bucket_remove_dialog .bucket_name').text(this.currentlyShownBucket.name);
    showDialog('bucket_remove_dialog', {
      closeOnEscape: false,
      onHide: function(jq) {
        $('#bucket_details_dialog').dialog('option', 'closeOnEscape', true);
      }
    });
  },
  startFlushingBucket: function () {
    if (!this.currentlyShownBucket) {
      return;
    }
    $('#bucket_flush_dialog .bucket_name').text(this.currentlyShownBucket.name);
    showDialog('bucket_flush_dialog', {
      closeOnEscape: false,
      onHide: function(jq) {
        $('#bucket_details_dialog').dialog('option', 'closeOnEscape', true);
      }
    });
  },
  flushCurrentBucket: function() {
    var self = this;
    var bucket = self.currentlyShownBucket;

    if (!bucket) {
      return;
    }

    var flushURL = bucket.controllers.flush;

    if (!flushURL) {
      genericDialog({buttons: {ok: true, cancel: false},
                     header: "Flush Not Supported",
                     text: "Flush operation is seemingly not supported for this bucket"});
      return;
    }

    var spinner = overlayWithSpinner('#bucket_flush_dialog');
    var modal = new ModalAction();

    jsonPostWithErrors(flushURL, {}, function (data, status) {
      if (status !== 'success') {
        var errorMessage = (data && data.length) ? data.join(' and ') : "Unknown error happened";
        genericDialog({buttons: {ok: true, cancel: false},
                       header: "Failed to Flush Bucket",
                       text: errorMessage});
      }
      self.refreshBuckets(function() {
        spinner.remove();
        modal.finish();
        hideDialog('bucket_details_dialog');
        hideDialog('bucket_flush_dialog');
      });
    });
  },
  removeCurrentBucket: function () {
    var self = this;
    var bucket = self.currentlyShownBucket;

    if (!bucket) {
      return;
    }

    var spinner = overlayWithSpinner('#bucket_remove_dialog');

    jsonPostWithErrors(self.currentlyShownBucket.uri, undefined, ajaxCallback, {
      timeout: 60000,
      type: 'DELETE'
    });
    return;

    function ajaxCallback(data, status) {
      // NOTE: this setValue to undefined is needed because if buckets
      // list cell is too fast to see bucket deletion then the
      // following callback may 'never' be called. That's shortcoming
      // of refreshBuckets and bucketsListCell equality function set
      // to _.isEqual
      DAL.cells.bucketsListCell.setValue(undefined);
      self.refreshBuckets(function () {
        spinner.remove();
        hideDialog('bucket_details_dialog');
        hideDialog('bucket_remove_dialog');
        if (status !== 'success') {
          var errorMessage = (data && data.length) ? data.join(' and ') : "Unknown error happened";
          genericDialog({buttons: {ok: true, cancel: false},
                         header: "Failed to Delete Bucket",
                         text: errorMessage});
        }
      });
    }
  }
};

configureActionHashParam("editBucket", $m(BucketsSection, 'showBucket'));

$(function () {
  var oldIsSasl,
      dialog = $('#bucket_details_dialog');

  dialog.observePotentialChanges(function () {
    var saslSelected = $('#js_bucket_details_sasl_selected')[0];
    if (!saslSelected) { // might happen just before page unload
      return;
    }
    var isSasl = saslSelected.checked;
    if (oldIsSasl !== null && isSasl == oldIsSasl) {
      return;
    }
    oldIsSasl = isSasl;

    dialog.find('#js_bucket_details_sasl_password').boolAttr('disabled', !isSasl);
    dialog.find('#js_bucket_details_proxy_port').boolAttr('disabled', isSasl);
  });
});

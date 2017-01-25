var isDomObject = function (obj) {
  try {
      return obj instanceof HTMLElement;
  } catch(e) {
      return !!obj && !(obj instanceof Object);
  }
}

function createFilterCells(ns) {
  ns.filterParamsCell = Cell.computeEager(function (v) {
    var filterParams = v(ns.rawFilterParamsCell);
    if (filterParams) {
      return $.deparam(filterParams);
    } else {
      return {};
    }
  });
}

Filter = function Filter(cfg, forTemplate) {
  if (!(this instanceof Filter)) {
    return new Filter(cfg, forTemplate);
  }

  this.cfg = cfg;
  this.forTemplate = forTemplate;
}

Filter.prototype = {
  errors: {
    tagNotExist: 'Tag with follow selector must be exists',
    wrongTagType: 'Tag must be sended as String, Node or jQuery object'
  },
  init: function () {
    var self = this;
    var cfg = self.cfg || {};
    self.forTemplate = self.forTemplate || {};

    if (cfg.container && self.tagValidation(cfg.container)) {
      self.container = $(cfg.container);

      self.tagValidation(self.container);
      delete cfg.container;
    } else {
      self.container = $('<div />').addClass('filter_container');
    }

    var forAllItems = {
      connectionTimeout: true,
      stale: true,
      startkeyDocid: true,
      startkey: true,
      reduce: true,
      keys: true,
      key: true,
      inclusiveEnd: true,
      groupLevel: true,
      group: true,
      endkeyDocid: true,
      endkey: true,
      descending: true,
      conflict: true
    }

    var defaultValues = {
      prefix: '',
      template: 'filter',
      hashName: '',
      onClose: function () {},
      onOpen: function () {},
      onParamsChanged: function () {}
    }

    var defaultForTemplate = {
      title: 'Filter Results',
      prefix: '',
      items: {}
    }

    self.forTemplate = _.extend(defaultForTemplate, self.forTemplate);
    _.extend(self, _.extend(defaultValues, cfg));

    if (self.forTemplate.items.all) {
      self.forTemplate.items = _.extend(forAllItems, self.forTemplate.items);
    }

    self.rawFilterParamsCell = new StringHashFragmentCell(self.hashName);
    createFilterCells(self);

    renderTemplate(self.template, self.forTemplate, self.container[0]);

    if (self.appendTo) {
      self.appendTo.append(self.container);
    }

    self.filtersCont = $('.filters_container', self.container);
    self.filtersBtn = $('.filters_btn', self.container);
    self.filtersReset = $('.btn_wrap [type="reset"]', self.container);
    self.filtersUrl = $('.filters_url', self.container);
    self.filters = $('.key input, .key select', self.filtersCont);
    self.form = $('form', self.filtersCont);
    self.stale = $('#' + self.prefix + '_filter_stale', self.container);
    self.selectBoxes = $('.selectBox', self.container);
    self.filterPopUp = $('.filters_popup', self.container);

    self.filtersCont.bind('clickoutside', function () {
      self.closeFilter();
    });

    self.form.submit(function (e) {
      e.preventDefault();
      self.closeFilter();
    });

    self.filters.change(function () {
      self.inputs2filterParams();
    });

    self.filtersReset.click(function (e) {
      e.preventDefault();
      self.clearForm();
    });

    self.filtersBtn.click(function () {
      if (!self.filtersCont.hasClass('dynamic_disabled')) {
        if (!self.filtersCont.hasClass('open')) {
          self.openFilter();
        } else {
          self.closeFilter();
        }
      }
    });

    return self;
  },
  reset: function () {
    if (this.currentURL) {
      this.currentURL = null;
    }
    this.rawFilterParamsCell.setValue(undefined);
    this.clearForm();
  },
  tagValidation: function (tag) {
    var self = this;

    if (!tag && !(tag instanceof String || tag instanceof jQuery || isDomObject(tag))) {
      throw new Error(self.errors.wrongTagType);
    }

    if (!tag.length) {
      throw new Error(self.errors.tagNotExist + ' "' + tag.selector + '"');
    }

    return true;
  },
  openFilter: function () {
    var self = this;
    self.filterParamsCell.getValue(function (params) {
      self.filtersCont.addClass("open");
      self.fillInputs(params);
      self.onOpen();
    });
    self.selectBoxes.selectBox();
  },
  closeFilter: function () {
    var self = this;
    if (!self.filtersCont.hasClass('open')) {
      return;
    }
    self.filtersCont.removeClass("open");
    self.inputs2filterParams();

    self.selectBoxes.selectBox("destroy");
    // jquery is broken. this is workaround, because $%#$%
    self.selectBoxes.removeData('selectBoxControl').removeData('selectBoxSettings');
    self.onClose();
  },
  inputs2filterParams: function () {
    var params = this.parseInputs();
    var packedParams = $.param(params, true);
    var oldFilterParams = this.rawFilterParamsCell.value;
    if (oldFilterParams !== packedParams) {
      this.rawFilterParamsCell.setValue(packedParams ? packedParams : undefined);
      this.onParamsChanged();
    }
  },
  iterateInputs: function (body) {
    this.filters.each(function () {
      var el = $(this);
      var name = el.attr('name');
      var type = (el.attr('type') === 'checkbox') ? 'bool' : 'json';
      var val = (type === 'bool') ? !!el.prop('checked') : $.isArray(el.val()) ? el.val()[0] :  el.val();
      body(name, type, val, el);
    });
  },
  clearForm: function () {
    var self = this;
    self.selectBoxes.selectBox('destroy');
    self.form[0].reset();
    if (self.initialParams) {
      self.fillInputs($.deparam(self.initialParams));
    }
    self.selectBoxes.removeData('selectBoxControl').removeData('selectBoxSettings');
    self.selectBoxes.selectBox();
    self.filters.trigger("change");
  },
  fillInputs: function (params) {
    this.iterateInputs(function (name, type, val, el) {
      if (params[name] === undefined) {
        return;
      }
      if (type == 'bool') {
        el.prop('checked', !(params[name] === 'false' || params[name] === false));
      } else {
        el.val(params[name]);
      }
    });
  },
  parseInputs: function() {
    var rv = {};
    var self = this;
    this.iterateInputs(function (name, type, val, el) {
      var row = el.parent();
      if (row.get(0).style.display === 'none' || val === 'none') {
        return;
      }
      if (!val) {
        if (type != 'bool') {
          return;
        }
        if (el.data('send-false') !== true) {
          // if we're checkbox we usually not send false values except
          // if markup actually asks us to send it (which is the case
          // for inclusive_end option)
          return;
        }
      }
      rv[name] = val;
    });
    return rv;
  }
}

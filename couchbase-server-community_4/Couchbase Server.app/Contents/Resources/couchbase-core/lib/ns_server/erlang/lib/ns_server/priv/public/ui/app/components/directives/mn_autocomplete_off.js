(function () {
  "use strict";

  //this module is hack for avoiding autocomplete only for one filed - password.
  //because all major browsers are moving towards ignoring the attribute for password fields.
  //http://stackoverflow.com/questions/3868299/is-autocomplete-off-compatible-with-all-modern-browsers/21348793#21348793

  angular
    .module('mnAutocompleteOff', [])
    .directive('mnAutocompleteOff', mnAutocompleteOff);

  function mnAutocompleteOff() {
    var autocompleteOff = {
      link: link
    };

    return autocompleteOff;

    function link($scope, $element, $attr) {
      //avoiding autocomplete via additional input
      var input = angular.element('<input style="display:none" readonly disabled>');
      input.attr("type", $attr.type);
      input.attr("name", $attr.name);
      $element.parent()[0].insertBefore(input[0], $element[0]);
      $element.attr('autocomplete', 'off');

      //avoiding autocomplete via readonly attr
      $element.attr('readonly', true);
      $element.on('focus', function () {
        $element.attr('readonly', false);
      });
    }
  }
})();

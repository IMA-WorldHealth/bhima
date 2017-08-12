angular.module('bhima.components')
.component('bhReferenceLink', {
  bindings : {
    reference : '<',
    display : '@?' 
  },
  templateUrl : 'modules/templates/bhReferenceLink.tmpl.html',
  controller : bhReferenceLink
});

bhReferenceLink.$inject = ['LanguageService'];

// @TODO(sfount) allow a user setting to determine if this link should link directly 
//               to external documents or take the user to a financial document search
function bhReferenceLink(Languages) { 
  var $ctrl = this;
  
  $ctrl.languageKey = Languages.key;

  $ctrl.$onInit = function onInit() { 
    $ctrl.display = $ctrl.display || $ctrl.reference;
  };
}

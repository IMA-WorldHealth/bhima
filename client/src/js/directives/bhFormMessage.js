angular.module('bhima.directives')
.controller('bhFormMessageController', bhFormMessageController)
.directive('bhFormMessage', bhFormMessage);

bhFormMessageController.$inject = ['$translate'];

/**
* Form Message Directive
*
* This directive is designed to fit inside an Angular + Bootstrap form
* and provide feedback to the client when the message property becomes
* available.
*
* A Form Message component has flexible styling depending on the data passed
* in.  By default, the display will show error styling (text-danger).  Either
* the DOM node (via the "type" attribute) or the message object (via the "type"
* property on the message object) can override the default style using bootstrap-style
* class definitions (success, danger, info, primary, warning).
*/
function bhFormMessageController($translate) {
  var vm = this;
  var defaultType = 'danger';

  // supported types
  var types = {
    'danger' : {
      icon : 'glyphicon-exclamation-sign',
      cssClass : 'bh-form-message-danger'
    },
    'success' : {
      icon : 'glyphicon-ok',
      cssClass : 'bh-form-message-success'
    },
    'warning' : {
      icon : 'glyphicon-warning-sign',
      cssClass : 'bh-form-message-warning'
    },
    'info' : {
      icon : 'glyphicon-info-sign',
      cssClass : 'bh-form-message-info'
    },
    'primary' : {
      icon : 'glyphicon-flag',
      cssClass : 'bh-form-message-primary'
    }
  };

  // the order of precedence goes like this:
  //  1) "type" defined on the DOM node directive
  //  2) "type" defined on the message object
  //  3) default type (error).
  if (vm.messageType) {
    vm.type = types[vm.messageType];
  } else if (vm.message && vm.message.type) {
    vm.type = types[vm.message.type];
  } else {
    vm.type = types[defaultType];
  }
}

// directive
function bhFormMessage() {
  return {
    restrict : 'E',
    scope : {
      messageType: '@',
      message : '='
    },
    templateUrl : 'partials/templates/bhFormMessage.tmpl.html',
    controller : 'bhFormMessageController as MessageCtrl',
    bindToController : true
  };
}

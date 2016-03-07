// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('SubsidiesController', SubsidiesController);

SubsidiesController.$inject = [
  'util'
];

function SubsidiesController( util) {
  var vm = this;
  var session = vm.session = {};



  
}
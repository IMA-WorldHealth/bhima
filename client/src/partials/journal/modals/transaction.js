angular.module('bhima.controllers')
  .controller('TransactionController', TransactionController);

TransactionController.$inject = ['$state'];

function TransactionController($state) {
  var vm = this;
  console.log('on est la');
}
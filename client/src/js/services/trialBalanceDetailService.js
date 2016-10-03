angular.module('bhima.services')
  .service('TrialBalanceMainService', TrialBalanceMainService);

TrialBalanceMainService.$inject = [];

function TrialBalanceMainService() {
  this.subView = false; //by opposition to main view
  this.errors = null;
  this.feedBack = null;
  this.cssClass = null;

  return this;
}
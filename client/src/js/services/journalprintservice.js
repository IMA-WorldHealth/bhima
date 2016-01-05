angular.module('bhima.services')
.service('JournalPrintService', function  () {
  var data = {};

  this.setData = function (ndata) {
    data = ndata;
  };

  this.getData = function () {
    return data;
  };
});

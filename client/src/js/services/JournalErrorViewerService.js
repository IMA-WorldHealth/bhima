
angular.module('bhima.services')
  .service('JournalErrorViewerService', JournalErrorViewerService);

/** Dependencies injection */
JournalErrorViewerService.$inject = ['$translate'];

function JournalErrorViewerService($translate) {
  console.log($translate);
  var service = this;

  service.parseGridRecord = parseGridRecord;

  function parseGridRecord (records){
    var list = [];

    records.forEach(function (record) {
      var line = [];
      var codeTranslated = null;
      if(record){

        codeTranslated = $translate.instant(record.code);
        console.log(codeTranslated);
        line = record.transactions.map(function (item) {
          return {code : codeTranslated, transaction : item};
        });

        list = list.concat(line);
      }
    });

    return list;
  }

  return service;
}
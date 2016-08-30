
angular.module('bhima.services')
  .service('JournalErrorViewerService', JournalErrorViewerService);

/** Dependencies injection */
JournalErrorViewerService.$inject = ['$translate'];

function JournalErrorViewerService($translate) {
  var service = this;

  service.parseGridRecord = parseGridRecord;

  function parseGridRecord (records){
    var list = [];

    /**
     * records is an array of nine item representing nine checks,
     * so if a check fails the item will be null but
     * if there is an error or warning the item will be defined
     */
    records.forEach(function (record) {
      var line = [];
      var codeTranslated = null;

      if(record){

        codeTranslated = $translate.instant(record.code);
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
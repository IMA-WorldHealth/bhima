angular.module('bhima.services')
  .service('JournalPostingModalService', JournalPostingModalService);

/** Dependencies injection */
JournalPostingModalService.$inject = [];

function JournalPostingModalService() {

  var service = this;

  service.parseSelectedGridRecord = parseSelectedGridRecord;

  function parseSelectedGridRecord (records){
    var parsed = [], processedTransactions = [];

    records.forEach(function (record){

      if(processedTransactions.indexOf(record.entity.trans_id) === -1){
        parsed = parsed.concat(record.treeNode.parentRow.treeNode.children.map(function (child){
          return child.row.entity;
        }));

        processedTransactions.push(record.entity.trans_id);
      }
    });

    return parsed;
  }

  return service;
}
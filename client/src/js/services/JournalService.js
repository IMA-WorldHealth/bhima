angular.module('bhima.services')
  .service('JournalService', JournalService);

// Dependencies injection
JournalService.$inject = ['PrototypeApiService'];

/**
 * Journal Service
 * This service is responsible of all process with the posting journal
 */
function JournalService(Api) {
  var URL = '/journal/';
  var service = new Api(URL);

  service.formatFilterParameters = formatFilterParameters;
  service.grid = grid;
  service.saveChanges = saveChanges;

  /**
   * Standard API read method, as this will be used to drive the journal grids
   * this method will always request aggregate information
   */
  function grid(id, parameters) {
    var gridOptions = angular.extend({ aggregates : 1 }, parameters);
    return this.read(id, gridOptions);
  }

  function saveChanges(entity, changes) {
    var added = angular.copy(entity.newRows);

    // format request for server
    var saveRequest = {
      changed : changes,
      added   : sanitiseNewRows(added),
      removed : entity.removedRows,
    };

    return service.$http.post('/journal/'.concat(entity.uuid, '/edit'), saveRequest)
      .then(service.util.unwrapHttpRequest);
  }

  function sanitiseNewRows(rows) {
    rows.data.forEach(function (row) {
      // delete view data required by journal grid
      delete row.transaction;
      delete row.hrRecord;
      delete row.currencyName;
      delete row.project_name;
    });

    return rows.data;
  }

  /**
   * This function prepares the filters for the journal for display to the
   * client via the bhFiltersApplied directive.
   * @todo - this might be better in it's own service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'debit', displayName: 'FORM.LABELS.DEBIT' },
      { field: 'credit', displayName: 'FORM.LABELS.CREDIT' },
      { field: 'credit_equiv', displayName: 'FORM.LABELS.CREDIT' },
      { field: 'debit_equiv', displayName: 'FORM.LABELS.DEBIT' },
      { field: 'trans_id', displayName: 'FORM.LABELS.TRANS_ID' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'account_id', displayName: 'FORM.LABELS.ACCOUNT' },
      { field: 'description', displayName: 'FORM.LABELS.DESCRIPTION', truncate: 8 },
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE', comparitor: '>', ngFilter: 'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE', comparitor: '<', ngFilter: 'date' },
      { field: 'amount', displayName: 'FORM.LABELS.AMOUNT' },
      { field: 'project_id', displayName: 'FORM.LABELS.PROJECT' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

      if (angular.isDefined(value)) {

        // this is to temporarily reduce the size of the description field
        // @TODO - find a better way of doing this
        if (column.truncate) {
          column.value = String(value).substring(0, column.truncate) + '... ';
        } else {
          column.value = value;
        }

        return true;
      } else {
        return false;
      }
    });
  }

  return service;
}

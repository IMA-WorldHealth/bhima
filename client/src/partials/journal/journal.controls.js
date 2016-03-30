angular.module('bhima.controllers')
.controller('journal.controls', [
  '$scope',
  '$rootScope',
  '$q',
  '$window',
  '$translate',
  'uuid',
  'store',
  'util',
  'connect',
  'precision',
  'validate',
  'appstate',
  'liberror',
  'messenger',
  'SessionService',
  function ($scope, $rootScope, $q, $window, $translate, uuid, Store, util, connect, precision, validate, appstate, liberror, messenger, Session) {
    var dependencies = {};
    var columns, options, dataview, grid, manager;
    var sortColumn;

    var journalError =  liberror.namespace('JOURNAL');

    $scope.editing = false;

    function isNull (t) { return t === null; }
    function clone (o) { return JSON.parse(JSON.stringify(o)); }
    function isDefined (d) { return angular.isDefined(d); }

    dependencies.account = {
      query : {
        'identifier' : 'number',
        'tables' : {
          'account' : { 'columns' : ['id', 'number', 'type_id', 'label'] }
        }
      }
    };

    dependencies.debtor = {
      query: {
        identifier : 'uuid',
        'tables' : {
          'debitor' : { 'columns' : ['uuid'] },
          'patient' : { 'columns' : ['first_name', 'last_name'] },
          'debitor_group' : { 'columns' : ['name'] },
          'account' : { 'columns' : ['number'] }
        },
        join: ['debitor.uuid=patient.debitor_uuid', 'debitor_group.uuid=debitor.group_uuid', 'debitor_group.account_id=account.id']
      }
    };

    dependencies.creditor = {
      query: {
        'tables' : {
          'creditor' : { 'columns' : ['uuid', 'text'] },
          'creditor_group' : { 'columns' : ['name'] },
          'account' : { 'columns' : ['number'] }
        },
        join: ['creditor.group_uuid=creditor_group.uuid','creditor_group.account_id=account.id']
      }
    };

    dependencies.invoice = {
      query: {
        identifier : 'uuid',
        tables : {
          sale : { columns : ['uuid', 'note'] }
        }
      }
    };

    dependencies.period = {
      query : {
        tables : {
          period : { columns : ['id', 'fiscal_year_id', 'period_stop', 'period_start'] }
        }
      }
    };

    dependencies.cost_center = {
      query : {
        tables : {
          'cost_center': {
            columns : ['id', 'text']
          }
        }
      }
    };

    dependencies.profit_center = {
      query : {
        tables : {
          'profit_center' : {
            columns : ['id', 'text']
          }
        }
      }
    };

    appstate.register('project', function (project) {
      $scope.project = project;
    });

    appstate.register('journal.ready', function (ready) {
      ready.then(function (params) {
        grid = params[0];
        columns = params[1];
        dataview = params[2];
        options = params[3];
        manager = params[4];
        return validate.process(dependencies);
      })
      .then(initialise)
      .catch(handleErrors);
    });

    function initialise (models) {
      angular.extend($scope, models);

      $scope.journal = new Store({ data : dataview.getItems() });

      var editors = {
        'trans_date'    : DateEditor, // SlickGrids date editors uses $() datepicker
        'account_id'    : AccountEditor,
        'deb_cred_uuid' : DebCredEditor,
        'deb_cred_type' : DebCredTypeEditor,
        'inv_po_id'     : InvoiceEditor,
        'cc_id'         : CostCenterEditor,
        'pc_id'         : ProfitCenterEditor
      };

      columns.forEach(function (column) {
        if (editors[column.id]) { column.editor = editors[column.id]; }
      });

      grid.setColumns(columns);

      // set up grid sorting

      grid.onSort.subscribe(function (e, args) {
        sortColumn = args.sortCol.field;
        dataview.sort(sort, args.sortAsc);
      });

      // set up click handling

      grid.onClick.subscribe(function (e, args) {
        handleClick(e.target.className, args);
      });

      // set up editing
      grid.onBeforeEditCell.subscribe(function (e, args) {
        var item =  dataview.getItem(args.row),
            canEdit = manager.session.mode === 'edit';
        if (!canEdit || manager.session.transactionId !== item.trans_id ) { return false; }
      });
    }

    function handleErrors (error) {
      messenger.danger('An error occured ' + JSON.stringify(error));
    }

    function sort (a,b) {
      var x = a[sortColumn];
      var y = b[sortColumn];
      return x > y ? 1 : -1;
    }


    function handleClick(className, args) {
      var classes = className.split(' ');
      var buttonMap = {
        'addRow'            : addRow,
        'deleteRow'         : deleteRow,
        'editTransaction'   : editTransaction,
        'saveTransaction'   : saveTransaction,
        'deleteTransaction' : deleteTransaction,
        'repost'            : repost
      };
      classes.forEach(function (cls) {
        if (buttonMap[cls]) { buttonMap[cls](args); }
      });
    }

    function repost(args){
      var item = dataview.getItem(args.row);
      item.rows.forEach(function (row){
        row.comment = 'Transaction repostee';
        var periodObj = refreshFiscalDetails(row.trans_date);
        if(periodObj.length === 0) {throw 'No fiscal year for this date';}
        periodObj = periodObj[0]; // a hack?
        row.fiscal_year_id = periodObj.fiscal_year_id;
        row.period_id = periodObj.id;
        manager.session.records.put(row);
      });
      saveTransaction();
    }

    function refreshFiscalDetails (date){
      var d = new Date(date);
      return $scope.period.data.filter(function (period){
        return d >= new Date(period.period_start) && d <= new Date(period.period_stop);
      });
    }

    function deleteTransaction (args) {
      var bool = $window.confirm('Are you sure you want to delete this transaction?');
      if (!bool) { return; }
      var item = dataview.getItem(args.row);
      item.rows.forEach(function (row) {
        manager.session.removed.post(row);
        manager.session.records.remove(row.uuid);
        dataview.deleteItem(row.uuid);
      });
      grid.invalidate();
      saveTransaction();
    }

    function deleteRow (args) {
      var item = dataview.getItem(args.row);
      if (manager.session.records.data.length < 2) { return broadcastError('Cannot delete last line in transaction.'); }
      // post to removed list and removed from records
      manager.session.removed.post(item);
      manager.session.records.remove(item.uuid);
      dataview.deleteItem(item.uuid);
      grid.invalidateRow(args.row);
      grid.render();
    }

    function addRow () {
      var row;
      row = clone(manager.session.template);
      row.newRecord = true;
      row.uuid = uuid();
      manager.session.records.post(row);
      dataview.addItem(row);
    }

    // TODO : clean this f() up
    function editTransaction(args) {
      var transaction = dataview.getItem(args.row),
          transactionId = transaction.groupingKey,
          templateRow = transaction.rows[0];

      manager.session.rowId = args.row;
      manager.session.mode = 'edit';
      manager.session.transactionId = transaction.groupingKey;

      if (!transactionId) { return $rootScope.$apply(messenger.danger('Invalid transaction provided')); }

      manager.fn.showDeleteButton();

      manager.origin = {
        'debit'        : transaction.totals.sum.debit,
        'credit'       : transaction.totals.sum.credit,
        'debit_equiv'  : transaction.totals.sum.debit_equiv,
        'credit_equiv' : transaction.totals.sum.credit_equiv
      };

      manager.session.records = new Store({ data : [], identifier: 'uuid'});
      manager.session.removed = new Store({ data : [], identifier: 'uuid'});

      manager.session.template = {
        trans_id       : transactionId,
        fiscal_year_id : templateRow.fiscal_year_id,
        period_id      : templateRow.period_id,
        trans_date     : templateRow.trans_date,
        description    : templateRow.description,
        project_id     : templateRow.project_id,
        number : '(Select Account)',
        debit_equiv    : 0,
        credit_equiv   : 0,
        debit          : 0,
        credit         : 0,
        inv_po_id      : templateRow.inv_po_id,
        currency_id    : templateRow.currency_id,
        userId         : 13 // FIXME
      };

      transaction.rows.forEach(function (row) {
        row.newRecord = false;
        manager.session.records.post(row);
      });

      grid.invalidate();
      manager.fn.regroup();
      $rootScope.$apply(messenger.success('Transaction #' + transactionId));
    }

    function broadcastError (desc) {
      journalError.throw(desc);
    }

    function packager(record) {
      var data = {}, cpProperties, prop;
      cpProperties = [
        'uuid', 'project_id', 'trans_id', 'trans_date', 'period_id', 'description', 'account_id',
        'credit', 'debit', 'debit_equiv', 'credit_equiv', 'fiscal_year_id', 'currency_id',
        'deb_cred_id', 'deb_cred_type', 'inv_po_id', 'comment', 'user_id', 'origin_id', 'cc_id', 'pc_id'
      ];

      for (prop in record) {
        if (cpProperties.indexOf(prop) > -1) {
          if (isDefined(record[prop]) && !isNull(record[prop])) {
            data[prop] = record[prop];
          }
        }
      }

      // FIXME : This will no longer work if we have non-unique account
      // numbers.
      if (record.number) { data.account_id = $scope.account.get(record.number).id; }

      // Transfer values from cc over to posting journal cc_id and pc_id fields
      // This is because we are doing a join, similar to the number field
      // above.
      // We check for NaNs because we don't have unique identifers like the account number
      // for an account.
      if (record.cc && !Number.isNaN(Number(record.cc))) { data.cc_id = record.cc; }
      if (record.pc && !Number.isNaN(Number(record.pc))) { data.pc_id = record.pc; }

      // FIXME : Hack to get deletion to work with parser.js
      // This is probably pretty damn insecure
      if (record.cc === 'null') { data.cc_id = null; }
      if (record.pc === 'null') { data.pc_id = null; }

      // FIXME : Review this decision
      data.project_id = $scope.project.id;
      data.origin_id = 4;

      return data;
    }

    function validDate (item) {
      return isDefined(item.trans_date) &&
          !isNaN(Date.parse(new Date(item.trans_date)));
    }

    function validDebitsAndCredits (item) {
      var credit = Number(item.credit_equiv),
          debit = Number(item.debit_equiv);
      return (isDefined(item.debit_equiv) && isDefined(item.credit_equiv)) &&
          (!isNaN(debit) || !isNaN(credit));
    }

    function validBalance (item) {
      var credit = Number(item.credit_equiv),
          debit = Number(item.debit_equiv);
      return (credit === 0 && debit > 0) || (debit === 0 && credit > 0);
    }


    function validAccountNumber (item) {
      return !isNaN(Number(item.number));
    }

    function validTotals (totalDebit, totalCredit) {
      return totalDebit === totalCredit;
    }

    function detectSingleEntry (item) {
      var credit = Number(item.credit_equiv),
          debit = Number(item.debit_equiv);
      return credit === 0 && debit === 0;
    }

    function validPeriod (item) {
      return !isNaN(Number(item.period_id));
    }

    function validFiscal(item) {
      return !isNaN(Number(item.fiscal_year_id));
    }

    function checkErrors (records) {
      if (!records.length) { return; }
      var totalDebits = 0, totalCredits = 0;

      var dateError = false,
          accountError = false,
          balanceError = false,
          singleEntryError = false,
          multipleDatesError = false,
          periodError = false,
          fiscalError = false;

      //validation
      records.forEach(function (record) {
        totalDebits += precision.round(Number(record.debit_equiv));
        totalCredits += precision.round(Number(record.credit_equiv));
        if (!validDate(record)) { dateError = true; }
        if (!validAccountNumber(record)) { accountError = true; }
        if (!validBalance(record)) { balanceError = true; }
        if (!validDebitsAndCredits(record)) { balanceError = true; }
        if (detectSingleEntry(record)) { singleEntryError = true; }
        if (!validPeriod(record)) { periodError = true; }
        if (!validFiscal(record)) { fiscalError = true; }
      });

      var testDate = new Date(records[0].trans_date).setHours(0,0,0,0);
      multipleDatesError = records.some(function (record) {
        return new Date(record.trans_date).setHours(0,0,0,0) !== testDate;
      });

      totalDebits = precision.round(totalDebits);
      totalCredits = precision.round(totalCredits);

      if (singleEntryError) { journalError.throw('ERR_TXN_SINGLE_ENTRY'); }
      if (!validTotals(totalDebits, totalCredits)) { journalError.throw('ERR_TXN_IMBALANCE'); }
      if (accountError) { broadcastError('Records contain invalid or nonexistant accounts.'); }
      if (dateError) { broadcastError('Transaction contains invalid dates.'); }
      if (multipleDatesError) { broadcastError('Transaction trans_date field has multiple dates.'); }
      if (periodError) { broadcastError('Transaction date does not fall in any valid periods.'); }
      if (fiscalError) { broadcastError('Transaction date does not fall in any valid fiscal years.'); }

      var hasErrors = (
          dateError || accountError ||
          balanceError || singleEntryError ||
          multipleDatesError || fiscalError ||
          periodError || !validTotals(totalDebits, totalCredits)
      );

      return hasErrors;

    }

    function saveTransaction () {
      var records = manager.session.records.data,
          removed = manager.session.removed.data;

      var hasErrors = checkErrors(records);
      if (hasErrors) { return; }

      var newRecords = [],
          editedRecords = [],
          removedRecords = [];

      records.forEach(function (record) {
        var newRecord = record.newRecord,
            packed = packager(record);
        (newRecord ? newRecords : editedRecords).push(packed);
      });

      removed.forEach(function (record) {
        if (record.newRecord) { return; }
        removedRecords.push(record.uuid);
      });

      var user = Session.user;
      manager.session.userId = user.id;
      newRecords.forEach(function (rec) { rec.user_id = user.id; });
      editedRecords.forEach(function (rec) { rec.user_id = user.id; });
      var promise = newRecords.length ? connect.post('posting_journal', newRecords) : $q.when(1);

      promise.then(function () {
        return editedRecords.length ? editedRecords.map(function (record) { return connect.put('posting_journal', [record], ['uuid']); }) : $q.when(1);
      })
      .then(function () {
        return removedRecords.length ? connect.delete('posting_journal', 'uuid', removedRecords) : $q.when(1);
      })
      .then(function () {
        return writeJournalLog(manager.session);
      })
      .then(function () {
		    messenger.success($translate.instant('POSTING_JOURNAL.TRANSACTION_SUCCESS'));
        manager.fn.resetManagerSession();
        manager.fn.regroup();
        grid.invalidate();
      })
      .catch(function (err) {
        messenger.danger('Submission failed' + err);
      })
      .finally();
    }

    function writeJournalLog (session) {

      var packagedLog = {
        uuid           : session.uuid,
        transaction_id : session.transactionId,
        justification  : session.justification,
        date           : util.convertToMysqlDate(session.start),
        user_id        : session.userId
      };

      return connect.post('journal_log', [packagedLog]);
    }

    function normalizeDate (date) {
      return new Date(date).setHours(0,0,0,0);
    }

    function getDateInfo (date) {
      var period_id, fiscal_year_id;
      var cp = normalizeDate(date);
      $scope.period.data.forEach(function (period) {
        if (cp >= normalizeDate(period.period_start) && cp <= normalizeDate(period.period_stop)) {
          period_id = period.id;
          fiscal_year_id = period.fiscal_year_id;
        }
      });
      return { period_id : period_id, fiscal_year_id : fiscal_year_id };
    }

    // Editors
    // FIXME: Is there some way to include this in another file?
    // TODO: Move to a service

    function BaseEditor() {

      this.destroy = function () { this.$input.remove(); };

      this.focus = function () { this.$input.focus(); };

      this.serializeValue = function () { return this.$input.val(); };

      this.isValueChanged = function () { return true; };

      this.validate = function () {
        return {
          valid: true,
          msg: null
        };
      };
    }

    function DateEditor(args) {
      var defaultValue;

      this.init = function () {
        defaultValue = args.item.trans_date.split('T')[0]; // If the date encodes timezone info, strip it.
        this.$input = $('<input class="editor-text" type="date">');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };

      this.applyValue = function (item, state) {
        var dateInfo = getDateInfo(state);
        item.fiscal_year_id = dateInfo.fiscal_year_id;
        item.period_id = dateInfo.period_id;
        item[args.column.field] = state;
      };

      this.loadValue = function () { this.$input.val(defaultValue); };

      this.init();
    }

    DateEditor.prototype = new BaseEditor();

    function InvoiceEditor(args) {
      var defaultValue;

      this.init = function () {
        defaultValue = args.item.inv_po_id;
        var options = '';
        $scope.invoice.data.forEach(function (invoice) {
          options += '<option value="' + invoice.uuid + '">' + invoice.uuid + ' ' + invoice.note + '</option>';
        });


        this.$input = $('<input type="text" class="editor-text" list="invoices"><datalist id="invoices">' + options + '</datalist>');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };

      this.applyValue = function (item, state) {
        if (state === 'cancel') { return; }
        item[args.column.field] = state === 'clear' ? '' : state;
      };

      this.loadValue = function () { this.$input.val(defaultValue); };

      this.init();
    }

    InvoiceEditor.prototype = new BaseEditor();

    function DebCredEditor(args) {
      var defaultValue;
      var clear = '<option value="clear">Clear</option>',
          cancel = '<option value="cancel">Cancel</option>';

      this.init = function () {
        defaultValue = isDefined(args.item.deb_cred_uuid) ? args.item.deb_cred_uuid : null;
        var deb_cred_type = args.item.deb_cred_type;
        var options = '';

        // TODO : this is overly verbose
        if (deb_cred_type === 'D') {
          $scope.debtor.data.forEach(function (debtor) {
            options += '<option value="' + debtor.uuid + '">[D] [' + debtor.name + '] ' + debtor.first_name + ' ' + debtor.last_name + '</option>';
            if (!defaultValue) {
              defaultValue = debtor.uuid;
            }
          });
        } else if (deb_cred_type === 'C') {
          $scope.creditor.data.forEach(function (creditor) {
            options += '<option value="' + creditor.uuid + '">[C] [' + creditor.text+ '] ' + creditor.name + '</option>';
            if (!defaultValue) {
              defaultValue = creditor.uuid;
            }
          });
        } else {
          $scope.debtor.data.forEach(function (debtor) {
            options += '<option value="' + debtor.uuid + '">[D] [' + debtor.name + '] ' + debtor.first_name + ' ' + debtor.last_name + '</option>';
            if (!defaultValue) {
              defaultValue = debtor.uuid;
            }
          });

          $scope.creditor.data.forEach(function (creditor) {
            options += '<option value="' + creditor.uuid + '">[C] [' + creditor.text+ '] ' + creditor.name + '</option>';
            if (!defaultValue) {
              defaultValue = creditor.uuid;
            }
          });
        }

        var label = deb_cred_type === 'D' ? 'Debitor' : 'Creditor';
        options += !!options.length ? cancel + clear : '<option value="" disabled>[No ' + label + 's Found]</option>';

        this.$input= $('<SELECT class="editor-text">' + options + '</SELECT>');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };

      this.applyValue = function (item,state) {
        if (state === 'cancel') { return; }
        item[args.column.field] = state === 'clear' ? '' : state;
      };

      this.loadValue = function () { this.$input.val(defaultValue); };

      this.init();
    }

    DebCredEditor.prototype = new BaseEditor();


    function AccountEditor(args) {
      var defaultValue,
          cancel = '<option value="cancel">Cancel</option>';

      this.init = function () {
        //default value - naive way of checking for previous value, default string is set, not value
        defaultValue = Number.isNaN(Number(args.item.number)) ? null : args.item.number;
        var options = '';
        $scope.account.data.forEach(function (account) {
          var disabled = (account.type_id === 3) ? 'disabled' : '';
          options += '<option ' + disabled + ' value="' + account.number + '">' + account.number + ' ' + account.label + '</option>';
          if (!defaultValue && account.type_id!==3) {
            defaultValue = account.number;
          }
        });

        options += cancel;

        this.$input = $('<SELECT class="editor-text">' + options + '</SELECT>');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };

      this.loadValue = function () { this.$input.val(defaultValue); };

      this.applyValue = function (item, state) {
        if (state === 'cancel') { return; }
        item[args.column.field] = state === 'clear' ? '' : state;
      };

      this.init();

    }

    AccountEditor.prototype = new BaseEditor();

    function DebCredTypeEditor(args) {
      var defaultValue;
      var clear = '<option value="clear">Clear</option>',
          cancel = '<option value="cancel">Cancel</option>';


      this.init = function () {
        var options = ['D', 'C'];

        defaultValue = args.item.deb_cred_type;
        var concatOptions = '';

        options.forEach(function (option) {
          concatOptions += '<option value="' + option + '">' + option + '</option>';
        });

        concatOptions += clear + cancel;

        this.$input = $('<select class="editor-text">' + concatOptions + '</select>');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };


      this.loadValue = function () { this.$input.val(defaultValue); };

      this.applyValue = function (item, state) {
        if (state === 'cancel') { return; }
        item[args.column.field] = state === 'clear' ? '' : state;
      };

      this.init();
    }

    DebCredTypeEditor.prototype = new BaseEditor();

    function CostCenterEditor(args) {
      var defaultValue,
          clear = '<option value="clear">Clear</option>',
          cancel = '<option value="cancel">Cancel</option>';

      this.init = function () {
        //default value - naive way of checking for previous value, default string is set, not value
        defaultValue = args.item.cc_id;
        var options = '';
        $scope.cost_center.data.forEach(function (cc) {
          options += '<option  value="' + cc.id + '">[' + cc.id + '] ' + cc.text + '</option>';
        });

        options += cancel;
        options += clear;

        this.$input = $('<SELECT class="editor-text">' + options + '</SELECT>');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };

      this.loadValue = function () { this.$input.val(defaultValue); };

      this.applyValue = function (item, state) {
        if (state === 'cancel') { return; }
        item[args.column.field] = (state === 'clear') ? 'null' : state;
      };

      this.init();

    }

    CostCenterEditor.prototype = new BaseEditor();

    function ProfitCenterEditor(args) {
      var defaultValue,
          clear = '<option value="clear">Clear</option>',
          cancel = '<option value="cancel">Cancel</option>';

      this.init = function () {
        //default value - naive way of checking for previous value, default string is set, not value
        var options = '';
        defaultValue = args.item.pc_id;
        $scope.profit_center.data.forEach(function (pc) {
          options += '<option  value="' + pc.id + '">[' + pc.id + '] ' + pc.text + '</option>';
        });

        options += cancel;
        options += clear;

        this.$input = $('<SELECT class="editor-text">' + options + '</SELECT>');
        this.$input.appendTo(args.container);
        this.$input.focus();
      };

      this.loadValue = function () { this.$input.val(defaultValue); };

      this.applyValue = function (item, state) {
        if (state === 'cancel') { return; }
        item[args.column.field] = (state === 'clear') ? 'null' : state;
      };

      this.init();
    }

    ProfitCenterEditor.prototype = new BaseEditor();
  }
]);

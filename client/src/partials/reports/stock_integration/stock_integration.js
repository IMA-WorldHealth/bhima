angular.module('bhima.controllers')
.controller('ReportStockIntegrationController', ReportStockIntegrationController);

ReportStockIntegrationController.$inject = [
  'connect', 'validate'
];

function ReportStockIntegrationController (connect, validate) {
  var vm = this,
      session = vm.session = {},
      state = vm.state,
      dependencies = {};

  // Dependencies
  dependencies.depots = {
    required: true,
    query : {
      tables : {
        'depot' : {
          columns : ['uuid', 'text', 'reference', 'enterprise_id']
        }
      }
    }
  };

  // Initialise model
  session.dateFrom = new Date();
  session.dateTo   = new Date();
  vm.selected  = null;
  vm.options   = [
    {
      label : 'CASH_PAYMENTS.DAY',
      fn : day,
    },
    {
      label : 'CASH_PAYMENTS.WEEK',
      fn : week,
    },
    {
      label : 'CASH_PAYMENTS.MONTH',
      fn : month
    }
  ];

  // Expose model to the view
  vm.search      = search;
  vm.reset       = reset;
  vm.reconfigure = reconfigure;
  vm.print       = function () { print(); };

  // Start the module up
  startup();

  // Functions
  function day () {
    session.dateFrom = new Date();
    session.dateTo = new Date();
  }

  function week () {
    session.dateFrom = new Date();
    session.dateTo = new Date();
    session.dateFrom.setDate(session.dateTo.getDate() - session.dateTo.getDay());
  }

  function month () {
    session.dateFrom = new Date();
    session.dateTo = new Date();
    session.dateFrom.setDate(1);
  }

  function search (selection) {
    session.selected = selection.label;
    selection.fn();
  }

  function reset (p) {
    session.searching = true;
    var req, url;

    // toggle off active
    session.active = !p;

    req = {
      dateFrom : session.dateFrom,
      dateTo : session.dateTo,
      depot : session.depot_entry
    };

    url = '/reports/integration_stock/?start=%start%&end=%end%&depot=%depot%'
    .replace('%start%', req.dateFrom)
    .replace('%end%', req.dateTo)
    .replace('%depot%', req.depot);

    connect.fetch(url)
    .then(function (model) {
      if (!model) { return; }
      vm.integration_records = model;
      vm.state = 'generate';
    })
    .catch(error);

  }

  function startup() {
    validate.process(dependencies)
    .then(function (models) {
      vm.depots = models.depots.data;
      search(vm.options[0]);
    });
  }

  function reconfigure () {
    vm.state = null;
    vm.session.type = null;
  }

  function error(err) {
    console.error(err);
  }

}

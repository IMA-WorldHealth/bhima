angular.module('bhima.controllers')
.controller('StockMovementController', StockMovementController);

StockMovementController.$inject = [
  '$scope', '$location', '$translate', '$routeParams', 'validate', 'SessionService',
  'connect', 'messenger', 'uuid', 'util'
];

function StockMovementController($scope, $location, $translate, $routeParams, validate, Session, connect, messenger, uuid, util) {

  // TODO Generic requirements for module to load/ warn
  var dependencies = {};
  var session = $scope.session = {
    configured : false,
    invalid : false,
    warn : false,
    doc : {},
    rows : [],
  };

  var depotMap = $scope.depotMap = {
    from : {
      model : {},
      dependency : 'to',
      action : fetchLots
    },
    to : {
      model : {},
      dependency : 'from',
      action : null
    }
  };

  dependencies.depots = {
    query : {
      identifier : 'uuid',
      tables : {
        'depot' : {
          columns : ['uuid', 'reference', 'text']
        }
      }
    }
  };

  $scope.project = Session.project;
  initialise();

  function initialise() {
    dependencies.depots.query.where =
      ['depot.enterprise_id=' + $scope.project.enterprise_id];

    validate.process(dependencies, ['depots'])
    .then(startup)
    .catch(error);
  }

  function selectDepot(target, newDepotId, oldDepot) {

    var reference = depotMap[target];
    var source = reference.model;
    var dependency = depotMap[reference.dependency].model;

    // Update current target
    session[target] = source.get(newDepotId);

    // Remove value from dependency
    dependency.remove(newDepotId);
    if (oldDepot) { dependency.post(oldDepot); }
    dependency.recalculateIndex();

    // Call targets action (this could be conditional)
    if (reference.action) { reference.action(newDepotId); }
  }

  function fetchLots(depotId) {
    dependencies.lots = {
      identifier : 'tracking_number',
      query : '/depots/' + depotId + '/inventory'
    };

    validate.process(dependencies, ['lots']).then(validateLots);
  }

  function validateLots(model) {

    // sort the lots into alphabetical order
    model.lots.data.sort(function (a, b) {
      return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
    });

    model.lots.recalculateIndex();

    $scope.lots = model.lots;
    // Reset rows TODO
    resetRows();
  }

  function resetRows() {
    session.rows = [];
    $scope.addRow();
  }

  $scope.$watch('session.from', function(nval, oval) {
    if (nval) { selectDepot('from', nval.uuid, oval); }
  }, false);

  $scope.$watch('session.to', function(nval, oval) {
    if (nval) { selectDepot('to', nval.uuid, oval); }
  }, false);

  function error (err) {
    messenger.error(err);
  }

  function startup (models) {
    var validDepo = models.depots.get($routeParams.depotId);
    var warnDepo = models.depots.data.length===1;

    if (!validDepo) {
      session.invalid = true;
      return;
    }

    if (warnDepo) {
      session.warn = true;
      return;
    }

    session.configured = true;
    angular.extend($scope, models);

    session.doc.document_id = uuid();
    session.doc.date = util.sqlDate(new Date());

    session.depot = validDepo;
    depotMap.from.model = angular.copy($scope.depots);
    depotMap.to.model = angular.copy($scope.depots);

    // Assign default location
    selectDepot('from', session.depot.uuid);

    // resetRows();
  }

  function updateDocumentDepo() {
    session.doc.depot_exit = session.from.uuid;
    session.doc.depot_entry = session.to.uuid;
  }

  $scope.addRow = function addRow () {

    // Ensure there are options left to select
    if ($scope.lots && !$scope.lots.data.length) {
      return messenger.info('There are no more lots available for movement in the current depot.');
    }
    session.rows.push({quantity : 0});
  };

  $scope.removeRow = function (idx, row) {
    if (row.lot) {
      $scope.lots.post(row.lot);
    }
    session.rows.splice(idx, 1);
  };

  $scope.submit = function () {
    var rows = [];

    updateDocumentDepo();

    session.rows.forEach(function (row) {
      var movement = angular.copy(session.doc);
      movement.uuid = uuid();
      movement.tracking_number = row.lot.tracking_number;
      movement.quantity = row.quantity;

      rows.push(movement);
    });

    connect.post('movement', rows)
    .then(function () {
      messenger.success($translate.instant('STOCK.MOVEMENT.SUCCESS'));
      $location.path('invoice/movement/' + session.doc.document_id);
    })
    .catch(function (err) {
      messenger.error(err);
    });
  };

  // FIXME literally called 1,000,000 times/s
  // configuration schema should be parsed and tested
  function verifyRows() {
    var validRows = true;

    if (!session.rows) {
      session.valid = false;
      return;
    }

    // Validate row data, need to visit every row, checking for multiple errors
    session.rows.forEach(function (row) {
      var selected = angular.isDefined(row.lot);
      if (!selected) {
        validRows = false;
        return;
      }

      // validate quantity

      // Error status
      if (row.quantity > row.lot.quantity) {
        row.error = {message : 'Invalid quantity'};
        row.validQuantity = false;
        validRows = false;

      // Warning status
      } else if (row.quantity <= 0) {
        row.validQuantity = false;
        validRows = false;
      } else {
        row.error = null;
        row.validQuantity = true;
      }

      if (isNaN(Number(row.quantity))) {
        row.validQuantity = false;
        validRows = false;
      }
    });

    session.valid = validRows;
  }

  $scope.$watch('session.rows', verifyRows, true);

  $scope.stockSelected = function (row) {
    if (row.oval) {
      if(row.oval.tracking_number !== row.lot.tracking_number) {$scope.lots.push(row.lot);}
    }

    row.oval = row.lot;
    $scope.lots.remove(row.lot.tracking_number);
    $scope.lots.recalculateIndex();
  };
}

/* jshint forin: false */
angular.module('bhima.controllers')
.controller('stock.loss_record', [
  '$scope',
  '$timeout',
  '$routeParams',
  'util',
  'validate',
  'exchange',
  function ($scope, $timeout, $routeParams, util, validate, exchange) {
    // TODO add search (filter)
    // TODO add sortable (clickable) columns
    var dependencies = {};

    var period = $scope.period = [
      {
        key : 'CASH_PAYMENTS.DAY',
        method : today
      },
      {
        key : 'CASH_PAYMENTS.WEEK',
        method : week
      },
      {
        key : 'CASH_PAYMENTS.MONTH',
        method : month
      }
    ];

    var session = $scope.session = {
      param     : {},
      searching : true
    };

    var total = $scope.total = {};

    var depotId = $routeParams.depotId;

    dependencies.loss = {
      query : {
        identifier : 'uuid',
          tables : {
            consumption : { columns : ['quantity', 'date', 'uuid'] },
            consumption_loss : { columns : ['document_uuid'] },
            stock : {columns : ['tracking_number', 'lot_number', 'entry_date']},
            inventory : {columns : ['text', 'purchase_price']},
            purchase : { columns : ['purchase_date']},
            purchase_item : { columns : ['unit_price']}
          },
          join : [
            'consumption.uuid=consumption_loss.consumption_uuid',
            'consumption.tracking_number=stock.tracking_number',
            'stock.inventory_uuid=inventory.uuid',
            'stock.purchase_order_uuid=purchase.uuid',
            'purchase.uuid=purchase_item.purchase_uuid',
            'purchase_item.inventory_uuid=inventory.uuid'
          ]
      }
    };

    init();

    function init() {
      validate.process(dependencies).then(loadProjects);
    }

    function loadProjects(model) {
      $scope.model = model;
      select(period[0]);
    }

    function select(period) {
      session.selected = period;
      period.method();
    }

    function updateSession(model) {
      $scope.model = model;
      groupingLoss(model.loss.data);
      updateTotals();
      session.searching = false;
    }

    function reset() {
      var request;

      request = {
        dateFrom : util.sqlDate(session.param.dateFrom),
        dateTo : util.sqlDate(session.param.dateTo),
        depotId : depotId
      };

      if (!isNaN(Number(session.project))) {
        request.project = session.project;
      }

      session.searching = true;

      dependencies.loss = {
	      query : {
	        identifier : 'uuid',
	          tables : {
	            consumption : { columns : ['quantity', 'date', 'uuid'] },
	            consumption_loss : { columns : ['document_uuid'] },
	            stock : {columns : ['tracking_number', 'lot_number', 'entry_date']},
	            inventory : {columns : ['text', 'purchase_price']},
	            purchase : { columns : ['purchase_date']},
	            purchase_item : { columns : ['unit_price']}
	          },
	          join : [
	            'consumption.uuid=consumption_loss.consumption_uuid',
	            'consumption.tracking_number=stock.tracking_number',
	            'stock.inventory_uuid=inventory.uuid',
	            'stock.purchase_order_uuid=purchase.uuid',
	            'purchase.uuid=purchase_item.purchase_uuid',
	            'purchase_item.inventory_uuid=inventory.uuid'
	          ],
	          where: ['consumption.depot_uuid=' + request.depotId,'AND','consumption.date>=' + request.dateFrom,'AND','consumption.date<=' + request.dateTo]
	      }
	    };

      total.result = {};
      if ($scope.model.loss) {
        $scope.model.loss.data = [];
        session.loss = [];
      }
      validate.refresh(dependencies, ['loss']).then(updateSession);
    }

    function today() {
      session.param.dateFrom = new Date();
      session.param.dateTo = new Date();
      reset();
    }

    function week() {
      session.param.dateFrom = new Date();
      session.param.dateTo = new Date();
      session.param.dateFrom.setDate(session.param.dateTo.getDate() - session.param.dateTo.getDay());
      reset();
    }

    function month() {
      session.param.dateFrom = new Date();
      session.param.dateTo = new Date();
      session.param.dateFrom.setDate(1);
      reset();
    }

    function updateTotals() {
      total.loss = totalLoss();
      total.loss_amount = $scope.model.loss.data.reduce(sum,0);
    }

    function sum(a, b) {
    	return a + (b.unit_price * b.quantity);
    }

    function totalLoss() {
      return $scope.model.loss.data.length;
    }

    function groupingLoss(data){
      // Grouping loss data by document_uuid
      // In the case where we have more than one item in a loss document
    	var lossArray = [];

      data.forEach(function (iItem) {
        var newLine = [],
            temp = iItem.document_uuid;

        newLine.push(iItem);

        data.forEach(function (jItem) {

          if( data.indexOf(jItem) !== data.indexOf(iItem) ) {
            if( jItem.document_uuid === temp ) {
              newLine.push(jItem);
            }
          }

          if( !isInside(newLine, lossArray) ) {
            lossArray.push(newLine);
          }

        });

      });

    	session.loss = lossArray;
    }

    function isInside(element, tableau){
    	var result = false;

      if(element.length && tableau.length){
        for(var i in tableau){
          for(var j in element){
            if(tableau[i][j] && tableau[i][j].document_uuid === element[j].document_uuid){
              result = true;
              break;
            }
          }
        }
      }

    	return result;
    }

    $scope.select = select;
    $scope.reset = reset;
  }
]);

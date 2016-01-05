angular.module('bhima.controllers')
.controller('purchaseValidate', [
  '$scope',
  'validate',
  'appstate',
  'connect',
  '$location',
  '$translate',
  'messenger',
  function ($scope, validate, appstate, connect, $location, $translate, messenger) {
    var dependencies = {}, session = $scope.session = { is_direct : false };

    dependencies.indirect_purchase = {
      query : {
        identifier : 'uuid',
        tables : {
          purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'purchaser_id', 'project_id', 'purchase_date', 'note', 'paid_uuid'] },
          employee : { columns : ['name'] },
          project : { columns : ['abbr'] }
        },
        join : ['purchase.project_id=project.id', 'purchase.purchaser_id=employee.id'],
        where : ['purchase.paid=0', 'AND', 'purchase.is_direct=0', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_authorized=0', 'AND', 'purchase.is_validate=0']
      }
    };

    dependencies.direct_purchase = {
      query : {
        identifier : 'uuid',
        tables : {
          purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'purchaser_id', 'project_id', 'purchase_date', 'note', 'is_direct'] },
          supplier : { columns : ['name'] },
          project : { columns : ['abbr'] }
        },
        join : ['purchase.project_id=project.id', 'purchase.creditor_uuid=supplier.creditor_uuid'],
        where : ['purchase.is_direct=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_authorized=0', 'AND', 'purchase.is_validate=0']
      }
    };

    dependencies.enterprise = {
      query : {
        tables : {
          enterprise : {columns : ['id', 'currency_id']}
        }
      }
    };

    appstate.register('project', function (project){
      $scope.project = project;
       validate.process(dependencies)
      .then(initialise);
    });

    function initialise(model) {
      angular.extend($scope, model);
    }

    $scope.confirmPurchase = function confirmPurchase(purchaseId) {
      session.selected = (session.is_direct) ? $scope.direct_purchase.get(purchaseId) : $scope.indirect_purchase.get(purchaseId);
    };

    $scope.confirmPayment = function confirmPayment () {
    	updatePurchase()
    	.then(function () {
        messenger.success($translate.instant('UTIL.SUCCESS'));
        session.selected = null;
        validate.refresh(dependencies)
        .then(initialise);
      })
    	.catch(handleError);
    };

    function updatePurchase () {
    	var purchase = {
        	uuid      : session.selected.uuid,
        	is_validate : 1
      };
      return connect.put('purchase', [purchase], ['uuid']);
    }

    function handleError(error) {
      throw error;
    }

    function getDate() {
      var currentDate = new Date();
      return currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + ('0' + currentDate.getDate()).slice(-2);
    }

    $scope.resetSelected = function () {
      session.selected = null;
    };
  }
]);

angular.module('bhima.controllers')
.controller('purchase_view', [
  '$scope',
  '$q',
  '$routeParams',
  'connect',
  function ($scope, $q, $routeParams, connect) {

    var session = $scope.session = {};
    session.option = $routeParams.option;

    $scope.purchase_filter = {};

    function init() {
      var promise = fetchRecords();
      $scope.selected = null;

      promise.then(function(model) {
        $scope.purchase_model = model[0].data.concat(model[1].data);
      });
    }

    function fetchRecords() {
      var requette = {}, direct = {}, indirect = {};
      $scope.selected = {};

      switch(session.option){
        case 'OrdersPayed' :
          indirect = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'employee' : {
              'columns' : ['name', 'prenom']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'purchase.purchaser_id=employee.id'
          ],
          where : ['purchase.paid=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=0']
        };

        direct = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'supplier' : {
              'columns' : ['name']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'creditor.uuid=supplier.creditor_uuid'
          ],
          where : ['purchase.paid=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=1']
        };
      break;

      case 'OrdersWatingPayment' :
        indirect = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'employee' : {
              'columns' : ['name', 'prenom']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'purchase.purchaser_id=employee.id'
          ],
          where : ['purchase.paid=0', 'AND', 'purchase.confirmed=0', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=0']
        };

        direct = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'supplier' : {
              'columns' : ['name']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'creditor.uuid=supplier.creditor_uuid'
          ],
          where : ['purchase.paid=0', 'AND', 'purchase.confirmed=0', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=1']
        };
      break;

      case 'OrdersReceived' :
        indirect = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'employee' : {
              'columns' : ['name', 'prenom']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'purchase.purchaser_id=employee.id'
          ],
          where : ['purchase.closed=1', 'AND', 'purchase.confirmed=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=0']
        };

        direct = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'supplier' : {
              'columns' : ['name']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'creditor.uuid=supplier.creditor_uuid'
          ],
          where : ['purchase.closed=1', 'AND', 'purchase.confirmed=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=1']
        };
      break;

      case 'InWatingReception' :
        indirect = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'employee' : {
              'columns' : ['name', 'prenom']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'purchase.purchaser_id=employee.id'
          ],
          where : ['purchase.closed=0','AND','purchase.confirmed=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=0']
        };

        direct = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'supplier' : {
              'columns' : ['name']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'creditor.uuid=supplier.creditor_uuid'
          ],
          where : ['purchase.closed=0', 'AND', 'purchase.confirmed=1', 'AND', 'purchase.is_donation=0', 'AND', 'purchase.is_direct=1']
        };
      break;

      default :
      console.log('default');
        indirect = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'employee' : {
              'columns' : ['name', 'prenom']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'purchase.purchaser_id=employee.id'
          ],
          where : ['purchase.is_donation=0', 'AND', 'purchase.is_direct=0']
        };

        direct = {
          'tables' : {
            'purchase' : {
              'columns' : ['uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid']
            },
            'creditor' : {
              'columns' : ['text']
            },
            'supplier' : {
              'columns' : ['name']
            },
            'user' : {
              'columns' : ['first', 'last']
            }
          },
          join : [
            'purchase.creditor_uuid=creditor.uuid',
            'purchase.emitter_id=user.id',
            'creditor.uuid=supplier.creditor_uuid'
          ],
          where : ['purchase.is_donation=0', 'AND', 'purchase.is_direct=1']
        };
      break;

      }

      var d = connect.req(direct);
      var i = connect.req(indirect);
      return $q.all([d,i]);
    }

    init();
  }
]);

angular.module('bhima.controllers')
.controller('group.debtor.reassignment', PatientDebtorGroupController);

PatientDebtorGroupController.$inject = [
  '$scope', 'validate', 'connect', 'messenger', '$translate',
  'uuid', 'SessionService'
];

/**
* Patient Debtor Group Controller
*
* This controller allows a user to change a patient's debtor group and
* therefore, the account that their transactions hit.  This is useful in case
* a patient becomes employed by a convention, or their data was entered
* incorrectly during registration.
*/
function PatientDebtorGroupController($scope, validate, connect, messenger, $translate, uuid, Session) {

  var dependencies = {};
  $scope.noEmpty = false;
  $scope.debitor = {};

  dependencies.debtorGroup = {
    query : {
      identifier : 'uuid',
      tables : {
        'debitor_group' : {
          'columns' : ['uuid', 'name', 'note']
        }
      }
    }
  };

  function swap(model) {
    $scope.model = model;
    $scope.locationDebitor = model.location.data[0];
  }

  $scope.initialiseSwaping = function initialiseSwaping(selectedDebitor) {
    if (!selectedDebitor) { return messenger.danger($translate('ERR_MISSING')); }
    connect.req({
      tables : {
        'debitor' : {
          columns : ['group_uuid']
        }
      },
      where : ['debitor.uuid=' + selectedDebitor.debitor_uuid]
    })
    .then(function(res) {
      $scope.debitor.debitor_group_uuid = res.data[0].group_uuid;
      $scope.selectedDebitor = selectedDebitor;
      $scope.noEmpty = true;
      dependencies.location = {
        query : '/location/village/' + selectedDebitor.origin_location_id
      };
      validate.process(dependencies).then(swap);
    });
  };

  $scope.swapGroup = function swapGroup (selectedDebitor) {

    var debitor = {
      uuid : selectedDebitor.debitor_uuid,
      group_uuid : $scope.debitor.debitor_group_uuid
    };

    connect.put('debitor', [debitor], ['uuid'])
    .then(function () {
      var packageHistory = {
        uuid               : uuid(),
        debitor_uuid       : selectedDebitor.debitor_uuid,
        debitor_group_uuid : $scope.debitor.debitor_group_uuid,
        user_id            : Session.user.id
      };
      return connect.post('debitor_group_history', [packageHistory]);
    })
    .then(handleSucces)
    .catch(handleError);
  };

  function handleSucces() {
    messenger.success($translate('SWAPDEBITOR.SUCCESS'));
    $scope.selectedDebitor = {};
    $scope.debitor = {};
    $scope.noEmpty = false;
  }

  function handleError() {
    messenger.danger($translate('SWAPDEBITOR.ERR_HTTP'));
  }
}

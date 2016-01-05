angular.module('bhima.controllers')
.controller('AssignPatientGroupController', [
  '$scope',
  '$q',
  '$translate',
  'connect',
  'validate',
  'appstate',
  'messenger',
  'uuid',
  function ($scope, $q, $translate, connect, validate, appstate, messenger, uuid) {

    // variables init
    var dependencies = {},
        models = $scope.models = {},
        state = {};

    $scope.flags = {};
    $scope.print = false;
    $scope.patient = {};

    dependencies.patient_group = {
      required : true,
      query : {
        tables : { 'patient_group':{ columns: ['uuid', 'name']}}
      }
    };

    dependencies.assignation_patient = {
      query : {
        tables : { 'assignation_patient':{ columns: ['uuid', 'patient_group_uuid', 'patient_uuid']}}
      }
    };

    //fonctions
    function init (model) {
      for (var k in model) {
        $scope[k] = model[k];
        models[k] = $scope[k].data;
      }
      transformDatas(false);
      $scope.all = false;
      state.all = false;
    }

    function errorDependencies (err) {
      messenger.danger([err.message, err.reference].join(' '));
    }

    function transformDatas (value) {
      models.patient_group.map(function(item) {
        item.checked = value;
      });
    }

    function isChecked() {
      return models.patient_group.some(function (group) {
        return group.checked;
      });
    }

    function loadPatientGroups(patient) {
      transformDatas(false);
      $scope.patient = patient;
      $scope.print = true;

      models.patient_group.forEach(function (pg) {
        $scope.assignation_patient.data.forEach(function (ap) {
          if (ap.patient_uuid === $scope.patient.uuid &&
              ap.patient_group_uuid === pg.uuid) {
            pg.checked = true;
          }
        });
      });

      var check = models.patient_group.some(function (pg) {
        return pg.checked !== true;
      });
      $scope.all = !check;
    }

    function changeChildren(v) {
      transformDatas(v);
    }

    function formatAccount (account) {
      return [
        account.account_number, account.account_txt
      ].join(' -- ');
    }

    function save () {
      connect.delete('assignation_patient', 'patient_uuid', $scope.patient.uuid)
      .then(function (v) {

        if (v.status === 200) {
          if (isChecked()) {
            $scope.assignation_patient.data = $scope.assignation_patient.data.filter(function (item) {
              return item.patient_uuid !== $scope.patient.uuid;
            });

            var ass_patient = [];

            var pg_checked = models.patient_group.filter(function (item) {
              return item.checked;
            });

            pg_checked.forEach(function(item) {
              ass_patient.push({uuid: uuid(), patient_group_uuid : item.uuid, patient_uuid : $scope.patient.uuid});
            });

            $q.all(
              ass_patient.map(function (assignation) {
                return connect.post('assignation_patient', [assignation]);
              })
            )
            .then(function () { 
              messenger.success($translate.instant('PATIENT_GRP_ASSIGNMENT.SUCCESS_UPD'));
              // $scope.patient = {};
            })
            .catch(function () {
              messenger.danger('Error updating');
            });

          }else{
           messenger.success($translate.instant('PATIENT_GRP_ASSIGNMENT.SUCCESS_UPD'));
          }
        }
      });
    }

    function checking() {
      if ($scope.patient.uuid) {
        save();
      } else {
        messenger.danger('Erreur');
      }
    }

    // invocation
    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      dependencies.patient_group.query.where =
        ['patient_group.enterprise_id=' + enterprise.id];
      validate.process(dependencies)
      .then(init)
      .catch(errorDependencies);
    });

    //exposition

    $scope.formatAccount = formatAccount;
    $scope.checking = checking;
    $scope.changeChildren = changeChildren;
    $scope.loadPatientGroups = loadPatientGroups;
  }
]);

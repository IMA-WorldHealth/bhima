angular.module('bhima.services')
.service('PatientGroupModal', PatientGroupModal);

PatientGroupModal.$inject = ['$uibModal'];

/**
 * This service is responsible for configuring and exposing modal that can be
 * used to configure a patients groups subscription.
 *
 * @todo remove callbacks in favour of propegating values through promise fufillment
 */
function PatientGroupModal(Modal) {
  var service = this;

  var modalConfig = {
    animation : true,
    size : 'md',
    keyboard : false,
    backdrop : 'static'
  };

  service.updateDebtor = updateDebtor;
  service.updateGroupConfig = updateGroupConfig;

  /**
   * This function if responsible for configuring and openening a modal to update
   * debtor groups given a patient and a complete callback
   *
   * @params Object     patientEntity
   */
  function updateDebtor(patientEntity, callback) {
    var debtorGroupConfig = {
      templateUrl : 'partials/patients/edit/updateDebtorGroup.tmpl.html',
      controller : 'UpdateDebtorGroup as UpdateDebtorGroupCtrl',
      resolve : {
        patient : function () {
          return patientEntity;
        },

        // FIXME
        updateModel : function () {
          return callback;
        }
      }
    };

    angular.extend(debtorGroupConfig, modalConfig);

    return Modal.open(debtorGroupConfig);
  }

  function updateGroupConfig(patientEntity, groups, callback) {
    var patientGroupConfig = {
      templateUrl : 'partials/patients/edit/updatePatientGroups.tmpl.html',
      controller : 'UpdatePatientGroups as UpdatePatientGroupsCtrl',
      resolve : {
        sessionPatient : function () {
          return patientEntity;
        },
        sessionGroups : function () {
          return groups;
        },

        // FIXME
        updateModel : function () {
          return callback;
        }
      }
    };

    angular.extend(patientGroupConfig, modalConfig);

    return Modal.open(patientGroupConfig);
  }
}

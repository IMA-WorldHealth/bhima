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
   * @param Object     patientEntity
   */
  function updateDebtor(patientEntity, callback) {
    var debtorGroupConfig = {
      templateUrl : 'modules/patients/edit/updateDebtorGroup.tmpl.html',
      controller : 'UpdateDebtorGroup as UpdateDebtorGroupCtrl',
      resolve : {
        patient : function () {
          return patientEntity;
        },

        /** @todo investigate passing multiple params through $modal.close to remove callback methods */
        updateModel : function () {
          return callback;
        }
      }
    };

    angular.extend(debtorGroupConfig, modalConfig);

    var modalInstance = Modal.open(debtorGroupConfig);
    return modalInstance.result;
  }

  function updateGroupConfig(patientEntity, groups, callback) {
    var patientGroupConfig = {
      templateUrl : 'modules/patients/edit/updatePatientGroups.tmpl.html',
      controller : 'UpdatePatientGroups as UpdatePatientGroupsCtrl',
      resolve : {
        sessionPatient : function () {
          return patientEntity;
        },
        sessionGroups : function () {
          return groups;
        },

        /** @todo investigate passing multiple params through $modal.close to remove callback methods */
        updateModel : function () {
          return callback;
        }
      }
    };

    angular.extend(patientGroupConfig, modalConfig);

    var modalInstance = Modal.open(patientGroupConfig);
    return modalInstance.result;
  }
}

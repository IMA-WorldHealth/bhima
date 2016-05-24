angular.module('bhima.controllers')
.controller('DocumentViewController', DocumentViewController);

DocumentViewController.$inject = [
  'ModalService', '$state', 'DocumentService', 'Upload', 'NotifyService'
];

function DocumentViewController(Modal, $state, Document, Upload, Notify) {
  var vm = this;

  /** global objects */
  vm.patientUuid = $state.params.patient_uuid;

  /** expose to the view */
  vm.addDocument = addDocument;
  vm.deleteDocument = deleteDocument;

  /** function add documents modal */
  function addDocument() {
    Modal.openAddDocument({ patient_uuid: vm.patientUuid })
    .then(listDocument);
  }

  /** delete document */
  function deleteDocument(uuid) {
    Document.remove(vm.patientUuid, uuid)
    .then(function () {
      Notify.success('FORM.INFOS.DELETE_SUCCESS');
      listDocument();
    });
  }

  /** gettint patient document */
  function listDocument() {
    Document.read(vm.patientUuid)
    .then(function (documents) {
      vm.patientDocuments = documents;
    });
  }

  /** startup the view */
  listDocument();

}

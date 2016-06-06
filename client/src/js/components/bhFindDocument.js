angular.module('bhima.components')
.component('bhFindDocument', {
  controller   : FindDocumentComponent,
  controllerAs : '$ctrl',
  templateUrl  : 'partials/templates/bhFindDocument.tmpl.html',
  bindings: {
    enablePatientDetails : '<',  // bind boolean (true|false) : Enable patient details option
    enableOptionBar      : '<',  // bind boolean (true|false) : Enable option for add, display list or display thumbnail in a bar
    enableSearch         : '<',  // bind boolean (true|false) : Enable search bar option
    display              : '@',  // bind (list|thumbnail)  : Display either in list or thumbnail mode
    patientUuid          : '<'  // Required patient uuid
  }
});

FindDocumentComponent.$inject = [
  'PatientService', 'ModalService', 'DocumentService',
  'NotifyService', 'UserService', '$translate'
];

/**
 * Find Document Component
 * This component is responsible for displaying documents for specific patient given
 */
function FindDocumentComponent(Patient, Modal, Document, Notify, User, $translate) {
  var vm = this;

  /** global variables */
  vm.session = {
    patientUuid     : this.patientUuid,
    enablePatientDetails : Boolean(this.enablePatientDetails),
    enableOptionBar : Boolean(this.enableOptionBar),
    enableSearch    : Boolean(this.enableSearch),
    display         : this.display,
    showAction      : false
  };

  /** expose to the view */
  vm.switchDisplay  = switchDisplay;
  vm.toggleAction   = toggleAction;
  vm.addDocument    = addDocument;
  vm.deleteDocument = deleteDocument;
  vm.mimeIcon       = mimeIcon;

  // startup the component
  startup();

  /** function switchDisplay */
  function switchDisplay(mode) {
    vm.session.display = mode;
  }

  /** toggle document actions */
  function toggleAction(index) {
    vm.selectedIndex = index;
    vm.session.showAction = vm.session.showAction === true ? false : true;
  }

  /** function add documents modal */
  function addDocument() {
    Modal.openUploadDocument({ patient_uuid: vm.session.patientUuid })
    .then(startup);
  }

  /** delete document */
  function deleteDocument(uuid) {
    Modal.confirm($translate.instant('FORM.DIALOGS.CONFIRM_DELETE'))
    .then(function (ans) {
      if (!ans) { return; }

      return Document.remove(vm.session.patientUuid, uuid)
      .then(function () {
        Notify.success('FORM.INFOS.DELETE_SUCCESS');
        startup();
      });

    })
    .catch(Notify.handleError);
  }

  /** getting patient document */
  function startup() {
    if (!vm.session.patientUuid) { return; }

    Patient.read(vm.session.patientUuid)
    .then(function (patient) {
      vm.session.patient = patient;
    })
    .catch(Notify.handleError);

    Document.read(vm.session.patientUuid)
    .then(function (documents) {
      vm.session.patientDocuments = documents;
    })
    .catch(Notify.handleError);
  }

  /** format the image type */
  function mimeIcon(mimetype) {
    var result = {};

    if (mimetype.indexOf('image') > -1) {
      result = { icon : 'fa-file-image-o', label : 'Image' };
    } else if (mimetype.indexOf('pdf') > -1) {
      result = { icon : 'fa-file-pdf-o', label : 'PDF' };
    } else if (mimetype.indexOf('word') > -1) {
      result = { icon : 'fa-file-word-o', label : 'MS WORD' };
    } else if (mimetype.indexOf('sheet') > -1) {
      result = { icon : 'fa-file-excel-o', label : 'MS EXCEL' };
    } else if (mimetype.indexOf('presentation') > -1) {
      result = { icon : 'fa-file-powerpoint-o', label : 'MS Power Point' };
    } else {
      result = { icon : 'fa-file-o', label : 'Fichier' };
    }

    return result;
  }
}

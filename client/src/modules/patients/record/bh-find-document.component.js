angular.module('bhima.components')
.component('bhFindDocument', {
  controller   : FindDocumentComponent,
  controllerAs : '$ctrl',
  templateUrl  : 'modules/patients/record/bh-find-document.html',
  bindings     : {
    enablePatientDetails : '<',  // bind boolean  Enable patient details option
    enableOptionBar      : '<',  // bind boolean  Enable option for add, display list or display thumbnail in a bar
    enableSearch         : '<',  // bind boolean  Enable search bar option
    display              : '@',  // bind (list|thumbnail)  Display either in list or thumbnail mode
    height               : '@',  // bind the height of list of contents
    patientUuid          : '<',  // Required patient uuid
  },
});

FindDocumentComponent.$inject = [
  'PatientService', 'ModalService', 'DocumentService', 'NotifyService',
];

/**
 * Find Document Component
 * This component is responsible for displaying documents for specific patient given
 */
function FindDocumentComponent(Patient, Modal, Document, Notify) {
  var vm = this;

  /** expose to the view */
  vm.switchDisplay = switchDisplay;
  vm.addDocument = addDocument;
  vm.deleteDocument = deleteDocument;
  vm.mimeIcon = mimeIcon;

  this.$onInit = function $onInit() {
    vm.session = {
      patientUuid          : this.patientUuid,
      enablePatientDetails : Boolean(this.enablePatientDetails),
      enableOptionBar      : Boolean(this.enableOptionBar),
      enableSearch         : Boolean(this.enableSearch),
      display              : this.display,
      height               : this.height,
      showAction           : false,
    };

    startup();
  };

  /** function switchDisplay */
  function switchDisplay(mode) {
    vm.session.display = mode;
  }

  /** function add documents modal */
  function addDocument() {
    Modal.openUploadDocument({ patient_uuid: vm.session.patientUuid })
    .then(startup);
  }

  /** delete document */
  function deleteDocument(uuid, pattern) {
    var request = {
      pattern     : pattern,
      patternName : 'FORM.PATTERNS.DOCUMENT_NAME',
    };

    Modal.openConfirmDialog(request)
      .then(function (ans) {
        if (!ans) { return; }

        return Document.remove(vm.session.patientUuid, uuid)
          .then(function () {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
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

        vm.session.patientDocuments.forEach(function (doc) {
          doc.downloadLink = doc.label + mimeIcon(doc.mimetype).ext;
          doc.icon = mimeIcon(doc.mimetype).icon;
          doc.type = mimeIcon(doc.mimetype).label;
        });
      })
      .catch(Notify.handleError);
  }

  /** format the image type */
  function mimeIcon(mimetype) {
    var result = {};
    var ext;

    if (mimetype.indexOf('image') > -1) {
      ext =
        (mimetype.indexOf('jpg') > -1 || mimetype.indexOf('jpeg') > -1) ? '.jpg' :
        (mimetype.indexOf('png') > -1) ? '.png' :
        (mimetype.indexOf('gif') > -1) ? '.gif' : '';

      result = { icon: 'fa-file-image-o', label: 'Image', ext: ext };
    } else if (mimetype.indexOf('pdf') > -1) {
      result = { icon: 'fa-file-pdf-o', label: 'PDF', ext: '.pdf' };
    } else if (mimetype.indexOf('word') > -1) {
      result = { icon: 'fa-file-word-o', label: 'MS WORD', ext: '.doc' };
    } else if (mimetype.indexOf('sheet') > -1) {
      result = { icon: 'fa-file-excel-o', label: 'MS EXCEL', ext: '.xls' };
    } else if (mimetype.indexOf('presentation') > -1) {
      result = { icon: 'fa-file-powerpoint-o', label: 'MS Power Point', ext: '.ppt' };
    } else {
      result = { icon: 'fa-file-o', label: 'Fichier', ext: '' };
    }

    return result;
  }
}

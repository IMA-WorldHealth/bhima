/* global element, by, $$ */
/* eslint class-methods-use-this:off */

/**
 * This class is represents a visit page in term of structure and
 * behaviour so it is a visit page object
 * */
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class VisitPage {

  constructor() {
    this.gridId = 'visit-grid';
    this.visitGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 12;
  }

  /**
   * send back the number of visits in the grid
   */
  expectNumberOfGridRows(number) {
    GU.expectRowCount(this.gridId, number, `Expected Visit Registry's ui-grid row count to be ${number}.`);
  }

  /**
   * create visit success
   */
  createVisitSuccess(
    patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
    isPregnant, notInsideHealthZone, isRefered, ward, room
  ) {
    this.createVisit(
      patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
      isPregnant, notInsideHealthZone, isRefered, ward, room
    );
    components.notification.hasSuccess();
  }

  /**
   * create visit fail
   */
  createVisitFail(
    patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
    isPregnant, notInsideHealthZone, isRefered, ward, room
  ) {
    this.createVisit(
      patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
      isPregnant, notInsideHealthZone, isRefered, ward, room
    );
    const warningAdmittedTag = by.css('[data-patient-already-admitted]');
    FU.exists(warningAdmittedTag, true);
    FU.buttons.cancel();
    components.notification.hasDanger();
  }

  /**
   * create visit
   */
  createVisit(
    patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
    isPregnant, notInsideHealthZone, isRefered, ward, room
  ) {
    FU.buttons.create();
    // choose the patient
    components.findPatient.findByName(patientName);

    // choose the service
    components.serviceSelect.set(serviceName);

    // select diagnosis
    if (diagnosis) {
      FU.typeahead('AdmitCtrl.visit.diagnosis', diagnosis);
    }

    // set note
    FU.input('AdmitCtrl.visit.notes', note || '');

    if (isHospitalized) {
      FU.radio('AdmitCtrl.visit.hospitalized', 1);
    }

    if (isOldCase) {
      FU.radio('AdmitCtrl.visit.is_new_case', 1);
    }

    if (isPregnant) {
      element(by.model('AdmitCtrl.visit.is_pregnant')).click();
    }

    if (isRefered) {
      element(by.model('AdmitCtrl.visit.is_refered')).click();
    }

    if (notInsideHealthZone) {
      FU.radio('AdmitCtrl.visit.inside_health_zone', 1);
    }

    if (ward) {
      components.wardSelect.set(ward);
    }

    if (room) {
      components.roomSelect.set(room);
    }

    FU.buttons.submit();
  }

  /**
   * search
   */
  search(options) {
    FU.buttons.search();

    // set to default values the form
    this.reset();

    if (options.isHospitalized) {
      element(by.model('$ctrl.searchQueries.hospitalized')).click();
    }

    if (options.isRefered) {
      element(by.model('$ctrl.searchQueries.is_refered')).click();
    }

    if (options.isPregnant) {
      element(by.model('$ctrl.searchQueries.is_pregnant')).click();
    }

    if (options.isNewCase === 1 || options.isNewCase === 0) {
      FU.input('$ctrl.searchQueries.is_new_case', options.isNewCase);
    }

    if (options.insideHealthZone === 1 || options.insideHealthZone === 0) {
      FU.input('$ctrl.searchQueries.is_new_case', options.insideHealthZone);
    }

    if (options.displayName) {
      FU.input('$ctrl.searchQueries.display_name', options.displayName);
    }

    if (options.reference) {
      FU.input('$ctrl.searchQueries.reference', options.reference);
    }

    if (options.hospital_no) {
      FU.input('$ctrl.searchQueries.hospital_no', options.hospital_no);
    }

    if (options.service) {
      components.serviceSelect.set(options.service);
    }

    if (options.ward) {
      components.wardSelect.set(options.ward);
    }

    if (options.room) {
      components.roomSelect.set(options.room);
    }

    FU.buttons.submit();
  }

  /**
   * reset
   */
  reset() {
    $$('[data-reset-input]').then(clearButtons => {
      clearButtons.forEach(clearBtn => {
        clearBtn.click();
      });
    });
  }
}

module.exports = VisitPage;

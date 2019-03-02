/* global element, by */
/* eslint class-methods-use-this:off */

/**
 * This class is represents a visit page in term of structure and
 * behaviour so it is a visit page object
 * */
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

// const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class VisitPage {

  constructor() {
    this.gridId = 'visit-grid';
    this.visitGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 1;
  }

  /**
   * send back the number of visits in the grid
   */
  getVisitCount() {
    return this.visitGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
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
}

module.exports = VisitPage;

/* global element, by, $$ */

/**
 * This class is represents a visit page in term of structure and
 * behaviour so it is a visit page object
 * */
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class VisitPage {

  constructor() {
    this.gridId = 'visit-grid';
    this.visitGrid = element(by.id(this.gridId));
  }

  /**
   * send back the number of visits in the grid
   */
  async expectNumberOfGridRows(number) {
    await GU.expectRowCount(this.gridId, number, `Expected Visit Registry's ui-grid row count to be ${number}.`);
  }

  /**
   * create visit success
   */
  async createVisitSuccess(
    patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
    isPregnant, notInsideHealthZone, isRefered, ward, room
  ) {
    await this.createVisit(
      patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
      isPregnant, notInsideHealthZone, isRefered, ward, room
    );
    await components.notification.hasSuccess();
  }

  /**
   * create visit fail
   */
  async createVisitFail(
    patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
    isPregnant, notInsideHealthZone, isRefered, ward, room
  ) {
    await this.createVisit(
      patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
      isPregnant, notInsideHealthZone, isRefered, ward, room
    );
    const warningAdmittedTag = by.css('[data-patient-already-admitted]');
    await FU.exists(warningAdmittedTag, true);
    await FU.buttons.cancel();
    await components.notification.hasDanger();
  }

  /**
   * create visit
   */
  async createVisit(
    patientName, serviceName, diagnosis, note, isHospitalized, isOldCase,
    isPregnant, notInsideHealthZone, isRefered, ward, room
  ) {
    await FU.buttons.create();
    // choose the patient
    await components.findPatient.findByName(patientName);

    // choose the service
    await components.serviceSelect.set(serviceName);

    // select diagnosis
    if (diagnosis) {
      await components.diagnosisSelect.set(diagnosis);
    }

    // set note
    await FU.input('AdmitCtrl.visit.notes', note || '');

    if (isHospitalized) {
      await FU.radio('AdmitCtrl.visit.hospitalized', 1);
    }

    if (isOldCase) {
      await FU.radio('AdmitCtrl.visit.is_new_case', 1);
    }

    if (isPregnant) {
      await element(by.model('AdmitCtrl.visit.is_pregnant')).click();
    }

    if (isRefered) {
      await element(by.model('AdmitCtrl.visit.is_refered')).click();
    }

    if (notInsideHealthZone) {
      await FU.radio('AdmitCtrl.visit.inside_health_zone', 1);
    }

    if (ward) {
      await components.wardSelect.set(ward);
    }

    if (room) {
      await components.roomSelect.set(room);
    }

    await FU.buttons.submit();
  }

  /**
   * search
   */
  async search(options) {
    await FU.buttons.search();

    // set to default values the form
    await this.reset();

    if (options.isRefered) {
      await element(by.model('$ctrl.searchQueries.is_refered')).click();
    }

    if (options.isPregnant) {
      await element(by.model('$ctrl.searchQueries.is_pregnant')).click();
    }

    // hospitalization
    if (options.isHospitalized === 1) {
      await element(by.id('hospitalized_yes')).click();
    }

    if (options.isHospitalized === 0) {
      await element(by.id('hospitalized_no')).click();
    }

    // new case
    if (options.isNewCase === 1) {
      await element(by.id('is_new_case_yes')).click();
    }

    if (options.isNewCase === 0) {
      await element(by.id('is_new_case_no')).click();
    }

    // inside health zone
    if (options.insideHealthZone === 1) {
      await element(by.id('inside_health_zone_yes')).click();
    }

    if (options.insideHealthZone === 0) {
      await element(by.id('inside_health_zone_no')).click();
    }

    if (options.displayName) {
      await FU.input('$ctrl.searchQueries.display_name', options.displayName);
    }

    if (options.reference) {
      await FU.input('$ctrl.searchQueries.reference', options.reference);
    }

    if (options.hospital_no) {
      await FU.input('$ctrl.searchQueries.hospital_no', options.hospital_no);
    }

    if (options.service) {
      await components.serviceSelect.set(options.service);
    }

    if (options.ward) {
      await components.wardSelect.set(options.ward);
    }

    if (options.room) {
      await components.roomSelect.set(options.room);
    }

    await FU.buttons.submit();
  }

  /**
   * reset
   */
  async reset() {
    const clearButtons = await $$('[data-reset-input]');

    // start clean from the bottom to the top
    // because if the clean start from the top and arrive in the bottom, top elements
    // are not visible
    for (let i = clearButtons.length - 1; i >= 0; i--) {
      const clearBtn = clearButtons[i];
      // eslint-disable-next-line
      await clearBtn.click();
    }
  }
}

module.exports = VisitPage;

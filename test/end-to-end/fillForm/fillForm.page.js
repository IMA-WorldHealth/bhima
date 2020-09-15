/* global element, browser, by */
/* eslint  */

/**
 * This class is represents a Survey Form page in term of structure and
 * behaviour so it is a Survey Form Management page object
 */

/* loading grid actions */
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class FillFormManagementPage {
  constructor() {
    this.gridId = 'fill-form-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 4;
  }

  /**
   * simulate the create Survey Form button click to show the dialog of creation
   */
  async create(fillForm) {
    await element(by.id('form_3')).click();
    await browser.findElement(by.css('[name="label"]')).sendKeys(fillForm.label);
    await browser.findElement(by.css('[name="longueur"]')).sendKeys(fillForm.longueur);
    await browser.findElement(by.css('[name="largeur"]')).sendKeys(fillForm.largeur);
    await browser.findElement(by.css('[name="nombre_agent"]')).sendKeys(fillForm.nombre_agent);
    await browser.findElement(by.css('[name="nombre_femme"]')).sendKeys(fillForm.nombre_femme);
    await browser.findElement(by.css('[name="raison"]')).sendKeys(fillForm.raison);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createComplexe(fillForm) {
    await element(by.id('form_1')).click();
    await components.findPatient.findByName(fillForm.patientName);
    await components.choiceListSelect.set(fillForm.choice_list_id, 'label');
    await browser.findElement(by.css('[name="poids"]')).sendKeys(fillForm.poids);
    await browser.findElement(by.css('[name="dosekilos"]')).sendKeys(fillForm.dosekilos);
    await browser.findElement(by.css('[name="nombreFois"]')).sendKeys(fillForm.nombreFois);
    await components.dateEditor.set(new Date(fillForm.date), null, '.title');
    await browser.findElement(by.css('[name="voie"]')).sendKeys(fillForm.voie);
    await browser.findElement(by.css('[ng-model="hours"]')).sendKeys(fillForm.hours);
    await browser.findElement(by.css('[ng-model="minutes"]')).sendKeys(fillForm.minutes);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async fillPatientSheet(fillForm) {
    await FU.buttons.create();

    await components.choiceListSelect.set(fillForm.choice_list_id, 'label');
    await browser.findElement(by.css('[name="poids"]')).sendKeys(fillForm.poids);
    await browser.findElement(by.css('[name="dosekilos"]')).sendKeys(fillForm.dosekilos);
    await browser.findElement(by.css('[name="nombreFois"]')).sendKeys(fillForm.nombreFois);
    await components.dateEditor.set(new Date(fillForm.date), null, '.title');
    await browser.findElement(by.css('[name="voie"]')).sendKeys(fillForm.voie);
    await browser.findElement(by.css('[ng-model="hours"]')).sendKeys(fillForm.hours);
    await browser.findElement(by.css('[ng-model="minutes"]')).sendKeys(fillForm.minutes);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = FillFormManagementPage;

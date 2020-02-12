/* global element, browser, by */
/* eslint  */

/**
 * This class is represents a Survey Form page in term of structure and
 * behaviour so it is a Survey Form Management page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class displayMetadataManagementPage {
  constructor() {
    this.gridId = 'display-metadata-grid';
    this.dataGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 8;
  }

  /**
   * simulate a click on the edit link of a function
   */
  async updateMetadata(structure, surveyData) {
    const row = new GridRow(structure);
    await row.dropdown().click();
    await row.edit().click();

    await browser.findElement(by.css('[name="label"]')).sendKeys(surveyData.label);
    await browser.findElement(by.css('[name="longueur"]')).sendKeys(surveyData.longueur);
    await browser.findElement(by.css('[name="largeur"]')).sendKeys(surveyData.largeur);
    await browser.findElement(by.css('[name="nombre_agent"]')).sendKeys(surveyData.nombre_agent);
    await browser.findElement(by.css('[name="nombre_femme"]')).sendKeys(surveyData.nombre_femme);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  // Delete Data of survey
  async deleteDataSurvey(dataDelete) {
    const row = new GridRow(dataDelete.label);
    await row.dropdown().click();
    await row.remove().click();

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = displayMetadataManagementPage;

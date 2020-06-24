/* global element, by */

/**
 * This class is represents a service page in term of structure and
 * behaviour so it is a service page object
 * */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class ServicePage {

  constructor() {
    this.serviceGrid = element(by.id('service-grid'));
  }

  /**
   * simulate the create service button click to show the dialog of creation
   */
  async createService(name, projectName) {
    await FU.buttons.create();
    await FU.input('ServiceModalCtrl.service.name', name);
    await components.projectSelect.set(projectName);
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the service name
   */
  async errorOnCreateService() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('ServiceModalCtrl.service.name');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a service
   */
  async editService(name, updatedName, projectName) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('ServiceModalCtrl.service.name', updatedName);

    if (projectName) {
      await components.projectSelect.set(projectName);
    }

    await element(by.css('[name="hidden"]')).click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a service
   */
  async deleteService(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.remove().click();
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }

  /**
   * cancel deletion process
   */
  async cancelDeleteService(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.remove().click();
    await components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used service
   */
  async errorOnDeleteService(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.remove().click();
    await components.modalAction.confirm();
    await components.notification.hasError();
  }
}

module.exports = ServicePage;

/* global element, by */

/**
 * This class is represents a service page in term of structure and
 * behaviour so it is a service page object
 * */

/** loading grid actions * */
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class ServicePage {

  constructor() {
    this.gridId = 'service-grid';
    this.serviceGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 2;
  }

  /**
   * send back the number of services in the grid
   */
  getServiceCount() {
    return this.serviceGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
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
  async editService(n, name, projectName) {
    await GA.clickOnMethod(n, this.actionLinkColumn, 'edit', this.gridId);
    await FU.input('ServiceModalCtrl.service.name', name);

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
  async deleteService(n) {
    await GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }

  /**
   * cancel deletion process
   */
  async cancelDeleteService(n) {
    await GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used service
   */
  async errorOnDeleteService(n) {
    await GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.confirm();
    await components.notification.hasError();
  }
}

module.exports = ServicePage;

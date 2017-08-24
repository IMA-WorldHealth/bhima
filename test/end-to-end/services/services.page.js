/* global element, by, browser */

/**
 * This class is represents a service page in term of structure and
 * behaviour so it is a service page object
 **/
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

/** loading grid actions **/
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class ServicePage {

  constructor() {
    this.gridId = 'service-grid';
    this.serviceGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 1;
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
  createService(name) {
    FU.buttons.create();
    FU.input('ServiceModalCtrl.service.name', name);
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the service name
   */
  errorOnCreateService() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('ServiceModalCtrl.service.name');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a service
   */
  editService(n, name) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'edit', this.gridId);
    FU.input('ServiceModalCtrl.service.name', name);
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a service
   */
  deleteService(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasSuccess();
  }

  /**
   * cancel deletion process
   */
  cancelDeleteService(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used service
   */
  errorOnDeleteService(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasError();
  }
}

module.exports = ServicePage;

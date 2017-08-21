/* global element, by, browser */

/**
 * This class is represents a service page in term of structure and
 * behaviour so it is a service page object
 **/

const chai = require('chai');

const expect = chai.expect;

const helpers = require('../shared/helpers');

helpers.configure(chai);

/** loading grid actions **/
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

function ServicePage() {
  const page = this;
  const path = '#!/services';
  const gridId = 'service-grid';
  const serviceGrid = element(by.id(gridId));
  const actionLinkColumn = 1;

  /**
   * send back the number of services in the grid
   */
  function getServiceCount() {
    return serviceGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create service button click to show the dialog of creation
   */
  function createService(name) {
    FU.buttons.create();
    FU.input('ServiceModalCtrl.service.name', name);
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the service name
   */
  function errorOnCreateService() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('ServiceModalCtrl.service.name');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a service
   */
  function editService(n, name) {
    GA.clickOnMethod(n, actionLinkColumn, 'edit', gridId);
    FU.input('ServiceModalCtrl.service.name', name);
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a service
   */
  function deleteService(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'delete', gridId);
    components.modalAction.confirm();
    components.notification.hasSuccess();
  }

  /**
   * cancel deletion process
   */
  function cancelDeleteService(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'delete', gridId);
    components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used service
   */
  function errorOnDeleteService(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'delete', gridId);
    components.modalAction.confirm();
    components.notification.hasError();
  }

  page.getServiceCount = getServiceCount;
  page.createService = createService;
  page.editService = editService;
  page.deleteService = deleteService;
  page.errorOnCreateService = errorOnCreateService;
  page.errorOnDeleteService = errorOnDeleteService;
  page.cancelDeleteService = cancelDeleteService;
}

module.exports = ServicePage;

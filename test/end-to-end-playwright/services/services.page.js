const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

/**
 * This class is represents a service page in term of structure and
 * behaviour so it is a service page object
 * */

class ServicePage {

  // ???
  // constructor() {
  //   this.serviceGrid = TU.locator(by.id('service-grid'));
  // }

  /**
   * simulate the create service button click to show the dialog of creation
   */
  async createService(name, projectName, costCenterName) {
    await TU.buttons.create();
    await TU.input('ServiceModalCtrl.service.name', name);
    await components.projectSelect.set(projectName);
    await components.costCenterSelect.set(costCenterName);
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the service name
   */
  async errorOnCreateService() {
    await TU.buttons.create();
    await TU.buttons.submit();
    await TU.validation.error('ServiceModalCtrl.service.name');
    await TU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a service
   */
  async editService(name, updatedName, projectName) {
    const row = new GridRow(name);
    await row.dropdown();
    await row.edit();

    await TU.input('ServiceModalCtrl.service.name', updatedName);

    if (projectName) {
      await components.projectSelect.set(projectName);
    }

    await TU.locator('[name="hidden"]').click();
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a service
   */
  async deleteService(name) {
    const row = new GridRow(name);
    await row.dropdown();
    await row.remove();
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }

  /**
   * cancel deletion process
   */
  async cancelDeleteService(name) {
    const row = new GridRow(name);
    await row.dropdown();
    await row.remove();
    await components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used service
   */
  async errorOnDeleteService(name) {
    const row = new GridRow(name);
    await row.dropdown();
    await row.remove();
    await components.modalAction.confirm();
    await components.notification.hasError();
  }
}

module.exports = ServicePage;

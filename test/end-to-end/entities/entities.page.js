/* eslint  */
/* global element, by */

/**
 * This class is represents a entity page in term of structure and
 * behaviour so it is a entity page object.
 */
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

const GridRow = require('../shared/GridRow');

class EntityPage {
  constructor() {
    this.gridId = 'entity-grid';
    this.entityGrid = element(by.id(this.gridId));
  }

  /**
   * create an entity
   */
  async createEntity(name, type, gender, phone, email, address) {
    await FU.buttons.create();
    // entity name
    await FU.input('EntityModalCtrl.entity.display_name', name);

    // entity type
    await components.entityTypeSelect.set(type);

    // entity gender
    await components.genderSelect.set(gender);

    // entity phone
    await FU.input('EntityModalCtrl.entity.phone', phone);

    // entity email
    await FU.input('EntityModalCtrl.entity.email', email);

    // entity address
    await FU.input('EntityModalCtrl.entity.address', address);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the entity name
   */
  async errorOnCreateEntity() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('EntityModalCtrl.entity.display_name');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a entity
   */
  async editEntity(name, newName, type, gender, phone, email, address) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.edit().click();

    if (newName) {
      await FU.input('EntityModalCtrl.entity.display_name', newName);
    }

    if (type) {
      await components.entityTypeSelect.set(type);
    }

    if (gender) {
      await components.genderSelect.set(gender);
    }

    if (phone) {
      await FU.input('EntityModalCtrl.entity.phone', phone);
    }

    if (email) {
      await FU.input('EntityModalCtrl.entity.email', email);
    }

    if (address) {
      await FU.input('EntityModalCtrl.entity.address', address);
    }

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a entity
   */
  async deleteEntity(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.remove().click();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = EntityPage;

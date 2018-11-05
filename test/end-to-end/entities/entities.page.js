/* eslint class-methods-use-this:"off" */
/* global element, by */

/**
 * This class is represents a entity page in term of structure and
 * behaviour so it is a entity page object.
 */
const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
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
  createEntity(name, type, gender, phone, email, address) {
    FU.buttons.create();
    // entity name
    FU.input('EntityModalCtrl.entity.display_name', name);

    // entity type
    components.entityTypeSelect.set(type);

    // entity gender
    components.genderSelect.set(gender);

    // entity phone
    FU.input('EntityModalCtrl.entity.phone', phone);

    // entity email
    FU.input('EntityModalCtrl.entity.email', email);

    // entity address
    FU.input('EntityModalCtrl.entity.address', address);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the entity name
   */
  errorOnCreateEntity() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('EntityModalCtrl.entity.display_name');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a entity
   */
  editEntity(name, newName, type, gender, phone, email, address) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.edit().click();

    if (newName) {
      FU.input('EntityModalCtrl.entity.display_name', newName);
    }

    if (type) {
      components.entityTypeSelect.set(type);
    }

    if (gender) {
      components.genderSelect.set(gender);
    }

    if (phone) {
      FU.input('EntityModalCtrl.entity.phone', phone);
    }

    if (email) {
      FU.input('EntityModalCtrl.entity.email', email);
    }

    if (address) {
      FU.input('EntityModalCtrl.entity.address', address);
    }

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a entity
   */
  deleteEntity(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.remove().click();

    components.modalAction.confirm();
    components.notification.hasSuccess();
  }
}

module.exports = EntityPage;

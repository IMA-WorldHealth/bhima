/* global by, element */

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

class BedPage {
  constructor() {
    this.gridId = 'bed-grid';
  }

  submit() {
    return FU.modal.submit();
  }

  cancel() {
    return FU.modal.cancel();
  }

  setLabel(txt) {
    return components.inpuText.set('label', txt);
  }

  labelValidationError() {
    return components.inpuText.validationError('label');
  }

  setWard(ward) {
    return components.wardSelect.set(ward);
  }

  wardValidationError() {
    return components.wardSelect.validationError();
  }

  setRoom(room, id) {
    return components.roomSelect.set(room, id);
  }

  roomValidationError() {
    return components.roomSelect.validationError();
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async editBed(label) {
    await element(by.css('[data-expand]')).click();
    const row = await this.openDropdownMenu(label);
    await row.edit().click();
  }

  async deleteBed(label) {
    await element(by.css('[data-expand]')).click();
    const row = await this.openDropdownMenu(label);
    await row.remove().click();
  }

  openCreateModal() {
    return element(by.css('[data-create-bed]')).click();
  }
}

module.exports = BedPage;

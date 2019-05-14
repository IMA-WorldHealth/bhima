/* global by, element */

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

class RoomPage {
  constructor() {
    this.gridId = 'room-grid';
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

  wardValidationError() {
    return components.wardSelect.validationError();
  }

  setDescription(txt) {
    const RoomDescription = element(by.model('ModalCtrl.room.description'));
    return RoomDescription.clear().sendKeys(txt);
  }

  setWard(ward) {
    return components.wardSelect.set(ward);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async editRoom(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit().click();
  }

  async deleteRoom(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();
  }

  openCreateModal() {
    return element(by.css('[data-create-room]')).click();
  }
}

module.exports = RoomPage;

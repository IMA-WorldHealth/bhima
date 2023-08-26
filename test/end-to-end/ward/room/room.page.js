const TU = require('../../shared/TestUtils');
const { by } = require('../../shared/TestUtils');

const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

class RoomPage {
  constructor() {
    this.gridId = 'room-grid';
  }

  submit() {
    return TU.modal.submit();
  }

  cancel() {
    return TU.modal.cancel();
  }

  setLabel(txt) {
    return components.inputText.set('label', txt);
  }

  labelValidationError() {
    return components.inputText.validationError('label');
  }

  wardValidationError() {
    return components.wardSelect.validationError();
  }

  setDescription(txt) {
    const RoomDescription = TU.locator(by.model('ModalCtrl.room.description'));
    return RoomDescription.fill(txt);
  }

  setWard(ward) {
    return components.wardSelect.set(ward);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row;
  }

  async editRoom(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit();
  }

  async deleteRoom(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove();
  }

  openCreateModal() {
    return TU.locator('[data-create-room]').click();
  }
}

module.exports = RoomPage;

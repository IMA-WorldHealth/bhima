const TU = require('../../shared/TestUtils');

const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

class BedPage {
  constructor() {
    this.gridId = 'bed-grid';
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
    await row.dropdown();
    return row;
  }

  async editBed(label) {
    await TU.locator('[data-expand]').click();
    const row = await this.openDropdownMenu(label);
    await row.edit();
  }

  async deleteBed(label) {
    await TU.locator('[data-expand]').click();
    const row = await this.openDropdownMenu(label);
    await row.remove();
  }

  openCreateModal() {
    return TU.locator('[data-create-bed]').click();
  }
}

module.exports = BedPage;

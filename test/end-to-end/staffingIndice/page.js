/* global by, element */
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

class StaffingIndicePage {
  submit() {
    return FU.modal.submit();
  }

  async setValue(number) {
    await components.inpuText.set('value', number);
  }

  setGrade(value) {
    return components.gradeSelect.set(value);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async edit(uuid) {
    const row = await this.openDropdownMenu(uuid);
    await row.edit().click();
  }

  async delete(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();
  }


  openCreateUpdateModal() {
    return FU.buttons.create();
  }
}

module.exports = StaffingIndicePage;

/* global by, element */

const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

function RolesPage() {
  const page = this;

  // the grid id
  const gridId = 'tagss-grid';

  page.gridId = gridId;
  page.setName = setName;
  page.editTags = editTags;
  page.deleteTags = deleteTags;
  page.openCreateModal = openCreateModal;

  const departmentName = element(by.model('ModalCtrl.tags.name'));

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function setName(txt) {
    return departmentName.clear().sendKeys(txt);
  }

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async function editTags(label) {
    const row = await openDropdownMenu(label);
    return row.edit().click();
  }

  async function deleteTags(label) {
    const row = openDropdownMenu(label);
    await row.remove().click();
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;

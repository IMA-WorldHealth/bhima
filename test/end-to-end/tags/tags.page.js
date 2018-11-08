/* global by, element */

const FU = require('../shared/FormUtils');
const GA = require('../shared/GridAction');
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

  //  label field in the create/edit modal

  const departmentName = element(by.model('ModalCtrl.tags.name'));


  page.submit = function submit() {
    return FU.modal.submit();
  };

  function setName(txt) {
    return departmentName.clear().sendKeys(txt);
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editTags(label) {
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deleteTags(label) {
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;

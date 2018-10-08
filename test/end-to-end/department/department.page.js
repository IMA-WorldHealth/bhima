/* global by, element */

const FU = require('../shared/FormUtils');
const GA = require('../shared/GridAction');
const GridRow = require('../shared/GridRow');

function RolesPage() {
  const page = this;

  // the grid id
  const gridId = 'roles-grid';

  page.gridId = gridId;
  page.setLabel = setLabel;
  page.editDepartment = editDepartment;
  page.deleteDepartment = deleteDepartment;
  page.openCreateModal = openCreateModal;
  page.setAction = setAction;

  //  label field in the create/edit modal

  const departmentName = element(by.model('ModalCtrl.department.name'));


  page.submit = function submit() {
    return FU.modal.submit();
  };

  function setLabel(txt) {
    return departmentName.clear().sendKeys(txt);
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editDepartment(label) {
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deleteDepartment(label) {
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function setAction(id) {
    return $(`[id="${id}"]`).click();
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;

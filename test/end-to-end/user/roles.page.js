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
  page.editRole = editRole;
  page.deleteRole = deleteRole;
  page.editPermissions = editPermissions;
  page.openCreateModal = openCreateModal;
  page.checkAllPerimission = checkAllPerimission;
  page.assignRole = assignRole;
  page.setRole = setRole;
  page.assignActions = assignActions;
  page.setAction = setAction;

  //  label field in the create/edit modal

  const roleLabel = element(by.model('RolesAddCtrl.role.label'));
  const checkAll = element(by.id('checkall'));

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function setLabel(txt) {
    return roleLabel.clear().sendKeys(txt);
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editRole(label) {
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deleteRole(label) {
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function editPermissions(label) {
    const row = openDropdownMenu(label);
    row.menu.$('[data-method="edit-permissions"]').click();
  }

  function checkAllPerimission() {
    checkAll.click();
  }

  function assignRole(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.menu.$('[data-method="assign_roles"]').click();
  }

  function assignActions(label) {
    const row = openDropdownMenu(label);
    row.menu.$('[data-method="edit-actions"]').click();
  }

  function setRole(txt) {
    return $(`[title="${txt}"]`).click();
  }

  function setAction(id) {
    return $(`[id="${id}"]`).click();
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;

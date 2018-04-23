/* global by, element */

const FU = require('../shared/FormUtils');
/* loading grid actions */
const GA = require('../shared/GridAction');

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
  page.dismissNotification = dismissNotification;
  page.assignRole = assignRole;
  page.setRole = setRole;
  page.assignActions = assignActions;
  page.setAction = setAction;

  const actionLinkColumn = 1;
  //  label field in the create/edit modal

  const roleLabel = element(by.model('RolesAddCtrl.role.label'));
  const checkAll = element(by.id('checkall'));

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function setLabel(txt) {
    return roleLabel.clear().sendKeys(txt);
  }

  function editRole(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'edit', gridId);
  }
  function deleteRole(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'delete', gridId);
  }

  function editPermissions(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'edit_permissions', gridId);
  }
  function dismissNotification() {
    return element(by.css('[data-dismiss="notification"]')).click();
  }
  function checkAllPerimission() {
    checkAll.click();
  }

  function assignRole(n) {
    GA.clickOnMethod(n, 2, 'assign_roles', 'users-grid');
  }

  function assignActions(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'edit_actions', gridId);
  }

  function setRole(txt) {
    return element(by.css(`[title="${txt}"]`)).click();
  }

  function setAction(id) {
    return element(by.css(`[id="${id}"]`)).click();
  }

  function openCreateModal() {
    return FU.buttons.add();
  }

}

module.exports = RolesPage;

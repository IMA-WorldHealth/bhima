/* global by, element */

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

function WardPage() {
  const page = this;

  // the grid id
  const gridId = 'ward-grid';

  page.gridId = gridId;
  page.setName = setName;
  page.editWard = editWard;
  page.setDescription = setDescription;
  page.deleteWard = deleteWard;
  page.selectService = selectService;
  page.openCreateModal = openCreateModal;

  //  label field in the create/edit modal

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function selectService(name) {
    components.serviceSelect.set(name);
  }
  function setName(txt) {
    const WardName = element(by.model('ModalCtrl.ward.name'));
    return WardName.clear().sendKeys(txt);
  }

  function setDescription(txt) {
    const WardDescription = element(by.model('ModalCtrl.ward.description'));
    return WardDescription.clear().sendKeys(txt);
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editWard(label) {
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deleteWard(label) {
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function openCreateModal() {
    return element(by.css('[data-create-ward]')).click();
  }
}

module.exports = WardPage;

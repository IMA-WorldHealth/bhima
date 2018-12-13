/* global by, element */

const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

function PavillionPage() {
  const page = this;

  // the grid id
  const gridId = 'pavillion-grid';

  page.gridId = gridId;
  page.setName = setName;
  page.editPavillion = editPavillion;
  page.setDescription = setDescription;
  page.deletePavillion = deletePavillion;
  page.selectService = selectService;
  page.openCreateModal = openCreateModal;

  //  label field in the create/edit modal

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function selectService(name) {
    FU.select('ModalCtrl.pavillion.service_id', name);
  }
  function setName(txt) {
    const PavillionName = element(by.model('ModalCtrl.pavillion.name'));
    return PavillionName.clear().sendKeys(txt);
  }

  function setDescription(txt) {
    const PavillionDescription = element(by.model('ModalCtrl.pavillion.description'));
    return PavillionDescription.clear().sendKeys(txt);
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editPavillion(label) {
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deletePavillion(label) {
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = PavillionPage;

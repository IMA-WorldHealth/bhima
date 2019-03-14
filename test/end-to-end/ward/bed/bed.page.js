/* global by, element */

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

function BedPage() {
  const page = this;

  // the grid id
  const gridId = 'bed-grid';

  page.gridId = gridId;
  page.setLabel = setLabel;
  page.editBed = editBed;
  page.deleteBed = deleteBed;
  page.openCreateModal = openCreateModal;
  page.setWard = setWard;
  page.labelValidationError = labelValidationError;
  page.wardValidationError = wardValidationError;
  page.roomValidationError = roomValidationError;
  page.setRoom = setRoom;

  //  label field in the create/edit modal

  page.submit = function submit() {
    return FU.modal.submit();
  };

  page.cancel = () => {
    FU.modal.cancel();
  };

  function setLabel(txt) {
    components.inpuText.set('label', txt);
  }

  function labelValidationError() {
    components.inpuText.validationError('label');
  }

  function setWard(ward) {
    components.wardSelect.set(ward);
  }

  function wardValidationError() {
    components.wardSelect.validationError();
  }

  function setRoom(room, id) {
    components.roomSelect.set(room, id);
  }

  function roomValidationError() {
    components.roomSelect.validationError();
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editBed(label) {
    element(by.css('[data-expand]')).click();
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deleteBed(label) {
    element(by.css('[data-expand]')).click();
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function openCreateModal() {
    return element(by.css('[data-create-bed]')).click();
  }
}

module.exports = BedPage;

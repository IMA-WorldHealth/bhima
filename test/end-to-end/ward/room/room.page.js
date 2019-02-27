/* global by, element */

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

function RoomPage() {
  const page = this;

  // the grid id
  const gridId = 'room-grid';

  page.gridId = gridId;
  page.setLabel = setLabel;
  page.editRoom = editRoom;
  page.setDescription = setDescription;
  page.deleteRoom = deleteRoom;
  page.openCreateModal = openCreateModal;
  page.setWard = setWard;
  page.labelValidationError = labelValidationError;
  page.wardValidationError = wardValidationError;

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

  function wardValidationError() {
    components.wardSelect.validationError();
  }

  function setDescription(txt) {
    const RoomDescription = element(by.model('ModalCtrl.room.description'));
    return RoomDescription.clear().sendKeys(txt);
  }

  function setWard(ward) {
    components.wardSelect.set(ward);
  }

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editRoom(label) {
    const row = openDropdownMenu(label);
    row.edit().click();
  }

  function deleteRoom(label) {
    const row = openDropdownMenu(label);
    row.remove().click();
  }

  function openCreateModal() {
    return element(by.css('[data-create-room]')).click();
  }
}

module.exports = RoomPage;

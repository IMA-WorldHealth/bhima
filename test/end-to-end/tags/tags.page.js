/* global by, element */

const FU = require('../shared/FormUtils');
const GridAction = require('../shared/GridAction');

function TagsPage() {
  const page = this;

  // the grid id
  const gridId = 'tags-grid';

  page.gridId = gridId;
  page.setName = setName;
  page.editTags = editTags;
  page.deleteTags = deleteTags;
  page.openCreateModal = openCreateModal;
  page.setColor = setColor;

  const tagName = element(by.model('ModalCtrl.tags.name'));

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function setName(txt) {
    return tagName.clear().sendKeys(txt);
  }

  function setColor(color) {
    return FU.uiSelect('ModalCtrl.tags.color', color);
  }

  async function editTags(rowIndex) {
    await GridAction.clickOnMethod(rowIndex, 1, 'edit-record', gridId);
  }

  async function deleteTags(rowIndex) {
    await GridAction.clickOnMethod(rowIndex, 1, 'delete-record', gridId);
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = TagsPage;

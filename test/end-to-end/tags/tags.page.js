/* global by, element */

const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

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

  async function showDragAndDropMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async function editTags(label) {
    const row = await showDragAndDropMenu(label);
    await row.edit().click();
  }

  async function deleteTags(label) {
    const row = await showDragAndDropMenu(label);
    await row.remove().click();
  }

  function openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = TagsPage;

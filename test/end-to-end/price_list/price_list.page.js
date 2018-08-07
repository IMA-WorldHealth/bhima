const FU = require('../shared/FormUtils');
/* loading grid actions */
const GA = require('../shared/GridAction');

function PriceListPage() {
  const page = this;

  // the grid id
  const gridId = 'priceList-grid';
  const itemsGridId = 'pricelist-items-grid';

  page.gridId = gridId;
  page.editPriceList = editPriceList;

  page.deleteRole = deleteRole;
  page.editItems = editItems;
  page.openCreateModal = openCreateModal;
  page.deletePriceListItem = deletePriceListItem;

  const actionLinkColumn = 2;
  const itemsActionLinkColumn = 3;

  page.submit = function submit() {
    return FU.modal.submit();
  };

  function editPriceList(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'edit', gridId);
  }

  function deletePriceListItem(n) {
    return GA.clickOnMethod(n, itemsActionLinkColumn, 'delete-item', itemsGridId);
  }

  function editItems(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'edit-items', gridId);
  }

  function deleteRole(n) {
    return GA.clickOnMethod(n, actionLinkColumn, 'delete', gridId);
  }

  function openCreateModal() {
    return FU.buttons.add();
  }

}

module.exports = PriceListPage;

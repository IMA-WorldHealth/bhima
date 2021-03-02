/* global element, by */
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');
const SharedStockPage = require('./stock.shared.page');

function StockAggregateConsumptionPage() {
  const page = this;
  const gridId = 'aggregated-consumption-grid';
  const modalGridId = 'lots-grid';

  // change current depot
  page.changeDepot = SharedStockPage.setDepot;

  // the grid id
  page.gridId = gridId;
  page.modalGridId = modalGridId;

  page.setFiscalPeriod = async (fiscalYear, period) => {
    await components.fiscalYearPeriodSelect.set(fiscalYear, period);
  };

  page.addRows = async number => {
    await components.addItem.set(number);
  };

  // set description
  page.setDescription = description => {
    return FU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setHeaderValue
   */
  page.setHeaderValue = async function setHeaderValue(rowIndex, columnIndex, value) {
    const cell = await GU.getCell(gridId, rowIndex, columnIndex);
    const inputOutStock = cell.element(by.id('row.treeNode.children[0].row.entity.inventory_uuid'));
    inputOutStock.sendKeys(value);
  };

  /**
   * @method setQuantityConsumed
   */
  page.setQuantityConsumed = async function setQuantityConsumed(rowIndex, columnIndex, quantity) {
    const quantityCell = await GU.getCell(gridId, rowIndex, columnIndex);
    await FU.input('row.entity.quantity_consumed', quantity, quantityCell);
  };

  /**
   * @method setQuantityLost
   */
  page.setQuantityLost = async function setQuantityLost(rowIndex, columnIndex, quantity) {
    const quantityCell = await GU.getCell(gridId, rowIndex, columnIndex);
    await FU.input('row.entity.quantity_lost', quantity, quantityCell);
  };

  /**
   * @method setDetailed
   */
  page.setDetailed = async function setDetailed(rowIndex, columnIndex) {
    const getCell = await GU.getCell(gridId, rowIndex, columnIndex);
    await getCell.element(by.id('aggregated_details')).click();
  };

  page.setLotsDetailed = async function setLotsDetailed(lotsArray) {
    const dateCell0 = await GU.getCell(modalGridId, 0, 1);
    const quantityConsumptionCell0 = await GU.getCell(modalGridId, 0, 2);
    const quantityLostCell0 = await GU.getCell(modalGridId, 0, 3);
    await components.datePicker.set(lotsArray[0].date, dateCell0);
    await FU.input('row.entity.quantity_consumed', lotsArray[0].quantity_consumed, quantityConsumptionCell0);
    await FU.input('row.entity.quantity_lost', lotsArray[0].quantity_lost, quantityLostCell0);
    await components.addItem.set(1);

    const dateCell1 = await GU.getCell(modalGridId, 1, 1);
    const quantityConsumptionCell1 = await GU.getCell(modalGridId, 1, 2);
    const quantityLostCell1 = await GU.getCell(modalGridId, 1, 3);
    await components.datePicker.set(lotsArray[1].date, dateCell1);
    await FU.input('row.entity.quantity_consumed', lotsArray[1].quantity_consumed, quantityConsumptionCell1);
    await FU.input('row.entity.quantity_lost', lotsArray[1].quantity_lost, quantityLostCell1);
    await components.addItem.set(1);

    const dateCell2 = await GU.getCell(modalGridId, 2, 1);
    const quantityConsumptionCell2 = await GU.getCell(modalGridId, 2, 2);
    const quantityLostCell2 = await GU.getCell(modalGridId, 2, 3);
    await components.datePicker.set(lotsArray[2].date, dateCell2);
    await FU.input('row.entity.quantity_consumed', lotsArray[2].quantity_consumed, quantityConsumptionCell2);
    await FU.input('row.entity.quantity_lost', lotsArray[2].quantity_lost, quantityLostCell2);
    await components.addItem.set(1);

    const dateCell3 = await GU.getCell(modalGridId, 3, 1);
    const quantityConsumptionCell3 = await GU.getCell(modalGridId, 3, 2);
    const quantityLostCell3 = await GU.getCell(modalGridId, 3, 3);
    await components.datePicker.set(lotsArray[3].date, dateCell3);
    await FU.input('row.entity.quantity_consumed', lotsArray[3].quantity_consumed, quantityConsumptionCell3);
    await FU.input('row.entity.quantity_lost', lotsArray[3].quantity_lost, quantityLostCell3);
    await components.addItem.set(1);

    const dateCell4 = await GU.getCell(modalGridId, 4, 1);
    const quantityConsumptionCell4 = await GU.getCell(modalGridId, 4, 2);
    const quantityLostCell4 = await GU.getCell(modalGridId, 4, 3);
    await components.datePicker.set(lotsArray[4].date, dateCell4);
    await FU.input('row.entity.quantity_consumed', lotsArray[4].quantity_consumed, quantityConsumptionCell4);
    await FU.input('row.entity.quantity_lost', lotsArray[4].quantity_lost, quantityLostCell4);

    FU.modal.submit();
  };

  page.setLots2Detailed = async function setLots2Detailed(lotsArray) {
    const dateCell0 = await GU.getCell(modalGridId, 0, 1);
    const quantityConsumptionCell0 = await GU.getCell(modalGridId, 0, 2);
    const quantityLostCell0 = await GU.getCell(modalGridId, 0, 3);
    await components.datePicker.set(lotsArray[0].date, dateCell0);
    await FU.input('row.entity.quantity_consumed', lotsArray[0].quantity_consumed, quantityConsumptionCell0);
    await FU.input('row.entity.quantity_lost', lotsArray[0].quantity_lost, quantityLostCell0);
    await components.addItem.set(1);

    const dateCell1 = await GU.getCell(modalGridId, 1, 1);
    const quantityConsumptionCell1 = await GU.getCell(modalGridId, 1, 2);
    const quantityLostCell1 = await GU.getCell(modalGridId, 1, 3);
    await components.datePicker.set(lotsArray[1].date, dateCell1);
    await FU.input('row.entity.quantity_consumed', lotsArray[1].quantity_consumed, quantityConsumptionCell1);
    await FU.input('row.entity.quantity_lost', lotsArray[1].quantity_lost, quantityLostCell1);

    FU.modal.submit();
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await FU.buttons.submit();
    // the receipt modal is displayed
    await FU.exists(by.id('receipt-confirm-created'), true);
    // close the modal
    await element(by.css('[data-action="close"]')).click();
  };

  /**
   * @method submitErrorQuantity
   */
  page.submitErrorQuantity = async function submitErrorQuantity() {
    FU.buttons.submit();

    await components.notification.hasDanger();
  };

}

module.exports = StockAggregateConsumptionPage;

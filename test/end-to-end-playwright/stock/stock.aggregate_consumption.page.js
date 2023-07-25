const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

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
    return components.fiscalYearPeriodSelect.set(fiscalYear, period);
  };

  page.addRows = async number => {
    return components.addItem.set(number);
  };

  // set description
  page.setDescription = description => {
    return TU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setHeaderValue
   */
  page.setHeaderValue = async function setHeaderValue(rowIndex, columnIndex, value) {
    const cell = await GU.getCell(gridId, rowIndex, columnIndex);
    // ??? const inputOutStock = await cell.locator(by.id('row.treeNode.children[0].row.entity.inventory_uuid'));
    const inputOutStock = await cell.locator(by.name('days_stock_out'));
    return TU.fill(inputOutStock, value);
  };

  /**
   * @method setQuantityConsumed
   */
  page.setQuantityConsumed = async function setQuantityConsumed(rowIndex, columnIndex, quantity) {
    const quantityCell = await GU.getCell(gridId, rowIndex, columnIndex);
    return TU.input('row.entity.quantity_consumed', quantity, quantityCell);
  };

  /**
   * @method setQuantityLost
   */
  page.setQuantityLost = async function setQuantityLost(rowIndex, columnIndex, quantity) {
    const quantityCell = await GU.getCell(gridId, rowIndex, columnIndex);
    return TU.input('row.entity.quantity_lost', quantity, quantityCell);
  };

  /**
   * @method setDetailed
   */
  page.setDetailed = async function setDetailed(rowIndex, columnIndex) {
    console.debug('SD1');
    const getCell = await GU.getCell(gridId, rowIndex, columnIndex);
    console.debug('SD2 cell: ', getCell, await getCell.count());
    const btn = await getCell.locator(by.id('aggregated_details'));
    console.debug('SD3 btn: ', btn, await btn.count(), await btn.isEnabled());
    await btn.evaluate(node => node.click());
    // await getCell.locator(by.id('aggregated_details')).click();
    // ??? return getCell.locator(by.id('aggregated_details')).click();
    console.debug('SD4');
    return true;
  };

  page.setLotsDetailed = async function setLotsDetailed(lotsArray) {
    const dateStartCell0 = await GU.getCell(modalGridId, 0, 1);
    const dateEndCell0 = await GU.getCell(modalGridId, 0, 2);
    const quantityConsumptionCell0 = await GU.getCell(modalGridId, 0, 3);
    const quantityLostCell0 = await GU.getCell(modalGridId, 0, 4);
    await components.datePicker.set(lotsArray[0].start_date, dateStartCell0);
    await components.datePicker.set(lotsArray[0].end_date, dateEndCell0);
    await TU.input('row.entity.quantity_consumed', lotsArray[0].quantity_consumed, quantityConsumptionCell0);
    await TU.input('row.entity.quantity_lost', lotsArray[0].quantity_lost, quantityLostCell0);
    await components.addItem.set(1);

    const dateStartCell1 = await GU.getCell(modalGridId, 1, 1);
    const dateEndCell1 = await GU.getCell(modalGridId, 1, 2);
    const quantityConsumptionCell1 = await GU.getCell(modalGridId, 1, 3);
    const quantityLostCell1 = await GU.getCell(modalGridId, 1, 4);
    await components.datePicker.set(lotsArray[1].start_date, dateStartCell1);
    await components.datePicker.set(lotsArray[1].end_date, dateEndCell1);
    await TU.input('row.entity.quantity_consumed', lotsArray[1].quantity_consumed, quantityConsumptionCell1);
    await TU.input('row.entity.quantity_lost', lotsArray[1].quantity_lost, quantityLostCell1);
    await components.addItem.set(1);

    const dateStartCell2 = await GU.getCell(modalGridId, 2, 1);
    const dateEndCell2 = await GU.getCell(modalGridId, 2, 2);
    const quantityConsumptionCell2 = await GU.getCell(modalGridId, 2, 3);
    const quantityLostCell2 = await GU.getCell(modalGridId, 2, 4);
    await components.datePicker.set(lotsArray[2].start_date, dateStartCell2);
    await components.datePicker.set(lotsArray[2].end_date, dateEndCell2);
    await TU.input('row.entity.quantity_consumed', lotsArray[2].quantity_consumed, quantityConsumptionCell2);
    await TU.input('row.entity.quantity_lost', lotsArray[2].quantity_lost, quantityLostCell2);
    await components.addItem.set(1);

    const dateStartCell3 = await GU.getCell(modalGridId, 3, 1);
    const dateEndCell3 = await GU.getCell(modalGridId, 3, 2);
    const quantityConsumptionCell3 = await GU.getCell(modalGridId, 3, 3);
    const quantityLostCell3 = await GU.getCell(modalGridId, 3, 4);
    await components.datePicker.set(lotsArray[3].start_date, dateStartCell3);
    await components.datePicker.set(lotsArray[3].end_date, dateEndCell3);
    await TU.input('row.entity.quantity_consumed', lotsArray[3].quantity_consumed, quantityConsumptionCell3);
    await TU.input('row.entity.quantity_lost', lotsArray[3].quantity_lost, quantityLostCell3);
    await components.addItem.set(1);

    const dateStartCell4 = await GU.getCell(modalGridId, 4, 1);
    const dateEndCell4 = await GU.getCell(modalGridId, 4, 2);
    const quantityConsumptionCell4 = await GU.getCell(modalGridId, 4, 3);
    const quantityLostCell4 = await GU.getCell(modalGridId, 4, 4);
    await components.datePicker.set(lotsArray[4].start_date, dateStartCell4);
    await components.datePicker.set(lotsArray[4].end_date, dateEndCell4);
    await TU.input('row.entity.quantity_consumed', lotsArray[4].quantity_consumed, quantityConsumptionCell4);
    await TU.input('row.entity.quantity_lost', lotsArray[4].quantity_lost, quantityLostCell4);

    return TU.modal.submit();
  };

  page.setLots2Detailed = async function setLots2Detailed(lotsArray) {
    const dateStartCell0 = await GU.getCell(modalGridId, 0, 1);
    const dateEndCell0 = await GU.getCell(modalGridId, 0, 2);
    const quantityConsumptionCell0 = await GU.getCell(modalGridId, 0, 3);
    const quantityLostCell0 = await GU.getCell(modalGridId, 0, 4);
    await components.datePicker.set(lotsArray[0].start_date, dateStartCell0);
    await components.datePicker.set(lotsArray[0].end_date, dateEndCell0);
    await TU.input('row.entity.quantity_consumed', lotsArray[0].quantity_consumed, quantityConsumptionCell0);
    await TU.input('row.entity.quantity_lost', lotsArray[0].quantity_lost, quantityLostCell0);

    await components.addItem.set(1);
    // await TU.locator(by.id('btn-add-rows')).click();
    const dateStartCell1 = await GU.getCell(modalGridId, 1, 1);
    const dateEndCell1 = await GU.getCell(modalGridId, 1, 2);
    const quantityConsumptionCell1 = await GU.getCell(modalGridId, 1, 3);
    const quantityLostCell1 = await GU.getCell(modalGridId, 1, 4);
    await components.datePicker.set(lotsArray[1].start_date, dateStartCell1);
    await components.datePicker.set(lotsArray[1].end_date, dateEndCell1);
    await TU.input('row.entity.quantity_consumed', lotsArray[1].quantity_consumed, quantityConsumptionCell1);
    await TU.input('row.entity.quantity_lost', lotsArray[1].quantity_lost, quantityLostCell1);

    return TU.modal.submit();
  };

  page.setLots3Detailed = async function setLots3Detailed(lotsArray) {
    const dateStartCell0 = await GU.getCell(modalGridId, 0, 1);
    const dateEndCell0 = await GU.getCell(modalGridId, 0, 2);
    const quantityConsumptionCell0 = await GU.getCell(modalGridId, 0, 3);
    const quantityLostCell0 = await GU.getCell(modalGridId, 0, 4);
    await components.datePicker.set(lotsArray[0].start_date, dateStartCell0);
    await components.datePicker.set(lotsArray[0].end_date, dateEndCell0);
    await TU.input('row.entity.quantity_consumed', lotsArray[0].quantity_consumed, quantityConsumptionCell0);
    await TU.input('row.entity.quantity_lost', lotsArray[0].quantity_lost, quantityLostCell0);

    await TU.exists(by.id('validation-error'), true);
    return TU.modal.cancel();
  };

  page.setLots4Detailed = async function setLots4Detailed(lotsArray) {
    const dateStartCell0 = await GU.getCell(modalGridId, 0, 1);
    const dateEndCell0 = await GU.getCell(modalGridId, 0, 2);
    const quantityConsumptionCell0 = await GU.getCell(modalGridId, 0, 3);
    const quantityLostCell0 = await GU.getCell(modalGridId, 0, 4);
    await components.datePicker.set(lotsArray[0].start_date, dateStartCell0);
    await components.datePicker.set(lotsArray[0].end_date, dateEndCell0);
    await TU.input('row.entity.quantity_consumed', lotsArray[0].quantity_consumed, quantityConsumptionCell0);
    await TU.input('row.entity.quantity_lost', lotsArray[0].quantity_lost, quantityLostCell0);
    await components.addItem.set(1);

    const dateStartCell1 = await GU.getCell(modalGridId, 1, 1);
    const dateEndCell1 = await GU.getCell(modalGridId, 1, 2);
    const quantityConsumptionCell1 = await GU.getCell(modalGridId, 1, 3);
    const quantityLostCell1 = await GU.getCell(modalGridId, 1, 4);
    await components.datePicker.set(lotsArray[1].start_date, dateStartCell1);
    await components.datePicker.set(lotsArray[1].end_date, dateEndCell1);
    await TU.input('row.entity.quantity_consumed', lotsArray[1].quantity_consumed, quantityConsumptionCell1);
    await TU.input('row.entity.quantity_lost', lotsArray[1].quantity_lost, quantityLostCell1);

    await TU.exists(by.id('validation-error'), true);
    return TU.modal.cancel();
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await TU.buttons.submit();
    // wait until the receipt modal is displayed
    await TU.waitForSelector(by.id('receipt-confirm-created'));
    // close the modal
    return TU.locator('[data-action="close"]').click();
  };

  /**
   * @method submitErrorQuantity
   */
  page.submitErrorQuantity = async function submitErrorQuantity() {
    TU.buttons.submit();

    return components.notification.hasDanger();
  };

}

module.exports = StockAggregateConsumptionPage;

/* global element, by */
/* eslint  */
const { expect } = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');

const EntryPage = require('./stock.setting.page');

function StockSettingTests() {
  // the page object
  const page = new EntryPage();

  // navigate to the page
  before(() => helpers.navigate('#/stock/setting'));

  it('Should Update Stock Setting', async () => {
    await page.defineMonthAverageConsumption(5);
    await page.defaultMinMonthsSecurityStock(4);

    await page.setRadio('yes', 'enable_daily_consumption');
    await page.setRadio('yes', 'enable_auto_purchase_order_confirmation');
    await page.setRadio('yes', 'enable_strict_depot_permission');
    await page.setRadio('yes', 'enable_auto_stock_accounting');
    await page.setRadio('yes', 'enable_supplier_credit');
    await element(by.id('algo_msh')).click();

    const checkSelectAlgo1 = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(0);
    const checkSelectAlgo2 = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(1);
    const checkSelectAlgo3 = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(2);
    const checkSelectAlgoMsh = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(3);

    expect(await checkSelectAlgo1.isSelected()).to.equal(false);
    expect(await checkSelectAlgo2.isSelected()).to.equal(false);
    expect(await checkSelectAlgo3.isSelected()).to.equal(false);
    expect(await checkSelectAlgoMsh.isSelected()).to.equal(true);

    // submit
    await FU.buttons.submit();
    await page.checkSuccess();
  });

  it('Should Restore Stock Setting value', async () => {
    await page.defineMonthAverageConsumption(10);
    await page.defaultMinMonthsSecurityStock(2);

    await page.setRadio('no', 'enable_daily_consumption');
    await page.setRadio('no', 'enable_auto_purchase_order_confirmation');
    await page.setRadio('no', 'enable_strict_depot_permission');
    await page.setRadio('no', 'enable_auto_stock_accounting');
    await page.setRadio('no', 'enable_supplier_credit');
    await element(by.id('algo3')).click();

    const checkSelectAlgo1 = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(0);
    const checkSelectAlgo2 = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(1);
    const checkSelectAlgo3 = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(2);
    const checkSelectAlgoMsh = element.all(by.model('StockSettingsCtrl.settings.average_consumption_algo')).get(3);

    expect(await checkSelectAlgo1.isSelected()).to.equal(false);
    expect(await checkSelectAlgo2.isSelected()).to.equal(false);
    expect(await checkSelectAlgo3.isSelected()).to.equal(true);
    expect(await checkSelectAlgoMsh.isSelected()).to.equal(false);

    // submit
    await FU.buttons.submit();
    await page.checkSuccess();
  });
}

module.exports = StockSettingTests;

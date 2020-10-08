/* eslint no-await-in-loop:off */

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

function StockSettingPage() {
  const page = this;

  /**
   * @method defineMonthAverageConsumption
   * @param {string} value - Month average consumption
   */
  page.defineMonthAverageConsumption = async function defineMonthAverageConsumption(value) {
    await FU.input('StockSettingsCtrl.settings.month_average_consumption', value);
  };

  /**
   * @method defaultMinMonthsSecurityStock
   * @param {string} value - Min Months security stock
   */
  page.defaultMinMonthsSecurityStock = async function defaultMinMonthsSecurityStock(value) {
    await FU.input('StockSettingsCtrl.settings.default_min_months_security_stock', value);
  };

  /**
   * @method setRadio
   * @param {string} value - Click Yes or No
   * @param {string} name  - Variable name to click
   */
  page.setRadio = async function setRadio(value, name) {
    await components.yesNoRadios.set(value, name);
  };

  page.checkSuccess = async function checkSuccess() {
    await components.notification.hasSuccess();
  };
}

module.exports = StockSettingPage;

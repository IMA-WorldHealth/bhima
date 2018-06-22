/* global element, by */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Exchange Rate', () => {
  const path = '#!/exchange';

  const DAILY_RATE = 1620;
  const OLD_RATE = 1500;
  const OLD_DATE = new Date('2018-06-01');

  // navigate to the exchange module before running tests
  before(() => helpers.navigate(path));

  it('set exchange rate for the current date', () => {
    element(by.id('set-exchange')).click();

    FU.input('ModalCtrl.rate.rate', DAILY_RATE);

    // submit the page to the server
    FU.buttons.submit();

    components.notification.hasSuccess();
  });

  it('set exchange rate for an old date', () => {
    element(by.id('set-exchange')).click();

    components.dateEditor.set(OLD_DATE, null, '[name="rate"]');
    FU.input('ModalCtrl.rate.rate', OLD_RATE);

    // submit the page to the server
    FU.buttons.submit();

    components.notification.hasSuccess();
  });

});

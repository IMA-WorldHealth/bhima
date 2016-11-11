/* global element, by, browser */
'use strict';

const uuid   = require('node-uuid');
const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Reports Cash Payment', () => {

  // navigate to the page
  before(() => helpers.navigate('#/finance/reports/cash_payment'));

  it('successfully Cancel a Cash Payment', () => {
    element(by.id(`TPA2`)).click();
    FU.input('ModalCtrl.creditNote.description', 'Cancel This Payment');
    FU.modal.submit();
    components.notification.hasSuccess();
  });
});

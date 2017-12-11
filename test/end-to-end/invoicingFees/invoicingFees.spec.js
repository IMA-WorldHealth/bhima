/* global by */
const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

const GU = require('../shared/GridUtils');
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Invoicing Fees', () => {
  const path = '#!/invoicing_fees';
  const gridId = 'InvoicingFeesGrid';

  before(() => helpers.navigate(path));

  it('can create a invoicing fee', () => {
    // click on the create button
    FU.buttons.create();

    // anticipate that the form should come up
    FU.exists(by.css('[name="InvoicingFeesForm"]'), true);
    components.accountSelect.set('75881010'); // 75881010 - Autres revenus

    FU.input('InvoicingFeesFormCtrl.model.label', 'Value Added Tax');
    FU.input('InvoicingFeesFormCtrl.model.description', 'A tax added for people who want value!');
    FU.input('InvoicingFeesFormCtrl.model.value', 25);

    FU.buttons.submit();

    components.notification.hasSuccess();
    GU.expectRowCount(gridId, 3);
  });

  it('can update a invoicing fee', () => {
    // get the cell with the update button and click it
    GA.clickOnMethod(0, 6, 'edit', 'InvoicingFeesGrid');

    // expect to find the update form has loaded
    FU.exists(by.css('[name="InvoicingFeesForm"]'), true);

    // update the label
    FU.input('InvoicingFeesFormCtrl.model.label', 'Value Reduced Tax');

    // submit the form
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('can delete a invoicing fee', () => {
    // get the cell with the delete button and click it
    GA.clickOnMethod(0, 6, 'delete', 'InvoicingFeesGrid');

    // expect the modal to appear
    FU.exists(by.css('[data-confirm-modal]'), true);

    // Confirm the action by a click on the buttom confirm
    components.modalAction.confirm();

    components.notification.hasSuccess();
    GU.expectRowCount(gridId, 2);
  });
});

/* global by */
const helpers = require('../shared/helpers');

const GU = require('../shared/GridUtils');
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Invoicing Fees', () => {
  const path = '#!/invoicing_fees';
  const gridId = 'InvoicingFeesGrid';

  before(() => helpers.navigate(path));

  it('can create a invoicing fee', async () => {
    // click on the create button
    await FU.buttons.create();

    // anticipate that the form should come up
    await FU.exists(by.css('[name="InvoicingFeesForm"]'), true);
    await components.accountSelect.set('75881010'); // 75881010 - Autres revenus

    await FU.input('InvoicingFeesFormCtrl.model.label', 'Value Added Tax');
    await FU.input('InvoicingFeesFormCtrl.model.description', 'A tax added for people who want value!');
    await FU.input('InvoicingFeesFormCtrl.model.value', 25);

    await FU.buttons.submit();

    await components.notification.hasSuccess();
    await GU.expectRowCount(gridId, 3);
  });

  it('can update a invoicing fee', async () => {
    // get the cell with the update button and click it
    await GA.clickOnMethod(0, 5, 'edit', 'InvoicingFeesGrid');

    // expect to find the update form has loaded
    await FU.exists(by.css('[name="InvoicingFeesForm"]'), true);

    // update the label
    await FU.input('InvoicingFeesFormCtrl.model.label', 'Value Reduced Tax');

    // submit the form
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('can delete a invoicing fee', async () => {
    // get the cell with the delete button and click it
    await GA.clickOnMethod(0, 5, 'delete', 'InvoicingFeesGrid');

    // expect the modal to appear
    await FU.exists(by.css('[data-confirm-modal]'), true);

    // Confirm the action by a click on the buttom confirm
    await components.modalAction.confirm();

    await components.notification.hasSuccess();
    await GU.expectRowCount(gridId, 2);
  });
});

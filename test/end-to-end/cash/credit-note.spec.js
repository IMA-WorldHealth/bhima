const FU = require('../shared/FormUtils');
const GA = require('../shared/GridAction');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

describe('Payments Credit Note', CreditNoteTests);

function CreditNoteTests() {
  before(() => helpers.navigate('#/payments'));

  it('cancels a payment', () => {
    GA.clickOnMethod(0, 7, 'cancel', 'payment-registry');
    FU.input('ModalCtrl.creditNote.description', 'Cancel This Payment');
    FU.modal.submit();
    components.notification.hasSuccess();
  });
}

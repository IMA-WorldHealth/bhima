/* global browser, element, by */

const chai = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');

const components = require('../shared/components');

helpers.configure(chai);

describe('Patient Edit', () => {
  const patient = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  const path = `#!/patients/${patient}/edit`;

  before(() => browser.get(path));

  it('ignores and warns for submission with no changes', () => {
    FU.buttons.submit();
    components.notification.hasWarn();
  });

  it('updates a patients details', () => {
    // required information
    components.inpuText.set('display_name', 'Updated Last Name');

    // optional information
    components.inpuText.set('title', 'Mr.');
    components.inpuText.set('email', 'update@email.com');

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('updates a patients debtor group subscription', () => {
    // opens update modal
    element(by.css('[data-update-group-debtor]')).click();
    components.debtorGroupSelect.set('NGO IMA World Health');

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('updates a patients group subscriptions', () => {
    element(by.css('[data-update-group-patient]')).click();

    element.all(by.css('[data-group-option]')).get(1).click();
    FU.modal.submit();

    components.notification.hasSuccess();
  });
});

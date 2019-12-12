const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

describe('Subsidies', () => {
  const path = '#!/subsidies';
  before(() => helpers.navigate(path));

  const subsidy = {
    label       : 'IMA SUBSIDY',
    description : 'InterChrurch Medical Assistance',
    value       : 12.5,
  };

  it('creates a new subsidy', async () => {
    // switch to the create form
    await FU.buttons.create();
    await FU.input('SubsidyModalCtrl.subsidy.label', subsidy.label);
    await FU.input('SubsidyModalCtrl.subsidy.value', subsidy.value);
    await components.accountSelect.set('NGO');
    await FU.input('SubsidyModalCtrl.subsidy.description', subsidy.description);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });


  it('edits an subsidy', async () => {
    const row = new GridRow('IMA SUBSIDY');
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('SubsidyModalCtrl.subsidy.label', 'Updated');
    await FU.input('SubsidyModalCtrl.subsidy.description', ' IMCK Tshikaji');

    await FU.buttons.submit();

    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    await FU.buttons.create();
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('SubsidyModalCtrl.subsidy.label');
    await FU.validation.error('SubsidyModalCtrl.subsidy.value');
    // the following fields are not required
    await FU.validation.ok('SubsidyModalCtrl.subsidy.description');
    await FU.buttons.cancel();
  });

  it('deletes a subsidy', async () => {
    const row = new GridRow('Updated');
    await row.dropdown().click();
    await row.remove().click();

    // click the alert asking for permission
    await FU.buttons.submit();

    // make sure that the delete message appears
    await components.notification.hasSuccess();
  });
});

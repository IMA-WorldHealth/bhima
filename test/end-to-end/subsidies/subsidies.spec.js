const chai = require('chai');
const helpers = require('../shared/helpers');

const { expect } = chai;
helpers.configure(chai);

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

  it('creates a new subsidy', () => {
    // switch to the create form
    FU.buttons.create();
    FU.input('SubsidyModalCtrl.subsidy.label', subsidy.label);
    FU.input('SubsidyModalCtrl.subsidy.value', subsidy.value);
    components.accountSelect.set('NGO');
    FU.input('SubsidyModalCtrl.subsidy.description', subsidy.description);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    components.notification.hasSuccess();
  });


  it('edits an subsidy', () => {
    const row = new GridRow('IMA SUBSIDY');
    row.dropdown().click();
    row.edit().click();

    FU.input('SubsidyModalCtrl.subsidy.label', 'Updated');
    FU.input('SubsidyModalCtrl.subsidy.description', ' IMCK Tshikaji');

    FU.buttons.submit();

    // make sure the success message appears
    components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', () => {
    FU.buttons.create();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('SubsidyModalCtrl.subsidy.label');
    FU.validation.error('SubsidyModalCtrl.subsidy.value');
    // the following fields are not required
    FU.validation.ok('SubsidyModalCtrl.subsidy.description');
  });

  it('deletes a subsidy', () => {
    const row = new GridRow('IMA SUBSIDY');
    row.dropdown().click();
    row.remove().click();

    // click the "delete" button
    FU.buttons.delete();

    // click the alert asking for permission
    components.modalAction.confirm();

    // make sure that the delete message appears
    components.notification.hasSuccess();
  });
});

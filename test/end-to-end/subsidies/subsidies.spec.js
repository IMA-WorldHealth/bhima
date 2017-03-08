/* global element, by, browser */
const chai = require('chai');
const helpers = require('../shared/helpers');

const expect = chai.expect;
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Subsidies', () => {
  const path = '#!/subsidies';
  before(() => helpers.navigate(path));

  const subsidy = {
    label       : 'IMA SUBSIDY',
    description : 'InterChrurch Medical Assistance',
    value       : 12.5,
  };

  const subsidyRank = 2;

  it('creates a new subsidy', () => {
    // switch to the create form
    FU.buttons.create();
    FU.input('SubsidyCtrl.subsidy.label', subsidy.label);
    FU.input('SubsidyCtrl.subsidy.value', subsidy.value);
    components.accountSelect.set('Test Debtor Accounts2');
    FU.input('SubsidyCtrl.subsidy.description', subsidy.description);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('edits an subsidy', () => {
    element(by.id(`subsidy-upd-${subsidyRank}`)).click();
    FU.input('SubsidyCtrl.subsidy.label', 'Updated');
    FU.input('SubsidyCtrl.subsidy.description', ' IMCK Tshikaji');

    FU.buttons.submit();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', () => {
    FU.buttons.create();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('SubsidyCtrl.subsidy.label');
    FU.validation.error('SubsidyCtrl.subsidy.value');
    // the following fields are not required
    FU.validation.ok('SubsidyCtrl.subsidy.description');
  });

  it('deletes a subsidy', () => {
    element(by.id(`subsidy-del-${subsidyRank}`)).click();

    // click the alert asking for permission
    components.modalAction.confirm();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });
});

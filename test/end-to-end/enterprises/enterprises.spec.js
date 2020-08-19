/* global element, by */
const path = require('path');
const helpers = require('../shared/helpers');

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

const fixtures = path.resolve(__dirname, '../../fixtures/');

describe.only('Enterprises', () => {
  const location = '#!/enterprises';

  const locations = [
    {
      location01 : 'Merge Country',
      location02 : 'Merge Province',
      location03 : 'Merge Town 1',
      location04 : 'Merge Township 1',
    },
    {
      location01 : 'République Démocratique du Congo',
      location02 : 'Kinshasa',
      location03 : 'Lukunga',
      location04 : 'Gombe',
    },
  ];

  // enterprise
  const enterprise = {
    name            : 'Interchurch Medical Assistance',
    abbr            : 'IMA',
    email           : 'ima@imaworldhealth.com',
    po_box          : 'POBOX USA 1',
    phone           : '01500',
    gain_account_id : 'Gain de change',
    loss_account_id : '67611010', // 67611010 - Différences de change
    location_default_type_root : 'Commune',
  };

  // default enterprise
  const defaultEnterprise = {
    name            : 'Test Enterprise',
    abbr            : 'TE',
    email           : 'enterprise@test.org',
    po_box          : 'POBOX USA 1',
    phone           : '243 81 504 0540',
    gain_account_id : 'Gain de change',
    loss_account_id : '67611010', // 67611010 - Différences de change
  };

  // project
  const abbr = suffix();
  const project = {
    name : `Test Project ${abbr}`,
    abbr,
  };

  // Select location in location component
  async function selectLocationLabel(label) {
    // select the item of the dropdown menu matching the label
    let searchString = label;
    let labelForRegex = label.replace('(', '\\(');
    labelForRegex = labelForRegex.replace(')', '\\)');

    switch ('contains') {
    case 'exact':
      searchString = new RegExp(`^\\s*${labelForRegex}$`, 'm');
      break;
    case 'fullWord':
      searchString = new RegExp(`\\s+${labelForRegex}(\\s|$)`);
      break;
    case 'accountName':
      searchString = new RegExp(`\\d+\\s+${labelForRegex}\\s+`);
      break;
    default:
    case 'contains':
      searchString = label;
      break;
    }

    return searchString;
  }

  // project update
  const abbrUpdate = suffix();
  const projectUpdate = {
    name : `Test Project Update ${abbrUpdate}`,
    abbr : abbrUpdate,
  };

  // navigate to the enterprise module before running tests
  before(() => helpers.navigate(location));

  /**
   * The actual enterprise module doesn't need to create new one
   * so we need only to update enterprise informations
   */
  it('set enterprise data', async () => {

    await FU.input('EnterpriseCtrl.enterprise.name', enterprise.name);
    await FU.input('EnterpriseCtrl.enterprise.abbr', enterprise.abbr);

    await components.accountSelect.set(enterprise.gain_account_id, 'gain-account-id');
    await components.accountSelect.set(enterprise.loss_account_id, 'loss-account-id');

    await FU.input('EnterpriseCtrl.enterprise.po_box', enterprise.po_box);
    await FU.input('EnterpriseCtrl.enterprise.email', enterprise.email);
    await FU.input('EnterpriseCtrl.enterprise.phone', enterprise.phone);

    await components.locationTypeSelect.set(enterprise.location_default_type_root);

    // select the locations specified
    await components.locationConfigurationSelect.set(locations[0].location01);

    // Location Level 2
    const select02 = element(by.id('level_0'));
    await select02.click();
    const filterLocation02 = selectLocationLabel(locations[0].location02);

    const option02 = select02.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation02,
      ),
    );
    await option02.click();

    // Location Level 3
    const select03 = element(by.id('level_1'));
    await select03.click();
    const filterLocation03 = selectLocationLabel(locations[0].location03);

    const option03 = select03.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation03,
      ),
    );
    await option03.click();

    // Location Level 4
    const select04 = element(by.id('level_2'));
    await select04.click();
    const filterLocation04 = selectLocationLabel(locations[0].location04);

    const option04 = select04.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation04,
      ),
    );
    await option04.click();

    // submit the page to the server
    await FU.buttons.submit();

    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    await FU.input('EnterpriseCtrl.enterprise.name', '');
    await FU.input('EnterpriseCtrl.enterprise.abbr', '');

    FU.buttons.submit();

    // verify form has not been submitted
    // expect(helpers.getCurrentPath()).to.equal(path);

    // The following fields should be required
    await FU.validation.error('EnterpriseCtrl.enterprise.name');
    await FU.validation.error('EnterpriseCtrl.enterprise.abbr');

    // The following fields is not required
    await FU.validation.ok('EnterpriseCtrl.enterprise.email');
    await FU.validation.ok('EnterpriseCtrl.enterprise.po_box');
    FU.validation.ok('EnterpriseCtrl.enterprise.phone');
  });

  /**
   * Set default enterprise data for others tests
   */
  it('reset enterprise data to default', async () => {
    await FU.input('EnterpriseCtrl.enterprise.name', defaultEnterprise.name);
    await FU.input('EnterpriseCtrl.enterprise.abbr', defaultEnterprise.abbr);

    await components.accountSelect.set(defaultEnterprise.gain_account_id, 'gain-account-id');
    await components.accountSelect.set(defaultEnterprise.loss_account_id, 'loss-account-id');

    await FU.input('EnterpriseCtrl.enterprise.po_box', defaultEnterprise.po_box);
    await FU.input('EnterpriseCtrl.enterprise.email', defaultEnterprise.email);
    await FU.input('EnterpriseCtrl.enterprise.phone', defaultEnterprise.phone);

    // select the locations specified
    await components.locationSelect.set(helpers.data.locations);

    // submit the page to the server
    await FU.buttons.submit();

    await components.notification.hasSuccess();
  });

  /**
   * Upload new logo for the enterprise
   */
  it('upload a new enterprise logo', async () => {
    const fileToUpload = 'logo.ico';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await element.all(by.css(`input[type=file]`)).get(0).sendKeys(absolutePath);
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('add a new project for the enterprise', async () => {
    await FU.buttons.create();

    await FU.input('$ctrl.project.name', project.name);
    await FU.input('$ctrl.project.abbr', project.abbr);

    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  it('edit an existing project', async () => {
    const btn = $(`[data-project="${abbr}"]`);
    await btn.$('a[data-method="update"]').click();

    await FU.input('$ctrl.project.name', projectUpdate.name);
    await FU.input('$ctrl.project.abbr', projectUpdate.abbr);

    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  it('delete an existing project', async () => {
    const btn = $(`[data-project="${abbr}"]`);
    await btn.$('a[data-method="delete"]').click();

    await FU.input('$ctrl.text', projectUpdate.name);

    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  /**
   * @function suffix
   * @desc This function returns a random 3 characters string as an abbreviation
   */
  function suffix() {
    const a = String.fromCharCode(random(65, 90));
    const b = String.fromCharCode(random(65, 90));
    const c = String.fromCharCode(random(65, 90));
    return `${a}${b}${c}`;
  }

  function random(min, max) {
    return Math.floor((Math.random() * ((max - min) + 1)) + min);
  }
});

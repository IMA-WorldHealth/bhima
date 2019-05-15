/* global element, by */
const path = require('path');

const components = require('../shared/components');
const helpers = require('../shared/helpers');

const fixtures = path.resolve(__dirname, '../../fixtures/');

describe('Patient Record', () => {
  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  before(() => helpers.navigate(root.concat(id)));

  it('uploads a patient picture', async () => {
    const fileToUpload = 'patient.png';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
    await components.notification.hasSuccess();
  });

  it('unable to upload a file that is not a picture', async () => {
    const fileToUpload = 'sample.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
    await components.notification.hasDanger();
  });
});

const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const components = require('../shared/components');
const GA = require('../shared/GridAction');

test.describe('Staffing indice Management Tests', () => {

  const path = '/#!/staffing_indices';

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const indice = {
    grade : 'grade 3',
    function_indice : 100,
    grade_indice : 200,
    function : 'Infirmier',
    employee : 'Employee Test 1',
  };

  const indiceTest = {
    grade : '1.1',
    function_indice : 10,
    grade_indice : 20,
    function : 'Medecin Directeur',
    employee : 'Test 2 Patient',
  };

  const gridId = 'staffing-indice-grid';
  const actionLinkCol = 6;

  test('creates a new staffing indice', async () => {
    await TU.buttons.create();
    await components.employeeSelect.set(indice.employee);
    await components.gradeSelect.set(indice.grade);
    await components.functionSelect.set(indice.function);
    await components.inputText.set('grade_indice', indice.grade_indice);
    await components.inputText.set('function_indice', indice.function_indice);
    // submit the page to the server
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('should edit a staffing indice', async () => {
    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await GA.clickOnMethod(2, actionLinkCol, 'edit-record', gridId);
    await components.inputText.set('function_indice', 200);
    // submit the page to the server
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('creates a new Staffing indice', async () => {
    await TU.buttons.create();
    await components.employeeSelect.set(indiceTest.employee);
    await components.gradeSelect.set(indiceTest.grade);
    await components.functionSelect.set(indiceTest.function);
    await components.inputText.set('grade_indice', indiceTest.grade_indice);
    await components.inputText.set('function_indice', indiceTest.function_indice);
    // submit the page to the server
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('should delete the staffing indice', async () => {
    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    // click the edit button
    await GA.clickOnMethod(3, actionLinkCol, 'delete-record', gridId);
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await TU.buttons.create();
    // submit the page to the server
    await TU.buttons.submit();
    // the following fields should be required
    await components.inputText.validationError('function_indice');
    await components.inputText.validationError('grade_indice');
    await TU.buttons.cancel();
  });

});

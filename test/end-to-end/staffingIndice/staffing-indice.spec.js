const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GA = require('../shared/GridAction');

describe('Staffing indice Management Tests', () => {

  const path = '#!/staffing_indices';
  // navigate to the page before the test suite
  before(() => helpers.navigate(path));

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
  it('creates a new staffing indice', async () => {
    await FU.buttons.create();
    await components.employeeSelect.set(indice.employee);
    await components.gradeSelect.set(indice.grade);
    await components.fonctionSelect.set(indice.function);
    await components.inpuText.set('grade_indice', indice.grade_indice);
    await components.inpuText.set('function_indice', indice.function_indice);
    // submit the page to the server
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('should edit a staffing indice', async () => {
    await GA.clickOnMethod(2, actionLinkCol, 'edit-record', gridId);
    await components.inpuText.set('function_indice', 200);
    // submit the page to the server
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('creates a new Staffing indice', async () => {
    await FU.buttons.create();
    await components.employeeSelect.set(indiceTest.employee);
    await components.gradeSelect.set(indiceTest.grade);
    await components.fonctionSelect.set(indiceTest.function);
    await components.inpuText.set('grade_indice', indiceTest.grade_indice);
    await components.inpuText.set('function_indice', indiceTest.function_indice);
    // submit the page to the server
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('should delete the staffing indice', async () => {
    // click the edit button
    await GA.clickOnMethod(3, actionLinkCol, 'delete-record', gridId);
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await FU.buttons.create();
    // submit the page to the server
    await FU.buttons.submit();
    // the following fields should be required
    await components.inpuText.validationError('function_indice');
    await components.inpuText.validationError('grade_indice');
    await FU.buttons.cancel();
  });

});

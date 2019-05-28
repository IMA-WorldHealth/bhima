const helpers = require('../shared/helpers');
const StaffingPage = require('./page');
const components = require('../shared/components');

// the page object
const page = new StaffingPage();

function StaffingIndiceTests() {

  // navigate to the page
  before(() => helpers.navigate('#!/staffing_indices'));

  const indice = {
    uuid : '3ac4e83c65f245a183578b025003d793',
    grade : 'grade 1',
    value : 100,
  };

  const indiceTest = {
    uuid : '3ac4e83c65f245a183578b025003d621',
    grade : '1.1',
    value : 50,
  };

  it('should add a new Staffing indice', async () => {
    await page.openCreateUpdateModal();
    await page.setValue(indice.value);
    await page.setGrade(indice.grade);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a edit Staffing indice', async () => {
    await page.edit('G1');
    await page.setValue(200);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a test Staffing indice', async () => {
    await page.openCreateUpdateModal();
    await page.setValue(indiceTest.value);
    await page.setGrade(indiceTest.grade);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete a Staffing indice', async () => {
    await page.delete('A1');
    await page.submit();
    await components.notification.hasSuccess();
  });

}


describe('Staffing indice Management Tests', StaffingIndiceTests);

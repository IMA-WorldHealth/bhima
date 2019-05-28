const helpers = require('../shared/helpers');
const StaffingPage = require('./page');
const components = require('../shared/components');

// the page object
const page = new StaffingPage();

function StaffingIndiceTests() {

  // navigate to the page
  before(() => helpers.navigate('#!/function_bonus'));

  const indice = {
    function : 'Infirmier',
    value : 100,
  };

  const indiceTest = {
    function : 'Medecin Directeur',
    value : 50,
  };

  it('should add a new Function Bonus', async () => {
    await page.openCreateUpdateModal();
    await page.setValue(indice.value);
    await page.setfunction(indice.function);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a edit Function Bonus', async () => {
    await page.edit(indice.function);
    await page.setValue(200);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a test Function Bonus', async () => {
    await page.openCreateUpdateModal();
    await page.setValue(indiceTest.value);
    await page.setfunction(indiceTest.function);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete a Function Bonus', async () => {
    await page.delete(indiceTest.function);
    await page.submit();
    await components.notification.hasSuccess();
  });

}


describe('Function Bonus Management Tests', StaffingIndiceTests);

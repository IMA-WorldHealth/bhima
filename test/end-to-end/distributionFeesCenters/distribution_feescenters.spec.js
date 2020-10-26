const helpers = require('../shared/helpers');
const DistributionPage = require('./distribution_feescenters.page');

describe('Distribution Auxiliary Fee Center', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/distribution_center'));
  const page = new DistributionPage();

  const dataset = {
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    profitCenter : 1,
  };

  const datasetManual = {
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    profitCenter : 0,
    label : 'Auxiliary 1',
    trans_id : 'TPA37',
  };

  it('set distribution by percentage', async () => {
    await page.setDistributionPercentage(dataset);
  });

  it('set automatic distribution of invoice', async () => {
    await page.setDistributionAutomatic(dataset);
  });

  it('set manual distribution by value', async () => {
    await page.setDistributionManual(datasetManual);
  });
});

describe('Update Distributed Auxiliary Fee Center', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/distribution_center/update'));

  const page = new DistributionPage();

  const dataset = {
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    costCenter : 1,
    trans_id : 'TPA37',
  };

  it('Update Distributed Fee Center', async () => {
    await page.setUpdatedDistribution(dataset);
  });
});

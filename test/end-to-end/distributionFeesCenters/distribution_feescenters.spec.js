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
  };

  it('Set Distribution By Percentage', async () => {
    await page.setDistributionPercentage(dataset);
  });

  it('Set Automatic Distribution of Invoice', async () => {
    await page.setDistributionAutomatic(dataset);
  });

  it('Set Manual Distribution by Value', async () => {
    await page.setDistributionManual(datasetManual);
  });
});

describe('Update Distributed Auxiliary Fee Center', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/distribution_center/update'));

  const page = new DistributionPage();

  const dataset = {
    uuid : 'E701230AE0DC11E89F4F507B9DD6DEA5 (3)',
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    costCenter : 1,
  };

  it('Update Distributed Fee Center', async () => {
    await page.setUpdatedDistribution(dataset);
  });
});

const chai = require('chai');
const helpers = require('../shared/helpers');
const DistributionPage = require('./distribution_feescenters.page');


/** configuring helpers* */
helpers.configure(chai);

const { expect } = chai;

describe('Distribution Auxiliary Fee Center', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/distribution_center'));

  const Page = new DistributionPage();

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

  it('Set Distribution By Percentage', () => {
    Page.setDistributionPercentage(dataset);
  });

  it('Set Automatic Distribution of Invoice', () => {
    Page.setDistributionAutomatic(dataset);
  });

  it('Set Manual Distribution by Value', () => {
    Page.setDistributionManual(datasetManual);
  });
});

describe('Update Distributed Auxiliary Fee Center', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/distribution_center/update'));

  const Page = new DistributionPage();

  const dataset = {
    uuid : 'E7011804E0DC11E89F4F507B9DD6DEA5 (3)',
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    profitCenter : 1,
  };

  it('Update Distributed Fee Center', () => {
    Page.setUpdatedDistribution(dataset);
  });
});

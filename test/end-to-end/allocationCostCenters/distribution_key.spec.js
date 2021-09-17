const { expect } = require('chai');
const DistributionKeysPage = require('./distribution_key.page');
const helpers = require('../shared/helpers');

describe('Distribution keys Management', () => {
  before(() => helpers.navigate('#!/allocation_center/allocation_key'));

  const Page = new DistributionKeysPage();
  const labelAuxiliary1 = 'Auxiliary 2';
  const labelAuxiliary2 = 'Auxiliary 2';
  const resetAuxiliary2 = 'Auxiliary 3';
  const allocationKeyElements = 10;

  it('set allocation key for an Auxiliary Cost Center', async () => {
    await Page.setDistributionKey(labelAuxiliary1);
  });

  it('prevent initialization of allocation keys greater than 100 percent', async () => {
    await Page.preventGreaterLess100(labelAuxiliary2);
  });

  it('displays all allocations keys loaded from the database', async () => {
    expect(await Page.getDistributionKeyCount()).to.equal(allocationKeyElements);
  });

  it('reset allocations key for an Auxiliary Cost Center', async () => {
    await Page.resetDistributionKey(resetAuxiliary2);
  });
});

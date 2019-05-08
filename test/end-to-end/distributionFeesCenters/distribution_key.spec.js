const { expect } = require('chai');
const DistributionKeysPage = require('./distribution_key.page');
const helpers = require('../shared/helpers');

describe('Distribution keys Management', () => {
  before(() => helpers.navigate('#!/distribution_center/distribution_key'));

  const Page = new DistributionKeysPage();
  const labelAuxiliary1 = 'Auxiliary 2 (1)';
  const labelAuxiliary2 = 'Auxiliary 2 (3)';
  const resetAuxiliary2 = 'Auxiliary 3 (1)';
  const distributionKeyElements = 10;

  it('Set Distribution key for an Auxiliary Fee Center', async () => {
    await Page.setDistributionKey(labelAuxiliary1);
  });

  it('Prevent initialization of distribution keys greater than 100 percent', async () => {
    await Page.preventGreaterLess100(labelAuxiliary2);
  });

  it('displays all distributions keys loaded from the database', async () => {
    expect(await Page.getDistributionKeyCount()).to.eventually.equal(distributionKeyElements);
  });

  it('displays all distributions keys loaded from the database', async () => {
    expect(await Page.getDistributionKeyCount()).to.eventually.equal(distributionKeyElements);
  });

  it('Reset Distributions key for an Auxiliary Fee Center', async () => {
    await Page.resetDistributionKey(resetAuxiliary2);
  });
});

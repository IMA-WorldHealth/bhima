const helpers = require('../shared/helpers');
const DistributionKeysPage = require('./distribution_key.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

const { expect } = chai;

describe('Distribution keys Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/distribution_center/distribution_key'));

  const Page = new DistributionKeysPage();
  const labelAuxiliary1 = 'Auxiliary 1 (1)';
  const labelAuxiliary2 = 'Auxiliary 2 (1)';
  const labelAuxiliary3 = 'Auxiliary 3 (1)';
  const distributionKeyElements = 10;
 
  it('Set Distribution key for an Auxiliary Fee Center', () => {
    Page.setDistributionKey(labelAuxiliary1);
  });

  it('Prevent initialization of distribution keys greater than 100 percent', () => {
    Page.preventGreaterLess100(labelAuxiliary2);
  });

  it('displays all distributions keys loaded from the database', () => {
    expect(Page.getDistributionKeyCount()).to.eventually.equal(distributionKeyElements);
  });
});

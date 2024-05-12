/* eslint global-require:off */
const { expect } = require('chai');

const dataset = require('./stepdown.data');

describe('test/server-unit/stepdown', () => {

  let Stepdown;

  before(() => {
    Stepdown = require('../../server/lib/stepdown');
  });

  it('Compute results for Cost Center documentation test', () => {
    const example = Stepdown.compute(dataset.SAMPLE_DOCS);
    expect(example.length).to.be.eq(5);
    // console.log("Example Step-Down results: ", example);
  });

  /**
   * Step down method with sample data from
   * @link: https://www.youtube.com/watch?v=yCxCF1PKVJQ
   */
  it('#compute(): compute and allocate cost to services (cost centers)', (done) => {
    const services = Stepdown.compute(dataset.SAMPLE_5);
    const expectedCostDistribution = dataset.SAMPLE_5_DISTRIBUTION;

    const SAMPLE_NB_SERVICES = 7;
    const SAMPLE_NB_PRINCIPAL = 3;
    const SAMPLE_NB_AUXILIARY = 4;

    const principalCenters = services.filter(serv => !!serv.principal);
    const auxiliaryCenters = services.filter(serv => !serv.principal);

    const nServices = services.length;
    const nPrincipal = principalCenters.length;
    const nAuxiliary = auxiliaryCenters.length;

    expect(nServices).to.be.eq(SAMPLE_NB_SERVICES);
    expect(nPrincipal).to.be.eq(SAMPLE_NB_PRINCIPAL);
    expect(nAuxiliary).to.be.eq(SAMPLE_NB_AUXILIARY);

    const cumulatedAllocatedCosts = Array(services.length).fill(0);
    for (let i = 0; i < services.length; i++) {
      for (let j = 0; j < services[i].toDist.length; j++) {
        cumulatedAllocatedCosts[j] += i !== j ? services[i].toDist[j] : 0;
      }
    }

    services.forEach((serv, index) => {
      // distribute to each other services (cost centers) with correct values
      if (!serv.principal) {
        expect(serv.toDist).to.be.deep.eq(expectedCostDistribution[index]);
      }

      // total cost is coming correctly from other cost centers
      if (serv.principal) {
        const finalCostFromAllocatedCosts = Number(cumulatedAllocatedCosts[index] + serv.directCost).toFixed(4);
        const finalCost = Number(serv.total).toFixed(4);
        expect(finalCost).to.be.eq(finalCostFromAllocatedCosts);
      }
    });

    done();
  });

});

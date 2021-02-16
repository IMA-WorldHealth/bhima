/* global expect, agent */

const helpers = require('./helpers');

// The /depots API endpoint
describe('(/depots) The depots API ', () => {

  it('GET /depots/:uuid/inventories returns inventory for a depot', () => {
    const { principal } = helpers.data.depots;

    const principalInventoryItems = [
      'Ampicilline, 500mg, Vial, Unité',
      'Oxytocine, 10 UI/ml, 1ml, Amp, Unité',
      'Quinine bichlorhydrate base, 500mg/2ml, 2ml Amp',
    ];

    return agent.get(`/depots/${principal}/inventories`)
      .then(res => {
        helpers.api.listed(res, 3);

        const unique = (item, index, array) => array.indexOf(item) === index;

        // assert that only inventory from this depot were recovered
        const uniqueDepots = res.body
          .map(row => row.depot_text)
          .filter(unique);

        expect(uniqueDepots).to.have.length(1);
        expect(uniqueDepots[0]).to.equal('Depot Principal');

        // the inventory items should be distinct
        const uniqueInventory = res.body
          .map(row => row.text)
          .filter(unique);

        expect(uniqueInventory).to.have.length(3);
        expect(uniqueInventory).to.deep.equal(principalInventoryItems);
      })
      .catch(helpers.handler);
  });

  it('GET /depots/:uuid/users returns the users who have access to a depot', () => {
    const { principal } = helpers.data.depots;
    return agent.get(`/depots/${principal}/users`)
      .then(res => {
        helpers.api.listed(res, 1);

        const [user] = res.body;
        expect(user.username).to.equal('superuser');
      })
      .catch(helpers.handler);
  });

  it('GET /depots/:uuid/inventories/:uuid/cmm returns the CMM for a depot', async () => {
    const { principal } = helpers.data.depots;
    const { quinine, oxytocine, ampicilline } = helpers.data.inventories;
    try {
      let res = await agent.get(`/depots/${principal}/inventories/${quinine}/cmm`);

      expect(res).to.be.json; // eslint-disable-line

      let values = {
        algo1 : 53.33,
        algo2 : 2168.89,
        algo3 : 53.33,
        algo_msh : 53.33,
        sum_days : 366,
        sum_stock_day : 366,
        sum_consumption_day : 9,
        sum_consumed_quantity : 640,
        number_of_month : 12,
        sum_stock_out_days : 0,
        head_days : 0,
      };

      expect(res.body.algo1, 'quinine CMM algorithm 1 is not calculated correctly').to.equal(values.algo1);
      expect(res.body.algo2, 'quinine CMM algorithm 2 is not calculated correctly').to.equal(values.algo2);
      expect(res.body.algo3, 'quinine CMM algorithm 3 is not calculated correctly').to.equal(values.algo3);
      expect(res.body.algo_msh, 'quinine CMM algorithm MSH is not calculated correctly').to.equal(values.algo_msh);
      expect(res.body, 'quinine CMM not calculated correctly').to.deep.include(values);

      res = await agent.get(`/depots/${principal}/inventories/${oxytocine}/cmm`);
      values = {
        algo1 : 74.17,
        algo2 : 3393.13,
        algo3 : 74.17,
        algo_msh : 74.17,
        sum_days : 366,
        sum_stock_day : 366,
        sum_consumption_day : 8,
        sum_consumed_quantity : 890,
        number_of_month : 12,
        sum_stock_out_days : 0,
        head_days : 0,
      };

      expect(res.body.algo1, 'oxytocine CMM algorithm 1 is not calculated correctly').to.equal(values.algo1);
      expect(res.body.algo2, 'oxytocine CMM algorithm 2 is not calculated correctly').to.equal(values.algo2);
      expect(res.body.algo3, 'oxytocine CMM algorithm 3 is not calculated correctly').to.equal(values.algo3);
      expect(res.body.algo_msh, 'oxytocine CMM algorithm MSH is not calculated correctly').to.equal(values.algo_msh);
      expect(res.body, 'oxytocine CMM not calculated correctly').to.deep.include(values);

      res = await agent.get(`/depots/${principal}/inventories/${ampicilline}/cmm`);
      values = {
        algo1 : 33.39,
        algo2 : 1143.75,
        algo3 : 25,
        algo_msh : 33.39,
        sum_days : 366,
        sum_stock_day : 274,
        sum_consumption_day : 8,
        sum_consumed_quantity : 300,
        number_of_month : 12,
        sum_stock_out_days : 92,
        head_days : 0,
      };

      expect(res.body.algo1, 'ampicilline CMM algorithm 1 is not calculated correctly').to.equal(values.algo1);
      expect(res.body.algo2, 'ampicilline CMM algorithm 2 is not calculated correctly').to.equal(values.algo2);
      expect(res.body.algo3, 'ampicilline CMM algorithm 3 is not calculated correctly').to.equal(values.algo3);
      expect(res.body.algo_msh, 'ampicilline CMM algorithm MSH is not calculated correctly').to.equal(values.algo_msh);
      expect(res.body, 'ampicilline CMM not calculated correctly').to.deep.include(values);
    } catch (err) {
      helpers.handler(err);
    }
  });

  it('GET /depots/:uuid/inventories/:uuid/lots returns the lots for a depot', () => {
    const { principal } = helpers.data.depots;
    const { quinine } = helpers.data.inventories;
    return agent.get(`/depots/${principal}/inventories/${quinine}/lots`)
      .then(res => {
        helpers.api.listed(res, 4);

        const unique = (item, index, array) => array.indexOf(item) === index;

        // assert that only inventory from this depot were recovered
        const uniqueDepots = res.body
          .map(row => row.depot_text)
          .filter(unique);

        expect(uniqueDepots).to.have.length(1);
        expect(uniqueDepots[0]).to.equal('Depot Principal');

        // the inventory items should be distinct
        const uniqueInventory = res.body
          .map(row => row.text)
          .filter(unique);

        expect(uniqueInventory).to.have.length(1);
        expect(uniqueInventory[0]).to.equal(
          'Quinine bichlorhydrate base, 500mg/2ml, 2ml Amp',
        );

        const uniqueLots = res.body
          .map(row => row.label)
          .filter(unique)
          .sort();

        expect(uniqueLots).to.have.length(4);
        expect(uniqueLots).to.deep.equal([
          'QUININE-A-XXX',
          'QUININE-B-XXX',
          'QUININE-C-XXX',
          'QUININE-D-XXX',
        ]);
      })
      .catch(helpers.handler);
  });

  it('GET /depots should returns the list of depots', () => {
    return agent.get('/depots')
      .then((res) => {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });
});

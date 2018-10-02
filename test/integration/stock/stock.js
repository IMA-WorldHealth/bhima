/* global expect, agent */
/* jshint expr : true */

const helpers = require('../helpers');
const shared = require('./shared');

describe('(/stock/) The Stock HTTP API', () => {

  // create new stock lots
  it('POST /stock/lots create a new stock lots entry', () => {
    return agent.post('/stock/lots')
      .send(shared.movementFirstLots)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  // create stock movement to patient
  it('POST /stock/lots/movements distribute lots to patients from a depot', () => agent.post('/stock/lots/movements')
    .send(shared.movementOutPatient)
    .then((res) => {
      helpers.api.created(res);
    })
    .catch(helpers.handler));

  // create stock movement to depot
  it('POST /stock/lots/movements distributes stock lots to a depot', () => agent.post('/stock/lots/movements')
    .send(shared.movementDepot)
    .then((res) => {
      helpers.api.created(res);
    })
    .catch(helpers.handler));

  // list all movement relatives to 'Depot Principal'
  it(
    `GET /stock/lots/movements?depot_uuid=...
    returns movements for Depot Principal (13: 10 IN + 3 OUT)`,
    () => agent.get(`/stock/lots/movements?depot_uuid=${shared.depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, shared.depotPrincipalMvt);
      })
      .catch(helpers.handler)
  );

  // list all stock exit relatives to 'Depot Principal'
  it(
    `GET /stock/lots/movements?is_exit=1&depot_uuid=...
    returns exits for Depot Principal (3 OUT)`,
    () => agent.get(`/stock/lots/movements?is_exit=1&depot_uuid=${shared.depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler)
  );

  // (report) render all stock exit
  it(
    `GET /reports/stock/lots?renderer=json
    returns exits for all depots (10 OUT)`,
    () => agent.get(`/reports/stock/lots?renderer=json`)
      .then((res) => {
        expect(res.body.rows.length).to.equal(22);
      })
      .catch(helpers.handler)
  );

  // (report) render all stock exit relatives to 'Depot Principal'
  it(
    `GET /reports/stock/lots?renderer=json
    returns exits for Depot principal(10 OUT)`,
    () => agent.get(`/reports/stock/lots?renderer=json&depot_uuid=${shared.depotPrincipalUuid}`)
      .then((res) => {
        expect(res.body.rows.length).to.equal(20);
      })
      .catch(helpers.handler)
  );

  // list all stock entry relatives to 'Depot Principal'
  it(
    `GET /stock/lots/movements?is_exit=0&depot_uuid=... returns entries for Depot Principal (10 IN)`,
    () => agent.get(`/stock/lots/movements?is_exit=0&depot_uuid=${shared.depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 20);
      })
      .catch(helpers.handler)
  );

  // get initial quantity of QUININE-A in 'Depot Principal'
  it(`GET /stock/lots?lot_uuid=...&depot_uuid=... returns initial quantity of QUININE-A in Depot Principal (100pcs)`, () => agent.get('/stock/lots')
    .query({
      lot_uuid : shared.lotQuinineUuid,
      depot_uuid : shared.depotPrincipalUuid,
    })
    .then(res => {
      helpers.api.listed(res, 1);
      const lotQuinine = res.body[0];
      expect(lotQuinine.initial_quantity).to.be.equal(100);
    })
    .catch(helpers.handler));

  // list exit of QUININE-A from 'Depot Principal'
  it(`GET /stock/lots/movements?is_exit=1&lot_uuid=...&depot_uuid=... returns exit of QUININE-A from Depot Principal (20pcs)`, () => agent.get('/stock/lots/movements')
    .query({
      is_exit : 1,
      lot_uuid : shared.lotQuinineUuid,
      depot_uuid : shared.depotPrincipalUuid,
    })
    .then((res) => {
      helpers.api.listed(res, 1);
      let totalExit = 0;
      res.body.forEach(row => {
        totalExit += row.quantity;
      });
      expect(totalExit).to.be.equal(20);
    })
    .catch(helpers.handler));

  it(`GET /stock/lots/movements filters on user`, () => agent.get('/stock/lots/movements')
    .query({
      user_id : 1, // super user
    })
    .then(res => {
      helpers.api.listed(res, 25);
    })
    .catch(helpers.handler));

  // returns quantity of QUININE-A in 'Depot Principal'
  it(
    `
    GET /stock/lots/depots?lot_uuid=...&depot_uuid=...
    returns remaining quantity of QUININE-A in Depot Principal (80pcs)`,
    () => agent.get(`/stock/lots/depots?lot_uuid=${shared.lotQuinineUuid}&depot_uuid=${shared.depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 1);
        expect(res.body[0].quantity).to.be.equal(100 - 20);
      })
      .catch(helpers.handler)
  );
});

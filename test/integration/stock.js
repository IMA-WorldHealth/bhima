/* global expect, chai, agent */
/* jshint expr : true */



const helpers = require('./helpers');

describe('(/stock/) The Stock HTTP API', () => {
    // stock flux
  const flux = {
    FROM_PURCHASE    : 1,
    FROM_OTHER_DEPOT : 2,
    FROM_ADJUSTMENT  : 3,
    FROM_PATIENT     : 4,
    FROM_SERVICE     : 5,
    FROM_DONATION    : 6,
    FROM_LOSS        : 7,
    TO_OTHER_DEPOT   : 8,
    TO_PATIENT       : 9,
    TO_SERVICE       : 10,
    TO_LOSS          : 11,
    TO_ADJUSTMENT    : 12,
  };

  // initial movement of five lots
  const lots = [
    {
      label            : 'T-QUININE-A',
      initial_quantity : 100,
      quantity         : 100,
      unit_cost        : 1.2,
      expiration_date  : new Date('2018-05-01'),
      inventory_uuid   : 'cf05da13-b477-11e5-b297-023919d3d5b0',
      origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
      entry_date       : new Date('2017-01-01'),
    },

    {
      label            : 'T-QUININE-B',
      initial_quantity : 200,
      quantity         : 200,
      unit_cost        : 0.8,
      expiration_date  : new Date('2018-05-01'),
      inventory_uuid   : 'cf05da13-b477-11e5-b297-023919d3d5b0',
      origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
      entry_date       : new Date('2017-01-01'),
    },

    {
      label            : 'T-QUININE-C',
      initial_quantity : 50,
      quantity         : 50,
      unit_cost        : 2,
      expiration_date  : new Date('2017-05-01'),
      inventory_uuid   : 'cf05da13-b477-11e5-b297-023919d3d5b0',
      origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
      entry_date       : new Date('2017-01-01'),
    },

    {
      label            : 'T-VITAMINE-A',
      initial_quantity : 100,
      quantity         : 100,
      unit_cost        : 1.2,
      expiration_date  : new Date('2019-05-01'),
      inventory_uuid   : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
      entry_date       : new Date('2017-01-01'),
    },

    {
      label            : 'T-VITAMINE-B',
      initial_quantity : 20,
      quantity         : 20,
      unit_cost        : 0.5,
      expiration_date  : new Date('2020-05-01'),
      inventory_uuid   : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
      entry_date       : new Date('2017-01-01'),
    },
  ];

  const movementFirstLots = {
    depot_uuid : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
    date       : new Date(),
    flux_id    : 1,
    user_id    : 1,
    lots,
  };

  const movementOutPatient = {
    depot_uuid  : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
    entity_uuid : '274c51ae-efcc-4238-98c6-f402bfb39866',
    date        : new Date(),
    is_exit     : 1,
    flux_id     : flux.TO_PATIENT,
    user_id     : 1,
    lots        : [
      {
        inventory_uuid : 'cf05da13-b477-11e5-b297-023919d3d5b0',
        uuid      : 'ae735e99-8faf-417b-aa63-9b404fca99ac', // QUININE-A
        quantity  : 20,
        unit_cost : 1.5,
      },

      {
        inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
        uuid      : '064ab1d9-5246-4402-ae8a-958fcdb07b35', // VITAMINE-A
        quantity  : 10,
        unit_cost : 2,
      },
    ],
  };

  const movementDepot = {
    from_depot : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
    to_depot   : 'd4bb1452-e4fa-4742-a281-814140246877',
    date       : new Date(),
    user_id    : 1,
    lots       : [
      {
        inventory_uuid : 'cf05da13-b477-11e5-b297-023919d3d5b0',
        uuid      : '6f80748b-1d94-4247-804e-d4be99e827d2', // QUININE-B
        quantity  : 50,
        unit_cost : 1.5,
      },

      {
        inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
        uuid      : '064ab1d9-5246-4402-ae8a-958fcdb07b35', // VITAMINE-A
        quantity  : 10,
        unit_cost : 2,
      },
    ],
  };


  // ==============================================================================

  const depotPrincipalUuid = 'f9caeb16-1684-43c5-a6c4-47dbac1df296';
  const depotPrincipalMvt = 13; // 10 initial plus 2 distributions
  const lotQuinineUuid = 'ae735e99-8faf-417b-aa63-9b404fca99ac';

  // create new stock lots
  it('POST /stock/lots create a new stock lots entry', () => agent.post('/stock/lots')
      .send(movementFirstLots)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler));

  // create stock movement to patient
  it('POST /stock/lots/movements distribute lots to patients from a depot', () => agent.post('/stock/lots/movements')
      .send(movementOutPatient)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler));

  // create stock movement to depot
  it('POST /stock/lots/movements distribute stock lots to a depot', () => agent.post('/stock/lots/movements')
      .send(movementDepot)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler));

  // list all movement relatives to 'Depot Principal'
  it('GET /stock/lots/movements?depot_uuid=... returns movements for Depot Principal (13: 9 IN + 2 OUT)', () => agent.get(`/stock/lots/movements?depot_uuid=${depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, depotPrincipalMvt);
      })
      .catch(helpers.handler));

  // list all stock exit relatives to 'Depot Principal'
  it('GET /stock/lots/movements?is_exit=1&depot_uuid=... returns exits for Depot Principal (3 OUT)', () => agent.get(`/stock/lots/movements?is_exit=1&depot_uuid=${depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler));

  // list all stock entry relatives to 'Depot Principal'
  it('GET /stock/lots/movements?is_exit=0&depot_uuid=... returns entries for Depot Principal (10 IN)', () => agent.get(`/stock/lots/movements?is_exit=0&depot_uuid=${depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 10);
      })
      .catch(helpers.handler));

  // get initial quantity of QUININE-A in 'Depot Principal'
  it('GET /stock/lots?lot_uuid=...&depot_uuid=... returns initial quantity of QUININE-A in Depot Principal (100pcs)', () => agent.get(`/stock/lots?lot_uuid=${lotQuinineUuid}&depot_uuid=${depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 1);
        const lotQuinine = res.body[0];
        expect(lotQuinine.initial_quantity).to.be.equal(100);
      })
      .catch(helpers.handler));

  // list exit of QUININE-A from 'Depot Principal'
  it('GET /stock/lots/movements?is_exit=1&lot_uuid=...&depot_uuid=... returns exit of QUININE-A from Depot Principal (20pcs)', () => agent.get(`/stock/lots/movements?is_exit=1&lot_uuid=${lotQuinineUuid}&depot_uuid=${depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 1);
        let totalExit = 0;
        res.body.forEach(row => {
          totalExit += row.quantity;
        });
        expect(totalExit).to.be.equal(20);
      })
      .catch(helpers.handler));

  // returns quantity of QUININE-A in 'Depot Principal'
  it('GET /stock/lots/depots?lot_uuid=...&depot_uuid=... returns remaining quantity of QUININE-A in Depot Principal (80pcs)', () => agent.get(`/stock/lots/depots?lot_uuid=${lotQuinineUuid}&depot_uuid=${depotPrincipalUuid}`)
      .then((res) => {
        helpers.api.listed(res, 1);
        expect(res.body[0].quantity).to.be.equal(100 - 20);
      })
      .catch(helpers.handler));
});

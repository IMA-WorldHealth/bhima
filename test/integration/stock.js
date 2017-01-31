/* global expect, chai, agent */
/* jshint expr : true */

'use strict';

const helpers = require('./helpers');

describe('(/stock/) The Stock HTTP API', () => {

    // stock flux 
    const flux = {
        'FROM_PURCHASE'    : 1,
        'FROM_OTHER_DEPOT' : 2,
        'FROM_ADJUSTMENT'  : 3,
        'FROM_PATIENT'     : 4,
        'FROM_SERVICE'     : 5,
        'FROM_DONATION'    : 6,
        'FROM_LOSS'        : 7,
        'TO_OTHER_DEPOT'   : 8,
        'TO_PATIENT'       : 9,
        'TO_SERVICE'       : 10,
        'TO_LOSS'          : 11,
        'TO_ADJUSTMENT'    : 12
    };
  
  // initial movement of five lots
  let lots = [
      {
          label: 'QUININE-A',
          initial_quantity: 100,
          quantity: 100,
          unit_cost: 1.2,
          expiration_date: new Date('2018-05-01'),
          inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
          purchase_uuid: 'e07ceadc-82cf-4ae2-958a-6f6a78c87588'
      },

      {
          label: 'QUININE-B',
          initial_quantity: 200,
          quantity: 200,
          unit_cost: 0.8,
          expiration_date: new Date('2018-05-01'),
          inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
          purchase_uuid: 'e07ceadc-82cf-4ae2-958a-6f6a78c87588'
      },

      {
          label: 'QUININE-C',
          initial_quantity: 50,
          quantity: 50,
          unit_cost: 2,
          expiration_date: new Date('2017-05-01'),
          inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
          purchase_uuid: 'e07ceadc-82cf-4ae2-958a-6f6a78c87588'
      },

      {
          label: 'VITAMINE-A',
          initial_quantity: 100,
          quantity: 100,
          unit_cost: 1.2,
          expiration_date: new Date('2019-05-01'),
          inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
          purchase_uuid: 'e07ceadc-82cf-4ae2-958a-6f6a78c87588'
      },

      {
          label: 'VITAMINE-B',
          initial_quantity: 20,
          quantity: 20,
          unit_cost: 0.5,
          expiration_date: new Date('2020-05-01'),
          inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
          purchase_uuid: 'e07ceadc-82cf-4ae2-958a-6f6a78c87588'
      }
  ];

  let movementFirstLots = {
      depot_uuid: 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
      date: new Date(),
      flux_id: 1,
      user_id: 1,
      lots: lots
  };

  let movement_out_patient = {
      depot_uuid  : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
      entity_uuid : '274c51ae-efcc-4238-98c6-f402bfb39866',
      date        : new Date(),
      is_exit     : 1,
      flux_id     : flux.TO_PATIENT,
      user_id     : 1,
      lots: [
        {
            uuid: '00219063-5010-462f-ac64-9e024416a2f4', // QUININE-A
            quantity: 20,
            unit_cost: 1.5
        },

        {
            uuid: '14bd524d-649f-4c81-ba49-2db6b76182ba', // VITAMINE-A
            quantity: 10,
            unit_cost: 2
        }
      ]
  };

  let movement_depot = {
      from_depot  : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
      to_depot    : 'd4bb1452-e4fa-4742-a281-814140246877',
      date        : new Date(),
      user_id     : 1,
      lots: [
        {
            uuid: 'aee7c2f7-8833-42ed-8041-0b74d35606d5', // QUININE-B
            quantity: 50,
            unit_cost: 1.5
        },

        {
            uuid: '14bd524d-649f-4c81-ba49-2db6b76182ba', // VITAMINE-A
            quantity: 10,
            unit_cost: 2
        }
      ]
  };



  // ==============================================================================

  // create new stock lots
  it('POST /stock/lots create a new stock lots entry', () => {
    return agent.post('/stock/lots')
      .send(movementFirstLots)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  // create stock movement to patient 
  it('POST /stock/lots/movements distribute lots to patients from a depot', () => {
    return agent.post('/stock/lots/movements')
      .send(movement_out_patient)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  // create stock movement to depot 
  it('POST /stock/lots/movements distribute stock lots to a depot', () => {
    return agent.post('/stock/lots/movements')
      .send(movement_depot)
      .then((res) => {
        helpers.api.created(res);
        console.log(res.body.uuid)
      })
      .catch(helpers.handler);
  });

});

/* global expect, chai, agent */
/* jshint expr : true */

'use strict';

const helpers = require('./helpers');

describe('(/stock/) The Stock HTTP API', () => {
  
  // initial movement of five lots
  let lots = [
      {
          label: 'QNN-A',
          initial_quantity: 100,
          quantity: 100,
          unit_cost: 1.2,
          expiration_date: new Date('2018-05-01'),
          inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
          purchase_uuid: '968e0ae6-c29d-4ce7-a4af-f516298b492d'
      },

      {
          label: 'QNN-B',
          initial_quantity: 200,
          quantity: 200,
          unit_cost: 0.8,
          expiration_date: new Date('2018-05-01'),
          inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
          purchase_uuid: '968e0ae6-c29d-4ce7-a4af-f516298b492d'
      },

      {
          label: 'QNN-C',
          initial_quantity: 50,
          quantity: 50,
          unit_cost: 2,
          expiration_date: new Date('2017-05-01'),
          inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
          purchase_uuid: '968e0ae6-c29d-4ce7-a4af-f516298b492d'
      },

      {
          label: 'VIT-A',
          initial_quantity: 100,
          quantity: 100,
          unit_cost: 1.2,
          expiration_date: new Date('2019-05-01'),
          inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
          purchase_uuid: '968e0ae6-c29d-4ce7-a4af-f516298b492d'
      },

      {
          label: 'VIT-B',
          initial_quantity: 20,
          quantity: 20,
          unit_cost: 0.5,
          expiration_date: new Date('2020-05-01'),
          inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
          purchase_uuid: '968e0ae6-c29d-4ce7-a4af-f516298b492d'
      }
  ];

  let movement = {
      depot_uuid: '31759d03-0d74-4d76-b626-d9e0e4ec4f20',
      date: new Date(),
      flux_id: 1,
      user_id: 1,
      lots: lots
  };

  // ========================== new stock entry ==============================

  // create new stock
  it('POST /stock/create create a new stock entry', () => {
    return agent.post('/stock/create')
      .send(movement)
      .then((res) => {
        helpers.api.created(res);
        console.log('document uuid: ', res.body.uuid)
      })
      .catch(helpers.handler);
  });

});

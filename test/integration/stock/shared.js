/**
 * stock shared variables as database
 */
const helpers = require('../helpers');

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
    inventory_uuid   : helpers.data.QUININE,
    origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
    entry_date       : new Date('2017-01-01'),
  },

  {
    label            : 'T-QUININE-B',
    initial_quantity : 200,
    quantity         : 200,
    unit_cost        : 0.8,
    expiration_date  : new Date('2018-05-01'),
    inventory_uuid   : helpers.data.QUININE,
    origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
    entry_date       : new Date('2017-01-01'),
  },

  {
    label            : 'T-QUININE-C',
    initial_quantity : 50,
    quantity         : 50,
    unit_cost        : 2,
    expiration_date  : new Date('2017-05-01'),
    inventory_uuid   : helpers.data.QUININE,
    origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
    entry_date       : new Date('2017-01-01'),
  },

  {
    label            : 'T-VITAMINE-A',
    initial_quantity : 100,
    quantity         : 100,
    unit_cost        : 1.2,
    expiration_date  : new Date('2019-05-01'),
    inventory_uuid   : helpers.data.MULTIVITAMINE,
    origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
    entry_date       : new Date('2017-01-01'),
  },

  {
    label            : 'T-VITAMINE-B',
    initial_quantity : 20,
    quantity         : 20,
    unit_cost        : 0.5,
    expiration_date  : new Date('2020-05-01'),
    inventory_uuid   : helpers.data.MULTIVITAMINE,
    origin_uuid      : 'e07ceadc-82cf-4ae2-958a-6f6a78c87588',
    entry_date       : new Date('2017-01-01'),
  },
];

const movementFirstLots = {
  depot_uuid : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
  date       : new Date(),
  flux_id    : 1,
  user_id    : 1,
  description : 'Initial Lot Movement',
  lots,
};

const movementOutPatient = {
  depot_uuid  : 'f9caeb16-1684-43c5-a6c4-47dbac1df296',
  entity_uuid : '274c51ae-efcc-4238-98c6-f402bfb39866',
  date        : new Date(),
  is_exit     : 1,
  description : 'Stock Exit to patient',
  flux_id     : flux.TO_PATIENT,
  user_id     : 1,
  lots        : [
    {
      inventory_uuid : helpers.data.QUININE,
      uuid      : 'ae735e99-8faf-417b-aa63-9b404fca99ac', // QUININE-A
      quantity  : 20,
      unit_cost : 1.5,
    }, {
      inventory_uuid : helpers.data.MULTIVITAMINE,
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
  description : 'Stock movement between depot',
  lots       : [
    {
      inventory_uuid : helpers.data.QUININE,
      uuid      : '6f80748b-1d94-4247-804e-d4be99e827d2', // QUININE-B
      quantity  : 50,
      unit_cost : 1.5,
    }, {
      inventory_uuid : helpers.data.MULTIVITAMINE,
      uuid      : '064ab1d9-5246-4402-ae8a-958fcdb07b35', // VITAMINE-A
      quantity  : 10,
      unit_cost : 2,
    },
  ],
};

// ==============================================================================

const depotPrincipalUuid = 'f9caeb16-1684-43c5-a6c4-47dbac1df296';
const depotPrincipalMvt = 23; // 10 initial plus 3 distributions + 10 imported
const lotQuinineUuid = 'ae735e99-8faf-417b-aa63-9b404fca99ac';

module.exports = {
  movementFirstLots,
  movementOutPatient,
  movementDepot,
  depotPrincipalMvt,
  depotPrincipalUuid,
  lotQuinineUuid,
};

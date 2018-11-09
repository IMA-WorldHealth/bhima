/* global expect, agent */

const helpers = require('./helpers');

/*
 * The Distribution Fees Centers  API endpoint
 *
 * This test suite implements full CRUD on the all fee center distributions  HTTP API endpoint.
 */
describe('(/fee_center_distribution_key) The /fee_center  API endpoint', () => {
  // distribution_center/distribution_key  we will add during this test suite.

  const distributionKey1 = {
    data : {
      auxiliary_fee_center_id : 6,
      values : { 1 : 50, 2 : 35, 3 : 15 },
    },
  };

  const distributionKey2 = {
    data : {
      auxiliary_fee_center_id : 4,
      values : { 1 : 95, 2 : 3, 3 : 2 },
    },
  };

  // Distribution Proceed
  const proceed = {
    data :
   {
     uuid : 'E7011804E0DC11E89F4F507B9DD6DEA5',
     posted : 1,
     project_id : 1,
     fiscal_year_id : 4,
     period_id : 201811,
     trans_id : 'TPA37',
     trans_date : '2018-11-05 10:26:05',
     record_uuid : '79B0393553C54498A5ECA8CA6DFEA7AC',
     hrRecord : 'IV.TPA.5',
     description : 'IV.TPA.1: Tylenol sirop (cold multivit)',
     account_id : 243,
     debit : 0,
     credit : 204.8,
     debit_equiv : 0,
     credit_equiv : 204.8,
     currency_id : 2,
     currencyName : 'United States Dollars',
     entity_uuid : null,
     hrEntity : null,
     reference_uuid : null,
     hrReference : null,
     comment : null,
     transaction_type_id : 11,
     user_id : 1,
     cc_id : null,
     pc_id : null,
     abbr : 'TPA',
     project_name : 'Test Project A',
     period_start : '2018-10-31T23:00:00.000Z',
     transaction_type_text : 'VOUCHERS.SIMPLE.INVOICING',
     period_end : '2018-11-29T23:00:00.000Z',
     account_number : 70111011,
     account_label : 'Vente Medicaments en Sirop',
     display_name : 'Super User',
     fee_center_id : 6,
     fee_center_label : 'Auxiliary 3',
     amount : 204.8,
     amount_equiv : 204.8,
     is_cost : 0,
     values : { 1 : 20.8, 2 : 100, 3 : 84 },
   },
  };
  const breackDown = {
    data : {
      values : { 1 : 50, 2 : 50, 3 : 0 },
      transactions :
  [{
    uuid : '0070D328DDB611E8A8B3507B9DD6DEA5',
    posted : 1,
    project_id : 1,
    fiscal_year_id : 4,
    period_id : 201811,
    trans_id : 'TPA20',
    trans_date : '2018-11-01 10:09:27',
    record_uuid : 'DB14EA1F777E4791B856B506F4C438E9',
    hrRecord : null,
    description : 'Facture de Test 2 Patient (PA.TPA.2) pour 2 items dans le service Medecine Interne. ',
    account_id : 220,
    debit : 6825.26,
    credit : 0,
    debit_equiv : 6825.26,
    credit_equiv : 0,
    currency_id : 2,
    currencyName : 'United States Dollars',
    entity_uuid : null,
    hrEntity : null,
    reference_uuid : null,
    hrReference : null,
    comment : null,
    transaction_type_id : 11,
    user_id : 1,
    cc_id : null,
    pc_id : null,
    abbr : 'TPA',
    project_name : 'Test Project A',
    period_start : '2018-10-31T23:00:00.000Z',
    transaction_type_text : 'VOUCHERS.SIMPLE.INVOICING',
    period_end : '2018-11-29T23:00:00.000Z',
    account_number : 66110011,
    account_label : 'Remunération Personnel',
    display_name : 'Super User',
    fee_center_id : 4,
    fee_center_label : 'Auxiliary 1',
    amount : 6825.26,
    amount_equiv : 6825.26,
  }],
      fee_center_id : 4,
      is_cost : 1,
    },
  };

  const automaticInvoices = {
    data :
   [{
     uuid : 'E7011C13E0DC11E89F4F507B9DD6DEA5',
     posted : 1,
     project_id : 1,
     fiscal_year_id : 4,
     period_id : 201811,
     trans_id : 'TPA37',
     trans_date : '2018-11-05 10:26:05',
     record_uuid : '79B0393553C54498A5ECA8CA6DFEA7AC',
     hrRecord : 'IV.TPA.5',
     description : 'IV.TPA.1: Multivitamine sirop500 ml',
     account_id : 243,
     debit : 0,
     credit : 190,
     debit_equiv : 0,
     credit_equiv : 190,
     currency_id : 2,
     currencyName : 'United States Dollars',
     entity_uuid : null,
     hrEntity : null,
     reference_uuid : null,
     hrReference : null,
     comment : null,
     transaction_type_id : 11,
     user_id : 1,
     cc_id : null,
     pc_id : null,
     abbr : 'TPA',
     project_name : 'Test Project A',
     period_start : '2018-10-31T23:00:00.000Z',
     transaction_type_text : 'VOUCHERS.SIMPLE.INVOICING',
     period_end : '2018-11-29T23:00:00.000Z',
     account_number : 70111011,
     account_label : 'Vente Medicaments en Sirop',
     display_name : 'Super User',
     fee_center_id : 6,
     fee_center_label : 'Auxiliary 3',
     amount : 190,
     amount_equiv : 190,
   }],
  };

  it('GET /distribution_fee_center  ', () => {
    return agent.get('/distribution_fee_center')
      .then(res => {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('POST /distribution_fee_center/distributionKey a new Distribution Fee Center Key: 1', () => {
    return agent.post('/distribution_fee_center/distributionKey')
      .send(distributionKey1)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /distribution_fee_center/distributionKey a new Distribution Fee Center Key: 2', () => {
    return agent.post('/distribution_fee_center/distributionKey')
      .send(distributionKey2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /distribution_fee_center/proceed : Distribution of Ancillary Cost Centers to Main Centers by Monetary Values', () => {
    return agent.post('/distribution_fee_center/proceed')
      .send(proceed)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('/distribution_fee_center/automatic Automatic distribution of invoices whose services are referenced to main expense centers', () => {
    return agent.post('/distribution_fee_center/automatic')
      .send(automaticInvoices)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /distribution_fee_center/getDistributed  Obtaining the list of all distributions of costs and profits made manually', () => {
    return agent.get('/distribution_fee_center/getDistributed')
      .then(res => {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('GET /distribution_fee_center/getDistributionKey Obtaining the list of all defined distribution keys', () => {
    return agent.get('/distribution_fee_center/getDistributionKey')
      .then(res => {
        helpers.api.listed(res, 7);
      })
      .catch(helpers.handler);
  });
});

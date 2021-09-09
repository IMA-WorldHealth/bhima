/* global agent, expect */

const helpers = require('./helpers');

/*
 * The Distribution Fees Centers  API endpoint
 *
 * This test suite implements full CRUD on the all fee center distributions  HTTP API endpoint.
 */
describe('(/fee_center_distribution) The /fee_center  API endpoint', () => {
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

  // Distribution Proceed Internal Server Error
  const proceedInternalServerError = {
    data :
   {
     uuid : 'E7011804F507B9DE0DC11E89F4D6DEA5',
     posted : 1,
     project_id : 1,
     fiscal_year_id : 4,
     period_id : 201811,
     account_id : 243,
     debit : 0,
     credit : 204.8,
     debit_equiv : 0,
     credit_equiv : 204.8,
     transaction_type_id : 11,
     user_id : 1,
     abbr : 'TPA',
     project_name : 'Test Project A',
     account_label : 'Vente Medicaments en Sirop',
     display_name : 'Super User',
     fee_center_id : 6,
     fee_center_label : 'Auxiliary 3',
     amount : 204.8,
     amount_equiv : 204.8,
     is_cost : 0,
     values : {},
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

  const auxiliaryFeeCenter = {
    data : 4,
  };

  it('GET /distribution_fee_center  ', () => {
    return agent.get('/distribution_fee_center')
      .then(res => {
        helpers.api.listed(res, 4);
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

  it('POST /distribution_fee_center/distributionKey a new distribution fee center key: 2', () => {
    return agent.post('/distribution_fee_center/distributionKey')
      .send(distributionKey2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /distribution_fee_center/proceed distribution of aux cost centers to main centers by currency', () => {
    return agent.post('/distribution_fee_center/proceed')
      .send(proceed)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /distribution_fee_center/proceed throws BadRequest if dataToDistribute.length is 0', () => {
    return agent.post('/distribution_fee_center/proceed')
      .send(proceedInternalServerError)
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  // eslint-disable-next-line
  it('/distribution_fee_center/automatic Automatically distributes invoices with referenced services to main expense centers', () => {
    return agent.post('/distribution_fee_center/automatic')
      .send(automaticInvoices)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /distribution_fee_center/getDistributed retunrs all distributions of costs and profits made manually', () => {
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

  it('POST /distribution_fee_center/resetKey : Reset the distribution keys', () => {
    return agent.post('/distribution_fee_center/resetKey')
      .send(auxiliaryFeeCenter)
      .then((res) => {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });
});

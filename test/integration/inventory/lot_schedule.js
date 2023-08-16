/* global expect, agent */

const moment = require('moment');
const helpers = require('../helpers');
const { expect } = require('chai');

function compareDate(date1, date2, msg) {
  expect(date1.getFullYear(), `${msg} (year does not match)`).to.equal(date2.getFullYear());
  expect(date1.getMonth(), `${msg} (month does not match)`).to.equal(date2.getMonth());
  expect(date1.getDate(), `${msg} (day does not match)`).to.equal(date2.getDate());
}

describe('Inventory lots schedule HTML REST API', () => {

  it('GET /inventory/:uuid/schedule: test usage schedule for QUININE (DORA_QUIN1S-_0)', () => {
    const uuid = helpers.data.QUININE;
    const depotUuid = helpers.data.depots.principal;
    const num_months = 3;
    return agent.get(`/inventory/${uuid}/schedule/${depotUuid}`)
      .query({
        month_average_consumption : 6,
        average_consumption_algo : 'algo_msh',
        interval_num_months : num_months,
      })
      .then(res => {
        const today = new Date();
        const lots = res.body;

        expect(lots.length).to.equal(2);

        // Check the first lot
        const B = lots[0];
        const start_b = new Date(B.start_date);
        const end_b = new Date(B.end_date);
        expect(B.label).to.equal('QUININE-B');
        compareDate(start_b, today, 'Lot QUININE-B start date error');
        compareDate(end_b, moment(today).add(30.5, 'days').toDate(), 'Lot QUININE-B end date error')
        expect(B.quantity_used).to.equal(0);
        expect(B.quantity_wasted).to.equal(15);
        expect(B.value_wasted).to.equal(12);

        // Check the second lot
        const C = lots[1];
        const start_c = new Date(C.start_date);
        const end_c = new Date(C.end_date);
        expect(C.label).to.equal('QUININE-C');
        compareDate(start_c, end_b, 'Lot QUININE-C start date error');
        compareDate(end_c, moment(start_c).add(num_months, 'months').toDate(), 'Lot QUININE-C end date error')
        // Note: Nothing wasted because the expiration date is after our interval
        expect(C.quantity_used).to.equal(50);
        expect(C.quantity_wasted).to.equal(0);
        expect(C.value_wasted).to.equal(0);
      })
      .catch(helpers.handler);
  });

});

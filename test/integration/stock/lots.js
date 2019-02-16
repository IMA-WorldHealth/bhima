/* global expect, agent */
/* jshint expr : true */

const moment = require('moment');
const helpers = require('../helpers');
const shared = require('./shared');

describe('(/lots/) The lots HTTP API', () => {
  it('GET /lots/:uuid returns details of a lot', () => {
    return agent.get(`/lots/${shared.lotQuinineUuid}`)
      .then((res) => {
        expect(res).to.have.status(200);
        const expectedKeys = [
          'uuid', 'label', 'quantity', 'unit_cost', 'description',
          'expiration_date', 'inventory_uuid', 'text',
        ];
        expect(res.body).to.have.all.keys(expectedKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /lots/:uuid update lot label or expiration date', () => {
    const update = {
      label : 'Lot Quinine Updated',
      expiration_date : '2020-12-15',
      unit_cost : 1.7,
    };

    return agent.put(`/lots/${shared.lotQuinineUuid}`)
      .send(update)
      .then((res) => {
        expect(res).to.have.status(200);
        return agent.get(`/lots/${shared.lotQuinineUuid}`);
      })
      .then(res => {
        const details = res.body;
        expect(details.label).to.be.equal(update.label);
        expect(formatDate(details.expiration_date)).to.be.equal(update.expiration_date);
      })
      .catch(helpers.handler);
  });

  it('GET /lots/:uuid/assignments/:depot_uuid returns all assignments of a lot for a given depot', () => {
    const depotUuid = shared.newPersonAssign.depot_uuid;
    const lotUuid = shared.newPersonAssign.lot_uuid;
    const lotNotAssignedUuid = shared.lotVitamineA;
    return agent.get(`/lots/${lotUuid}/assignments/${depotUuid}`)
      .then(res => {
        helpers.api.listed(res, 1);
        return agent.get(`/lots/${lotUuid}/assignments/${lotNotAssignedUuid}`);
      })
      .then(res => {
        helpers.api.listed(res, 0);
      })
      .catch(helpers.handler);
  });
});

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

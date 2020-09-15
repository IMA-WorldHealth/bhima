/* global expect, agent */
const moment = require('moment');
const helpers = require('../helpers');
const shared = require('./shared');

describe('(/stock/requisition) The Stock Assign HTTP API', () => {
  const variables = {};
  const keys = [
    'uuid', 'requestor_uuid', 'requestor_type_id', 'description', 'date',
    'user_id', 'user_display_name', 'depot_uuid', 'depot_text', 'service_requestor',
    'depot_requestor', 'reference', 'items', 'status_key', 'title_key',
  ];

  // create new stock requisition on "Depot Principal" from a servicedelete stock requisition
  it('POST /stock/requisition create a new stock requisition from a service', () => {
    return agent.post('/stock/requisition')
      .send(shared.requisitionFromService)
      .then((res) => {
        helpers.api.created(res);
        variables.requisitionFromServiceUuid = res.body.uuid;
      })
      .catch(helpers.handler);
  });

  // create new stock requisition on "Depot Principal" from a depot
  it('POST /stock/requisition create a new stock requisition from a depot', () => {
    return agent.post('/stock/requisition')
      .send(shared.requisitionFromDepot)
      .then((res) => {
        helpers.api.created(res);
        variables.requisitionFromDepotUuid = res.body.uuid;
      })
      .catch(helpers.handler);
  });

  // list all stock requisition
  it('GET /stock/requisition list all stock requisitions', () => {
    return agent.get('/stock/requisition')
      .then(res => {
        helpers.api.listed(res, 6);
      })
      .catch(helpers.handler);
  });

  // get requisition details by its uuid
  it('GET /stock/requisition get requisition by its uuid', () => {
    return agent.get(`/stock/requisition/${variables.requisitionFromServiceUuid}`)
      .then(res => {
        const diff = dateDiff(res.body.date, shared.requisitionFromService.date);
        const items = res.body.items.map(getItem);

        expect(res).to.have.status(200);
        expect(res).to.be.an('object');
        expect(diff).to.equal(0);
        expect(res.body.uuid).to.equal(variables.requisitionFromServiceUuid);
        expect(res.body.depot_uuid).to.equal(shared.requisitionFromService.depot_uuid);
        expect(res.body.requestor_type_id).to.equal(shared.requisitionFromService.requestor_type_id);
        expect(res.body.description).to.equal(shared.requisitionFromService.description);
        expect(items).to.deep.equal(shared.requisitionFromService.items);
        expect(res.body).to.have.all.keys(keys);
      })
      .catch(helpers.handler);
  });

  // search requisitions by filters
  it('GET /stock/requisition get requisitions of a given depot', () => {
    return agent.get(`/stock/requisition?depot_uuid=${shared.depotPrincipalUuid}`)
      .then(res => {
        helpers.api.listed(res, 3);
        return agent.get(`/stock/requisition?depot_uuid=${shared.depotSecondaireUuid}`);
      })
      .then(res => helpers.api.listed(res, 3))
      .catch(helpers.handler);
  });

  /**
   * This feature is not implemented on client due to the lack of information
   * which can be introduced by the stock requisition edit feature.
   */
  it(`PUT /stock/requisition/:uuid update stock requisition`, () => {
    const update = {
      requestor_uuid : shared.depotSecondaireUuid,
      requestor_type_id : 2,
      depot_uuid : shared.depotPrincipalUuid,
      description : 'Updated Requisition for a depot',
      date : new Date(),
    };
    return agent.put(`/stock/requisition/${variables.requisitionFromServiceUuid}`)
      .send(update)
      .then(res => {
        expect(res).to.have.status(200);
        return agent.get(`/stock/requisition/${variables.requisitionFromServiceUuid}`);
      })
      .then(res => {
        const diff = dateDiff(res.body.date, update.date);
        const items = res.body.items.map(getItem);

        expect(res).to.be.an('object');
        expect(diff).to.equal(0);
        expect(res.body.uuid).to.equal(variables.requisitionFromServiceUuid);
        expect(res.body.depot_uuid).to.equal(update.depot_uuid);
        expect(res.body.requestor_type_id).to.equal(update.requestor_type_id);
        expect(res.body.description).to.equal(update.description);
        expect(items).to.deep.equal(shared.requisitionFromService.items);
        expect(res.body).to.have.all.keys(keys);
      })
      .catch(helpers.handler);
  });

  // delete the requisition
  it(`DELETE /stock/requisition/:uuid delete stock requisition`, () => {
    return agent.delete(`/stock/requisition/${variables.requisitionFromServiceUuid}`)
      .then(res => {
        expect(res).to.have.status(204);
        return agent.get('/stock/requisition');
      })
      .then(res => {
        const doesnExist = res.body.map(item => item.uuid)
          .filter(uuid => uuid === variables.requisitionFromServiceUuid)
          .length === 0;
        expect(doesnExist).to.be.equal(true);
        helpers.api.listed(res, 5);
      })
      .catch(helpers.handler);
  });

  function dateDiff(start, end) {
    return moment(start).diff(end, 'minutes');
  }

  function getItem(item) {
    return { inventory_uuid : item.inventory_uuid, quantity : item.quantity };
  }

});

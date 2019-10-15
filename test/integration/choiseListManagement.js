/* global expect, agent */
const helpers = require('./helpers');

describe('(/choises_list_management) Choise List Management', () => {
  const numListElement = 22;

  const newElementList = {
    name : 'oshwe',
    label : 'OSHWE',
    fixed : 0,
    parent : 0,
    group_label : 0,
    is_group : 0,
    is_title : 0,
  };

  const updateElementList = {
    parent : 20,
    group_label : 15,
  };

  it('POST /choises_list_management add Choise List Element', () => {
    return agent.post('/choises_list_management')
      .send(newElementList)
      .then((res) => {
        helpers.api.created(res);
        newElementList.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('GET /choises_list_management/:id returns one Choise List Management as detail', () => {
    return agent.get(`/choises_list_management/${newElementList.id}`)
      .then((res) => {
        expect(res).to.have.status(200);

        expect(res).to.be.a('object');
        expect(res.body).to.have.all.keys('id', 'name', 'label', 'fixed', 'parent',
          'group_label', 'is_group', 'is_title');
      })
      .catch(helpers.handler);
  });

  it('PUT /choises_list_management/:id updates the newly added Choise List Management', () => {
    return agent.put(`/choises_list_management/${newElementList.id}`)
      .send(updateElementList)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
        expect(res.body.id).to.equal(newElementList.id);
      })
      .catch(helpers.handler);
  });

  it('GET /choises_list_management returns all Choise List Management', () => {
    return agent.get(`/choises_list_management/`)
      .then((res) => {
        helpers.api.listed(res, numListElement);
        expect(res.body[0]).to.have.all.keys('id', 'name', 'label', 'fixed', 'parent',
          'group_label', 'is_group', 'is_title');
      })
      .catch(helpers.handler);
  });

  it('DELETE /choises_list_management/:id deletes a Choise List Management', () => {
    return agent.delete(`/choises_list_management/${newElementList.id}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/choises_list_management/${newElementList.id}`);
      })
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});

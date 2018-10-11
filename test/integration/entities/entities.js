/* global expect, agent */
const uuid = require('uuid/v4');

const helpers = require('../helpers');

describe('(/entities) Entities', () => {
  const types = {
    PERSON : 1,
    SERVICE : 2,
    OFFICE : 3,
    ENTERPRISE : 4,
  };

  const person = {
    uuid : uuid(),
    display_name : 'Mr Jean Jacques Rousseau',
    gender : 'M',
    phone : '+330000000000',
    email : 'jjr@history.france',
    address : 'France',
    entity_type_id : types.PERSON,
  };

  const service = {
    uuid : uuid(),
    display_name : 'IMT OFFICE',
    gender : 'O',
    entity_type_id : types.SERVICE,
  };

  const responseKeys = [
    'uuid', 'display_name', 'gender', 'email', 'phone',
    'address', 'reference', 'entity_type_id', 'label', 'translation_key',
  ];

  it('POST /entities Create a new person entity', () => {
    return agent.post('/entities')
      .send(person)
      .then(res => {
        helpers.api.created(res);
        return agent.get(`/entities/${res.body.uuid}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('POST /entities Create a new service entity', () => {
    return agent.post('/entities')
      .send(service)
      .then(res => {
        helpers.api.created(res);
        return agent.get(`/entities/${res.body.uuid}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

});

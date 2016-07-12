/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/reference_group) The Reference Group API', function () {

  var newReferenceGroup = {
    reference_group   : 'AR',
    text              : 'A new Reference Group',
    position          : 5,
    section_bilan_id  : 1
  };

  var responseKeys = [
    'id', 'reference_group', 'text', 'position', 'section_bilan_id'
  ];

  it('POST /reference_group adds a reference group', function () {
    return agent.post('/reference_group')
      .send(newReferenceGroup)
      .then(function (res) {
        helpers.api.created(res);
        newReferenceGroup.id = res.body.id;
        return agent.get('/reference_group/' + newReferenceGroup.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });


  it('GET /reference_group returns a list of reference groups', function () {
    return agent.get('/reference_group')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /reference_group/:id returns one reference group', function () {
    return agent.get('/reference_group/'+ newReferenceGroup.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(newReferenceGroup.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });


  it('PUT /reference_group/:id updates the newly added reference group', function () {
    var updateData = {
      text : 'A Reference Group Test Update',
      position : 1
    };

    return agent.put('/reference_group/'+ newReferenceGroup.id)
      .send(updateData)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newReferenceGroup.id);
        expect(res.body.text).to.equal(updateData.text);
        expect(res.body.position).to.equal(updateData.position);
      })
      .catch(helpers.handler);
  });

   it('DELETE /reference_groups/:id deletes a reference group', function () {
    return agent.delete('/reference_group/' + newReferenceGroup.id)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/reference_group/' + newReferenceGroup.id);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});

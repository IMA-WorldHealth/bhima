/*global describe, it, beforeEach*/

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The Reference Group API, PATH : /reference_groups', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newReferenceGroup = {
    reference_group   : 'AR',
    text              : 'A new Reference Group',
    position          : 5,
    section_bilan_id  : 1 
  };

  var responseKeys = [
    'id', 'reference_group', 'text', 'position', 'section_bilan_id'
  ];

  beforeEach(helpers.login(agent));

  it('METHOD : POST, PATH : /reference_group, It adds a Reference Group', function () {
    return agent.post('/reference_group')
      .send(newReferenceGroup)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newReferenceGroup.id = res.body.id;
        return agent.get('/reference_group/' + newReferenceGroup.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });


  it('METHOD : GET, PATH : /reference_group, It returns a list of reference_groups', function () {
    return agent.get('/reference_group')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /reference_group/:id, It returns one Reference Group', function () {
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


  it('METHOD : PUT, PATH : /reference_group/:id, It updates the newly added Reference Group', function () {
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

   it('METHOD : DELETE, PATH : /reference_groups/:id, It deletes a Reference Group', function () {
    return agent.delete('/reference_group/' + newReferenceGroup.id)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/reference_group/' + newReferenceGroup.id);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
      })
      .catch(helpers.handler);
  });
});
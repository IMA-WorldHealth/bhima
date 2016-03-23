/*global describe, it, beforeEach*/

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The section bilan API, PATH : /section_bilans', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newSectionBilan = {
    text : 'A new Section Bilan',
    position : 5,
    is_actif : 0 
  };

  var responseKeys = [
    'id', 'text', 'position', 'is_actif'
  ];

  beforeEach(helpers.login(agent));

  it('METHOD : POST, PATH : /section_bilans, It adds a section bilan', function () {
    return agent.post('/section_bilans')
      .send(newSectionBilan)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newSectionBilan.id = res.body.id;
        return agent.get('/section_bilans/' + newSectionBilan.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });


  it('METHOD : GET, PATH : /section_bilans, It returns a list of section_bilans', function () {
    return agent.get('/section_bilans')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /section_bilans/:id, It returns one section bilan', function () {
    return agent.get('/section_bilans/'+ newSectionBilan.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(newSectionBilan.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });


  it('METHOD : PUT, PATH : /section_bilans/:id, It updates the newly added section bilan', function () {
    var updateData = {
      text : 'A Section Bilan Test Update',
      position : 1
    };

    return agent.put('/section_bilans/'+ newSectionBilan.id)
      .send(updateData)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newSectionBilan.id);
        expect(res.body.text).to.equal(updateData.text);
        expect(res.body.position).to.equal(updateData.position);
      })
      .catch(helpers.handler);
  });

   it('METHOD : DELETE, PATH : /section_bilans/:id, It deletes a section bilan', function () {
    return agent.delete('/section_bilans/' + newSectionBilan.id)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/section_bilans/' + newSectionBilan.id);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
      })
      .catch(helpers.handler);
  });
});
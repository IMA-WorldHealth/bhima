/*global describe, it, beforeEach*/

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The section resultat API, PATH : /section_resultats', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newSectionResultat = {
    text : 'A new Section Resultat',
    position : 4,
    is_charge : 1 
  };


  var responseKeys = [
    'id', 'text', 'position', 'is_charge'
  ];

  beforeEach(helpers.login(agent));

  it('METHOD : POST, PATH : /section_resultats, It adds a section resultat', function () {
    return agent.post('/section_resultats')
      .send(newSectionResultat)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newSectionResultat.id = res.body.id;
        return agent.get('/section_resultats/' + newSectionResultat.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });


  it('METHOD : GET, PATH : /section_resultats, It returns a list of section_resultats', function () {
    return agent.get('/section_resultats')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /section_resultats/:id, It returns one section resultat', function () {
    return agent.get('/section_resultats/'+ newSectionResultat.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(newSectionResultat.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });


  it('METHOD : PUT, PATH : /section_resultats/:id, It updates the newly added section resultat', function () {
    var updateData = {
      text : 'A Section Resultat Test Update',
      position : 1
    };

    return agent.put('/section_resultats/'+ newSectionResultat.id)
      .send(updateData)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newSectionResultat.id);
        expect(res.body.text).to.equal(updateData.text);
        expect(res.body.position).to.equal(updateData.position);
      })
      .catch(helpers.handler);
  });

   it('METHOD : DELETE, PATH : /section_resultats/:id, It deletes a section resultat', function () {
    return agent.delete('/section_resultats/' + newSectionResultat.id)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/section_resultats/' + newSectionResultat.id);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
      })
      .catch(helpers.handler);
  });
});

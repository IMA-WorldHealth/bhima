/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/section_resultats) The section resultat API', function () {

  var newSectionResultat = {
    text : 'A new Section Resultat',
    position : 4,
    is_charge : 1
  };


  var responseKeys = [
    'id', 'text', 'position', 'is_charge'
  ];


  it('POST /section_resultats adds a section resultat', function () {
    return agent.post('/section_resultats')
      .send(newSectionResultat)
      .then(function (res) {
        helpers.api.created(res);
        newSectionResultat.id = res.body.id;
        return agent.get('/section_resultats/' + newSectionResultat.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });


  it('GET /section_resultats returns a list of section_resultats', function () {
    return agent.get('/section_resultats')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /section_resultats/:id returns one section resultat', function () {
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


  it('PUT /section_resultats/:id updates the newly added section resultat', function () {
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

   it('DELETE /section_resultats/:id deletes a section resultat', function () {
    return agent.delete('/section_resultats/' + newSectionResultat.id)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/section_resultats/' + newSectionResultat.id);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});

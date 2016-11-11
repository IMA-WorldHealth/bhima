/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe.skip('(/section_bilans) The section bilan API', function () {

  var newSectionBilan = {
    text : 'A new Section Bilan',
    position : 5,
    is_actif : 0
  };

  var responseKeys = [
    'id', 'text', 'position', 'is_actif'
  ];

  it('POST /section_bilans adds a section bilan', function () {
    return agent.post('/section_bilans')
      .send(newSectionBilan)
      .then(function (res) {
        helpers.api.created(res);
        newSectionBilan.id = res.body.id;
        return agent.get('/section_bilans/' + newSectionBilan.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });


  it('GET /section_bilans returns a list of section_bilans', function () {
    return agent.get('/section_bilans')
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('GET /section_bilans/:id returns one section bilan', function () {
    return agent.get('/section_bilans/'+ newSectionBilan.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.be.equal(newSectionBilan.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });


  it('PUT /section_bilans/:id updates the newly added section bilan', function () {
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

   it('DELETE /section_bilans/:id deletes a section bilan', function () {
    return agent.delete('/section_bilans/' + newSectionBilan.id)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/section_bilans/' + newSectionBilan.id);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});

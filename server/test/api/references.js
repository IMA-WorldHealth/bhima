var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The reference API, PATH : /references', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newReference = {
    is_report : 0,
    ref : 'AD',
    text : 'Reference tested 1',
    position: 2,
    reference_group_id : 1,
    section_resultat_id : 1
  };

  var DELETABLE_REFERENCE_ID = 5;
  var FETCHABLE_REFERENCE_ID = 1;

  beforeEach(helpers.login(agent));

    it('METHOD : GET, PATH : /references, It returns a list of references', function () {
      return agent.get('/references?full=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(3);
         })
       .catch(helpers.handler);
    });

    it('METHOD : GET, PATH : /references, It returns a list of references', function () {
      return agent.get('/references')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(3);
         })
       .catch(helpers.handler);
    });


    it('METHOD : GET, PATH : /references/:id, It returns one reference', function () {
      return agent.get('/references/'+ FETCHABLE_REFERENCE_ID)
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body.id).to.be.equal(FETCHABLE_REFERENCE_ID);
          expect(res.body).to.have.all.keys('id', 'is_report', 'ref', 'text', 'position', 'reference_group_id', 'section_resultat_id');
        })
        .catch(helpers.handler);
    });

    it('METHOD : POST, PATH : /references, It adds a reference', function () {
      return agent.post('/references')
        .send(newReference)
          .then(function (res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.not.be.empty;
            expect(res.body.id).to.be.defined;
            newReference.id = res.body.id;
            return agent.get('/references/' + newReference.id);
          })
          .then(function (res){
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys('id', 'is_report', 'ref', 'text', 'position', 'reference_group_id', 'section_resultat_id');
          })
          .catch(helpers.handler);
  });

  it('METHOD : PUT, PATH : /references/:id, It updates the newly added reference', function () {
    var updateInfo = {position : 3};

    return agent.put('/references/'+ newReference.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newReference.id);
        expect(res.body.position).to.equal(updateInfo.position);
      })
      .catch(helpers.handler);
  });

   it('METHOD : DELETE, PATH : /references/:id, It deletes a reference', function () {
    return agent.delete('/references/' + DELETABLE_REFERENCE_ID)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/references/' + DELETABLE_REFERENCE_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
      })
      .catch(helpers.handler);
  });
});

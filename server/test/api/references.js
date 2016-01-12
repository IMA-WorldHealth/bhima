/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1};

describe('The /references API endpoint', function () {
  var agent = chai.request.agent(url);
  var new_reference = {
    id : 2,
    is_report : 0,
    ref : 'AD',
    text : 'Reference tested 1',
    position: 2,
    reference_group_id : 1,
    section_resultat_id : 1
  };

  var DELETABLE_REFERENCE_ID = 4;

  var FETCHABLE_REFERENCE_ID = 1;

  // throw errors
  function handler(err) { throw err; }

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  it(' A GET /references/:liste_type returns a list of references', function () {
    return agent.get('/references?list=full')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(3);
      })
      .catch(handler);
  });

  it(' A GET /reference/:id returns one reference', function () {
    return agent.get('/references/'+ FETCHABLE_REFERENCE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
      })
      .catch(handler);
  });

  it('A POST /references will add a reference', function () {
    return agent.post('/references')
      .send(new_reference)
      .then(function (res) {
        expect(res).to.have.status(201);
        new_reference.id = res.body.id;
      })
      .catch(handler);
  }); 

  it('A PUT /references/:id will update the newly added reference', function () {
    return agent.put('/references/'+ 2)
      .send({ position : 3 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(new_reference.id);
        expect(res.body.position).to.not.equal(new_reference.position);

        // re-query the database
        return agent.get('/references/'+ new_reference.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });

   it(' A DELETE /references/:id will delete a reference', function () {
    return agent.delete('/references/' + DELETABLE_REFERENCE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // re-query the database
        return agent.get('/references/' + DELETABLE_REFERENCE_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(0);
      })
      .catch(handler);
  });  
});

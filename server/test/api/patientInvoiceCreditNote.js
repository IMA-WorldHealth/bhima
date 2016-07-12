/* jshint expr:true*/
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('(/Journal) Credit notes to reverse invoice transactions', function () {
  var agent = chai.request.agent(helpers.baseUrl);
            
  const fetchableInvoiceUuid = '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6';

  before(helpers.login(agent));

  it('PUT /journal/:uuid/reverse Cancel an Invoice', function () {
    return agent.put('/journal/' + fetchableInvoiceUuid + '/reverse')
      .send({ description : 'Credit Note', type_id: 9 })
      .then(function (res) {
        expect(res);
        return agent.get('/invoices/'.concat(fetchableInvoiceUuid));
      })
      .then(function (res){

        expect(res).to.have.status(200);
        expect(res.body.type_id).to.equal(9);
      })
     .catch(helpers.handler);
  });

});

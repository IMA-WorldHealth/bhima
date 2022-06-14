/* global expect, chai, */

const helpers = require('./helpers');

describe('/remote access APIs', () => {

  const port = process.env.PORT || 8080;
  const url = `http://localhost:${port}`;

  // set up valid user
  const validUser = {
    username : 'superuser',
    password : 'superuser',
    project : 1,
  };
  let token = null;

  it('get token', () => {
    return chai.request(url)
      .post('/auth/login')
      .send(validUser)
      .then(res => {
        expect(res).to.have.status(200);
        expect(typeof (res.body.token)).to.be.equal('string');
        token = res.body.token;
      })
      .catch(helpers.handler);
  });

  it('Accessing a private route using a correct token', () => {
    return chai.request(url)
      .get('/depots')
      .set('x-access-token', token)
      .then((res) => {
        expect(res).to.have.status(200);
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('Reject accessing a private route without a token', () => {
    return chai.request(url)
      .post('/depots')
      .send(validUser)
      .then(res => {
        expect(res).to.have.status(401);
      })
      .catch(helpers.handler);
  });

  it('Reject accessing a private route using a wrong token', () => {
    return chai.request(url)
      .post('/depots')
      .set('x-access-token', 'my wrong token')
      .send(validUser)
      .then(res => {
        expect(res).to.have.status(401);
      })
      .catch(helpers.handler);
  });

});

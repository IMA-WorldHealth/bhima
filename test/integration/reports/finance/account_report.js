/* global expect, chai, agent */
'use strict';

const helpers = require('../../helpers');

const target = '/reports/finance/account_report';

describe(`(${target}) Report Account`, function () {

  const parameters = {
    account_id : '3627',
    source : 2,
  };

  const BAD_REQUEST = 'ERRORS.BAD_REQUEST';

  const clone = (object) => JSON.parse(JSON.stringify(object));

  it(`GET ${target} should return a BAD_REQUEST response`, function () {
    return agent.get(target)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.code).to.equal(BAD_REQUEST);
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return HTML data for HTML rendering target`, function () {
    let copy = clone(parameters);
    copy.renderer = 'html';

    return agent.get(target)
      .query(copy)
      .then(function (res) {
        expect(res.headers['content-type']).to.equal('text/html; charset=utf-8');
        expect(res.text).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return PDF data for PDF rendering target`, function () {

    let copy = clone(parameters);
    copy.renderer = 'pdf';

    return agent.get(target)
      .query(copy)
      .then(function (res) {
        expect(res.headers['content-type']).to.equal('application/pdf');
        expect(res.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
});
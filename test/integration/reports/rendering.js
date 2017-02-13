'use strict';
/* global expect, chai, agent */

const helpers = require('../helpers');
const _ = require('lodash');

// this makes render tests for reports the lazy way.  Just give it a target and it will write describe() tests for you.
module.exports = function LazyTester(target, keys, params) {
  return function LazyTest() {

    params = _.clone(params || {});

    // renders
    const invalid = { renderer : 'unknown' };
    const json = _.merge({ renderer : 'json' }, params);
    const html = _.merge({ renderer : 'html' }, params);
    const pdf = _.merge({ renderer : 'pdf' }, params);

    it(`GET ${target} should return Bad Request for invalid renderer`, function () {
      return agent.get(target)
        .query(invalid)
        .then(function (result) {
          helpers.api.errored(result, 400, 'ERRORS.INVALID_RENDERER');
        })
        .catch(helpers.handler);
    });

    it(`GET ${target} should return JSON data for 'json' rendering target`, function () {
      return agent.get(target)
        .query(json)
        .then(expectJSONReport)
        .catch(helpers.handler);
    });

    it(`GET ${target} should return HTML data for 'html' rendering target`, function () {
      return agent.get(target)
        .query(html)
        .then(expectHTMLReport)
        .catch(helpers.handler);
    });

    it(`GET ${target} should return PDF data for 'pdf' rendering target`, function () {
      return agent.get(target)
        .query(pdf)
        .then(expectPDFReport)
        .catch(helpers.handler);
    });

    it(`GET ${target} should return the default PDF renderer if no rendering target`, function () {
      let parameters = _.clone(params);
      delete parameters.renderer;
      return agent.get(target)
        .query(parameters)
        .then(expectPDFReport)
        .catch(helpers.handler);
    });

    // validate a JSON response
    function expectJSONReport(result) {
      expect(result).to.have.status(200);
      expect(result).to.be.json;
      expect(result.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(result.body).to.not.be.empty;

      // only assert keys if passed in to the function
      if (keys) {
        expect(result.body).to.contain.all.keys(keys);
      }
    }

    // validate an HTML response
    function expectHTMLReport(result) {
      expect(result.headers['content-type']).to.equal('text/html; charset=utf-8');
      expect(result.text).to.not.be.empty;
    }

    // validate a PDF response
    function expectPDFReport(result) {
      expect(result.headers['content-type']).to.equal('application/pdf');
      expect(result.type).to.equal('application/pdf');
    }
  };
};

/* global element, by, inject, browser */
const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Error 404, Not found', function () {
  const path = '#/incorrectPath';  
  const pathError = '#/error404';
  // navigate to the page
  before(() => helpers.navigate(path));

  it('Page 404 is returned when the user uses a path that does not exist', function () {
    expect(helpers.getCurrentPath()).to.eventually.equal(pathError);
  });

});

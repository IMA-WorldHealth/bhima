/* jshint expr:true */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
helpers.configure(chai);

describe('(patients/:uuid/documents) Patient Documents', () => {
  'use strict';

  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';

  it('POST /patients/:uuid/documents should add documents to a patient');

  it('DELETE /patients/:uuid/documents/:uuid should remove that attachment from the patient reference');

  // @todo - is this a good idea?  Or is this will this accidentally remove all
  // documents if :uuid is not defined?
  it('DELETE /patients/:uuid/documents should remove all documents from the patient');

  it('GET /patients/:uuid/documents should return an array of patient documents');

  it('GET /patients/:uuid/documents/:uuid should serve an attachment to the browser as an attachment');

  it('GET /patients/:uuid/documents/:uuid should send a 404 for an invalid uuid');

  // these are kind of "super user" features.
  it('GET /patients/documents should send a list of all documents ever registered with the application');

  it('GET /patients/documents/:uuid should return a particular document without knowing the patient uuid');
});

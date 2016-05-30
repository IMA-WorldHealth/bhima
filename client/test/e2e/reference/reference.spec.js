/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
helpers.configure(chai);

describe('Reference Module', function () {
  'use strict';

  const path = '#/references';
  before(() => helpers.navigate(path));

  const reference = {
    ref : 'AD',
    text : 'A reference for Test E2E',
    position: 2
  };

  const referenceRank = 1;

  it('successfully creates a new reference', function () {

    // switch to the create form
    FU.buttons.create();

    // input form fields
    FU.input('ReferenceCtrl.reference.ref', reference.ref);
    FU.input('ReferenceCtrl.reference.text', reference.text);
    FU.input('ReferenceCtrl.reference.position', reference.position);
    FU.select('ReferenceCtrl.reference.reference_group_id', 'Reference Group 1');
    FU.select('ReferenceCtrl.reference.section_resultat_id', 'Section Resultat 1');

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits an reference', function () {

    element(by.id('reference-upd-' + referenceRank )).click();
    // modify the reference reference_
    FU.input('ReferenceCtrl.reference.ref', 'D3');

    // modify the reference text
    FU.input('ReferenceCtrl.reference.text', 'Updated');

    element(by.id('is_report')).click();

     FU.buttons.submit();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('ReferenceCtrl.reference.ref');
    FU.validation.error('ReferenceCtrl.reference.text');
    FU.validation.error('ReferenceCtrl.reference.position');

    // the following fields are not required
    FU.validation.ok('ReferenceCtrl.reference.is_report');
    FU.validation.ok('ReferenceCtrl.reference.reference_group_id');
    FU.validation.ok('ReferenceCtrl.reference.section_resultat_id');

  });

  it('successfully delete a reference', function () {
    element(by.id('reference-del-' + referenceRank )).click();

    // click the alert asking for permission
    components.modalAction.confirm();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });
});

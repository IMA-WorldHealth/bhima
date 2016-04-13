/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Reference  Module', function () {
  'use strict';

  var path = '#/references';

  var reference = {
    ref : 'AD',
    text : 'A reference for Test E2E',
    position: 2
  };

  var referenceRank = 1;


  // navigate to the Reference module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Reference', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('ReferenceCtrl.reference.ref', reference.ref);
    FU.input('ReferenceCtrl.reference.text', reference.text);
    FU.input('ReferenceCtrl.reference.position', reference.position);

    // select a reference_group_id
    FU.select('ReferenceCtrl.reference.reference_group_id')
      .enabled()
      .first()
      .click();

    // select a section_resultat_id
    FU.select('ReferenceCtrl.reference.section_resultat_id')
      .enabled()
      .first()
      .click();

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

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

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

  it('successfully delete a Reference', function () {
    element(by.id('reference-del-' + referenceRank )).click();

    // click the alert asking for permission
    browser.switchTo().alert().accept();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });

});
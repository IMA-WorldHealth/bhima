/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Reference Group Module', function () {
  'use strict';

  var path = '#/references/groups';

  var referenceGroup = {
    reference_group   : 'BC',
    text              : 'A new Reference Group',
    position          : 5  
  };

  var referenceGroupRank = 1;


  // navigate to the ReferenceGroup module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new ReferenceGroup', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('ReferenceGroupCtrl.referenceGroup.reference_group', referenceGroup.reference_group);
    FU.input('ReferenceGroupCtrl.referenceGroup.text', referenceGroup.text);
    FU.input('ReferenceGroupCtrl.referenceGroup.position', referenceGroup.position);

    // select a section_bilan_id
    FU.select('ReferenceGroupCtrl.referenceGroup.section_bilan_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an referenceGroup', function () {

    element(by.id('referenceGroup-upd-' + referenceGroupRank )).click();
    // modify the referenceGroup reference_group
    FU.input('ReferenceGroupCtrl.referenceGroup.reference_group', 'RG');

    // modify the referenceGroup text
    FU.input('ReferenceGroupCtrl.referenceGroup.text', 'Updated');

    element(by.id('change_referenceGroup')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-referenceGroup')).click();

    // the following fields should be required
    FU.validation.error('ReferenceGroupCtrl.referenceGroup.reference_group');
    FU.validation.error('ReferenceGroupCtrl.referenceGroup.text');
    FU.validation.error('ReferenceGroupCtrl.referenceGroup.position');
    FU.validation.error('ReferenceGroupCtrl.referenceGroup.section_bilan_id');
  });

  it('successfully delete a ReferenceGroup', function () {
    element(by.id('referenceGroup-del-' + referenceGroupRank )).click();

    // click the alert asking for permission
    browser.switchTo().alert().accept();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });

});
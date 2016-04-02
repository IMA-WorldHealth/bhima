/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Section resultats Module', function () {
  'use strict';

  var path = '#/section_resultat';

  var sectionResultat = {
    text : 'A Special Section Result',
    position : 3,
    is_charge : 0 
  };

  var sectionResultatRank = 1;


  // navigate to the SectionResultat module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new SectionResultat', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('sectionResultatCtrl.sectionResultat.text', sectionResultat.text);
    FU.radio('sectionResultatCtrl.sectionResultat.is_charge', sectionResultat.is_charge);
    FU.input('sectionResultatCtrl.sectionResultat.position', sectionResultat.position);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an sectionResultat', function () {

    element(by.id('sectionResultat-upd-' + sectionResultatRank )).click();
    // modify the sectionResultat text
    FU.input('sectionResultatCtrl.sectionResultat.text', 'Updated');
    // modify the sectionResultat Is Charge
    FU.radio('sectionResultatCtrl.sectionResultat.is_charge', 1);

    element(by.id('change_sectionResultat')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-sectionResultat')).click();

    // the following fields should be required
    FU.validation.error('sectionResultatCtrl.sectionResultat.text');
    FU.validation.error('sectionResultatCtrl.sectionResultat.position');
    FU.validation.error('sectionResultatCtrl.sectionResultat.is_charge');
  });

  it('successfully delete a SectionResultat', function () {
    element(by.id('sectionResultat-del-' + sectionResultatRank )).click();

    // click the alert asking for permission
    browser.switchTo().alert().accept();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });

});

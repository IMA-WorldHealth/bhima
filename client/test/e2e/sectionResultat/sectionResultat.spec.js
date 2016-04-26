/* global element, by, inject, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Section Resultats Module', function () {
  'use strict';

  const path = '#/section_resultat';
  before(() => browser.get(path));

  const sectionResultat = {
    text : 'A Special Section Result',
    position : 3,
    is_charge : 0
  };

  const sectionResultatRank = 1;

  it('successfully creates a new SectionResultat', function () {

    // switch to the create form
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

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-sectionResultat')).click();

    // the following fields should be required
    FU.validation.error('sectionResultatCtrl.sectionResultat.text');
    FU.validation.error('sectionResultatCtrl.sectionResultat.position');
    FU.validation.error('sectionResultatCtrl.sectionResultat.is_charge');
  });

  it('successfully delete a SectionResultat', function () {
    element(by.id('sectionResultat-del-' + sectionResultatRank )).click();

    // click the alert asking for permission
    element(by.id('confirm_modal')).click();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });
});

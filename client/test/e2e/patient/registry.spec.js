/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

helpers.configure(chai);

describe('Patient Registry UI Grid ', function () {
  'use strict';

  var paramResearch = {
    name : 'Mock',
    name1 : 'Patient',
    dateRegistrationFrom : new Date('2015-01-01'),
    dateRegistrationTo : new Date('2015-04-01'),
    dateBirthFrom : new Date('2016-05-01'),
    dateBirthTo : new Date('2016-05-16'),
    dateBirthFrom2 : new Date('1960-06-30'),
    dateBirthTo2 : new Date('2016-05-16')    
  };

  var grid = element(by.id('patient-registry'));

  const path = '#/patients/registry';
  before(() => helpers.navigate(path));

  it('grid should have 3 visible rows', function () {
    var defaultVisibleRowNumber = 3;

    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(defaultVisibleRowNumber);
  });

  it('Search patient with the Name The Grid should be have 1 visible rows', function () {
    FU.buttons.search();
    FU.input('ModalCtrl.patient.name', paramResearch.name);

    // submit the page to the server
    FU.buttons.submit();

    // The Grid should be have 1 visible rows
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(1);
  });


  it('Search patient with the Sex and Name, the grid should have 2 visible rows', function () {
    FU.buttons.search();
    FU.input('ModalCtrl.patient.name', paramResearch.name1);

    // set the gender of the patient
    element(by.id('male')).click();
    
    // submit the page to the server
    FU.buttons.submit();

    // The Grid should be have 3 visibles rows
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(3);
  });

  it('Search patient with the Name and Registration Date and the grid should have 1 visible row ', function () {
    FU.buttons.search();
    FU.input('ModalCtrl.patient.name', paramResearch.name1);
    element(by.id('week')).click();
    
    // submit the page to the server
    FU.buttons.submit();
    // The Grid should be have 1 visible rows
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(1);
  });

  it('Search patient with the Sex and Registration Date and the grid should be empty', function () {
    FU.buttons.search();
    element(by.id('year')).click();
    // set the gender of the patient
    element(by.id('female')).click();
    
    // submit the page to the server
    FU.buttons.submit();
    // The Grid should be have 0 visible rows
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(0);
  });

  it('Search patient with the Registration Date and Registration date of birth and the grid should be empty', function () {
    FU.buttons.search();

    components.dateEditor.set(paramResearch.dateRegistrationFrom, 'date-registration-from', '.bhima-title');
    components.dateEditor.set(paramResearch.dateRegistrationTo, 'date-registration-to', '.bhima-title');
    components.dateEditor.set(paramResearch.dateBirthFrom, 'date-birth-from', '.bhima-title');
    components.dateEditor.set(paramResearch.dateBirthTo, 'date-birth-to', '.bhima-title');
    
    // submit the page to the server
    FU.buttons.submit();
    // The Grid should be have 0 visible rows
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(0);
  });

  it('Search patient with the Date of Birth and Sex. the grid should be empty, the grid should have 3 visibles row ', function () {
    FU.buttons.search();
    // set the gender of the patient
    element(by.id('male')).click();

    components.dateEditor.set(paramResearch.dateBirthFrom2, 'date-birth-from', '.bhima-title');
    components.dateEditor.set(paramResearch.dateBirthTo2, 'date-birth-to', '.bhima-title');
    
    // submit the page to the server
    FU.buttons.submit();
    // The Grid should be have # visible rows
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(3);
  });

});

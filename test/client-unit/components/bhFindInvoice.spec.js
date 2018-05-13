/* eslint no-unused-expressions:off */
/* global inject, expect, chai */

describe('bhFindInvoice', bhFindInvoiceTests);

function bhFindInvoiceTests() {
  const patient = {
    uuid              : '234c51ae-efcc-4238-98c6-f402bfb39866',
    reference         : 'TPA17',
    dob               : '1993-04-25T23:00:00.000Z',
    first_name        : 'Brandon',
    middle_name       : 'Hope',
    last_name         : 'Spike',
    registration_date : '2018-05-10T23:00:000Z',
    sex               : 'F',
    invoice_reference : 'IV.TPA.001',
  };

  const template = `
    <bh-find-invoice
      patient-uuid="patientUuid"
      on-search-complete="callback(record)">
    </bh-find-invoice>
  `;

  // make sure the modules are correctly loaded.
  beforeEach(module(
    'pascalprecht.translate',
    'ngStorage',
    'ui.bootstrap',
    'angularMoment',
    'tmh.dynamicLocale',
    'bhima.services',
    'bhima.components',
    'bhima.constants',
    'templates',
  ));

  let $scope;
  let $compile;
  let $controller;
  let $httpBackend;
  let element;

  // inject dependencies
  beforeEach(inject((_$rootScope_, _$compile_, _$httpBackend_) => {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $httpBackend = _$httpBackend_;

    element = angular.element(template);
    element = $compile(element)($scope);

    $scope.patientUuid = '234c51ae-efcc-4238-98c6-f402bfb39866';
    $scope.callback = chai.spy();
    $scope.$digest();
  }));

  // make sure $httpBackend is clean after each test completes
  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('#bhFindInvoice component exists and it is compiled', () => {
    const input = element.find('#search-input');
    expect(input.length).to.equal(1);

    const button = element.find('#search-button');
    expect(button.length).to.equal(1);
  });

  it('Run the search method when the ENTER key is pressed', () => {
    const ENTER_KEY = 13;
    const FormController = $scope.$$childTail.FindInvoiceForm || {};

    // the component controller
    $controller = $scope.$$childTail.$ctrl;
    $controller.search = chai.spy();

    // insert the invoice reference into the input box
    setInput(patient.invoice_reference);

    // all these are not the ENTER key
    $controller.onKeyPress({ keyCode : 64 }, FormController);
    $controller.onKeyPress({ keyCode : 0 }, FormController);
    expect($controller.search).to.have.not.been.called();

    // when the ENTER key is pressed, submit should be called
    $controller.onKeyPress({ keyCode : ENTER_KEY, preventDefault : angular.noop }, FormController);
    expect($controller.search).to.have.been.called();
  });

  it('Run the search method when click on the search button', () => {
    // the component controller
    $controller = $scope.$$childTail.$ctrl;
    $controller.search = chai.spy();

    // insert the invoice reference into the input box
    setInput(patient.invoice_reference);
    expect($controller.search).to.have.not.been.called();

    // click on search button
    clickOnSearch();
    expect($controller.search).to.have.been.called();
  });

  function setInput(value) {
    const input = element.find('#search-input');
    const ngModel = angular.element(input).controller('ngModel');
    ngModel.$setViewValue(value);
    $scope.$digest();
  }

  function clickOnSearch() {
    const btn = element.find('#search-button');
    btn.click();
    $scope.$digest();
  }
}

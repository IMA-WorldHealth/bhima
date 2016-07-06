/* jshint expr: true */
/* global inject, expect, chai */

describe('bhFindPatient', function () {
  'use strict';

  const template = `
    <bh-find-patient on-search-complete="onSearchComplete">
    </bh-find-patient>
  `;

  // test patient to search for
  const patient = {
    uuid: '234c51ae-efcc-4238-98c6-f402bfb39866',
    reference:'TPA1',
    dob: '1990-03-31T23:00:00.000Z',
    first_name: 'Gorgia',
    middle_name: 'Faith',
    last_name: 'Miller',
    registration_date : '2015-11-26T22:23:003Z',
  };

  let $scope, $compile, $httpBackend;
  let element, controller, bindings;

  beforeEach(module('pascalprecht.translate', 'ngStorage', 'angularMoment', 'ui.bootstrap', 'bhima.services', 'bhima.components', 'templates'));

  // component setup
  beforeEach(inject((_$rootScope_, _$compile_, _$httpBackend_, _$componentController_) => {

    // setup initial imports
    $scope = _$rootScope_.$new();
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;

    // bindings refreshed every time
    bindings = {
      onSearchComplete : chai.spy(),
    };

    // compile the element and grab it's controller
    element = $compile(angular.element(template))($scope);
    controller = _$componentController_('bhFindPatient', {
      $scope : $scope,
    }, bindings);

    // trigger a digest
    $scope.$digest();
  }));

  // make sure $httpBackend is clean after each test completes
  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('automatically binds the API to a provided binding', () => {
    console.log('[element]', element);
    console.log('[controller]', controller);
    console.log('[bindings]', bindings);
  });

  it.skip('finds a patient by id', () => {

    // fake array of patient responses
    const response = [patient];

    $httpBackend.expect('GET', '/patients/search?limit=1&reference=TPA1')
      .respond(200, response);

    //  spy on the search complete callback
    $scope.onSearchComplete = chai.spy();
    $scope.$digest();

    // open the dropdown menu
    const toggle = angular.element(element.find('[data-find-patient-dropdown-toggle]'));
    toggle.triggerHandler('click');
    $scope.$apply();

    // click the "findById" dropdown option
    const li = angular.element(element.find('[data-find-patient-option="FORM.LABELS.PATIENT_ID"]'));
    li.triggerHandler('click');
    $scope.$apply();

    // make sure we have selected the label
    expect($scope.$ctrl.selected.label).to.equal('FORM.LABELS.PATIENT_ID');

    const input = angular.element(element.find('input'));
    input.val('TPA1').triggerHandler('input');
    $scope.$apply();

    // make sure we actually typed something into the input
    expect($scope.$ctrl.idInput).to.equal('TPA1');

    // click the find button to trigger an $http request
    const button = angular.element(element.find('[data-find-patient-submit]'));
    button.triggerHandler('click');
    $scope.$apply();

    $scope.$digest();

    // flush the requests
    $httpBackend.flush();

    // assert that the onSearchComplete was called with this data
    expect($scope.onSearchComplete).to.have.been.called.with(response);
  });

  it.skip('finds a patient by name', () => {

    // fake array of patient responses
    const response = [patient];

    $httpBackend.expect('GET', '/patients/search?limit=10&reference=TPA1')
      .respond(response);
  });

  it('allows the reset method to reset the component');

  it('suppressReset does not allow the reset method to fire');

  it('exposes an API to allow for resets');

  it('performs form validation on HTTP errors');
});

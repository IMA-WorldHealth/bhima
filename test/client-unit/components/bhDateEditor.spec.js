/* eslint no-unused-expressions:off */
/* global inject, expect, chai */

describe('bhDateEditor', bhDateEditorTests);

function bhDateEditorTests() {
  const template = `
    <bh-date-editor date-value="date" on-change="callback(date)">
    </bh-date-editor>
  `;

  // OPTIONS
  const templateWithOptions = `
    <bh-date-editor date-value="date" on-change="callback(date)" OPTIONS>
    </bh-date-editor>
  `;

  // make sure the modules are correctly loaded.
  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'ngStorage',
    'pascalprecht.translate',
    'bhima.components',
    'bhima.constants',
    'templates',
    'bhima.mocks'
  ));

  let $scope;
  let $compile;
  let element;
  let Session;
  let Mocks;

  const futureDate = '20120-01-20';
  // utility fns
  const find = (elm, selector) => elm[0].querySelector(selector);

  beforeEach(inject((_$rootScope_, _$compile_, _SessionService_, _MockDataService_) => {
    Session = _SessionService_;
    Mocks = _MockDataService_;

    $compile = _$compile_;
    $scope = _$rootScope_.$new();

    Session.create(Mocks.user(), Mocks.enterprise(), Mocks.project());

    // spy on the onChange callback
    $scope.date = new Date();
    $scope.callback = chai.spy();
    element = $compile(angular.element(template))($scope);

    $scope.$digest();
  }));

  it('the "label" binding should set the label', () => {
    const stub = templateWithOptions
      .replace('OPTIONS', 'label="HELLO_WORLD"');

    element = $compile(angular.element(stub))($scope);
    $scope.$digest();

    const label = find(element, '.control-label');
    expect(label).to.have.text('HELLO_WORLD');
  });

  const clickOnCalendarButton = (elm) => {
    const btn = find(elm, '[data-date-editor] button');
    angular.element(btn).triggerHandler('click');
    $scope.$digest();
  };

  it('calendar button enables the input', () => {
    const input = find(element, '[data-date-editor-input]');
    expect(input).to.have.attr('readonly');

    clickOnCalendarButton(element);

    expect(input).not.to.have.attr('readonly');
  });

  it('changing the date value should fire the onChange event', () => {
    const input = find(element, '[data-date-editor-input]');


    // make sure the input is not readonly
    clickOnCalendarButton(element);

    const ngModel = angular.element(input).controller('ngModel');
    ngModel.$setViewValue('2015-02-03');
    $scope.$digest();

    expect($scope.callback).to.have.been.called();
  });


  it('Should not allow future date to be selected', () => {
    const input = find(element, '[data-date-editor-input]');
    clickOnCalendarButton(element);

    const ngModel = angular.element(input).controller('ngModel');
    ngModel.$setViewValue(futureDate);
    $scope.$digest();
    expect(ngModel.$modelValue).to.be.equal(undefined);

  });

  it('Should allow future date to be selected', () => {

    const stub = templateWithOptions
      .replace('OPTIONS', 'allow-future-date="true"');

    element = $compile(angular.element(stub))($scope);
    $scope.$digest();
    const input = find(element, '[data-date-editor-input]');

    clickOnCalendarButton(element);

    const ngModel = angular.element(input).controller('ngModel');
    ngModel.$setUntouched();
    ngModel.$setViewValue(futureDate);
    element = $compile(angular.element(stub))($scope);
    $scope.$digest();
    expect(ngModel.$modelValue).to.be.equal(futureDate);
  });

}

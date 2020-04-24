/* eslint no-unused-expressions:off */
/* global inject, expect */

describe('bhModalNotify', bhModalNotifyTests);

function bhModalNotifyTests() {
  const template = `
    <bh-modal-notify error="someError"></bh-modal-notify>
  `;

  beforeEach(module('pascalprecht.translate', 'templates', 'bhima.services', 'bhima.components', 'ui.bootstrap'));

  let $scope;
  let $compile;
  let element;

  let $flushPendingTasks;

  const find = (elm, selector) => elm[0].querySelector(selector);

  beforeEach(inject((_$rootScope_, _$compile_, _$flushPendingTasks_) => {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $flushPendingTasks = _$flushPendingTasks_;

    element = $compile(angular.element(template))($scope);

    $scope.$digest();
  }));

  it('is not visible when no error message is defined', () => {
    const icon = find(element, '.fa');
    expect(icon).to.equal(null);
  });

  it('is visible when error property is set on component', () => {
    $scope.someError = {
      data : { code : 404, message : 'NotFound' },
    };

    $scope.$digest();

    const icon = find(element, '.fa');
    const hasTimesClass = angular.element(icon).hasClass('fa-times');
    expect(hasTimesClass).to.equal(true);
  });

  it('removes the error message when fa-times is clicked', () => {
    $scope.someError = {
      data : { code : 404, message : 'NotFound' },
    };

    $scope.$digest();

    // assert that the message is visible
    const icon = find(element, '.fa');
    const hasTimesClass = angular.element(icon).hasClass('fa-times');
    expect(hasTimesClass).to.equal(true);

    // click on the icon
    icon.click();
    $scope.$digest();

    const closeIcon = find(element, '.fa');
    expect(closeIcon).to.equal(null);
  });


  it('removes the error message when the $timeout TTL expires', () => {
    $scope.someError = {
      data : { code : 404, message : 'NotFound' },
    };

    $scope.$digest();

    // assert that the message is visible
    const icon = find(element, '.fa');
    const hasTimesClass = angular.element(icon).hasClass('fa-times');
    expect(hasTimesClass).to.equal(true);

    // flush the TTL
    $flushPendingTasks();
    $scope.$digest();

    const closeIcon = find(element, '.fa');
    expect(closeIcon).to.equal(null);
  });
}

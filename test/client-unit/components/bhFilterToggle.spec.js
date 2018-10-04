/* eslint no-unused-expressions:off */
/* global inject, expect, chai */
describe('bhFilterToggle', bhFilterToggleTests);

function bhFilterToggleTests() {
  let $scope;
  let element;

  const template = `
    <bh-filter-toggle on-toggle="callback()">
    </bh-filter-toggle>
  `;

  beforeEach(module('templates', 'bhima.components'));

  beforeEach(inject(($rootScope, $compile) => {
    $scope = $rootScope.$new();
    element = $compile(angular.element(template))($scope);
    $scope.callback = chai.spy();
    $scope.$digest();
  }));

  const find = (elm, selector) => elm[0].querySelector(selector);

  it('calls the onToggle() callback when clicked', () => {
    const btn = find(element, '[data-method=filter');

    expect($scope.callback).to.not.have.been.called;
    angular.element(btn).click();
    expect($scope.callback).to.have.been.called.once;
  });
}

/* global inject, expect */
describe('(directive) bhInteger', function () {
  'use strict';

  let $scope;
  let form;

  beforeEach(module('bhima.directives'));

  // $complile and $rootScope are injected using angular name based dependency
  // injection
  beforeEach(inject(($compile, $rootScope) => {
    $scope = $rootScope;

    const element = angular.element(`
      <form name="form">
        <input ng-model="models.intValue" name="intValue" bh-integer />
      </form>
    `);

    // initialise models that will be used
    $scope.models = {
      intValue : null
    };

    // compile angular element in with the context of $rootScope
    $compile(element)($scope);
    form = $scope.form;
  }));


  it('validates an integer value', function () {
    const correctIntegerValue = 10;

    form.intValue.$setViewValue(correctIntegerValue);
    $scope.$digest();

    expect($scope.models.intValue).to.equal(correctIntegerValue);
    expect(form.intValue.$valid).to.equal(true);
  });

  it('blocks non integer values (string/decimal)', function () {
    const incorrectDecimalValue = 10.23;
    const incorrectStringValue = 'value';

    form.intValue.$setViewValue(incorrectDecimalValue);
    $scope.$digest();

    expect($scope.models.intValue).to.equal(undefined);
    expect(form.intValue.$valid).to.equal(false);

    form.intValue.$setViewValue(incorrectStringValue);
    $scope.$digest();

    expect($scope.models.intValue).to.equal(undefined);
    expect(form.intValue.$valid).to.equal(false);
  });
});

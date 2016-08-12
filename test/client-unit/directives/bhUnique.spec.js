/* global inject, expect */
describe('(directive) bhUnique', function () {
  'use strict';

  let $scope, form;

  let MockUniqueValidatorService;

  // these represent values that the external $http request would return as
  // already registered in the database
  let existingValues = [100, 110, 120];

  beforeEach(module('bhima.directives', 'bhima.services'));

  beforeEach(module(($provide) => {

    // if this service is used by multiple directives/ controllers the mock
    // can be defined in an external /shared folder
    MockUniqueValidatorService = function ($q) {
      return {
        check : function (validationUrl, viewValue) {
          return existingValues.indexOf(viewValue) > -1 ? $q.reject() : $q.resolve();
        }
      };
    };

    // override the default unique validator service with a mocked service.
    $provide.service('UniqueValidatorService', MockUniqueValidatorService);
  }));

  beforeEach(inject(($compile, $rootScope) => {
    $scope = $rootScope;

    const element = angular.element(`
      <form name="form">
        <input ng-model="models.uniqueValue" name="uniqueValue" bh-unique="/validation_path">
      </form>
    `);

    $scope.models = {
      uniqueValue : null
    };

    $compile(element)($scope);
    form = $scope.form;
  }));

  it('rejects a value that already exists', function () {

    // take the first exisitng value
    let existingValue = existingValues[0];

    form.uniqueValue.$setViewValue(existingValue);
    $scope.$digest();

    expect($scope.models.uniqueValue).to.equal(undefined);
    expect(form.uniqueValue.$valid).to.equal(false);
  });

  it('accepts a value that is unique', function () {
    let uniqueValue = 200;

    form.uniqueValue.$setViewValue(uniqueValue);
    $scope.$digest();

    expect($scope.models.uniqueValue).to.equal(uniqueValue);
    expect(form.uniqueValue.$valid).to.equal(true);
  });
});

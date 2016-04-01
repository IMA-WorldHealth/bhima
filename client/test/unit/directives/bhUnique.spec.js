describe('Unique (async) validation directive', function () { 
  var $scope, form;
  
  var MockUniqueValidatorService;

  // these represent values that the external $http request would return as 
  // already registered in the database
  var existingValues = [100, 110, 120];

  beforeEach(module('bhima.directives', 'bhima.services'));
  
  beforeEach(module(function ($provide) { 

    // if this service is used by multiple directives/ controllers the mock 
    // can be defined in an external /shared folder 
    MockUniqueValidatorService = function ($q) {
      return { 
        check : function (validationUrl, viewValue) { 
          return existingValues.includes(viewValue) ? $q.reject() : $q.resolve();
        }
      };
    };
  
    $provide.service('UniqueValidatorService', MockUniqueValidatorService);
  }));

  beforeEach(inject(function ($compile, $rootScope) { 
    $scope = $rootScope;
    
    var element = angular.element(
      '<form name="form">' + 
      '<input ng-model="models.uniqueValue" name="uniqueValue" bh-unique="/validation_path">' + 
      '</form>'
    );

    $scope.models = { 
      uniqueValue : null
    };

    $compile(element)($scope);
    form = $scope.form;
  }));
  
  it('rejects a value that already exists', function () { 
    
    // take the first exisitng value
    var existingValue = existingValues[0];
    
    form.uniqueValue.$setViewValue(existingValue);
    $scope.$digest();

    expect($scope.models.uniqueValue).to.be.undefined;
    expect(form.uniqueValue.$valid).to.be.false;
  });

  it('accepts a value that is unique', function () { 
    var uniqueValue = 200;
  
    form.uniqueValue.$setViewValue(uniqueValue);
    $scope.$digest();

    expect($scope.models.uniqueValue).to.equal(uniqueValue);
    expect(form.uniqueValue.$valid).to.equal.true;
    
  });
});

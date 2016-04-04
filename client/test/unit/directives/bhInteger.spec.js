describe('Integer validation directive', function () { 
  var $scope;
  var form;

  beforeEach(module('bhima.directives'));
  
  // $complile and $rootScope are injected using angular name based dependency 
  // injection
  beforeEach(inject(function ($compile, $rootScope) { 
    $scope = $rootScope;

    var element = angular.element(
      '<form name="form">' + 
      '<input ng-model="models.intValue" name="intValue" bh-integer />' + 
      '</form>'
    );
    
    // initialise models that will be used
    $scope.models = {
      intValue : null
    };
  
    // compile angular element in with the context of $rootScope
    $compile(element)($scope);
    form = $scope.form;
  }));
  

  it('validates an integer value', function () { 
    var correctIntegerValue = 10;

    form.intValue.$setViewValue(correctIntegerValue);
    $scope.$digest();

    expect($scope.models.intValue).to.equal(correctIntegerValue);
    expect(form.intValue.$valid).to.be.true;
  });

  it('blocks non integer values (string/decimal)', function () { 
    var incorrectDecimalValue = 10.23;
    var incorrectStringValue = 'value';

    form.intValue.$setViewValue(incorrectDecimalValue);
    $scope.$digest();

    expect($scope.models.intValue).to.be.undefined;
    expect(form.intValue.$valid).to.be.false;

    form.intValue.$setViewValue(incorrectStringValue);
    $scope.$digest();

    expect($scope.models.intValue).to.be.undefined;
    expect(form.intValue.$valid).to.be.false;
  });
});

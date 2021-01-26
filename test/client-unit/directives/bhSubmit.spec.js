/* global inject, expect, chai */
describe('(directive) bhSubmit', () => {
  let $scope;
  let element;
  let deferred;

  beforeEach(module('bhima.directives'));
  beforeEach(inject(($q, $rootScope) => {
    $scope = $rootScope;
    deferred = $q.defer();

    $scope.models = {
      formValue : null,
      submit : chai.spy(() => deferred.promise),
    };
  }));

  describe('when the directive is added to a form', () => {
    beforeEach(inject(($compile) => {
      element = angular.element(`
        <form name="form" bh-submit="models.submit(form)" novalidate>
          <input ng-model="models.formValue" name="formValue">
        </form>
      `);

      $compile(element)($scope);
      $scope.$digest();
    }));

    it('sets $loading to false on the FormControl', () => {
      expect($scope.form.$loading).to.equal(false);
    });

    describe('when the form is submitted', () => {
      beforeEach(() => {
        angular.element(element).trigger('submit');
      });

      it('sets $loading to true on the FormControl', () => {
        expect($scope.form.$loading).to.equal(true);
      });

      it('calls the submit callback function', () => {
        expect($scope.models.submit).to.have.been.called.with($scope.form);
      });

      describe('when the submit callback is resolved', () => {
        beforeEach(() => {
          deferred.resolve();
          $scope.$digest();
        });

        it('sets $loading to false on the FormControl', () => {
          expect($scope.form.$loading).to.equal(false);
        });
      });

      describe('when the submit callback is rejected', () => {
        beforeEach(() => {
          deferred.reject(new Error('callback rejected'));
          $scope.$digest();
        });

        it('sets $loading to false on the FormControl', () => {
          expect($scope.form.$loading).to.equal(false);
        });
      });
    });
  });

  describe('when the directive is not added to a form', () => {
    it('the compilation fails', inject(($compile) => {
      element = angular.element(`
        <form name="form">
          <div bh-submit="models.submit(form)">
            <input ng-model="models.formValue" name="formValue">
          </div>
        </form>
      `);

      try {
        $compile(element)($scope);
      } catch (error) {
        expect(error.message).to.have.string('Controller \'form\', '
            + 'required by directive \'bhSubmit\', can\'t be found');
      }
    }));
  });
});

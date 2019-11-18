/* global expect inject */
describe('FillFormService', () => {
  let FillFormService;
  let $httpBackend;

  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'bhima.mocks',
    'ngStorage'
  ));

  beforeEach(inject((_FillFormService_, _$httpBackend_) => {
    FillFormService = _FillFormService_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Verification of the formatting of the contrains defined during the filling of the forms', () => {
    // This is the value to get
    const value = '(FillFormModalCtrl.form.nombre_femme < 25) || (FillFormModalCtrl.containtValue.nombre_femme < 25)';

    const formatedConstaint = FillFormService.formatConstraint('.{nombre_femme} < 25');

    expect(formatedConstaint).to.equal(value);
  });
});

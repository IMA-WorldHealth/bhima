/* global inject, expect */
describe('PasswordMeterService', () => {
  let PasswordMeterService;
  let Session;
  let Mocks;

  // has special characters
  const STRONG_PASSWORD = '8%@Y2kZ!ZzyZ$F#TyKkPPXnRsKoKWfy!2yMo$G6i';

  // only numbers and letters
  const MEDIUM_PASSWORD = 'g3WpJ3qa9nv3xLRgx7WMtuAxX2BmX3PK3IjhgWSF';

  // too short, no variation
  const WEAK_PASSWORD = '123';

  // blank
  const EMPTY_PASSWORD = '';

  beforeEach(module(
    'bhima.services',
    'ngStorage',
    'bhima.mocks',
    'angularMoment',
    'ui.router'
  ));

  beforeEach(inject((_PasswordMeterService_, _SessionService_, _MockDataService_) => {
    PasswordMeterService = _PasswordMeterService_;
    Session = _SessionService_;
    Mocks = _MockDataService_;

    // set up the required properties for the session
    Session.create(Mocks.user(), Mocks.enterprise(), Mocks.project());
    Session.enterprise.settings.enable_password_validation = true;
  }));

  it('#validate() return true for a strong password', () => {
    const validation = PasswordMeterService.validate(STRONG_PASSWORD);
    expect(validation).to.equal(true);
  });

  it('#validate() returns true for a medium strength password', () => {
    const validation = PasswordMeterService.validate(MEDIUM_PASSWORD);
    expect(validation).to.equal(true);
  });

  it('#validate() returns false for a weak password', () => {
    const validation = PasswordMeterService.validate(WEAK_PASSWORD);
    expect(validation).to.equal(false);
  });

  it('#validate() returns false for an empty password', () => {
    const validation = PasswordMeterService.validate(EMPTY_PASSWORD);
    expect(validation).to.equal(false);
  });

  it('#validate() returns true for a weak password if password validation is off in enterprise settings', () => {
    Session.enterprise.settings.enable_password_validation = false;
    const validation = PasswordMeterService.validate(WEAK_PASSWORD);
    expect(validation).to.equal(true);
  });

  it('#validate() returns true for an empty password if password validation is off in enterprise settings', () => {
    Session.enterprise.settings.enable_password_validation = false;
    const validation = PasswordMeterService.validate(EMPTY_PASSWORD);
    expect(validation).to.equal(true);
  });

  it('#counter() returns 4 for a strong password', () => {
    const validation = PasswordMeterService.counter(STRONG_PASSWORD);
    expect(validation).to.equal(4);
  });

  it('#counter() returns 3 for a medium-strength password', () => {
    const validation = PasswordMeterService.counter(MEDIUM_PASSWORD);
    expect(validation).to.equal(3);
  });

  it('#counter() returns 0 for a weak', () => {
    const validation = PasswordMeterService.counter(WEAK_PASSWORD);
    expect(validation).to.equal(0);
  });

  it('#counter() returns -1 for an empty, null, or undefined password', () => {
    let validation = PasswordMeterService.counter(EMPTY_PASSWORD);
    expect(validation).to.equal(-1);

    validation = PasswordMeterService.counter(null);
    expect(validation).to.equal(-1);

    validation = PasswordMeterService.counter(undefined);
    expect(validation).to.equal(-1);
  });
});

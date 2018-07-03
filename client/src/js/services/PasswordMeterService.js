/* eslint no-useless-escape:"off" */
angular.module('bhima.services')
  .service('PasswordMeterService', PasswordMeterService);

PasswordMeterService.$inject = ['SessionService'];

function PasswordMeterService(Session) {
  const service = this;

  service.validate = validate;
  service.counter = counter;

  // A strong password must include special characters
  const strongRegularExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  // A medium strength password includes only numbers and letters
  const mediumRegularExp = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

  // both Strong and Weak password are accepted
  function validate(viewValue) {
    // escape the validation if we don't need to validate passwords
    if (!Session.enterprise || !Session.enterprise.settings.enable_password_validation) {
      return true;
    }

    if (strongRegularExp.test(viewValue)) {
      // Strong password
      return true;
    } else if (mediumRegularExp.test(viewValue)) {
      // Medium password
      return true;
    }

    // Weak password
    return false;
  }

  // this function is used at bhPasswordMeter component
  // it returns a number for a given password strength
  // it strength policy is specified in regulars expressions (strongRegularExp & mediumRegularExp)
  function counter(viewValue) {
    if (!viewValue) {
      return -1;
    }

    if (viewValue.toString().length < 8) {
      // Weak password
      return 0;
    } else if (strongRegularExp.test(viewValue)) {
      // strong password
      return 4;
    } else if (mediumRegularExp.test(viewValue)) {
      // Medium password
      return 3;
    }

    return 0;
  }
}

angular.module('bhima.services')
.service('PasswordMeterService', PasswordMeterService);

function PasswordMeterService() {
  var service = this;
  service.validate = validate;
  service.counter = counter;

  var strongRegularExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  var mediumRegularExp = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

  // both Strong and Weak password are accepted
  function validate(viewValue) {

    if (strongRegularExp.test(viewValue)) {
      // Strong password
      return true;
    }
    else if (mediumRegularExp.test(viewValue)) {
      // Medium password
     return  true;
    }

    // Weak password
    return false;
  }

  // this function is used at bhPasswordMeter component
  // it returns a number for a given password strength
  // it strength policy is specified in regulars expressions (strongRegularExp & mediumRegularExp)
  function counter(viewValue){

    if(!viewValue){
      return -1;
    }

    if (viewValue.toString().length < 8){
      // Weak password
      return 0;
    }
    else if (strongRegularExp.test(viewValue)) {
      // strong password
      return 4;
    }
    else if (mediumRegularExp.test(viewValue)) {
      // Medium password
     return  3;
    }

    return 0;
  }
}
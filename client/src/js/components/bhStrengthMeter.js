angular.module('bhima.components')
.component('bhStrengthMeter', {
  template :
    "<div class='strength-meter'>"+
    " <div class='strength-meter-fill' data-strength='{{$ctrl.counter()}}'></div>"+
    "</div>",
  bindings : {
    password : '<',
  },
  controller: StrengthMeterController,
});

StrengthMeterController.$inject = ['PasswordMeterService'];

function StrengthMeterController(PasswordMeterService){

  var $ctrl = this;
  $ctrl.counter = function () {
    return PasswordMeterService.counter($ctrl.password);
  }
}

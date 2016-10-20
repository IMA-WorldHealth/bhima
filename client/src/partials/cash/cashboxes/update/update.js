angular.module('bhima.controllers')
.controller('CashboxUpdateController', CashboxUpdateController);

CashboxUpdateController.$inject = ['$state', 'NotifyService', 'CashboxService'];

function CashboxUpdateController($state, Notify, Boxes) {
  var vm = this;
  console.log('update controller fired');

  console.log($state);

  vm.submit = submit;

  var CREATE_STATE = "cashboxes.create";

  // temporary method of determining if we're in create state
  var creating = $state.current.name === CREATE_STATE;

  vm.box = {};
  vm.box.type = "1";

  // form submission
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var cashboxId;
    var promise;
    var box = angular.copy(vm.box);


        // box.is_auxiliary = (box.type === 'auxiliary') ?  0 : 1;
    //

    promise = (creating) ?
      Boxes.create(box) :
      Boxes.update(box.id, box);

    return promise
      // .then(function (response) {
        // cashboxId = response.id;

        // return refreshBoxes();
      // })
      .then(function () {

        Notify.success(creating ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS');
        $state.go('cashboxes.list', null, { reload : true});
        // update(cashboxId);
      })
      .catch(Notify.handleError);
  }
}



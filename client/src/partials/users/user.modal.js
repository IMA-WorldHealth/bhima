angular.module('bhima.controllers')
  .controller('UserModalController', UserModalController);

UserModalController.$inject = ['$state', 'ProjectService', 'UserService'];

function UserModalController($state, Projects, Users) {
  var vm = this;

  // the user object that is either edited or created
  vm.user = {};
  vm.isCreating = $state.params.creating;


  //exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.validPassword = validPassword;

  Projects.read().then(function (data) {
    vm.projects = data;
  });

  if(!vm.isCreating){

    Users.read($state.params.id)
      .then(function (user) {
        vm.user = user;
      })
      .catch(function (err){ throw err});
  }

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {

    userForm.$setSubmitted();

    if (userForm.invalid) { return; }
    if (!userForm.$dirty) { return; }

    var promise;
    var messages = {
      'create' : 'FORM.INFO.CREATE_SUCCESS',
      'update' : 'FORM.INFO.UPDATE_SUCCESS',
      'permissions' : 'FORM.INFO.UPDATE_SUCCESS'
    };

    promise = (vm.isCreating)? Users.create(vm.user) : Users.update(vm.user.id, vm.user);
    var msg = (vm.isCreating) ? messages.create : messages.update;

    promise.then(function () {
          $state.go('users.list', null, {reload : true});
          vm.formMessage = { code : msg };
        })
        .catch(function (res) {
          vm.formMessage = res.data;
        });
  }

  function closeModal (){
    $state.go('users.list', null, {reload : false});
  }

  // make sure that the passwords exist and match.
  function validPassword() {
    return vm.user.password &&
      vm.user.passwordVerify &&
      vm.user.password.length &&
      vm.user.passwordVerify.length &&
      vm.user.password === vm.user.passwordVerify;
  }
}



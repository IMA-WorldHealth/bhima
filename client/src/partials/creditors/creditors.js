angular.module('bhima.controllers')
.controller('SupplierController', SupplierController);

SupplierController.$inject = [
  '$scope', '$translate', 'validate', 'connect',
  'appstate', 'uuid', 'messenger'
];

function SupplierController($scope, $translate, validate, connect, appstate, uuid, messenger) {
  var dependencies = {}, session = $scope.session = {}, route = {};

  dependencies.creditGroup = {
    query : {
      tables : {
        creditor_group : { columns : ['enterprise_id', 'uuid', 'name', 'account_id', 'locked'] }
      }
    }
  };

  dependencies.supplier = {
    query : {
      identifier : 'uuid',
      tables : {
        supplier : { columns : ['uuid', 'name', 'phone', 'locked', 'email', 'international', 'creditor_uuid', 'address_1', 'address_2', 'fax', 'note'] },
        creditor : { columns : ['group_uuid'] }
      },
      join : ['supplier.creditor_uuid=creditor.uuid']
    }
  };

  route = $scope.route = {
    create : {
      header : 'SUPPLIER.CREATE',
      button : 'SUPPLIER.CREATE_SUPPLIER',
      method : registerSupplier
    },
    edit : {
      header : 'SUPPLIER.EDIT',
      button : 'SUPPLIER.EDIT_SUPPLIER',
      method : submitEdit
    }
  };

  // Request enterprise information 
  appstate.register('enterprise', function (enterprise) { 
    session.enterprise = enterprise;
    
    // Request project information - initialise page
    appstate.register('project', initialise);
  });
  
  function initialise(project) {
    session.project = project;
    session.state = route.create;
    session.location = {};
    
    // Request data from server
    validate.process(dependencies).then(settupForm);
  }

  function settupForm(model) {
    angular.extend($scope, model);
  }

  function createSupplier() {
    session.supplier = {};
    session.creditor = {};
    
    session.state = route.create;
    session.selected = null;

 }

  function editSupplier(uuid) {

    // Verify there is nothing in the current session

    assignSupplier($scope.supplier.get(uuid));
    session.state = route.edit;
    session.selected = uuid;
  }

  function assignSupplier(supplier) {
    session.supplier = supplier;
    session.creditor = { group_uuid : supplier.group_uuid };      
  }

  function registerSupplier() {
    var creditor_uuid = uuid();

    // Assign uuid and note to creditor
    session.creditor.uuid = creditor_uuid;
    session.creditor.text = $translate.instant('SUPPLIER.SUPPLIER') + '[' + session.supplier.name + ']';

    // Assign uuid, location and creditor id to supplier
    session.supplier.uuid = uuid();
    session.supplier.creditor_uuid = creditor_uuid;
  
    requestCreditor(session.creditor)
    .then(writeSupplier(session.supplier))
    .then(handleRegistration)
    .catch(handleError);
  }

  function requestCreditor(creditor) {
    return connect.post('creditor', [creditor]);
  }

  function writeSupplier(supplier) {  
    //supplier.international = supplier.international? 1 : 0;
    return connect.post('supplier', [supplier]);
  }

  function requestSupplier(supplier) {
    //supplier.international = supplier.international? 1 : 0;
    return connect.put('supplier', [supplier], ['uuid']);
  }

  function handleRegistration() {
    messenger.success($translate.instant('SUPPLIER.REGISTRATION_SUCCESS'));
    $scope.supplier.post(session.supplier);
    createSupplier();
  }

  function submitEdit() {

    //FIXME hack - remove group_uuid from supplier
    delete session.supplier.group_uuid;

    requestSupplier(session.supplier)
    .then(requestCreditorUpdate(session.supplier))
    .then(handleRegistration)
    .catch(handleError);
  }

  function requestCreditorUpdate() {
    dependencies.creditor = {
      query : {
        tables : {
          creditor : { columns : ['uuid', 'group_uuid'] }
        },
        where : ['creditor.uuid=' + session.supplier.creditor_uuid]
      },
    };

    return validate.process(dependencies, ['creditor'])
    .then(function (model) {
     
      // Assuming one supplier will only ever have one creditor account
      var creditor = model.creditor.data[0];
      creditor.group_uuid = session.creditor.group_uuid;
  
      // FIXME hack
      session.supplier.group_uuid = creditor.group_uuid;
      return connect.put('creditor', [creditor], ['uuid']);
    });
  }

  function handleError() {
    // TODO reverse previous incorrect transactions
    messenger.danger($translate.instant('SUPPLIER.REGISTRATION_FAILURE'));
  }

  $scope.registerSupplier = registerSupplier;
  $scope.editSupplier = editSupplier;
  $scope.createSupplier = createSupplier;

  $scope.selectVillage = function selectVillage(village) { 
    session.location.village = village;
  };
}

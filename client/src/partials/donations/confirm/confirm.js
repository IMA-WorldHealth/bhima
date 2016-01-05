angular.module('bhima.controllers')
.controller('ConfirmDonationController', ConfirmDonationController);

ConfirmDonationController.$inject = [
  '$scope', '$q', '$http', 'validate', 'connect', '$location', 'uuid', 'SessionService'
];

function ConfirmDonationController($scope, $q, $http, validate, connect, $location, uuid, Session) {
  var vm = this,
      dependencies = {},
      session = $scope.session = {};

  dependencies.donations = {
    query : {
      identifier : 'uuid',
      tables : {
        donations     : {columns : ['uuid', 'date', 'is_received', 'confirmed_by']},
        donor         : {columns : ['id', 'name']},
        employee      : {columns : ['prenom', 'name::nom_employee', 'postnom']}
      },
      join : ['donor.id=donations.donor_id', 'donations.employee_id=employee.id'],
      where : ['donations.is_received=1', 'AND', 'donations.is_confirmed=0']
    }
  };

  $scope.project = Session.project;
  $scope.user = Session.user;

  function initialise(model) {
    angular.extend($scope, model);
  }

  function confirmDonation(donationId) {
    session.selected = $scope.donations.get(donationId);
    loadDetails(donationId);
  }

  function loadDetails(donationId) {
    dependencies.donationDetails = {
      query : {
        identifier : 'inventory_uuid',
        tables : {
          donations     : {columns : ['uuid', 'donor_id', 'employee_id', 'date', 'is_received']},
          donation_item : {columns : ['uuid::donationItemUuid']},
          stock         : {columns : ['inventory_uuid', 'tracking_number', 'purchase_order_uuid', 'quantity::stockQuantity', 'lot_number', 'entry_date']},
          purchase      : {columns : ['uuid::purchaseUuid', 'cost', 'currency_id', 'note']},
          purchase_item : {columns : ['uuid::purchaseItemUuid', 'unit_price', 'quantity']}
        },
        join : [
          'donations.uuid=donation_item.donation_uuid',
          'donation_item.tracking_number=stock.tracking_number',
          'stock.purchase_order_uuid=purchase.uuid',
          'stock.inventory_uuid=purchase_item.inventory_uuid',
          'purchase.uuid=purchase_item.purchase_uuid',
        ],
        where : ['donations.uuid=' + donationId]
      }
    };

    validate.refresh(dependencies, ['donationDetails'])
    .then(initialise);
  }

  function confirmReception() {
    writeToJournal()
    .then(updateDonation)
    .then(generateDocument)
    .then(resetSelected)
    .catch(handleError);
  }

  function updatePurchase () {
    var purchase = {
      uuid         : session.selected.uuid,
      confirmed    : 1,
      confirmed_by : $scope.user.id,
      paid         : 1
    };
    return connect.put('purchase', [purchase], ['uuid']);
  }

  function updateDonation () {
    var donation = {
      uuid         : session.selected.uuid,
      is_confirmed : 1,
      confirmed_by : $scope.user.id
    };
    return connect.put('donations', [donation], ['uuid']);
  }

  function writeToJournal() {
    var document_id = uuid();
    var synthese = [];

    // Distinct inventory
    var unique = {};
    var distinctInventory = [];
    $scope.donationDetails.data.forEach(function (x) {
      if (!unique[x.inventory_uuid]) {
        distinctInventory.push(x);
        unique[x.inventory_uuid] = true;
      }
    });
    // End Distinct inventory

    // Grouping by lot
    var inventoryByLot = [];
    distinctInventory.forEach(function (x) {
      var lot = [];
      lot = $scope.donationDetails.data.filter(function (item) {
        return item.inventory_uuid === x.inventory_uuid;
      });
      inventoryByLot.push({
        inventory_uuid : x.inventory_uuid,
        purchase_price : x.unit_price,
        currency_id    : x.currency_id,
        quantity       : x.quantity,
        lots : lot
      });
    });
    // End Grouping by lot

    inventoryByLot.forEach(function (item) {
      var donation = { uuid : item.lots[0].uuid },
          inventory_lots = [];

      item.lots.forEach(function (lot) {
        inventory_lots.push(lot.tracking_number);
      });

      synthese.push({
        movement         : { document_id : document_id },
        inventory_uuid   : item.inventory_uuid,
        donation         : donation,
        tracking_numbers : inventory_lots,
        quantity         : item.quantity,
        purchase_price   : item.purchase_price,
        currency_id      : item.currency_id,
        project_id       : $scope.project.id
      });

    });

    return $q.all(synthese.map(function (postingEntry) {
      // REM : Stock Account (3) in Debit and Donation Account (?) in credit
      // OBJECTIF : Ecrire pour chaque inventory de la donation comme une transaction dans le journal
      return $http.post('posting_donation/', postingEntry);
    }));
  }

  function paymentSuccess(result) {
    var purchase = {
      uuid : session.selected.uuid,
      paid : 1
    };
    return connect.put('purchase', [purchase], ['uuid']);
  }

  function generateDocument(res) {
    $location.path('/invoice/confirm_donation/' + session.selected.uuid);
  }

  function handleError(error) {
    console.log(error);
  }

  function resetSelected() {
    session.selected = null;
    validate.refresh(dependencies, ['donations'])
    .then(initialise);
  }

  $scope.confirmDonation = confirmDonation;
  $scope.confirmReception = confirmReception;
  $scope.resetSelected = resetSelected;

  // start the module up
  validate.process(dependencies)
  .then(initialise);
}

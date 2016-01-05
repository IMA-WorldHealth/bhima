angular.module('bhima.controllers')
.controller('DepotLossController', DepotLossController);

DepotLossController.$inject = [
  '$routeParams', '$q', '$http', '$location', 'DepotService',
  'InventoryService', 'SessionService', 'uuid'
];

function DepotLossController($routeParams, $q, $http, $location, Depots, Inventory, Session, uuid) {
  var vm = this;

  // bind variables
  vm.depotId = $routeParams.depotId;
  vm.date = new Date();
  vm.user = Session.user;
  vm.enterprise = Session.enterprise;
  vm.totals = { cost : 0 };
  vm.queue = [];

  // bind methods
  vm.addInventoryItem         = addInventoryItem;
  vm.removeInventoryItem      = removeInventoryItem;
  vm.selectInventoryItem      = selectInventoryItem;
  vm.totalInventoryItem       = totalInventoryItem;
  vm.addLot                   = addLot;
  vm.removeLot                = removeLot;
  vm.submit                   = submit;
  vm.selectLot                = selectLot;

  initialise();
  /* ------------------------------------------------------------------------ */

  // generic error handler
  function handler(error) {
    console.log(error);
  }

  // removes an inventory item from the table
  function removeInventoryItem(idx) {
    var item = vm.queue.splice(idx, 1)[0];

    // add the item back into the inventory
    vm.inventory.push(item.inventoryItem);

    totalAllInventoryItems();
  }

  //
  function addInventoryItem() {
    vm.queue.push({});
  }

  // called to initialize the module
  function initialise() {

    // add the first item to the queue
    addInventoryItem();

    // send HTTP request
    $q.all([
      Depots.getDepots(vm.depotId),
      Depots.getAvailableStock(vm.depotId),
      Inventory.getInventoryItems()
    ])
    .then(function (responses) {
      var lots, inventory;

      vm.depot = responses[0];
      lots = responses[1];
      inventory = responses[2];

      // associate inventory items with lots
      inventory.forEach(function (i) {

        var founds = lots.filter(function (s) {
          return s.code === i.code;
        });

        i.lots = founds.map(function (s) {
          return {
            lot_number      : s.lot_number,
            fmtLabel        : s.lot_number + '  [' + s.quantity + ']',
            quantity        : s.quantity,
            tracking_number : s.tracking_number,
            unit_price      : s.unit_price,
            expiration_date : new Date(Date.parse(s.expiration_date)),
            used : false
          };
        });

        // create a nicely formatted label for the typeahead
        i.fmtLabel = i.code + ' ' + i.label;
      });

     // expose to view
      vm.inventory = inventory;
    })
    .catch(handler)
    .finally(function () { vm.loading = false; });
  }

  // runs down the inventory items, calculating the total costs
  function totalAllInventoryItems() {
    vm.totals.cost = vm.queue.reduce(function (accumulator, row) {
      return accumulator + (row.totalCost || 0);
    }, 0);
  }

  // total a single inventory item, changing the total cost associated with it
  function totalInventoryItem(row) {
    row.totalCost = row.staged.reduce(function (accumulator, item) {
      var hasData = item && item.unit_price && item.quantity;
      return accumulator + (hasData ? (item.unit_price * item.quantity) : 0);
    }, 0);

    // run totaller on all inventory items on any change
    totalAllInventoryItems();
  }

  // clears the queue row at a given index in the queue  This is done to ensure
  // when a user changes an inventory item, all the other values in the row are
  // cleared, and we do not submit false information.
  function selectInventoryItem(row) {

    // remove the inventory item from the typeahead so you cannot find it again
    vm.inventory = vm.inventory.filter(function (i) {
      return i.code !== row.inventoryItem.code;
    });

    // push the first lot onto the queue
    row.staged = [{}];

    // Since we changed the values outside of angular's detection, re-run the
    // totalling function to calculate the correct totals.
    totalInventoryItem(row);
  }

  // adds a lot to a row
  function addLot(row) {
    row.staged.push({});
  }

  // removes a specific lot from the row
  function removeLot(row, idx) {
    row.staged.splice(idx, 1);
    filterAvailableLots(row);
    totalInventoryItem(row);
  }

  // select an inventory item
  function selectLot(item, lot, row) {
    item.tracking_number = lot.tracking_number;
    item.maxQuantity = lot.quantity;
    item.label = lot.fmtLabel;
    item.unit_price = lot.unit_price;

    filterAvailableLots(row);
  }

  // filters lots
  function filterAvailableLots(row) {

    // ids used so far
    var usedIds = row.staged.map(function (s) {
      return s.tracking_number;
    });

    // loop through lots and toggle the used parameter
    row.inventoryItem.lots.forEach(function (l) {
      l.used = (usedIds.indexOf(l.tracking_number) !== -1);
    });
  }

  // validate and submit the form
  function submit(invalid) {

    // NOTE -- angular validation will take care of all the missing and UI
    // validation portions.  If the form is invalid, simply return the function
    if (invalid) { return; }

    // do not submit a form with no data in it.
    if (vm.queue.length < 1) { return; }

    // we need to flatten the queue data structure into a flat map of
    // tracking numbers and quantities for distribution
    var data = vm.queue.reduce(function (array, row) {

      // loop through the staged lots and assign UUIDs
      var distributions = row.staged.map(function (item) {
        return {
          id:              uuid(),
          date:            vm.date,
          tracking_number: item.tracking_number,
          quantity:        item.quantity,
          unit_price:      item.unit_price
        };
      });

      return array.concat(distributions);
    }, []);

    $http.post('/depots/' + vm.depotId + '/distributions', {
      type : 'loss',
      data :  data
    })
    .then(function (response) {
      $location.url('/invoice/loss/' + response.data);
    })
    .catch(handler);
  }
}

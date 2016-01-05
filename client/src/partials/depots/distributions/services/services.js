angular.module('bhima.controllers')
.controller('StockServiceDistributionsController', StockServiceDistributionsController);

StockServiceDistributionsController.$inject = [
  '$routeParams', '$http', '$q', '$location', 'SessionService', 'DepotService', 'InventoryService'
];

/**
* Responsible for distributing medications to services throughout the hospital.
* This entails the following steps:
*   1) Get the available lots in a particular depot
*   2) Recommend lots by increasing expiration date (soonest is first)
*   3) Select quantities from each lot
*   4) Distribute the drugs to an employee representing the service
*   5a) Print a receipt/generate documentation
*   5b) Decrease the stock inventory account in the journal by debiting the
*       stock account and crediting the cost of goods sold account.
*
* @constructor
* @class StockServiceDistributionsController
*/
function StockServiceDistributionsController($routeParams, $http, $q, $location, Session, Depots, Inventory) {
  var vm = this;

  // view data
  vm.uuid = $routeParams.depotId;
  vm.total   = 0;
  vm.queue = [{}];
  vm.metadata = { date : new Date() };
  vm.currencyId = Session.enterprise.currency_id;

  // exposed functions
  vm.dequeue    = dequeue;
  vm.enqueue    = enqueue;
  vm.use        = use;
  vm.retotal    = retotal;
  vm.submit     = submit;
  vm.filterAggregateQuantities = filterAggregateQuantities;

  // start the module up
  startup();

  /* ------------------------------------------------------------------------ */

  // get all the services supported by the enterprise
  function getServices() {
    return $http.get('/services')
    .then(function (response) { return response.data; });
  }

  // copy data from inventory onto queue row
  function use(row, item) {

    // toggle visibility in the inventory typeahead
    item.used = true;

    // cache selected inventory metadata on row
    row.price           = item.price;
    row.label           = item.label;
    row.lots            = item.lots;
    row.unit            = item.unit;
    row.group           = item.groupName;
    row.tracking_number = item.tracking_number;
    row.maxQuantity     = item.maxQuantity;
  }

  // removes an item from the queue at a given index
  function dequeue(idx) {
    var item, i = 0,
        removed = vm.queue.splice(idx, 1)[0];

    // ensure the inventory item has actually been selected
    if (!removed.code) { return; }

    // linear search: find the inventory item that we just dequeued by linearly
    // searching through the inventory for a matching code
    do {
      item = vm.inventory[i++];
    } while (removed.code !== item.code);

    // set the item to be visible again in the typeahead
    item.used = false;
  }

  // adds a new row to the queue
  function enqueue() {
    vm.queue.push({});
  }

  // calculate the totals when quantities change
  function retotal() {
    vm.total = vm.queue.reduce(function (sum, row) {
      return sum + (row.price * row.quantity);
    }, 0);
  }

  // we need to extract the amount distributed from each lot
  function distributeAmongLots(quantity, item) {
    var lot, q,
        distributions = [],
        i = 0;

    while (quantity > 0) {
      lot = item.lots[i++];

      // q is the amount we will consume.distribute from this lot
      q = (lot.quantity < quantity) ? quantity - lot.quantity : quantity;

      // add to list of distributions
      distributions.push({
        service_id      : vm.service.id,
        unit_price      : item.price,
        depot_uuid      : vm.uuid,
        date            : vm.metadata.date,
        tracking_number : lot.tracking_number,
        quantity        : q
      });

      // decrease quantity needed by q
      quantity -= q;
    }

    return distributions;
  }

  // triggered to submit the form
  // NOTE -- we are guaranteed to have "valid" data, since the button will be
  // disabled until it passes angular's validation checks.  Further validation
  // will be done on the server.
  function submit() {
    var data;

    // make a single flat array of distributions
    data = vm.queue.reduce(function (array, item) {
      return array.concat(distributeAmongLots(item.quantity, item));
    }, []);

    $http.post('/depots/' + vm.uuid + '/distributions', {
      data : data,
      type : 'service'   // create a service distribution
    })
    .then(function (result) {

      // go to the receipt
      $location.url('/invoice/service_distribution/' + result.data);
    })
    .catch(function (err) {
      console.log('An error occurred:', err);
    });
  }

  // startup the module
  function startup() {
    $q.all([
      getServices(),
      Depots.getDepots(vm.uuid),
      Depots.getAvailableStock(vm.uuid),
      Inventory.getInventoryItems()
    ])
    .then(function (responses) {
      var stock, inventory;

      // destructure responses
      vm.services = responses[0];
      vm.depot    = responses[1];
      stock       = responses[2];
      inventory   = responses[3];

      // we need to associate each stock with the proper inventory item
      // if a particular inventory item does not have lots in this pharmacy,
      // we will assign an empty array as the lots.
      inventory.forEach(function (i) {

        // default: the item has not been selected yet
        i.used = false;

        i.lots = stock.filter(function (s) {
          return s.code === i.code;
        })
        .map(function (s) {
          return {
            lot_number      : s.lot_number,
            quantity        : s.quantity,
            tracking_number : s.tracking_number,
            expiration_date : new Date(Date.parse(s.expiration_date))
          };
        });

        // sum the lots and figure out how much quantity we can distribute of
        // this item
        i.maxQuantity = i.lots.reduce(function (s, lot) {
          return s + lot.quantity;
        }, 0);

        // sort lots in increasing order of expiration date
        i.lots.sort(function (a,b) {
          return a.expiration_date > b.expiration_date ? 1 : -1;
        });

        // aggregate the value (in sorted order) so that we can filter as demanded
        // by the UI
        i.lots.forEach(function (lot, index, lots) {

          // for the first item, the aggregate quantity is the quantity
          // for all others, the aggregate quantity is the previous aggregate quantity
          // plus the current quantity
          lot.aggregateQuantity = (index === 0) ?
            0 :
            lots[index - 1].aggregateQuantity + lots[index - 1].quantity; // quantity up to this one
        });

        // create a nicely formatted label for the typeahead
        i.fmtLabel = i.code + ' ' + i.label;
      });

      // expose inventory to the view
      vm.inventory = inventory;
    });
  }

  // TODO - find a better name
  // Creates a filter for each row, that removes aggregate quantities
  function filterAggregateQuantities(row) {
    return function (lot) {
      return row.quantity > lot.aggregateQuantity;
    };
  }
}

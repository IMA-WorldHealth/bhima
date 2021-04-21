(() => {
  angular.module('bhima.StockMocks', [])
    .service('MockStockDataService', MockStockDataService);

  function MockStockDataService() {
    const service = this;

    service.lots = () => ([{
      uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b123',
      lot : 'A',
      quantity : 50,
      expiration_date : '2019-01-01',
    }, {
      uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b124',
      lot : 'B',
      quantity : 30,
      expiration_date : '2018-12-01',
    }]);

    service.singleInventoryFormStoreData = () => ({
      inventory_uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b3f4',
      unit_cost : 0.5,
      lots : service.lots(),
    });

    service.flatLotsFromSingleInventory = () => ([
      {
        uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b123',
        label : 'A',
        quantity : 50,
        unit_cost : 0.5,
        expiration_date : '2019-01-01',
        inventory_uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b3f4',
      },
      {
        uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b124',
        label : 'B',
        quantity : 30,
        unit_cost : 0.5,
        expiration_date : '2018-12-01',
        inventory_uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b3f4',
      },
    ]);
  }
})();

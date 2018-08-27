/* global inject, expect */

describe.only('StockService', StockServiceTests);

function StockServiceTests() {
  // define modules
  beforeEach(module(
    'bhima.services',
    'bhima.constants',
    'ngStorage',
    'tmh.dynamicLocale',
    'angularMoment',
    'pascalprecht.translate',
  ));

  let Stock;

  // inject dependencies
  beforeEach(inject((_StockService_) => {
    Stock = _StockService_;
  }));

  it('#statusLabelMap() returns the correct stock status label', () => {
    const status = {
      sold_out          : 'STOCK.STATUS.SOLD_OUT',
      in_stock          : 'STOCK.STATUS.IN_STOCK',
      security_reached  : 'STOCK.STATUS.SECURITY',
      minimum_reached   : 'STOCK.STATUS.MINIMUM',
      over_maximum      : 'STOCK.STATUS.OVER_MAX',
    };
    expect(Stock.statusLabelMap('sold_out')).to.be.equal(status.sold_out);
    expect(Stock.statusLabelMap('in_stock')).to.be.equal(status.in_stock);
    expect(Stock.statusLabelMap('security_reached')).to.be.equal(status.security_reached);
    expect(Stock.statusLabelMap('minimum_reached')).to.be.equal(status.minimum_reached);
    expect(Stock.statusLabelMap('over_maximum')).to.be.equal(status.over_maximum);
  });

  it('#processLotsFromStore() returns a flat array of lots from StockForm.store.data', () => {
    const entityUuid = 'xxxe7870-0c8e-47d4-a7a8-a17a9924bxxx';

    const mockStockFormStoreData = [
      {
        inventory_uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b3f4',
        unit_cost : 0.5,
        lots : [
          {
            uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b123', lot : 'A', quantity : 50, expiration_date : '2019-01-01',
          },
          {
            uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b124', lot : 'B', quantity : 30, expiration_date : '2018-12-01',
          },
        ],
      },
    ];

    const expectedLotsArray = [
      {
        uuid : mockStockFormStoreData[0].lots[0].uuid,
        label : mockStockFormStoreData[0].lots[0].lot,
        initial_quantity : mockStockFormStoreData[0].lots[0].quantity,
        quantity : mockStockFormStoreData[0].lots[0].quantity,
        unit_cost : mockStockFormStoreData[0].unit_cost,
        expiration_date : mockStockFormStoreData[0].lots[0].expiration_date,
        inventory_uuid : mockStockFormStoreData[0].inventory_uuid,
        origin_uuid : entityUuid,
      },
      {
        uuid : mockStockFormStoreData[0].lots[1].uuid,
        label : mockStockFormStoreData[0].lots[1].lot,
        initial_quantity : mockStockFormStoreData[0].lots[1].quantity,
        quantity : mockStockFormStoreData[0].lots[1].quantity,
        unit_cost : mockStockFormStoreData[0].unit_cost,
        expiration_date : mockStockFormStoreData[0].lots[1].expiration_date,
        inventory_uuid : mockStockFormStoreData[0].inventory_uuid,
        origin_uuid : entityUuid,
      },
    ];

    const processed = Stock.processLotsFromStore(mockStockFormStoreData, entityUuid);
    expect(processed).to.be.an('array');
    expect(processed.length).to.be.equal(2);

    const [first, second] = processed;
    expect(first).to.be.an('object');
    expect(second).to.be.an('object');
    expect(processed).to.deep.equal(expectedLotsArray);
  });

  it('#uniformSelectedEntity() format the displayName property for a given entity object', () => {
    const entityText = { text : 'Text supposed to be displayName' };
    const entityName = { name : 'Name supposed to be displayName' };
    const entityDisplayName = { display_name : 'Display_Name supposed to be displayName' };

    const uniformText = Stock.uniformSelectedEntity(entityText);
    const uniformName = Stock.uniformSelectedEntity(entityName);
    const uniformDisplayName = Stock.uniformSelectedEntity(entityDisplayName);

    expect(uniformText).to.have.property('displayName', entityText.text);
    expect(uniformName).to.have.property('displayName', entityName.name);
    expect(uniformDisplayName).to.have.property('displayName', entityDisplayName.display_name);
  });

}

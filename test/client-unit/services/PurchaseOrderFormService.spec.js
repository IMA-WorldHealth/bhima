/* global inject, expect, chai */
/* eslint no-unused-expressions:off, no-restricted-properties:off */
describe('PurchaseOrderForm', () => {
  let PurchaseOrderForm;
  let Mocks;
  let Session;
  let httpBackend;
  let $timeout;
  let form;

  // const FC = 1;
  // const USD = 2;
  const EUR = 3;

  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'ui.bootstrap',
    'ui.router',
    'ngStorage',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'bhima.StockMocks',
    'bhima.mocks',
  ));

  beforeEach(inject((
    _PurchaseOrderForm_,
    _MockDataService_,
    _SessionService_,
    $httpBackend,
    _$timeout_,
  ) => {

    PurchaseOrderForm = _PurchaseOrderForm_;
    Mocks = _MockDataService_;
    Session = _SessionService_;
    $timeout = _$timeout_;

    // set up the required properties for the session
    Session.create(Mocks.user(), Mocks.enterprise(), Mocks.project());

    httpBackend = $httpBackend;

    httpBackend.when('GET', '/inventory/metadata/?locked=0')
      .respond(200, Mocks.inventories());
  }));

  beforeEach(() => {
    form = new PurchaseOrderForm('TestKey');

    // Load the inventory
    httpBackend.flush();
  });

  // make sure $http is clean after tests
  afterEach(() => {
    $timeout.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('calls #setup() in the constructor()', () => {
    let setupSpy;

    before(() => {
      setupSpy = chai.spy.on(form, 'setup');
    });

    it('calls #setup() on initialization', () => {
      expect(setupSpy).to.have.been.called;
    });

    it('sets up store.data as an empty array', () => {
      expect(form.store.data).to.be.a('array');
      expect(form.store.data).to.have.length(0);
    });
  });

  it('produces an error when #validate() is called with bad PO items', () => {
    // Add a bad (uninitialized) PO item
    form.addItem();

    // Validate the form (should fail)
    form.validate();
    expect(form._valid).to.be.false;
    expect(form._invalid).to.be.true;
  });

  it('adds an empty item when addItem() is called ', () => {
    // There should be no items before addItem is called
    expect(form.store.data.length).to.equal(0);

    // Add an item and verify that one got added
    form.addItem();
    expect(form.store.data.length).to.equal(1);
  });

  it('deletes an item when when #removeItem() is called', () => {
    // Make sure it is empty to start with
    expect(form.store.data.length).to.equal(0);

    // Create a Purchase Order Item on the form
    const item = form.addItem();
    item.inventory_uuid = form.inventory.available.data[0].uuid;
    form.configureItem(item);

    // Now that we have added the item, the count should be 1
    expect(form.store.data.length).to.equal(1);

    // Remove the item and make sure the count goes back to 0
    form.removeItem(item);
    expect(form.store.data.length).to.equal(0);
  });

  it('sets totals correctly when #digest() is called', () => {

    // Get the UUIDs for a couple of inventory items
    const uuid1 = form.inventory.available.data[0].uuid;
    const uuid2 = form.inventory.available.data[1].uuid;

    // First, verify that the initial cost is 0
    expect(form.details.cost).to.equal(0);

    // Add a PO item to the form
    const item1 = form.addItem();
    item1.inventory_uuid = uuid1;
    form.configureItem(item1);
    item1.quantity = 2;
    item1.unit_price = 2.30;
    item1._hasValidAccounts = true;

    // Verify that adding an item updates the total cost
    //    The total should be: 2*2.30 => 4.6
    form.digest();
    expect(form.details.cost).to.eql(4.6);

    // Add a second PO item to the form
    const item2 = form.addItem();
    item2.inventory_uuid = uuid2;
    form.configureItem(item2);
    item2.quantity = 3;
    item2.unit_price = 3.50;
    item2._hasValidAccounts = true;

    // Verify that adding an item updates the total cost
    //    The total should be: 2*2.30 + 3*3.5 => 4.6 + 10.5 => 15.1\
    form.digest();
    expect(form.details.cost).to.eql(15.1);
  });

  it('verify that currencies are handled correctly with multiple currencies', () => {

    const enterpriseCurrencyId = Mocks.enterprise().currency_id;
    const enterpriseCurrencyRate = Mocks.exchange()[enterpriseCurrencyId].rate;

    // Get the UUIDs for an inventory item for the test
    // NOTE: inventory unit prices are always in enterprise currency
    const invUuid1 = form.inventory.available.data[1].uuid;
    const unitPrice1 = 2.3;
    const quantity1 = 10;
    const invUuid2 = form.inventory.available.data[2].uuid;
    const unitPrice2 = 3.1;
    const quantity2 = 20;

    // Fix the price in the inventory
    form.inventory.available.data[1].price = unitPrice1;
    form.inventory.available.data[2].price = unitPrice2;

    // Set up and verify the default currency and exchange rate
    form.setCurrencyId(enterpriseCurrencyId);
    form.setExchangeRate(enterpriseCurrencyRate);
    expect(form.details.currency_id).to.equal(enterpriseCurrencyId);
    expect(form.currentExchangeRate).to.equal(enterpriseCurrencyRate);

    // Add a PO item to the form
    const item1 = form.addItem();
    item1.inventory_uuid = invUuid1;
    item1._valid = true;
    item1._invalid = !item1._valid;
    form.configureItem(item1);
    item1.quantity = quantity1;
    item1._hasValidAccounts = true;
    item1._initialised = true;

    // Verify that the cost (in USD)
    form.digest();
    expect(form.details.cost).to.be.closeTo(quantity1 * unitPrice1 * enterpriseCurrencyRate, 1e-8);

    // Now change to Euros
    const euroExchangeRate = Mocks.exchange()[EUR].rate;
    form.setCurrencyId(EUR);
    form.setExchangeRate(euroExchangeRate);
    expect(form.details.currency_id).to.equal(EUR);
    expect(form.currentExchangeRate).to.equal(euroExchangeRate);

    // Verify that the cost (in USD)
    form.digest();
    const expectedCost1 = quantity1 * unitPrice1 * euroExchangeRate;
    expect(form.details.cost).to.be.closeTo(expectedCost1, 1e-8);

    // Now add another item
    const item2 = form.addItem();
    item2.inventory_uuid = invUuid2;
    item2._valid = true;
    item2._invalid = !item1._valid;
    form.configureItem(item2);
    item2.quantity = quantity2;
    item2._hasValidAccounts = true;
    item2._initialised = true;

    // Check the cost
    form.digest();
    const expectedCost2 = (quantity1 * unitPrice1 * euroExchangeRate)
      + (quantity2 * unitPrice2 * euroExchangeRate);
    expect(form.details.cost).to.be.closeTo(expectedCost2, 1e-8);
  });

});

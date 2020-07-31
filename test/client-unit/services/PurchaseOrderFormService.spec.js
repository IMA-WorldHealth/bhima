/* global inject, expect, chai */
/* eslint no-unused-expressions:off, no-restricted-properties:off */
describe('PurchaseOrderForm', () => {
  let PurchaseOrderForm;
  let Mocks;
  let Session;
  let httpBackend;
  let $timeout;
  let form;

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

    httpBackend.when('GET', '/inventory/metadata/?locked=0&use_previous_price=1')
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

  it('deletes an item when when #removeItem() is callled', () => {
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

  it('sets totals correctly when #digest() is callled', () => {

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

    // Add a secpmd PO item to the form
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
});

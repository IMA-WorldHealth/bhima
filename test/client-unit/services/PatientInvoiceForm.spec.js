/* global inject, expect, chai */
/* eslint no-unused-expressions:off */
describe('PatientInvoiceForm', () => {
  let PatientInvoiceForm;
  let httpBackend;
  let Session;
  let form;
  let Mocks;

  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'ui.bootstrap',
    'bhima.constants',
    'ngStorage',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'bhima.mocks'
  ));

  beforeEach(inject((_PatientInvoiceForm_, $httpBackend, _SessionService_, _MockDataService_) => {
    PatientInvoiceForm = _PatientInvoiceForm_;
    Session = _SessionService_;
    Mocks = _MockDataService_;

    // set up the required properties for the session
    Session.create(Mocks.user(), Mocks.enterprise(), Mocks.project());

    httpBackend = $httpBackend;

    const patient = Mocks.patient();
    const baseUrl = `/patients/${patient.uuid}`;

    // configure endpoints for HTTP requests
    httpBackend.when('GET', baseUrl)
      .respond(200, patient);

    httpBackend.when('GET', `${baseUrl}/services`)
      .respond(200, Mocks.invoicingFees());

    httpBackend.when('GET', `${baseUrl}/subsidies`)
      .respond(200, Mocks.subsidies());

    httpBackend.when('GET', `${baseUrl}/finance/balance`)
      .respond(200, null);

    httpBackend.when('GET', `/prices/${patient.price_list_uuid}`)
      .respond(200, Mocks.priceList());

    httpBackend.when('GET', '/services/')
      .respond(200, Mocks.services());

    httpBackend.when('GET', '/inventory/metadata/?detailed=1&locked=0')
      .respond(200, Mocks.inventories());

    form = new PatientInvoiceForm('InvoiceTestKey');
    httpBackend.flush();
  }));

  // make sure $http is clean after tests
  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('#constructor()', () => {
    let constructorForm;
    let setupSpy;
    let inventorySpy;

    before(() => {
      constructorForm = new PatientInvoiceForm('TestCacheKey');
      setupSpy = chai.spy.on(constructorForm, 'setup');
      inventorySpy = chai.spy.on(constructorForm.inventory, 'initialize');
    });

    it('calls #setup() on initialization', () => {
      expect(setupSpy).to.have.been.called;
    });

    it('creates a new, empty store for the grid', () => {
      expect(constructorForm.store).to.exist;
      expect(constructorForm.store.identifier).to.equal('uuid');
      expect(constructorForm.store.data).to.have.length(0);
    });

    it('initializes the inventory', () => {
      expect(inventorySpy).to.have.been.called;
    });

    it('sets the form to be invalid by default', () => {
      expect(constructorForm._invalid).to.equal(true);
      expect(constructorForm._valid).to.equal(false);
    });
  });

  it('#constructor() creates an inventory pool with six items in it', () => {
    expect(form.inventory).to.exist;
    expect(form.inventory.size()).to.equal(6);
  });

  it('#constructor() sets the default service on startup', () => {
    const [service] = Mocks.services();
    expect(form.details.service_id).to.equal(service.id);
  });

  it('#setPatient() sets the patient and downloads relevant data', () => {
    const patient = Mocks.patient();
    form.setPatient(patient);
    expect(form.details.debtor_uuid).to.equal(patient.debtor_uuid);

    // make sure promise methods fire
    httpBackend.flush();

    const priceList = Mocks.priceList();
    const mockInvoiceFeeIds = Mocks.invoicingFees().map(fee => fee.id);
    const mockSubsidyIds = Mocks.subsidies().map(subsidy => subsidy.id);

    expect(form.prices.data).to.have.deep.members(priceList.items);

    // test that all ids of invoice fees are in the form.
    const invoiceFeeIds = form.invoicingFees.map(fee => fee.id);
    const subsidyIds = form.subsidies.map(subsidy => subsidy.id);

    expect(invoiceFeeIds).to.have.members(mockInvoiceFeeIds);
    expect(subsidyIds).to.have.members(mockSubsidyIds);
  });

  it('#addItem() adds a row to the store', () => {
    expect(form.store.data).to.have.length(0);
    form.addItem();
    expect(form.store.data).to.have.length(1);
  });

  it('#removeItem() removes a specific uuid from the store', () => {
    form.addItem();
    expect(form.store.data).to.have.length(1);
    const [item] = form.store.data;
    form.removeItem(item);

    expect(form.store.data).to.have.length(0);
    expect(form.store.get(item.uuid)).to.be.undefined;
  });

  it('#clear() removes all data from the internal store', () => {
    form.addItem();
    form.addItem();
    form.addItem();
    form.addItem();
    form.clear();
    expect(form.store.data).to.have.length(0);
  });

  it('#hasCacheAvailable() should be false by default', () => {
    expect(form.hasCacheAvailable()).to.equal(false);
  });

  it('#writeCache() should make #hasCacheAvailable() true', () => {
    form.writeCache();
    expect(form.hasCacheAvailable()).to.equal(true);
  });

  it('#clearCache() should make #hasCacheAvailable() false', () => {
    form.writeCache();
    form.clearCache();
    expect(form.hasCacheAvailable()).to.equal(false);
  });

  it('#digest() calculates totals', () => {
    form.digest();

    const mockTotals = {
      invoicingFees : 0,
      rows : 0,
      subsidies : 0,
      grandTotal : 0,
    };

    expect(form.totals).to.eql(mockTotals);

    // put two items in the store
    form.addItem();
    form.addItem();

    // alias the items
    const [itemA, itemB] = form.store.data;

    // configure the items with inventory items
    const mefloquine = {
      uuid : 'd2f7ef71-6f3e-44bd-8056-378c5ca26e20',
      price : 0.9600,
      text : 'Mefloquine 250mg',
      code : '100070',
      sales_account : true,
      default_quantity : 10,
    };

    const quinine = {
      uuid : '43f3decb-fce9-426e-940a-bc2150e62186',
      code : '100102',
      text : 'Quinine sulphate 500mg',
      price : 0.1500,
      sales_account : true,
      default_quantity : 30,
    };

    itemA.configure(mefloquine);
    itemB.configure(quinine);

    form.digest();

    // this is 30 * 0.15 + 10 * .96
    mockTotals.rows = 14.1;
    mockTotals.grandTotal += mockTotals.rows;

    const str = (j) => JSON.stringify(j);

    expect(form.totals, `${str(form.totals)} should equal ${str(mockTotals)}`).to.eql(mockTotals);
  });
});

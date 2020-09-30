/* global inject, expect, chai */
/* eslint no-unused-expressions:off */
describe('VoucherForm', () => {
  let VoucherForm;
  let httpBackend;
  let Session;
  let form;
  let Mocks;
  let $timeout;

  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'ui.bootstrap',
    'ui.router',
    'bhima.constants',
    'ngStorage',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'bhima.mocks'
  ));

  beforeEach(inject((_VoucherForm_, $httpBackend, _SessionService_, _MockDataService_, _$timeout_) => {
    VoucherForm = _VoucherForm_;
    Session = _SessionService_;
    Mocks = _MockDataService_;
    $timeout = _$timeout_;

    // set up the required properties for the session
    Session.create(Mocks.user(), Mocks.enterprise(), Mocks.stock_settings(), Mocks.project());

    httpBackend = $httpBackend;

    httpBackend.when('GET', '/accounts/')
      .respond(200, Mocks.accounts());

    form = new VoucherForm('TestKey');
  }));

  // make sure $http is clean after tests
  afterEach(() => {
    $timeout.flush();
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('#constructor()', () => {
    let constructorForm;
    let setupSpy;

    before(() => {
      constructorForm = new VoucherForm('TestCacheKey');
      setupSpy = chai.spy.on(constructorForm, 'setup');
    });

    it('calls #setup() on initialization', () => {
      expect(setupSpy).to.have.been.called;
    });

    it('creates a new store with two items in it', () => {
      expect(constructorForm.store).to.exist;
      expect(constructorForm.store.identifier).to.equal('uuid');

      // two rows should be added
      expect(constructorForm.store.data).to.have.length(2);
    });

    it('sets default data based on Session', () => {
      expect(constructorForm.details).to.exist;
      expect(constructorForm.details.project_id).to.be.equal(Session.project.id);
      expect(constructorForm.details.currency_id).to.be.equal(Session.enterprise.currency_id);
      expect(constructorForm.details.user_id).to.be.equal(Session.user.id);
    });
  });

  it('#removeItem() removes a specific uuid from the store', () => {
    // there must be 2 items by default in the store
    const item = form.store.data[1];
    form.removeItem(item.uuid);

    expect(form.store.data).to.have.length(1);
    expect(form.store.get(item.uuid)).to.be.undefined;
  });

  it.skip('#addItems() adds multiple rows to the store', () => {
    form.addItems(13);
    expect(form.store.data).to.have.length(15);
  });


  it('#clear() removes all data from the internal store', () => {
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

  it('#onChanges() calls #validate()', () => {
    form.validate = chai.spy();
    form.onChanges();
    expect(form.validate).to.have.been.called.exactly(1);
  });

  it('#validate() calculate totals', () => {
    form.validate();
    expect(form.totals).to.eql({ debit : 0, credit : 0 });

    // grab both items and configure them
    const [firstItem, secondItem] = form.store.data;

    firstItem.debit = 10;
    firstItem.credit = 0;
    secondItem.debit = 0;
    secondItem.credit = 10;

    form.validate();
    expect(form.totals).to.eql({ debit : 10, credit : 10 });
  });
});

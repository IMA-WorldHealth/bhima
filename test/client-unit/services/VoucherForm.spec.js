/* global inject, expect, chai */
describe('VoucherForm', () => {
  'use strict';

  let VoucherForm;
  let httpBackend;
  let Session;
  let form;

  const mockCashboxes = [{
    id : 1,
    label : 'Little Cash Window',
    account_id : 1100,
    is_auxiliary : 1,
    transfer_account_id : 1200,
    symbol : '$ (USD)',
    currency_id : 1,
  }, {
    id : 2,
    label : 'Little Cash Window',
    account_id : 1101,
    is_auxiliary : 1,
    transfer_account_id : 1201,
    symbol : 'EUR',
    currency_id : 2,
  }, {
    id : 3,
    label : 'Main Coffre',
    account_id : 1102,
    is_auxiliary : 0,
    transfer_account_id : 1202,
    symbol : '$ (USD)',
    currency_id : 1,
  }, {
    id : 4,
    label : 'Secondary Coffre',
    account_id : 1103,
    is_auxiliary : 0,
    transfer_account_id : 1203,
    symbol : 'EUR',
    currency_id : 2,
  }];

  // these accounts aren't really all that important
  const mockAccounts = [
    { id : 0, label : 'Mock Root Account', type_id : 1, parent : null },
    { id : 1, label : 'Mock Account A', type_id : 2, parent : 0 },
    { id : 2, label : 'Mock Account B', type_id : 2, parent : 0 },
  ];

  beforeEach(
    module(
      'bhima.services',
      'angularMoment',
      'ui.bootstrap',
      'bhima.constants',
      'ngStorage',
      'pascalprecht.translate',
      'tmh.dynamicLocale'
    )
  );

  beforeEach(inject((_VoucherForm_, $httpBackend, _SessionService_) => {
    VoucherForm = _VoucherForm_;
    Session = _SessionService_;

    // set up the required properties for the session
    Session.create(
      { id : 1 }, // user
      { currency_id : 2 }, // enterprise
      { id : 3 }, // project
    );

    httpBackend = $httpBackend;

    httpBackend.when('GET', '/cashboxes/?detailed=1')
      .respond(200, mockCashboxes);

    httpBackend.when('GET', '/accounts/')
      .respond(200, mockAccounts);

    form = new VoucherForm('TestKey');
  }));

  // make sure $http is clean after tests
  afterEach(() => {
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
      expect(constructorForm.store).to.be.defined;
      expect(constructorForm.store.identifier).to.equal('uuid');

      // two rows should be added
      expect(constructorForm.store.data).to.have.length(2);
    });

    it('sets default data based on Session', () => {
      expect(constructorForm.details).to.be.defined;
      expect(constructorForm.details.project_id).to.be.equal(Session.project.id);
      expect(constructorForm.details.currency_id).to.be.equal(Session.enterprise.currency_id);
      expect(constructorForm.details.user_id).to.be.equal(Session.user.id);
    });
  });

  it.skip('#addItems() adds multiple rows to the store', () => {
    form.addItems(13);
    expect(form.store.data).to.have.length(15);
  });

  it('#removeItem() removes a specific uuid from the store', () => {
    // there must be 2 items by default in the store
    const item = form.store.data[1];
    form.removeItem(item.uuid);

    expect(form.store.data).to.have.length(1);
    expect(form.store.get(item.uuid)).to.not.be.defined;
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
    const firstItem = form.store.data[0];
    const secondItem = form.store.data[1];

    firstItem.debit = 10;
    firstItem.credit = 0;
    secondItem.debit = 0;
    secondItem.credit = 10;

    form.validate();
    expect(form.totals).to.eql({ debit : 10, credit : 10 });
  });
});

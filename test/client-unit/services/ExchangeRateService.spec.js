/* global expect inject */
describe('ExchangeRateService', () => {
  let Exchange;
  let $httpBackend;
  let Session;
  let Mocks;

  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'bhima.mocks',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'pascalprecht.translate',
  ));

  beforeEach(inject((_ExchangeRateService_, _SessionService_, _MockDataService_, _$httpBackend_) => {
    Exchange = _ExchangeRateService_;
    $httpBackend = _$httpBackend_;

    Session = _SessionService_;
    Mocks = _MockDataService_;

    const enterprise = Mocks.enterprise();
    Session.create(Mocks.user(), Mocks.enterprise(), Mocks.project());

    const rates = [{
      id : 1,
      enterprise_id : enterprise.id,
      currency_id : 1,
      rate : 800,
      date : new Date('01-01-2000'),
    }, {
      id : 2,
      enterprise_id : enterprise.id,
      currency_id : 2,
      rate : 1200,
      date : new Date('01-01-2001'),
    }, {
      id : 3,
      enterprise_id : enterprise.id,
      currency_id : 2,
      rate : 1500,
      date : new Date('01-01-2010'),
    }, {
      id : 4,
      enterprise_id : enterprise.id,
      currency_id : 2,
      rate : 2000,
      date : new Date('01-02-2010'),
    }, {
      id : 5,
      enterprise_id : enterprise.id,
      currency_id : 3,
      rate : 0.84,
      date : new Date('01-02-2010'),
    }];

    const currencies = [{
      id : 1,
      symbol : 'FC',
      format_key : 'fc',
      name : 'Congolese Francs',
      min_monentary_unit : 50,
    }, {
      id : 2,
      symbol : 'USD',
      format_key : 'usd',
      name : 'US Dollars',
      min_monentary_unit : 0.01,
    }, {
      id : 3,
      symbol : '€',
      format_key : 'EUR',
      name : 'Euro',
      min_monentary_unit : 0.01,
    }];

    $httpBackend.when('GET', '/exchange')
      .respond(rates);

    $httpBackend.when('GET', '/currencies')
      .respond(currencies);
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('gets the exchange rate for a currency with id 2 for today', () => {
    Exchange.read();
    $httpBackend.flush();

    const rate = Exchange.getExchangeRate(2, new Date());
    expect(rate).to.equal(2000);
  });

  it('gets the exchange rate for a currency with id 2 for 2008', () => {
    Exchange.read();
    $httpBackend.flush();

    const rate = Exchange.getExchangeRate(2, new Date('06-06-2008'));

    // rate defined for 2001, but should still apply in 2008
    expect(rate).to.equal(1200);
  });

  it.skip('gets the exchange rate for a currency with id 2 for 2008', () => {
    $httpBackend.when('GET', '/exchange')
      .respond([]);

    Exchange.read();
    $httpBackend.flush();

    expect(Exchange.getExchangeRate(2, new Date('06-06-2008'))).to.throw('EXCHANGE.MISSING_EXCHANGE_RATES');
  });

  it('#getCurrentRate() should return today\'s rate', () => {
    Exchange.read();
    $httpBackend.flush();

    // currency_id 1 is the enterprise currency, so it is always 1
    let rate = Exchange.getCurrentRate(1);
    expect(rate).to.equal(1);

    rate = Exchange.getCurrentRate(2);
    expect(rate).to.equal(2000);
  });
});

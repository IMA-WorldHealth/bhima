/* global inject expect */

describe('AccountService', () => {

  let Accounts;
  let $httpBackend;

  beforeEach(module('bhima.services', 'bhima.mocks', 'angularMoment', 'bhima.constants'));

  beforeEach(inject((_$httpBackend_, AccountService, MockDataService) => {
    $httpBackend = _$httpBackend_;
    Accounts = AccountService;

    $httpBackend.when('GET', '/accounts/')
      .respond(200, MockDataService.accounts());
  }));

  // throws if there are more outstanding requests
  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });


  it('#read() will fire an HTTP GET request each time it is called', () => {
    const NUM_REQUESTS = 10;
    let count = NUM_REQUESTS;
    while (count--) {
      Accounts.read();
    }

    // this would throw if too many requests were called.
    expect(() => $httpBackend.flush(NUM_REQUESTS)).not.to.throw();
  });
});

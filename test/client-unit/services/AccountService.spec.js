/* global inject expect */

describe('AccountService', () => {

  let Accounts;
  let $httpBackend;
  let $timeout;
  let $verifyNoPendingTasks;

  beforeEach(module('bhima.services', 'bhima.mocks', 'angularMoment', 'bhima.constants'));

  beforeEach(inject((_$httpBackend_, AccountService, MockDataService, _$timeout_, _$verifyNoPendingTasks_) => {
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $verifyNoPendingTasks = _$verifyNoPendingTasks_;

    Accounts = AccountService;

    $httpBackend.when('GET', '/accounts/')
      .respond(200, MockDataService.accounts());
  }));

  // throws if there are more outstanding requests
  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $verifyNoPendingTasks('$timeout');
  });


  it('#read() will fire only a single HTTP GET request when called mutliple times in a row', () => {
    const NUM_REQUESTS = 10;
    let count = NUM_REQUESTS;
    while (count--) {
      Accounts.read();
    }

    $timeout.flush();

    // this would throw if too many requests were called.
    expect(() => $httpBackend.flush(1)).not.to.throw();
    expect(() => $httpBackend.flush(1)).to.throw();
  });
});

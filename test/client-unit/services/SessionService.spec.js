/* global inject, expect */
/* eslint no-unused-expressions:off */
describe('SessionService', () => {
  // shared services
  let Session;
  let rootScope;
  let httpBackend;
  let user;
  let project;
  let enterprise;

  // load bhima.services
  beforeEach(module(
    'pascalprecht.translate',
    'ngStorage',
    'angularMoment',
    'bhima.services',
    'bhima.mocks',
    'ui.router'
  ));

  // bind the services as $injects
  beforeEach(inject((_SessionService_, _$rootScope_, $httpBackend, _MockDataService_) => {
    Session = _SessionService_;
    rootScope = _$rootScope_;
    httpBackend = $httpBackend;

    user = _MockDataService_.user();
    project = _MockDataService_.project();
    enterprise = _MockDataService_.enterprise();


    // mocked responses
    httpBackend.when('POST', '/auth/login')
      .respond(200, { user, project, enterprise });

    httpBackend.when('GET', '/auth/logout')
      .respond(200);

    httpBackend.when('POST', '/auth/reload')
      .respond(200, { user, project, enterprise });
  }));

  // make sure $http is clean after tests
  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('create() creates a session from an object', () => {
    Session.create(user, enterprise, project);

    expect(Session.user).to.be.eql(user);
    expect(Session.project).to.be.eql(project);
    expect(Session.enterprise).to.be.eql(enterprise);
  });

  it('destroy() destroys the session object', () => {
    // destroy the session's variables
    Session.destroy();

    // ensure the session variables have been destroyed
    expect(Session.user).to.be.undefined;
    expect(Session.project).to.be.undefined;
    expect(Session.enterprise).to.be.undefined;
  });

  it('emits a login event', () => {
    var called = false;
    rootScope.$on('session:login', () => { called = true; });

    // send a POST /login request
    Session.login(user);

    // expect the HTTP backend to have been hit
    httpBackend.expectPOST('/auth/login');
    httpBackend.flush();

    // the event should have been emitted
    expect(called).to.be.true;
  });

  it('emits a logout event', () => {
    var called = false;
    rootScope.$on('session:logout', () => { called = true; });

    Session.logout();

    // expect the HTTP backend to have been hit
    httpBackend.expectGET('/auth/logout');
    httpBackend.flush();

    // the event should have been emitted
    expect(called).to.be.true;
  });
});

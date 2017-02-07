/* jshint expr: true */
/* global inject, expect */
describe('SessionService', function () {
  'use strict';

  // shared services
  let Session;
  let rootScope;
  let httpBackend;

  // data for login and such
  const user = {
    username : 'superuser',
    password : 'superuser',
    projectid: 1
  };

  const project = {
    id: 1,
    label : 'Test Project'
  };

  const enterprise = {
    id : 1,
    label : 'Test Enterprise'
  };

  // load bhima.services
  beforeEach(
    module('pascalprecht.translate', 'ngStorage', 'angularMoment', 'bhima.services')
  );

  // bind the services as $injects
  beforeEach(inject((_SessionService_, $rootScope, $httpBackend) => {
    Session = _SessionService_;
    rootScope = $rootScope;
    httpBackend = $httpBackend;

    // mocked responses
    httpBackend.when('POST', '/auth/login')
      .respond(200, { user : user, project : project, enterprise : enterprise });

    httpBackend.when('GET', '/auth/logout')
      .respond(200);

    httpBackend.when('POST', '/auth/reload')
      .respond(200, { user : user, project : project, enterprise : enterprise });
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

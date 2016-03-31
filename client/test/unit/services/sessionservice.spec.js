/*global describe, it, beforeEach, inject, expect */

'use strict';

describe('TestSessionService - get and set client user sessions', function () {
  var Session, window,
      key = 'bhima-session-key';

  // make sure bhima.services is defined
  beforeEach(module('bhima.services'));

  beforeEach(inject(function (_SessionService_, $window) {
    Session = _SessionService_;
    window = $window;
  }));

  it('should not have a session by default', function () {
    
    // Destroy method should clear user, enterprise and project - if this is not 
    // done initially all unit tests that do not open a new browser instance will 
    // fail
    Session.destroy();

    expect(Session.user).to.be.undefined;
    expect(Session.enterprise).to.be.undefined;
    expect(Session.project).to.be.undefined;
  });

  it('creates a user session on create()', function () {
    var userMock = { id : 1};

    expect(Session.user).to.be.undefined;

    Session.create(userMock, {}, {});
    expect(Session.user).to.equal(userMock);
  });

  it('destroys a user session on destroy()', function () {
    var userMock = { id : 1};
    Session.create(userMock, {}, {});

    expect(Session.user).to.equal(userMock);

    Session.destroy();
    expect(Session.user).to.be.undefined;
  });


  it('destroys previously stored session with destroy()', function () {
    var storeMock = JSON.stringify({ user : { id : 1 }, project : {}, enterprise : {} });
  
    // mock a stored session
    window.sessionStorage.setItem(key, storeMock);

    Session.destroy();
    Session.loadStoredSession();
    expect(Session.user).to.be.undefined;
  });


  it('loads the stored session with loadStoredSession()', function () {
    var storeMock = JSON.stringify({ user : { id : 1 }, project : {}, enterprise : {} });

    // ensure no session exists
    Session.destroy();
    expect(Session.user).to.be.undefined;

    window.sessionStorage.setItem(key, storeMock);

    Session.loadStoredSession();
    expect(Session.user).to.be.defined;
    expect(Session.user.id).to.equal(1);
  });

});

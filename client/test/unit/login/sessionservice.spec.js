/*global describe, it, beforeEach, inject, expect */

'use strict';

describe('TestSessionService - get and set client user sessions', function () {
  var SessionService, $window,
      key = 'bhima-session-key';

  // make sure bhima.services is defined
  beforeEach(function () {
    module('bhima.services')
  });

  beforeEach(inject(function (_SessionService_, _$window_) {
    SessionService = _SessionService_;
    $window = _window_;
  }));

  it('should not have a session by default', function () {
    expect(SessionService.user).not.toBeDefined();
    expect(SessionService.enterprise).not.toBeDefined();
    expect(SessionService.project).not.toBeDefined();
  });

  it('creates a user session on create()', function () {
    var userMock = { id : 1};

    expect(SessionService.user).not.toBeDefined();

    SessionService.create(userMock, {}, {});
    
    expect(SessionService.user).toEqual(userMock);
  });

  it('destroys a user session on destroy()', function () {
    var userMock = { id : 1};
    SessionService.create(userMock, {}, {});

    expect(SessionService.user).toBe(userMock);

    SessionService.destroy();
    expect(SessionService.user).not.toBeDefined();
  });


  it('destroys previously stored session with destroy()', function () {
    var storeMock = JSON.stringify({ user : { id : 1 }, project : {}, enterprise : {} });

    // mock a stored session
    $window.sesionStorage.setItem(key, storeMock);

    SessionService.destroy();
    SessionService.loadStoredSession();
    expect(SessionService.user).not.toBeDefined();
  });


  it('loads the stored session with loadStoredSession()', function () {
    var storeMock = JSON.stringify({ user : { id : 1 }, project : {}, enterprise : {} });

    // ensure no session exists
    SessionService.destroy();
    expect(SessionService.user).not.toBeDefined();

    $window.sesionStorage.setItem(key, storeMock);

    SessionService.loadStoredSession();
    expect(SessionService.user).toBeDefined();
    expect(SessionService.user.id).toBe(1);
  });

});

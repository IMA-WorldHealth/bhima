angular.module('bhima.services')
.service('NotifyService', NotifyService);

NotifyService.$inject = ['$interval'];

/**
 * This service is responsible for displaying system wide notifications to the
 * user.
 *
 * @todo  this is a placeholder service - it should be properly developed with
 *        the all features and unit test
 * @todo  feature - success/warning/failure messages
 * @todo  unit tests
 */
function NotifyService($interval) {
  var service = this;

  // this was historically a list - this doesn't play nice with angular-growl
  var notifications = [];
  var index = 0;

  service.success = success;

  /** expose notifications for application level view */
  service.list = notifications;

  /**
   * Display a success notification
   */
  function success(message) {

    /** @todo analysis on the heap allocation implications should be done this */
    var n = {
      ttl : 5000,
      alive : true,
      message : message
    }
    notifications[0] = n;
  }
}

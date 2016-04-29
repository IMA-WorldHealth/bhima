angular.module('bhima.services')
.service('NotifyService', NotifyService);

NotifyService.$inject = ['$interval'];

/**
 * This service is responsible for displaying system wide notifications to the
 * user.
 *
 * @todo  this is a placeholder service - it should be properly developed with
 *        the all features and relevent tests
 * @todo  feature - success/warning/failure messages - styles, data tags
 * @todo  unit tests
 */
function NotifyService($interval) {
  var service = this;

  // default time to live of 5 seconds
  var TTL = 5000;

  // this stores all notification instances - for now this will only be allowed
  // to store one notification however it can be extended in the future
  var notifications = [];
  service.success = success;

  /** expose notifications for application level view */
  service.list = notifications;

  /**
   * Display a success notification
   *
   * @todo extend for optiosn
   */
  function success(message) {

    /** @todo analysis on the heap allocation implications should be done this */
    var formatMessage = {
      ttl : TTL,
      message : message
    };

    // very brief and naive performance analysis shows that this is cheaper in terms
    // of memory usage vs. setting the array length to 0, shift() or pop(). This
    // could be improved
    notifications[0] = formatMessage;
  }
}

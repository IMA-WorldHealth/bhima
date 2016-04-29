angular.module('bhima.services')
.service('NotifyService', NotifyService);

NotifyService.$inject = ['$translate'];

/**
 * This service is responsible for displaying system wide notifications to the
 * user.
 *
 * @todo  this is a placeholder service - it should be properly developed with
 *        the all features and relevent tests
 * @todo  feature - success/warning/failure messages - styles, data tags
 * @todo  unit tests
 */
function NotifyService($translate) {
  var service = this;

  // default time to live of 5 seconds
  var TTL = 5000;

  // this stores all notification instances - for now this will only be allowed
  // to store one notification however it can be extended in the future
  var notifications = [];

  var formatOptions = {
    // success : 'notification-success',
    success : {
      format  : 'notification-success',
      icon    : 'glyphicon-check'
    },
    danger : {
      format  : 'notification-danger',
      icon    : 'glyphicon-exclamation-sign'
    },
    info : {
      format  : 'notification-info',
      icon    : 'glyphicon-info-sign'
    },
    warn : {
      format  : 'notification-warn',
      icon    : 'glyphicon-warning-sign'
    }
  };

  service.success = success;

  /** expose notifications for application level view */
  service.list = notifications;

  /**
   * Display a success notification
   *
   * @todo extend for optiosn
   */
  function success(key, options) {
    setNotification(key, formatOptions.success);
  }

  function danger(key, options) {
    setNotification(key, formatOptions.danger);
  }

  function info(key, options ) {
    setNotification(key, formatOptions.info);
  }

  function warn(key, options) {
    setNotification(key, formatOptions.warn);
  }

  /** @todo analysis on the heap allocation implications should be done this */
  function setNotification(key, options) {
    var message = $translate.instant(key);
    var formatNotification = {
      ttl : TTL,
      message : message
    };

    angular.extend(formatNotification, options);

    // very brief and naive performance analysis shows that this is cheaper in terms
    // of memory usage vs. setting the array length to 0, shift() or pop(). This
    // could be improved
    notifications[0] = formatNotification;
  }
}

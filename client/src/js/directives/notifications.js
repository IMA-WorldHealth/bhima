/**
 * Notification directive (/services) temporarily 'forked' from
 * https://github.com/jvandemo/angular-growl-notifications/ to resolve an issue
 * with clearing $timeout. If this issue is resolved the external dependency
 * will be added again.
 */
(function(){

    // Config
    angular.module('growlNotifications.config', [])
        .value('growlNotifications.config', {
            debug: true
        });

    // Modules
    angular.module('growlNotifications.directives', []);
    angular.module('growlNotifications.filters', []);
    angular.module('growlNotifications.services', []);
    angular.module('growlNotifications',
        [
            'growlNotifications.config',
            'growlNotifications.directives',
            'growlNotifications.filters',
            'growlNotifications.services'
        ]);

})();(function () {

  function growlNotificationDirective(growlNotifications, $animate, $interval) {

    var defaults = {
      ttl: growlNotifications.options.ttl || 5000
    };

    return {

      /**
       * Allow compilation via attributes as well so custom
       * markup can be used
       */
      restrict: 'AE',

      /**
       * Create new child scope
       */
      scope: true,

      /**
       * Controller
       */
      controller: growlNotificationController,

      /**
       * Make the controller available in the directive scope
       */
      controllerAs: '$growlNotification',

      /**
       * Post link function
       *
       * @param scope
       * @param iElem
       * @param iAttrs
       * @param ctrl
       */
      link: function (scope, iElem, iAttrs, ctrl) {

        // Assemble options
        var options = angular.extend({}, defaults, scope.$eval(iAttrs.growlNotificationOptions));

        if (iAttrs.ttl) {
          options.ttl = scope.$eval(iAttrs.ttl);
        }

        // Move the element to the right location in the DOM
        $animate.move(iElem, growlNotifications.element);

        // Run onOpen handler if there is one
        if (iAttrs.onOpen) {
          scope.$eval(iAttrs.onOpen);
        }

        // Schedule automatic removal
        ctrl.timer = $interval(function () {
          $animate.leave(iElem);

          // Run onClose handler if there is one
          if(iAttrs.onClose){
            scope.$eval(iAttrs.onClose);
          }
        }, options.ttl, 1);

        function handleCloseEvent() {

        }

      }
    };

  }

  // Inject dependencies
  growlNotificationDirective.$inject = ['growlNotifications', '$animate', '$interval'];

  /**
   * Directive controller
   *
   * @param $element
   * @param $animate
   * @param $attrs
   * @param $scope
   */
  function growlNotificationController($element, $animate, $attrs, $scope, $interval) {

    /**
     * Placeholder for timer promise
     */
    this.timer = null;

    /**
     * Helper method to close notification manually
     */
    this.remove = function () {

      // Remove the element
      $animate.leave($element);

      // Cancel scheduled automatic removal if there is one
      if (this.timer) {
        $interval.cancel(this.timer);

        // Run onClose handler if there is one
        if($attrs.onClose){
          $scope.$eval($attrs.onClose);
        }
      }
    };

  }

  // Inject dependencies
  growlNotificationController.$inject = ['$element', '$animate', '$attrs', '$scope', '$interval'];

  // Export
  angular
    .module('growlNotifications.directives')
    .directive('growlNotification', growlNotificationDirective);

})();
(function () {

  /**
   * Create directive definition object
   *
   * @param growlNotifications
   */
  function growlNotificationsDirective(growlNotifications) {

    return {

      /**
       * Allow compilation via attributes as well so custom
       * markup can be used
       */
      restrict: 'AE',

      /**
       * Post link function
       *
       * @param scope
       * @param iElem
       * @param iAttrs
       */
      link: function (scope, iElem, iAttrs) {
        growlNotifications.element = iElem;
      }
    };

  }

  // Inject dependencies
  growlNotificationsDirective.$inject = ['growlNotifications'];

  // Export
  angular
    .module('growlNotifications.directives')
    .directive('growlNotifications', growlNotificationsDirective);

})();(function () {

  /**
   * Growl notifications provider
   */
  function growlNotificationsProvider(){

    // Default options
    var options = {
      ttl: 5000
    };

    /**
     * Provider method to change default options
     *
     * @param newOptions
     */
    this.setOptions = function (newOptions) {
      angular.extend(options, newOptions);
      return this;
    };

    /**
     * Provider convenience method to get or set default ttl
     *
     * @param ttl
     * @returns {*}
     */
    this.ttl = function (ttl) {
      if (angular.isDefined(ttl)) {
        options.ttl = ttl;
        return this;
      }
      return options.ttl;
    };

    /**
     * Factory method
     *
     * @param $timeout
     * @param $rootScope
     * @returns {GrowlNotifications}
     */
    this.$get = function () {

      function GrowlNotifications() {

        this.options = options;
        this.element = null;

      }

      return new GrowlNotifications();

    };

  }

  // Export
  angular
    .module('growlNotifications.services')
    .provider('growlNotifications', growlNotificationsProvider);

})();

angular.module('bhima.services')
.service('ScrollService', ScrollService);

ScrollService.$inject = ['$location', '$anchorScroll', '$timeout'];

/**
 * Scrolling Utility Service
 *
 * This is a simple utility containing the logic for scrolling to a given element.
 * The primary reason for this service is the number of imports it requires to
 * scroll in Angular, this is just a semantic wrapper for a basic operation.
 *
 * @example
 * Controller.$inject = ['ScrollService'];
 *
 * function Controller(ScrollTo)...
 *
 * ScrollTo('element-id');
 *
 * @module services/ScrollService
 */
function ScrollService($location, $anchorScroll, $timeout) {
  var scrollDelay = 0;

  // Always scroll an additional 50 pixels to ensure element is visiable
  $anchorScroll.yOffset = 50;

  /**
   * @deprecated
   *
   * This method is responsible for scrolling to a specific element. It uses
   * angular $location and $anchorScroll services.
   *
   * @param {String} elementId   Element identifier (html attribute `id`) to
   *                              be scrolled to.
   */
  function scrollTo(elementId) {

    // Verify that the hash not already been set to this value
    if ($location.hash() !== elementId) {

      // $location.hash will invoke anchor scroll
      $location.hash(elementId);
    } else {

      // $location has has already been set - invoke scroll
      $anchorScroll();
    }
  }

  /**
   * This is a wrapper method to ensure $anchorScroll is called within an $apply
   * block.
   *
   * @toto Discuss if this workaround is required if everything is put together correctly
   *
   * @param {String} elementId   Identifier to be passed on to scrollTo method.
   */
  function applyScrollTo(elementId) {
    var invokeApply = true;

    // we now make a call to $anchorScroll, directly passing the element ID, the
    // primary difference between this and the scrollTo method is that it does
    // not alter the browser URL (location hash) or history.
    $timeout($anchorScroll, scrollDelay, invokeApply, elementId);
  }

  return applyScrollTo;
}

const bhPanelOverlayTemplate = `
<div class="panel-overlay">
  <div class="panel-overlay-container">
    <span class="panel-overlay-text" ng-transclude>
    </span>
  </div>
</div>
`;

angular.module('bhima.components')
  .component('bhPanelOverlay', {
    transclude : true,
    template : bhPanelOverlayTemplate,
  });

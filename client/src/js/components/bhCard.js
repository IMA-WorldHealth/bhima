angular.module('bhima.components')
  .component('bhCard', {
    templateUrl : 'modules/templates/bhCard.tmpl.html',
    transclude : {
      title : 'bhCardTitle',
      subtitle : 'bhCardSubtitle',
      edit : 'bhCardEdit',
      detail : 'bhCardDetail',
      statistic : 'bhCardStatistic',
    },
    bindings : { },
  });

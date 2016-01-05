angular.module('bhima.controllers')
.controller('settings', [
  '$scope',
  '$routeParams',
  '$translate',
  '$location',
  'appcache',
  'messenger',
  'tmhDynamicLocale',
  'store',
  'amMoment',
  function($scope, $routeParams, $translate, $location, Appcache, messenger, tmhDynamicLocale, Store, amMoment) {
    
    // TODO issue discussing DB modelling of languages, quick suggestion (id, label, translateKey, localeKey)
    var languageStore = new Store({identifier : 'translateKey'});
    var languages = [
      {
        translateKey : 'en',
        localeKey : 'en-us',
        label : 'English'
      },
      {
        translateKey : 'fr',
        localeKey : 'fr-be',
        label : 'French'
      },
      {
        translateKey : 'ln',
        localeKey : 'fr-cd',
        label : 'Lingala'
      }
    ];
    languageStore.setData(languages);
    
    $scope.url = $routeParams.url || '';
    var cache = new Appcache('preferences');

    cache.fetch('language')
    .then(function (res) {
      if (res) {
        $scope.settings = { language: res.translateKey };
      }
    });

    $scope.updateLanguage = function updateLanuage(key) {
      var language = languageStore.get(key);
      
      $translate.use(language.translateKey);
      tmhDynamicLocale.set(language.localeKey);
      amMoment.changeLocale(language.translateKey);

      cache.put('language', language);
    };

    $scope.back = function () {
      $location.url($scope.url);
    };
  }
]);

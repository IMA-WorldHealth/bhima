angular.module('bhima.controllers')
.controller('settings', Settings);

Settings.$inject = [
  '$http','$routeParams','$translate','$location','appcache',
  'tmhDynamicLocale','amMoment', 'SessionService', 'Store'
];

function Settings($http, $routeParams, $translate, $location, Appcache, tmhDynamicLocale, amMoment, SessionService, Store) {
  var vm = this;

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

  vm.url = $routeParams.url || '';
  var cache = new Appcache('preferences');

  cache.fetch('language')
  .then(function (res) {
    if (res) {
      vm.settings = { language: res.translateKey };
    }
  });

  vm.updateLanguage = function updateLanuage(key) {
    var language = languageStore.get(key);

    $translate.use(language.translateKey);
    tmhDynamicLocale.set(language.localeKey);
    amMoment.changeLocale(language.translateKey);

    cache.put('language', language);
  };

  vm.back = function () {
    $location.url(vm.url);
  };

  /** @todo Wrap logout call in a service */
  vm.logout = function () {
    $http.get('/logout')
      .then(function () {
        SessionService.destroy();
        $location.url('/login');
      });
  };
}

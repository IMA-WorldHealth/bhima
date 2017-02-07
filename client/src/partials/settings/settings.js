angular.module('bhima.controllers')
  .controller('settings', SettingsController);

SettingsController.$inject = [
  'LanguageService', 'SessionService', 'bhConstants', '$translate',
  'NotifyService', '$window', 'SystemService', 'ReceiptService'
];

/**
 * Settings Page Controller
 *
 * The settings page allows a user to control the local application settings,
 * such as display language.
 *
 * @constructor
 */
function SettingsController(Languages, Session, Constants, $translate, Notify, $window, System, Receipts) {
  var vm = this;

  vm.back = function back() { $window.history.back(); };
  vm.cachePosReceipt = cachePosReceipt;
  vm.cacheSimplified = cacheSimplified;
  vm.cacheInvoiceCurrency = cacheInvoiceCurrency;

  // load settings from services
  vm.settings = { language : Languages.key, posReceipt : Receipts.posReceipt, simplified : Receipts.simplified };

  // bind methods/services to the view
  vm.languageService = Languages;
  vm.logout = Session.logout;

  /** bind the language service for use in the view */
  Languages.read()
    .then(function (languages) {
      vm.languages = languages;
    })
    .catch(Notify.handleError);

  // formatting or bug report
  var emailAddress = Constants.settings.CONTACT_EMAIL;
  var subject = '[BUG] ' + new Date().toLocaleDateString() + ' -  ' + Session.enterprise.name;

  // get the translated bug report
  $translate('SETTINGS.BUG_REPORT')
    .then(function (body) {

      var text =
        Session.user.username + ' ' +
        new Date().toLocaleDateString() + '\r\n\r\n' +
        body;

      // template in the bug link
      vm.bugLink = encodeURI(emailAddress + '?subject=' + subject + '&body=' + text);
    })
    .catch(Notify.handleError);

  // loads system information from the server
  function loadSystemInformation() {
    System.information()
      .then(function (data) {
        vm.system = data;
      });
  }

  function cachePosReceipt(value) {
    Receipts.setPosReceipt(value);
  }

  function cacheSimplified(value) {
    Receipts.setSimplified(value);
  }

  function cacheInvoiceCurrency(value) {
    Receipts.setReceiptCurrency(value);
  }

  // initialize with data
  loadSystemInformation();
}

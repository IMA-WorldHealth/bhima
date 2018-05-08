angular.module('bhima.components')
  .component('bhFindInvoice', {
    controller : FindInvoiceComponent,
    templateUrl : 'modules/templates/bhFindInvoice.tmpl.html',
    bindings : {
      patientUuid :       '<', // patient uuid - to restrict search to this patient
      onSearchComplete :  '&', // bind callback to call when data is available
      disabled :          '<', // bind disable behavior
    },
  });

FindInvoiceComponent.$inject = [
  'PatientService', 'PatientInvoiceService', 'AppCache', 'NotifyService',
];

/**
 * The Find Invoice Component
 */
function FindInvoiceComponent(Patients, PatientInvoice, AppCache, Notify) {
  const vm = this;

  /* @const the enter key keycode */
  const ENTER_KEY = 13;

  const translate = {
    name : '',
  };

  vm.$onInit = function onInit() {
    vm.disabled = vm.disabled || false;
  };

  /* Expose functions and variables to the template view */
  vm.search = search;
  vm.onKeyPress = onKeyPress;
  vm.translate = translate;

  /**
   * @method search
   */
  function search(form) {
    form.$setSubmitted();

    PatientInvoice.findConsumableInvoicePatient(vm.invoiceReference, vm.patientUuid)
      .then(invoice => {
        if (!invoice.details) {
          vm.invoiceFound = false;
          return;
        }
        selectInvoice(invoice);
      })
      .catch(Notify.handleError);
  }

  /**
   * @method selectInvoice
   *
   * @param {object} invoice The invoice object
   */
  function selectInvoice(invoice) {
    vm.invoiceFound = true;

    const elementId = 'search';
    const searchButton = document.getElementById(elementId);

    if (invoice && typeof (invoice) === 'object') {
      vm.translate.name = invoice.details.debtor_name;
      vm.invoiceDescription = invoice.details.description;
      vm.invoiceItems = invoice.items.map(item => `${item.text}: ${item.quantity} ${item.inventory_unit}`);

      // call the external function with patient
      vm.onSearchComplete({ invoice });

      // set focus on the search button after a search
      searchButton.focus();
    }
  }

  /**
   * @method onKeyPress
   *
   * @param {object} event - a DOM event bubbled up to the function
   *
   * @description
   * This function capture the "Enter" key push of the user and call a function
   * to do something.
   */
  function onKeyPress(event, form) {

    // submit the find-invoice form
    if (event.keyCode === ENTER_KEY) {
      search(form);
      event.preventDefault();
    }
  }
}

angular.module('bhima.services')
  .service('Invoice', InvoiceService);

InvoiceService.$inject = [
  'InvoiceItems', 'PatientService', 'PriceListService'
];

/**
 * @class Invoice
 * Invoice Service
 *
 * @description
 * This service provides helpers functions for the patient invoice controller.
 * It is responsible for setting the form data for the invoice.
 *
 * @todo (required) Only the maximum of the bill should be subsidised
 */
function InvoiceService(InvoiceItems, Patients, PriceLists) {

  // Reduce method - assigns the current billing services charge to the billing
  // service and adds to the running total
  function calculateBillingServices(billingServices, total) {
    return billingServices.reduce(function (current, billingService) {
      billingService.charge = (total / 100) * billingService.value;
      return current + billingService.charge;
    }, 0);
  }

  // This is a separate(very similar) method to calculating billing services
  // as subsidies will require additional logic to limit subsidising more then 100%
  function calculateSubsidies(subsidies, total) {

    // All values are percentages
    return subsidies.reduce(function (current, subsidy) {
      subsidy.charge = (total / 100) *  subsidy.value;
      return current + subsidy.charge;
    }, 0);
  }


  // Invoice instance - this should only exist during the controllers lifespan
  function Invoice() {
    this.rows = new InvoiceItems('SaleItems');
    this.setup();
  }

  // initial setup and clearing of the invoice
  Invoice.prototype.setup = function setup() {

    // the invoice details
    this.details = {
      is_distributable : 1,
      date : new Date(),
      cost : 0,
      description : null
    };

    // the recipient is null
    this.recipient = null;

    // this object holds the abstract properties of the invoice
    this.billingServices = [];
    this.subsidies = [];
    this.rows.clear();

    // this object holds the totals for the invoice.
    this.totals = {
      billingServices : 0,
      subsidies : 0,
      rows : 0,
      grandTotal : 0
    };

    // trigger a totals digest
    this.digest();
  };


  /**
   * @method setPatient
   *
   * @description
   * This method downloads the patient's billing services, price lists, and
   * subsidies to be applied to the bill.  It sets also sets the `recipient`
   * and `debtor_uuid` properties on the invoice.
   *
   * @param {Object} patient - a patient object as read out of the database.
   */
  Invoice.prototype.setPatient = function setPatient(patient) {
    var invoice = this;

    // load the billing services and bind to the invoice
    Patients.billingServices(patient.uuid)
    .then(function (billingServices) {
      invoice.billingServices = billingServices;
      invoice.digest();
    });

    // load the subsidies and bind to the invoice
    Patients.subsidies(patient.uuid)
    .then(function (subsidies) {
      invoice.subsidies = subsidies;
      invoice.digest();
    });

    if (patient.price_list_uuid) {
      PriceLists.read(patient.price_list_uuid)
      .then(function (priceList) {
        invoice.rows.setPriceList(priceList);
        invoice.digest();
      });
    }

    invoice.recipient = patient;
    invoice.details.debtor_uuid = patient.debtor_uuid;
    invoice.rows.addItems(1);
    invoice.digest();
  };

  /**
   * @method setService
   *
   * @description
   * This method simply sets the `service_id` property of the invoice.
   *
   * @param {Object} service - a service object as read from the database
   */
  Invoice.prototype.setService = function setService(service) {
    this.details.service_id = service.id;
  };


  /**
   * @method digest
   *
   * @description
   * Calculates the totals for the invoice by:
   *  1) Summing all the values in the grid (invoice items)
   *  2) Calculating the additions due to billing services
   *  3) Calculating the reductions due to subsidies
   *  4) Reporting the "grand total" owed after all are applied
   *
   * This method should be called anytime the values of the grid change,
   * but otherwise, only on setPatient() completion.
   */
  Invoice.prototype.digest = function digest() {
    var invoice = this;
    var totals = invoice.totals;
    var grandTotal = 0;

    // Invoice cost as modelled in the database does not factor in billing services
    // or subsidies
    var rowSum = invoice.rows.sum();
    totals.rows = rowSum;
    invoice.details.cost = rowSum;
    grandTotal += rowSum;

    // calculate the billing services total and increase the bill by that much
    totals.billingServices = calculateBillingServices(invoice.billingServices, grandTotal);
    grandTotal += totals.billingServices;

    // calculate the subsidies total and decrease the bill by that much
    totals.subsidies = calculateSubsidies(invoice.subsidies, grandTotal);
    grandTotal -= totals.subsidies;

    // bind the grandTotal
    totals.grandTotal = grandTotal;
  };

  /**
   * This method exists purely to intercept the change call from the grid.
   */
  Invoice.prototype.configureItem = function configureItem(item) {
    this.rows.configureItem(item);
    this.digest();
  };

  return Invoice;
}

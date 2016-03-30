angular.module('bhima.services')
  .service('Invoice', InvoiceService);

InvoiceService.$inject = [
  'InvoiceItems', 'AppCache'
];

/**
 * Invoice Service
 *
 * This service provides a model for generic to be used by any controller,
 * patient, purchase orders etc.
 *
 * @todo Discuss - currently all total values are force calculated by
 * in the angular digest loop (from the angular template) - this vs. $watch
 *
 * @todo (required) Only the maximum of the bill should be subsidised
 *
 * @example
 * var invoice = new Invoice('cacheKey');
 */
function InvoiceService(InvoiceItems, AppCache) {

  function calculateBillingServices(billingServices, total) {

    // Reduce method - assigns the current billing services charge to the billing
    // service and adds to the running total
    var billingCharge = billingServices.reduce(function (current, billingService) {
      billingService.charge = (total / 100) * billingService.value;
      current += billingService.charge;
      return current;
    }, 0);
    return billingCharge;
  }

  // This is a seperate (very similar) method to calculating billing services
  // as subsidies will require additional logic to limit subsidising more then 100%
  function calculateSubsidies(subsidies, total) {

    var subsidyReduction = subsidies.reduce(function (current, subsidy) {

      // All values are percentages
      subsidy.charge = (total / 100) *  subsidy.value;
      current += subsidy.charge;
      return current;
    }, 0);
    return subsidyReduction;
  }

  // Reduce method
  function sumTotalCost(currentCost, item) {
    var itemIsValid =
      angular.isNumber(item.quantity) &&
      angular.isNumber(item.transaction_price);

    if (itemIsValid) {
      item.credit = (item.quantity * item.transaction_price);
      currentCost += item.credit;
    }
    return currentCost;
  }

  // Invoice instance - this should only exist during the controllers lifespan
  function InvoiceModel() {
    var invoice = this;

    invoice.billingServices = {
      items : [],
      total : 0
    };

    invoice.subsidies = {
      items : [],
      total : 0
    };

    invoice.rows = {

      // TODO This should also be initialised
      items : new InvoiceItems('saleItems'),
      total : 0
    };

    invoice.total = 0;

    invoice.details = { is_distributable : '1' };
    invoice.recipient = null;

    function configureGlobalCosts(recipientServices, recipientSubsidies) {
      invoice.billingServices.items = recipientServices;
      invoice.subsidies.items = recipientSubsidies;
    }

    function total() {
      var total = 0;

      invoice.rows.total = invoice.rows.items.currentRows.data.reduce(sumTotalCost, 0);
      total = invoice.rows.total;

      invoice.billingServices.total = calculateBillingServices(invoice.billingServices.items, total);
      total += invoice.billingServices.total;

      invoice.subsidies.total = calculateSubsidies(invoice.subsidies.items, total);
      total -= invoice.subsidies.total;

      // Invoice cost as modelled in the database does not factor in billing services
      // or subsidies
      invoice.details.cost = invoice.rows.total;
      return total;
    }

    invoice.configureGlobalCosts = configureGlobalCosts;
    invoice.total = total;

    // Alias items as these are frequently used
    invoice.items = invoice.rows.items;

    return invoice;
  }
  return InvoiceModel;
}

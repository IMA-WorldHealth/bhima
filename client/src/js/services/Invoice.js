'use strict';

angular.module('bhima.services')
  .service('Invoice', Invoice);

Invoice.$inject = ['InvoiceItems', 'appcache'];

function Invoice(InvoiceItems, AppCache) { 
  var invoice = this;
  // Accept billing serivces, subsidies + price lists 
  // Price lists passed to inventory items 
  // calculate total facotrs in subsidies + billing services
  
  console.log('invoice service fired');
 
    
  
  // global costs 
  invoice.billingServices = [];
  invoice.subsidies = [];
  
  invoice.details = {};

  // TODO Initialise per session 
  invoice.items = InvoiceItems;
  invoice.recipient = null;
  
  invoice.itemsCost = 0;
  invoice.billingServiceCost = 0;
  invoice.subsidyCost = 0;
  invoice.totalCost = 0;
  
  function configureGlobalCosts(billingServices, subsidies) { 
    console.log('configure global costs');
    invoice.billingServices = billingServices;
    invoice.subsidies = subsidies;
  }
  
  // TODO Discuss - currently all values are force calculated by the angular template 
  // calling this method - this then updates all of the other values that are statically 
  // referenced. Design decision - should this be called from the angular template or using
  // something like $watch
  function total() { 
    var total = 0;
    invoice.itemsCost = invoice.items.current.data.reduce(sumTotalCost, 0);
    total = invoice.itemsCost;
  
    invoice.billingServiceCost = calculateBillingServices(total);

    // Apply billing services before factoring in subsidies
    total += invoice.billingServiceCost;

    invoice.subsidyCost = calculateSubsidies(total);
    total -= invoice.subsidyCost; 
    
    // console.log('billing service', invoice.billingServiceCost); 
    // console.log('calculated total', total);
    return total;
  }
 
  // TODO Do checks to make sure billing service is valid whilst applying
  // billing service is always a percentage

  // TODO rewrite these as reduces
  function calculateBillingServices(invoiceTotal) { 
    var billingCharge = 0;
    
    invoice.billingServices.forEach(function (billingService) {
      var serviceCharge = (invoiceTotal / 100) * billingService.value;
      billingService.charge = serviceCharge;
      billingCharge += serviceCharge;
    });

    return billingCharge;
  }
  
  // Currently works just first come first served - potentially there
  // should be rules for what order to take subsidies
  
  // TODO only the maximum of the bill should be subsidised - each subsidy should
  // know how much it is being used
  function calculateSubsidies(invoiceTotal) { 
    var subsidyReduction = 0;

    invoice.subsidies.forEach(function (subsidy) { 
      // All values are percentages
      var subsidyCharge = (invoiceTotal / 100) *  subsidy.value;
      subsidyReduction += subsidyCharge;
    });

    return subsidyReduction;
  }
 
    
  /**
   * Utility methods 
   */
  function sumTotalCost(currentCost, item) { 
    var itemIsValid =
      angular.isNumber(item.quantity) && 
      angular.isNumber(item.unit_price);
    
    if(itemIsValid) { 
      currentCost += (item.quantity * item.unit_price);
    }

    return currentCost;
  }
  
  invoice.configureGlobalCosts = configureGlobalCosts;
  invoice.total = total;


}

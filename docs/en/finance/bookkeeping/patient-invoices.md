# Patient Invoicing

BHIMA packages a powerful, flexible, and simple patient invoicing module.  Patients are invoiced for goods and services in the [inventory](../../stock-management/inventory).  At the time of invoicing, the price of individual items are calculated from the base price of the inventory and any price lists that may apply to the patient.  Furthermore, an additional charge, known as an [Invoice Fee](#), or an additional reduction, known as a [Subsidy](#), can be applied at the time of invoice based on the patient's [debtor group](../core-concepts/debtor-groups) or patient groups.  Taken together, these allow an institution to model a series of complex invoicing scenarios.

## How does BHIMA calculate the price of an item?

At the time of invoicing, BHIMA must compute a price based on three pieces of information:

  1. The institution's price list
  2. The patient's _patient group_
  3. The patient's _debtor group_

If a price list exists, the prices on that list will always override the inventory price. However, the application seeks to apply the lowest price possible for any particular item - if multiple price lists apply to the patient, the items will assume their lowest possible price across all applicable price lists.

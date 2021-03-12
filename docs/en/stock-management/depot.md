&raquo; [Home](../index.md) / [Inventory Management](./index.md) / Depots

# Depots

<div class="bs-callout bs-callout-warning">
  <p>
    <b>Attention!</b> A user must be assigned to a depot before it will be visible
    for them to use.

    To avoid user mistakes and fraud, BHIMA requires that each user be individually
    assigned to a depot similar to cashboxes.
  </p>
</div>


Depots are used to store articles.  We can not talk about stock without talking about depots. The depot forms
a container for the enterprise's stock, and allows users to enter stock through [Stock Entry](./movement.entry.md), or dispense
stock through [Stock Exit](./movement.exit.md). 

To create a new depot, click on the **Add Depot** button in the top right corner of the module.  This opens a
modal window to enter the depot information.


## Depot Heirarchies
BHIMA allows users to structure their depots in a tree hierachary of parents and children, similar to the chart
of accounts.  This feature exists to allow easier permissions management.  If a user is responsible for many depots
in a region, it may make sense to group these regionally and assign a user the permissions to all child depots in that
region.  Functionally, the parent-child relationship has no bearing on which depots can transfer stock between one another.


## Depot Capabilities
Each depot can be customized to allow only certain kinds of entries and exits.  For example, a central
warehouse might not distribute directly to patients, but may serve as a staging center to distribute to
other depots.  Similarly, a depot could be a distribution center only and not allow direct entry of
donated or purchased stock.


## Average Monthly Consumption by Depot
The Average Monthly Consumption (AMC) is calculated for the enterprise as a whole and for individual depots.  The
calculation is slightly different though, depending on the type of depot.

For dispensing pharmacies, the Average Monthly Consumption is calculated based on the distributions/exits to _patients_
or _services_.  These are considered consumption of the depot and factor into the average monthly consumption.

For warehouses, BHIMA considers transfers to other depots as consumption in addition to the exits to patients and services.
By including transfers, BHIMA can estimate when to refill stock in warehouses when they otherwise would not be considered.

BHIMA offers two choices of algorithm that differ slighty:

  1. **Default Algorithm** - The average monthly consumption is obtained by dividing the quantity consumed during the period by
  the number of days with stock during the period, and by multiplying the result by 30.5.
  2. **MSH Algorithm** - The average consumption is obtained by dividing the quantity consumed during the period by number of
  months of stock (found by subtracting the number of days of stock outs divided by 30.5 from the number of months in the period).
  The MSH algorithm is recommended by the [Management Sciences for Health](https://www.msh.org) organization.

These algorithms produce identical or similar results.  The main difference is in rounding - the MSH algorithm converts to months
before the computation while the default algorithm converts to months as a last step.

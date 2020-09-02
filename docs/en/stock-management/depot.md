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


Depots are used to store products.  We can not talk about stock without talking about depots. The depot forms
a container for the enterprise's stock, and allows users to enter stock through [Stock Entry](), or dispense
stock through [Stock Exit]().

To create a new depot, click on the **Add Depot** button in the top right corner of the module.  This opens a
modal window to enter the depot information.



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


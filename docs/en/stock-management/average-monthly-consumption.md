&raquo; [Home](../index.md) / [Stock Management](./index.md) / Average Monthly Consumption

# Average Monthly Consumption by Depot
The Average Monthly Consumption (AMC) is calculated for the enterprise as a
whole and for individual depots.  The calculation is slightly different
though, depending on the type of depot.

For dispensing pharmacies, the Average Monthly Consumption is calculated based
on the distributions/exits to _patients_ or _services_.  These are considered
consumption of the depot and factor into the average monthly consumption.

For warehouses, BHIMA considers transfers to other depots as consumption in
addition to the exits to patients and services.  By including transfers, BHIMA
can estimate when to refill stock in warehouses when they otherwise would not
be considered.

BHIMA offers two choices of algorithm that differ slighty:

  1. **Default Algorithm** - The average monthly consumption is obtained by
  dividing the quantity consumed during the period by the number of days with
  stock during the period, and by multiplying the result by 30.5.

  2. **MSH Algorithm** - The average consumption is obtained by dividing the
  quantity consumed during the period by number of months of stock (found by
  subtracting the number of days of stock outs divided by 30.5 from the number
  of months in the period).  The MSH algorithm is recommended by the
  [Management Sciences for Health](https://www.msh.org) organization.

These algorithms produce identical or similar results.  The main difference is
in rounding - the MSH algorithm converts to months before the computation
while the default algorithm converts to months as a last step.

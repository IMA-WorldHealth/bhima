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


Depots are used to store stock articles.  We cannot talk about stock without talking about depots since all stock articles are assigned to specific depots. The depot forms a container for the enterprise's stock, and allows users to enter stock through [Stock Entry](./movement.entry.md), or dispense stock through [Stock Exit](./movement.exit.md).

To see the registry of known depots:

<div class="bs-callout bs-callout-success">
  <p>
  <i>menu</i> > Stock > <strong>Depot Management</strong> <br>
   &rArr; Opens a registry of known depots and allows editing existing depots and creating new ones
  </p>
</div>

To edit an existing depot, click on the **Action** link on the right end of the line of the depot you want to edit.  Then click on the "Edit" link, make the changes on to the depot and then click the **[Submit]** button on the bottom of the edit form.

To create a new depot, click on the **[Add Depot]** button in the top right corner of the page.  This opens a
modal window to enter the depot information.


## Depot Heirarchies
BHIMA allows sites to structure their depots in a tree hierachary of parents and children, similar to the chart
of accounts.  This feature exists to allow easier permissions management.  If a user is responsible for many depots
in a region, it may make sense to group these regionally and assign a user the permissions to all child depots in that
region.  Functionally, the parent-child relationship has no bearing on which depots can transfer stock between one another.


## Depot Capabilities
Each depot can be customized to allow only certain kinds of entries and exits.  For example, a central
warehouse might not distribute directly to patients, but may serve as a staging center to distribute to
other depots.  Similarly, a depot could be a distribution center only and not allow direct entry of
donated or purchased stock.

## Getting Access to a Depot
Before managing or accessing a depot, you must have authorization. To get access, open the User Management page:

<div class="bs-callout bs-callout-success">
  <p>
  <i>menu</i> > Administration > <strong>User Management</strong> <br>
   &rArr; Opens a registry of users
  </p>
</div>

Use the **Action** link on the right end of the line for the user you wish to update and click on the "Depot Management" link.  A form will appear that will allow you to enter the name of the depot for which you want to obtain permission to manage.  Click in the box under the "Add:" and type.  After you type in a few characters, the full name should appear.  Click on it to select it.  The depot name should now be shown.  Then confirm the authorization by clicking on the blue **[Submit]** button.  If the operation is successful, a green "Updated" message should appear briefly at the top of the page.

Enabling this authorization is only necessary once (per user). Once done, the user should be able to carry out operations related to stock movements with the authorized depot.


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

# Suppliers

Since the stock in a **Depot** orginally comes from a supplier, the available **Supplier**s must be configured before creating purchase orders for stock from suppliers.  To create a supplier:

<div class="bs-callout bs-callout-success">
  <p>
  <i>menu</i> > Administration > <strong>Supplier Management</strong> <br>
   &rArr; Opens a registry of known Suppliers and allows editing existing Suppliers and creating new ones
  </p>
</div>

To edit an existing supplier, click on the **Actions** link on the far right of the line with the supplier you wish to edit and click on the "Edit" link.

To create a new Supplier, click on the **[Add A Supplier]** button on the top right.  Most of the form entries are self-explanatory.  The "Group" field offers you a list of pre-configured creditor groups to choose from; click on the one that is related to the supplier in creation for the to select.   Finally, click on the blue "Submit" button at the bottom right of the form to confirm the configuration and create the supplier.   A message will be shown to indicate success or to explain errors in the form needing correction. 

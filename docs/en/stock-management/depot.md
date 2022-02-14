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

Depots are used to store stock articles.  We cannot discuss stock without
talking about depots since all stock articles are assigned to specific
depots. The depot forms a container for the enterprise's stock, and allows
users to enter stock through [Stock Entry](./movement.entry.md), or dispense
stock through [Stock Exit](./movement.exit.md).

To see the registry of depots:

<div class="bs-callout bs-callout-success">
  <p>
  <i>menu</i> > Stock > <strong>Depot Management</strong> <br>
   &rArr; Opens a registry of known depots and allows editing existing depots and creating new ones
  </p>
</div>

To edit an existing depot, click on the **Action** link on the right end of
the row of the depot to edit.  Then click on the "Edit" link, make the changes
on to the depot and then click the **[Submit]** button on the bottom of the
edit form.

To create a new depot, click on the **[Add Depot]** button in the top right
corner of the page.  This opens a modal window to enter the depot information.
While creating a new depot, you will need to specify the supplier.  For more
details on creating and editing suppliers within BHIMA, please see the
[Supplier documentation](./supplier.md).


## Depot Heirarchies
BHIMA allows sites to structure their depots in a tree hierachary of parents
and children, similar to the chart of accounts.  This feature exists to allow
easier permissions management.  If a user is responsible for many depots in a
region, it may make sense to group these regionally and assign a user the
permissions to all child depots in that region.  Functionally, the
parent-child relationship has no bearing on which depots can transfer stock
between one another.


## Depot Capabilities
Each depot can be customized to allow only certain kinds of entries and exits.
For example, a central warehouse might not distribute directly to patients,
but may serve as a staging center to distribute to other depots.  Similarly, a
depot could be a distribution center only and not allow direct entry of
donated or purchased stock.

## Getting Access to a Depot
Before managing or accessing a depot, a user have authorization. To get
access, open the User Management page:

<div class="bs-callout bs-callout-success">
  <p>
  <i>menu</i> > Administration > <strong>User Management</strong> <br>
   &rArr; Opens a registry of users
  </p>
</div>

Use the **Action** link on the right end of the line for the user you wish to
update and click on the "Depot Management" menu item.  A form will appear that
will allow you to enter the name of the depot you want to obtain permission to
manage. Click in the input box under the "Add:" and begin typing the depot
name. After you type in a few characters, BHIMA will look up the depot by name
and the full name should appear. Click on it to select it. The depot name
should now be shown.

If you do not see any depots names loaded, this could mean that either you
have a slow connection to the server or your have mistyped your depot
name. Confirm the name is of an existing depot and try again.

Then confirm the authorization by clicking on the blue **[Submit]** button.
If the operation is successful, a green "Updated" message will appear briefly
at the top of the page.

Enabling this authorization is only necessary once (per user). Once done, the
user will be able to carry out operations related to stock movements with the
authorized depot.

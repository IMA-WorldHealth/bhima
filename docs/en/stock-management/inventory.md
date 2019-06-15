&raquo; [Home](../index.md) / [Inventory Management](./index.md) / inventories

# Inventories

Inventories are information about products or services that can be billable, or that can be stored in repositories.

The difference between inventory and stock in BHIMA is that the inventory is information on a product (or service) regardless of the quantity and the deposit concerned, whereas a stock concerns an inventory, its batch, its quantity and its deposit.

### Inventory register

To access the inventory module:

<div class="bs-callout bs-callout-success">
  <p>Inventories > <strong>Inventory Register</strong> : This module is a registry that lists all the inventories of the system, and allows you to create new ones.
  </p>
</div>

To create a new inventory, click on the **Add Inventory** button which will open a modal window to enter the inventory information.

It should be noted that the inventory requires some information beforehand. these prerequisites must exist in the system before creating the inventory.

<div class="bs-callout bs-callout-warning">
  <h4> Requirements </h4>
  <ul>
    <li>
      <strong>Inventory group</strong>: The inventory group contains the <em>accounting information (inventory, expense, and product accounts)</em> for inventory in this group
    </li>
    <li>
      <strong>Inventory type</strong>: The inventory you want to add is an item, a service, or something else
    </li>
    <li>
      <strong>Unit or dosage form</strong>: Does the inventory unit exist in the system, otherwise this unit must be added.
    </li>
  </ul>
</div>

### Configurations

This module allows to create information required for inventories, such as:
- inventory groups
- types of inventories
- inventory units

To access the module related to the inventory configuration:

<div class="bs-callout bs-callout-success">
  <p>Inventory > <strong>Configuration</strong>: This module allows you to create, edit, and delete inventory groups, inventory types, and inventory units.
  </p>
</div>

#### Inventory groups

A group of inventories is a collection of inventories that share the same:
- Product Account
- Charge account
- Stock account

If within the company, there are inventories that share these three accounts (product, load and stock) or have these three accounts in common, there must be a group of inventories in BHIMA that has these three accounts, and the inventories concerned must have as group of inventories this group.

The groups of inventories have as a prerequisite: the accounts, it is necessary that the accounts (product, load and stock) can exist in BHIMA; if they do not exist, they should be created.

<div class="bs-callout bs-callout-warning">
  <h4>Requirements</h4>
  <ul>
    <li>
      <strong>Accounts</strong> : see the account module in Finance.
    </li>
  </ul>
</div>

#### Inventory types

In BHIMA the inventories can be either:
- Articles
- Services
- Assemblies

If a type is missing, you can easily add it. In the inventory type section, click `Add`.

#### Units or galenical form of inventories

The unit consitutes the unit to consider to give the quantity of the inventory in the stock, or even the smallest unit to be considered during a billing.

If a unit is missing, you can easily add it. In the unit or inventory dosage form section, click `Add`.
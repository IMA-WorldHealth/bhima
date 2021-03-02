&raquo; [Home](../index.md) / [Inventory Management](./index.md) / Inventory

# Inventory

In BHIMA, "inventory" refers to information about products or services are sold to clients, or any assets or material that must be tracked over time.

The difference between inventory and stock in BHIMA is that inventory is the description of a product (or service), whereas stock is the physical asset stored in the depot.

For example, an inventory item might be a "Appendectomy" which is a service and will not have a representation in stock.  However, the inventory item "Quinine 500mg" will have a representation in stock as pills bought on a given date with a quantity and expiration date.

There are two modules that compose BHIMA's inventory management:

1. [Inventory Registry](#inventory-registry)
2. [Configuration](#configuration)

We'll cover each of these below.

### Inventory Registry

The Inventory Registry provides an overview of all inventory items in the application.  To access the Inventory Registry module:

<div class="bs-callout bs-callout-success">
  <p>
    Inventory > <strong>Inventory Registry</strong>: This module is a registry that lists all inventory times in the system, allows you to create new ones, or import an inventory from a CSV file.
  </p>
</div>

The registry also has links inline to the Invoices Registry, Stock Movements Registry, Articles in Stock Registry, and Inventory Changes Report.


#### Creating an Inventory Item

To create a new inventory item, click on the **+ Add Inventory** button which will open a modal window to enter the inventory information.  The following information is required:

1. **Code** - a unique identifier for the product or service.  This code is usually a shorthand method of looking up inventory items useful in both the pharmacy and invoicing.
2. **Name** - the full name of the inventory item.
3. **Price** - the default sale price of the inventory item.  Note that can be later modified by a [price list](#) for a patient, patient group, or debtor group.  The price is always set in the enterprise currency.
4. **Group** - the inventory group set in the [configuration](#configuration) section.
5. **Type** - the type of inventory item. This distinguishes between goods ands services.
6. **Unit** - the unit of measurement for the inventory item.  This is typically "pills", "tablets", "milligrams", "liters", "boxes" or some other basic unit.

There are also some optional properties:

1. **Consumable** - determines whether consumption information should be tracked for stock items.  Defaults to `false`.
2. **Default Quantity** - the default quantity given in an invoice.  Defaults to `0`.
3. **Weight** - the weight of the item.   Defaults to `0`. _Note: BHIMA currently does not use this field for anything._
4. **Volume** - the volume of the item.  Defaults to `0`. _Note: BHIMA currently does not use this field for anything._
5. **Delay** - the delivery lag time (in months) of the item.  Defaults to `1 month`.
6. **Average Consumption** - manually set the average consumption of an item.  If left blank, the average consumption will be automatically calculated.
7. **Purchase Interval** - (?)
8. **Sellable** - indicates if the item can be sold to clients in the Patient Invoice module. Defaults to `true`.
9. **Note** - an open text field for notes on the item.

As mentioned above, the inventory requires some prerequisite information beforehand. These prerequisites must exist in the system before creating the inventory item.

<div class="bs-callout bs-callout-warning">
  <h4>Requirements</h4>
  <ul>
    <li>
      <strong>Inventory Group</strong>: The inventory group contains the <em>accounting information (inventory, expense, and income accounts)</em> for inventory in this group
    </li>
    <li>
      <strong>Inventory Type</strong>: The inventory type you want to add is an item, a service, or something else
    </li>
    <li>
      <strong>Unit or dosage form</strong>: Does the inventory unit exist in the system, otherwise this unit must be added.
    </li>
  </ul>
</div>

### Configuration

This module allows to create information required for inventory, such as:
- inventory groups
- types of inventories
- inventory units

To access the module related to the inventory configuration:

<div class="bs-callout bs-callout-success">
  <p>
  Inventory > <strong>Configuration</strong>: This module allows you to create, edit, and delete inventory groups, inventory types, and inventory units.
  </p>
</div>

#### Inventory Groups

The inventory group defines the accounting information for all inventory items in the group.  An Inventory Group is a collection of items that share the same:

- Sale Account
- Cost of Goods Sold Account
- Stock Account

Clearly, these accounts must exist prior to using them. They are created in [Account Management](../../finance/accounts).

The following properties are required for Inventory Groups:

1. **Name** - the name of the group.
2. **Code** - a shorthand way to refer to the group, similar to an inventory item's code.
3. **Sale Account** - an _income_ account records the income from selling the items in the group.

There are also the following optional properties:

1. **Stock Account** - the value of assets are stored in this account.  The type of account is an asset account.  It is required for stock management.
2. **Cost of Goods Sold Account** - the value of assets sold. The type of account is an expense account.  It is required for stock management.
3. **Expires** - informs the application if expiration dates should be tracked.  Defaults to `true`.
4. **Unique Item** - informs the application that this item does not have stock. Defaults to `false`.

#### Inventory Types

In BHIMA the inventories can be either:

- Articles
- Services
- Assemblies

If a type is missing, you can easily add it. In the inventory type section, click `Add`.

#### Inventory Unit

An inventory unit is the smallest unit of an inventory item considered.  This might be "pill", "tablet", "box", "liter" or any similar unit of measure.

If a unit is missing, you can easily add it. In the unit or inventory dosage form section, click `Add`.

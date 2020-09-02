&raquo; [Home](../index.md) / [Inventory Management](./index.md) / Overview of Inventory Management

# Overview of Inventory Management

## Terminology

Before discussing inventory and stock management in BHIMA, we must establish some terminology.

In BHIMA, **inventory** is used to define the concept of goods and services that can be purchased and sold and are
referred to with codes and names.  The physical items received some suppliers and housed in the depot are called **stock**
and are referred to by lot numbers.

To help clarify the difference between stock and inventory, it is useful to consider what properties
apply to each.

The following are properties of **inventory**:
 1. **Name** - the name of the good or service that can be bought and sold
 2. **Cost of Goods Sold (COGS) Account** - each item of stock is valued at the purchase price.  When a good is sold or lost, an expense is recorded in the cost of goods sold account.
 3. **Stock Account** - once purchased, the value of the goods are written into the stock account.
 4. **Sales Account** - the sales account is credited for every sale of the good.  To understand if you are making a profit on sales, the value of the sales account is compared to the cost of goods sold account.  If the value is higher, the institution is making a profit.

The following are properties of **stock**:
 1. **Purchase Price** - each stock item is bought from a vendor at a price. This is the purchase price.
 2. **Expiration Date** - perishable stock will have an expiration date.  This date will differ from lot to lot.
 3. **Lot Number** - the identifier used to distinguish between different items in stock.  Often, this is issued by the manufacturer.


<div class="bs-callout bs-callout-primary">
<h4>A Philosophical Analogy</h4>
If you are still struggling to understand the relationship between stock and inventory, a useful analogy is that _inventory_ is a platonic form and _stock_ is the physical manifestation of that form.  The institutions sells the inventory item of "Quinine in 500 milligram capsules", but it may not be in stock.  If it is in stock, a particular lot of Quinine might have an expiration date that is different from other Quinines in stock.
</div>

## Features of Stock Management

Inventory management in BHIMA allows you to:

- Have the stock sheet of each item (inventory) in real time
- Valuate stocks in real time
- Know the status of stocks in real time
- Make the entries of stocks:
    - Entry of stocks from purchases
    - Entry of stocks from integrations
    - Entry of stocks from donations
    - Entry of stocks from another warehouse
- Make out of stocks:
    - Outflow of stocks to patients
    - Outputs from stocks to services
    - Outflow of stocks to other deposits
    - Out of stock as inventory loss
- Make inventory adjustments
- Make inventory assignments
- Consult the registers of stocks:
    - The batch register
    - The inventory register
    - Inventory movements register

### the dependencies of the stock management

To manage stock with BHIMA there are some dependencies that must be completed beforehand.

![Inventory Management](../../images/stock_dependencies.svg)

This management requires certain prerequisites:

- **The presence of depots**: stocks are always in deposits, from which you can not manage stocks without defining deposits.

- **The presence of inventories**: the inventories in BHIMA are the information on articles or services, but in the context of the stock it is the information on articles that can be stored in repositories

- **The presence of users with the required permissions on the repositories**: BHIMA has a permission policy on deposits, that is to say that only authorized users can have access to a given repository

&raquo; [Home](../index.md) / [Inventory Management](./index.md) / Overview of Inventory Management

# Overview of inventory management

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

- **The presence of deposits**: stocks are always in deposits, from which you can not manage stocks without defining deposits.

- **The presence of inventories**: the inventories in BHIMA are the information on articles or services, but in the context of the stock it is the information on articles that can be stored in repositories

- **The presence of users with the required permissions on the repositories**: BHIMA has a permission policy on deposits, that is to say that only authorized users can have access to a given repository

&raquo; [Home](../index.md) / [Inventory Management](./index.md) / Stock Settings

# Stock Settings

There are a number of settings that affect how the BHIMA software deals with
stock management.  To check and update the settings, one goes to the "Stock
Settings" page (under the "Stock" folder):

![Stock Settings Page](./images/stock-settings-page.png)

If you do not see the "Stock Settings" menu item, consult your system
adminstrator.  You need to be given permission to access that page.

- To add permission for a user to access the "Stock Settings' page: Under
  `Administration > Role Management`, click on the action menu on the right
  end of the desired user.  In the action menu, click on `Permission`.  Scroll
  down to "Stock Settings" (at the end of the Stock items), then click the check
  box and the [Save] button.  The Stock Settings page should now be accessible
  for the user.

## AMC - Average Monthly Consumption

For the following Stock Setting options, the term "AMC" is used.  It
represents "Average Monthy Consumption" of stock.  AMC is the total number of
stock items dispensed on average to **patients** for the facility involved.
AMC is an important value that used to estimate when to order more stock.

## Individual Stock Settings
The Stock Settings page allows access to the following items:

- **Number of months for calculating the average monthly consumption** (integer)  
  This determines the number of months in the past to use to calculate the
  average monthly consumption. The AMC is a "moving" average, since it uses a
  window of only the previous X months to determine the average. This setting
  will set the X.  (Default: 6)

- **Default minimum number of months of security stock for depots** (integer)  
  The stock supply should provide at least this many months of stock for the
  depot involved. (Default: 2)

- **Enable automatic confirmation of purchase orders** (yes/NO)  
  Enable automatic confirmation of purchase orders when they are created
  without requiring manual confirmation

- **Enable permission to view depots in stock registries** (yes/NO)  
  Limit the consultation of stock registries to users according to their
  depots

- **Enable automatic stock accounting** (YES/no)  
  Enabling this feature will write stock movement transactions into the
  posting journal in automatically, in real time. It requires all inventory
  accounts to be correctly configured.

- **Enable automatic crediting of supplier on stock entry** (yes/NO)  
  Automatically adds the transactions to credit the supplier for the value of
  stock received in a depot when entering stock from a purchase order. This is
  only triggered if the automatic stock accounting is set as well.

- **Activate the restriction of distribution depots** (yes/NO)  
  Limit the list of distribution depots for depots

- **Algorithm for calculating average monthly consumption**.  Possible choices:

  - **Algorithm 1**: The average monthly consumption is obtained by dividing
    the quantity consumed during the period defined by the number of days of
    stock for said period, and by multiplying the result obtained by 30.5.

  - **Algorithm 2**: The average consumption is obtained by dividing the
    quantity consumed during the period defined by the number of days of
    consumption for said period, and by multiplying the result obtained
    by 30.5.

  - **Algorithm 3**: The average consumption is obtained by dividing the
    quantity consumed during the period defined by the number of days in the
    period, and by multiplying the result obtained by 30.5.

  - **Algorithm 4 (MSH)** (default): The average consumption is obtained by
    dividing the quantity consumed during the period defined by the number of
    months minus the number of months divided by the total number of days of
    stock out.


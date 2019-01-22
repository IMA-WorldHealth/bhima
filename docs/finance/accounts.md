# Account Management

_Located in: **Finance > Account Management**_

BHIMA allows a user to create a detailed chart of accounts.  All accounts must specify the following points of information:
 1. **Number** - a unique number to identify the account.  The length shouldn't exceed 12 characters.
 2. **Label** - a textual label that is often displayed with the account number to identify the purpose of the account.
 3. **Type** - the account type determines how the account will behave.  An account type can be:
    1. _Title_ - a label account used to group subaccounts.  Title accounts are never used directly, but roll up totals in reports.
    2. _Liability_ - holds the client accounts
    3. _Asset_ - Bank, cash, and other asset accounts
    4. _Capital_ - contains capital gains, physical plant, and other capital accounts.
    5. _Income_
    6. _Expense_

 4. **Parent** - the parent account is determines the account grouping.  By default, a top level account will fall under the _root node_.  However, any title account can be a parent account, allowing the user to build an account tree.

## Navigating the Accounts List

BHIMA presents the list of accounts has a tree of parent and child accounts.  Parent accounts are _title_ accounts, are presented in bold, and can contain zero or more child accounts. These child accounts are displayed slightly indented underneath the parent accounts.

<div class="bs-callout bs-callout-primary">
<h4>Note!</h4>
It is important to note that the nesting structure in Accounts Management is determined by the parent/child relationships, not by the account number.  However, to avoid confusion, it is advisable to make the level of the account in the tree determinable based on the account number.
</div>

## Creating an Account

To create a new account, the button **Create an Account** in the top right corner opens a modal form to create a new account.  Once the user has filled out the required fields, they may submit the modal to create a new account.

An alternative method of creating an account is to click the button **Add a Child Account** inline in the grid.  This button appears on title accounts and will pre-configure the account creation modal with the parent property set to the chosen title account.

If the user would like to create multiple accounts, they may check the box labeled **add another account**.  This will persist the modal, allowing the user to submit multiple accounts without needing to re-open the modal.

## Updating an Account

Only two properties of accounts may be updated after an account is created - the account label and the parent of the current account.  This allows a certain amount of regrouping accounts without changing their underlying type of balance.  If more extensive edits need to be made, the account should be closed and/or deleted and a second account made.

## Removing an Account

If an account hasn't been used before, it can be removed via the dropdown on the account grid.  However, BHIMA will block the user from removing the account if it is used anywhere in the system.  The safeguard is in place to prevent users from accidentally deleting critical accounts that either are used for debtors or may contain balances.

## Other Actions

In addition to the basic CRUD operations on accounts, users can optionally hide or lock accounts.

### Hidden Accounts

Hiding an account is purely for usability and does not affect the accounting potion of the system. Hidden accounts are only hidden from user-facing selections.  For example, they will no longer appear in the Debtor Group Management account selection input, or in the typeahead in Complex Vouchers.  However, they will continue to be presented in reports where they are relevant.  This allows old, closed, and unused accounts to be safely removed from the user interface without changing the nature of the account.

### Locked Accounts

Locking an account prevents the user from posting any more movements to this account.  To avoid general confusion, this rule is enforced during the trial balance checks, rather than for each cash payment, invoice, or voucher.  Importantly, a locked account will still be available for use throughout the system.  In order to prevent its use, a user should hide it as well.

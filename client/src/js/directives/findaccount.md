FindAccount Directive
=====================

To use the *findAccount* directive, insert the following into your HTML file:

    <div find-account on-search-complete="selectAccount" on-submit="submitAccount"></div>

The required attributes are:

  * `submitAccount` is a callback function that will be called when
    the [Submit] button on the right side of the account selection
    input field is pressed.  It is called with the selected
    account.  Note that the submit button will not be enabled until
    an account is selected.

Optional attributes:
  
  * `hide-submit` tells the directive to hide the findAccount
    directive submit button.  The page will need to provide an
    [Submit] button elsewhere on the page.  Note that the page
    should still call the findAccount.submit() function when the
    account is to be processed (to pass in the account ID to the
    users 'onSubmit' function and clear the form).  Add it as an
    attribute like this:

       hide-submit

  * `selectAccount` is an optional callback function that will be
    called by the *findAccount* directive when an account is
    selected.  Its argument is either the selected account object
    or null (if the input field is reset).  This function should
    also save the account data for later use.
  
  * `enable-reset` tells the directive to add a reset button on
    the right end of the account selection input field.  When
    pressed, the current account selection will be cleared and the
    `selectAccount` will be called with `null` as its argument.
    Add it as an attribute like this:

       enable-reset

  * `on-reset` sets a callback function that will be called if the
    form's reset button is pressed.  This gives the invoking page a
    chance to reset its internal data if selected account is
    rejected.  Add the attribute as follows:

       on-reset="resetFunction"

  * `where` sets a callback function that will add a 'where' clause to the
    database search for accounts to be shown in the account selection
    typeahead drop-down area.  The `where` callback function should return a
    list of strings, each representing a SQL where clause.  Example usage:

       where="whereClause"

    If you want to restrict the search to income and expense accounts, the
    `whereClause()` function would look like this:

       function whereClause() {
          return [ 'account.type_id in (1,4)' ];
       }

    Note that all fields are included in the query for accounts so the 'WHERE'
    clauses can use any of the `account` table fields.

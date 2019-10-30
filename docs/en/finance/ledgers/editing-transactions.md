## Modifying Transactions <span id="modifying-transactions">#</span>

Sometimes a transaction must be modified to reflect changes made to the transaction \(such as during price negotiation\) or to fix typos.  Modifying transactions is performed first selecting the transaction, then clicking on the "edit" button, which will be illuminated in green.  If the edit button is not highlighted, it means that either a transaction isn't selected, or multiple transactions have been selected.  Only a single transaction can be modified at a time.

To begin modifying a transaction, you must first [select a row or transaction](.../../grid-features/row-selection.md).  Selecting any part of the transaction will select the whole transaction for modification.

Not all properties on a transaction can be modified.  The follow properties of a transaction can be modified:

 1. Transaction Description
 2. Transaction Date
 3. Debit
 4. Credit
 5. Reference
 6. Record
 7. Transaction Type

In addition to altering values in the transaction, the edit modal also allows a user to:

 1. Delete rows from a transaction
 2. Add rows to a transaction

Note that all the regular transaction validation rules continue to apply, and validation is performed when the user attempts to submit their changes.

Note that the values (debits and credit) of a transaction can be changed, but the currency of the transaction cannot be changed.  If a transaction was made in the wrong currency, it must be reversed and completed remade.  This is to prevent confusion during analysis.  Be sure to note the currency of the transaction before altering the values in the transaction.

### Modifying Posted Transactions

If a transaction has been posted, it should not be further modified.  However, in practice, it may be necessary to correct posted mistakes.  To facilitate this procedure, BHIMA lets the user edit transactions as if they were unposted, using the same mechanics as [unposted transactions](#modifying-transactions).  Underneath, the software generates a reversing record and then a new record with the previous and modified values.

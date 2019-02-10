# Trial Balance

The purpose of the Trial Balance is to give a summary view of the data in the Journal before it is posted.  It is a proposition, allowing the accountant to detect errors in the accounts assigned to transactions.  The workflow looks like this:

```mermaid
graph LR;
    J[Journal] --> T[Trial Balance]
    T --> G[General Ledger]
```

## Running a Trial Balance

The Trial Balance is a report run on selected transactions \(see the [Row Selection](/grid-features/row-selection.md) section\).  Once one or more rows are selected, use the Trial Balance in the Menu \(&lt;span class="fa fa-hamburger"&gt;&lt;/span&gt; **Menu** &gt; &lt;span class="fa fa-balance"&gt;&lt;/span&gt; **Trial Balance**\).  This action will bring up the Trial Balance modal.

<div class="bs-callout bs-callout-warning">
<h4>Common Gotchas</h4>

Sometimes the Trial Balance refuses to open with a yellow error bar.  This can occur for a number of reasons:
 1. Ensure you have selected at least one unposted transaction.
 2. Ensure you have no posted transactions selected.  The easiest way to do this is to filter out all posted transactions via the search modal.
</div>

The modal can be in two states: _correct_ and _error_.

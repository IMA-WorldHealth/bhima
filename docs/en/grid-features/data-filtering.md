## Data Filtering

Most grids do not load all records in the database.  Instead, they load the dataset corresponding to a set filters.  The filters persist between page reloads and sessions.   All data filters are configured from a Search Modal linked in a button in the module header.  Data filters are categorized as either _default filters_ or _custom filters_.

_Default filters_ are found on nearly all grids, highlighted in the header in purple.  While the values of default filters can be altered, they cannot be removed.  They are configured in the "Default Filters" tab of the Search Modal.  Common default filters are:

1. **Limit** - controls the number of records the client will attempt to download.  This ensures the application will not load more data than necessary.  Sometimes, a low limit will cut off data that the user wishes to see, and they should increase the limit to get the full dataset.
2. **Period** - sets the start and end date of the dataset.  This applies to transactional data, such as invoices, cash payments, vouchers, and transactions.  The period has various preset values such as _today_, _yesterday_, _this month_, and others, that can be used to quickly choose a sensible date range.  For specific date queries, the _custom_ option allows the user to pick any start and end date.

_Custom filters_ are similar to default filters, though they can be removed and are rendered in dark blue.  They are configured in the "Custom Filters" tab of the Search Modal.  These filters vary considerably depending on the module.  However, as a general rule, the title of the flter parameter is the same as the title of the column in the view it is filtering.  For example, if a module has a column _reference_, user will need to find the input labeled _reference_ to configure the filter.

All filters are additive: the filters `limit:10`, `account:X`, and `period:today` will download the first 10 records of the dataset with account X from today.

Data filtering requires a live connection to the server, since the filtering operation is performed on the server.

<div class="bs-callout bs-callout-danger">
<h4>Check your limits!</h4>
Be careful!  All grids provide a count of the number of rows in the grid.  If you filter on multiple parameters and the number of rows in the grid is equivalent to the limit you set, you may not have all the data you seek.  Increase the limit to be sure you have the full dataset.
</div>

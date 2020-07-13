&raquo; [Home](../index.md) / [Inventory Management](./index.md) / [Stock Movements](./movement.md) / Stock Exit

# Stock Exit

Any outflows of stock from a depot is a stock exit in BHIMA.  The available options are:

1. Exit to Patient *
2. Exit to a Service *
3. Transfer to a Depot
4. Exit to record a Loss

The stock exits marked with an asterisk are _consumptions_ and influence the [average monthly consumption (AMC)](#average-monthly-consumption).  All other types of exits are not considered in the AMC calculation.

Note that stock exits to a patient, service, or recording a loss effectively remove stock items from the enterprise.  The only way to replenish stock after an exit is made is to perform a stock adjustment.

# Average Monthly Consumption (AMC)

The Average Monthly Consumption (AMC) in BHIMA is _currently_ defined as follows:

```sh
AMC = SUM(quantity consumed) / COUNT(days with a stock consumption event)
```

Technically, this is not a complete metric.  This is being tracked in [#4346](https://github.com/IMA-WorldHealth/bhima/issues/4346).  We are working towards implementing the following:

```sh
AMC = SUM(quantity consumed) / COUNT(days with stock on hand)
```

However, for highly used medications, both calculations should approach the same value.

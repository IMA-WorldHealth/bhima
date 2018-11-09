# Voucher Tools

Voucher Tools is a name given to a collection of components and services that automate financial operations through the creation of vouchers.
They provide administrative tools for quickly creating vouchers based on different inputs and tasks.

## Structure

The structure of this unit is to be decided. Currently each tool defines its own component that is responsible for switching between input, output and error states.

## Tools

### Reverse

The Reverse tool allows reversal of any transaction in the posting journal or general ledger.

Input: Transaction to reverse
Process: Submit request to /journal/reverse to generate a voucher reversing this transaction
Output: Description of process and voucher used to reverse transaction

Example Usage:

```html
<bh-voucher-tools-reverse
  ng-if="Ctrl.isReversing"
  source="{ transaction_id : Ctrl.transaction_id }"
  show-badge>
</bh-voucher-tools-reverse>
```

### Correct

Example Usage:

```html

<!-- Notice no show-badge is assigned, it is assumed that the Correct tool -->
<!-- will be integrated in a page that will have to modify its own UI to -->
<!-- provide the voucher rows required by Correct -->
<bh-voucher-tools-correct
  ng-if="Ctrl.isCorrecting"
  source="{ transaction_id : Ctrl.transaction_id, voucher_rows : Ctrl.rows }" />
</bh-voucher-tools-correct>
```

## Components

```html
<!-- An inline badge element to demonstrate that a voucher tool is active -->
<!-- on the current module/ component -->
<bh-badge voucher-tools></bh-badge>
```

## Proposed Unify API

An API proposal to unify all voucher tools into an umbrella component, this would allow developers to simply include `<bh-voucher-tool>` and specify which functionality they require. This API should only be implemented when it is clear what is required for building a voucher tool.

```html
<!-- Example usage -->
<bh-voucher-tool
  ng-if="Ctrl.isReversing"
  reverse-transaction />
</bh-voucher-tool>

<bh-voucher-tool
  ng-if="Ctrl.isCorrecting"
  correct-transaction />
```

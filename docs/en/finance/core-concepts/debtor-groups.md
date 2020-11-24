# Debtor Groups

All debtors in BHIMA are organized into Debtor Groups.  Debtor Groups determine the accounts and billing structure for individual debtors.

## Required Information

Because debtor groups are principally a financial concept, we require certain financial information to create one.  These include:

1. **Name** - the name of the group that will show up in labels and dropdown menus throughout the application.
2. **Locked** - locks the group to prevent patient assignment and further invoicing of group members.
3. **Account** - the account used in transactions involving a member of the debtor group.
4. **Price List** - a price list to apply to the debtor group.
5. **Max Credit** - _not implemented yet_ [#5068](https://github.com/IMA-WorldHealth/bhima/issues/5068).

Optional information includes:

1. **Notes** - a text field for user notes
2. **Phone** - a field with phone contact information for representatives of the debtor group.
3. **Email** - a field with email contact information for representatives of the group.
4. **Location** - a series of selects to specify where the group is located.
5. **Color** - a color to associate with the group for easy recognition.

## Conventions / HMOs

A "Convention" is a collective of individuals who are under contract with the medical institution to pay for care of individual members.  It is analogous to an HMO.  Instead of invoicing individual members of the group, the institution will invoice the group for medical care provided to any member of the group.

In BHIMA, conventions are non-cash clients.  This means BHIMA will _block payments at the cash window_ for patients that are in a convention, to prevent double-payment.

## Group Policies

It is often in the best interest of hospitals to charge patients belonging to organisations/HMOs full price to subsidize all the patients who are impoverished and cannot pay.  Conversely, particular debtor groups may a standing relationship with the medical institution to wave administrative fees.

To account for these different scenarios, BHIMA allows administrators to toggle "group policies."  Particular groups can be exempt for subsidies, discounts, or invoicing fees, even if members of the group have subsidies/discounts/fees applied to them from elsewhere.

## Subscriptions

Debtor Groups may be subscribed to individual fees or subsidies.  For example, clients that always pay via mobile money may have a processing fee attached to every invoice.  Similarly, church members may receive a subsidy from a religious organisation.

The "subscriptions" section of the debtor group management allows the administrator to enroll groups in one or more of subscriptions.

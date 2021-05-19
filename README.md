BHIMA
=================

BHIMA is a free, open source accounting and hospital information management system
(HIMS) tailored for rural hospitals in Africa.  We are an international team
based in the Democratic Republic of the Congo.

BHIMA is an acronym for _basic hospital information management application_.

Project Goals
--------------------

BHIMA aims to provide a flexible and robust accounting and managerial solution
for rural hospitals.  This includes, but is not limited to, basic income/expense
reporting, budgeting, patient and organisational billing, depreciation,
inventory and pricing, and purchasing.

Additionally, BHIMA bundles reports and optional reporting plugins to aid
hospital administrators, aid organisations, and governmental/non-governmental
agencies access up to date utilization data.  It targets insitutions that must conform
to the [OHADA](https://en.wikipedia.org/wiki/OHADA) reporting standards in western
and central Africa.

Finally, the entire project is designed to scale from a single, low cost device
in a clinic, to a large multi-hundred bed institution with tens of users
accessing the server simultaneously.

Technology
---------------

The client-side is written in AngularJS and the server in NodeJS.  Session management
is enabled by Redis, and the backend is a MySQL database.

Contributing
---------------
All contributions are welcome!  If you want to get started hacking on BHIMA, the
[developer wiki](https://github.com/IMA-WorldHealth/bhima/wiki) contains notes
on our designs and testing infrastructure.  We also have a dedicated documentation
website https://docs.bhi.ma.  If you have any questions or need help getting started,
please [open an issue](https://github.com/IMA-WorldHealth/bhima/issues/new) - chances
are you are not the only one!

If you just want to jump into to messing with the software, check out [Getting Up And Running](https://github.com/IMA-WorldHealth/bhima/wiki/Getting-Up-and-Running).

If you are new to Github, they have an [excellent guide](https://docs.github.com/en/github/getting-started-with-github).

Installation
-------------------
See the [installation guide](https://docs.bhi.ma/en/for-developers/installing-bhima.html).

License
---------------
BHIMA is licensed under GPL-2.0.  [Read the License](./LICENSE).

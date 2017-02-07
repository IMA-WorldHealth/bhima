Contributor's Guide
=======================

 - Project page: https://github.com/IMA-WorldHealth/bhima
 - Email us: bhimateam@gmail.com

Thank you for your interest!  This document aims to provide a step by step guide for making your first contribution to the bhima codebase.  The first
and most important step is to understand the motivation and target goals of bhima.  You can gain a bit of background by reading our [PURPOSE.md](./docs/PURPOSE.md)
manifesto.  If you have any questions, feel free to email the team.

#### Step 1: Obtaining the code

For an in-depth installation guide (including trouble-shooting tips), please refer to the [INSTALL.md](./docs/INSTALL.md) file.  Continue reading
for the basic steps.

 1. Clone the official repository onto your local machine: `git clone git@github.com:IMA-WorldHealth/bhima.git bhima`
 2. Install the development dependencies: `npm install -g gulp jshint bower && npm install && bower install`
 3. Build the client and server `gulp build`
 4. Startup the server `npm run app`.

 For troubleshooting, please see [the installation guide](./docs/INSTALL.md).

#### Step 2: Setting up GitHub

All our code contributions are monitored via pull requests on Github.  If you have not already, set up an account on Github and
fork the bhima repository.

**NOTE:** All pull request are made against the `development` branch; `master` is reserved for releases.  Be sure to make your PR
against the `development` branch to begin with, or we will ask you to resubmit your PR.

#### Step 3: Determining what to contribute

There are three main areas you can contribute:

1. **Bugs**  We use GitHub isssues as our bug tracker.  Did the application crash?  Is there a misspelling or poor word choice?  Something else that
just annoys you?  Sometimes our design choices are deliberate, other times they are the result of carelessness.  Create an issue about it so that we
can

2. **Translation** We aim to be an international application.  Therefore, all text in the application can be translated.  We use
  [angular-translate](https://github.com/angular-translate/angular-translate) to transform key-value pairs into the appropriate text.  If you would like
  to translate the application, simply add your language to the database (in the table `languages`), and add the language file to in the folder
  `client/i18n/`.  You will see `en.json` and `fr.json` as templates for the initial translation.

3. **Code** Bugs, features, patches all require code generation or rewrites.  We highly recommend emailing us before trying to make significant
code changes so that we may answer any questions and guide you through the process.




#### Step 4: Your first contribution

In your first code contribution we ask that you sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement)
for [individuals](./contributors/individual-cla.md) or [entities](./contributors/entity-cla.md). To do so, please create a file with a name like
`/contributors/{github_username}.md` and in the content of that file indicate your agreement.  Be sure to include your agreement in the first pull
request you make!  An example of this method of agreement can be seen [here](./contributors/jniles.md).

This type of agreement was inspired by [adam-p](https://github.com/adam-p/markdown-here/blob/master/CONTRIBUTING.md)'s CLA.  Thanks!

#### Step 4: Rinse and Repeat

Thank you!  If you've gotten to this step, you have made a valuable contribution to the bhima codebase.  There is still more work to be
done; please recurse to step 3 and repeat!


Other Forms of Contribution
---------------------------

#### Translation

Bhima is an international piece of software.  Our development team operates in both French and English, but would love to round out
our supported languages!  If you would like to get involved in translation work, you can either translate documentation
(see the [user manual](https://github.com/IMA-WorldHealth/bhima/tree/development/docs/BHIMA%20User%20Guide)) or the application itself.
We use [angular-translate](https://github.com/angular-translate/angular-translate) for all client-side translation.  The files are located in `client/src/i18n/{locale}.json`.  Feel free to translate the key-value pairs and store it in your own langage.



Contributor Tips & Tricks
-------------------------

Some helpful tips for code organization:

1. Pick a good branch name for clarity.  Below are some examples of good naming schemes.
 - `features/patient-discharge-form`   implements a new feature for a patient discharge
 - `patches/fiscal-year-transfer`      adds in missing (but intended) functionality transfering budgets between fiscal years
 - `fixes/posting-journal-bug-1193`    fixes bug #1193 in the posting ouranl
 - `docs/budget-documentation`         adds in documentation for the budgeting module

2. Include `fix {#}`, `fixes {#}` in your git commits to link issues.  Link issues to pull requests to track progress.
Examples can be seen [here](https://github.com/jmcameron/bhima/commit/c5441fdf0246ca3b3efa63786064751974971777) and
[here](https://github.com/IMA-WorldHealth/bhima/issues/306)).

3. If you plan to tackle an issue, please comment on the issue indicating you will begin working on it.   This will prevent
our team from doubling up effort on code you are working on.  Also, there are no hard feelings if you try and fail, or begin
and discover that it is grounded in a design decision that cannot be changed immediately.  Give it your best shot!

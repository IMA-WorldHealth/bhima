# End-to-end Tests

BHIMA has a large collection of end-to-end tests using the [Playwright testing environment](https://playwright.dev/docs/intro).  The following guidelines how to get the tests working in your environment.  This description assumes that you have already set up BHIMA development environment (see [Installation](./installing-bhima.md)).

1. Install Playwwright (the tests currently only use the chromium browser):
```bash
  npm install playwright chromium
```

2. Verify that everything is consistent.  The following commands should give the same version numbers:
```bash
  grep 'playwright/test' yarn.lock   # if you are using yarn
  grep 'playwright/test' package.json
  npx playwright --version
```

NOTE:  If you upgrade your version of Playwright in your sandbox, you may need to run this command again to update the browsers for Playwright.

4. Run the end-to-end tests (see `package.json` for the commands for this).

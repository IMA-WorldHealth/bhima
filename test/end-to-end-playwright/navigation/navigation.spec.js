const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Tree Navigation', () => {

  test('toggles the tree open and closed', async () => {
    await TU.navigate('/#!/');

    // the navigation should start hidden
    expect(await TU.isPresent('#expandnav span.fa-angle-double-right')).toBe(true);

    // click to expand
    await TU.locator('#expandnav span.fa-angle-double-right').click();

    // the navigation should become visible
    expect(await TU.isPresent('#expandnav span.fa-angle-double-right')).toBe(false);
    expect(await TU.isPresent('#expandnav span.fa-angle-double-left')).toBe(true);
  });

  test('remembers the currently selected node', async () => {
    await TU.navigate('/#!/fiscal');

    // Verify that the fiscal year navigation entry is selected
    let selected = await TU.locator('.flex-tree .selected a');
    expect(await selected.getAttribute('data-unit-key')).toBe('TREE.FISCAL_YEAR');

    // trigger full page reload
    await TU.reloadPage();

    // Verify that the fiscal year navigation entry is selected again
    selected = await TU.locator('.flex-tree .selected a');
    expect(await selected.getAttribute('data-unit-key')).toBe('TREE.FISCAL_YEAR');
  });

  test('toggles tree nodes open and closed', async () => {
    await TU.navigate('/#!/');

    const menuItem = '[data-unit-key="TREE.INVENTORY"]';
    const node = await TU.locator(menuItem);

    // expect payroll to be closed by default
    expect(await TU.isPresent(`${menuItem} .fa-folder`)).toBe(true);
    expect(await TU.isPresent(`${menuItem} .fa-folder-open`)).toBe(false);

    // click to open
    await node.click();

    // the open/closed folder icon should be updated
    expect(await TU.isPresent(`${menuItem} .fa-folder-open`)).toBe(true);
    expect(await TU.isPresent(`${menuItem} .fa-folder`)).toBe(false);

    // toggle to close again
    await node.click();

    expect(await TU.isPresent(`${menuItem} .fa-folder-open`)).toBe(false);
    expect(await TU.isPresent(`${menuItem} .fa-folder`)).toBe(true);
  });

});

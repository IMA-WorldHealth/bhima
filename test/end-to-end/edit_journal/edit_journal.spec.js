/* global browser, element, by */
const protractor = require('protractor');

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

describe('Edit Posting Journal', () => {
  const path = '#!/journal';
  const gridId = 'journal-grid';

  const editingGridId = 'transaction-edit-grid';

  // simulates a double click
  const doubleClick = async element => browser
    .actions()
    .doubleClick(await element.getWebElement())
    .perform();

  before(() => helpers.navigate(path));

  it('edits a transaction change an account', async () => {
    await GU.selectRow(gridId, 0);
    await FU.buttons.edit();

    const accountNumberCell = await GU.getCell(editingGridId, 0, 1);
    await doubleClick(accountNumberCell);
    await FU.typeahead('accountInputValue', '1100');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  async function editInput(rowIndex, columnIndex, value) {
    const cell = await GU.getCell(editingGridId, rowIndex, columnIndex);

    // open the editing pane
    await doubleClick(cell);

    // get the element
    const input = element(by.css('input[type=number]'));

    // Bug: calling input.clear() will submit the input in ui-grid!  This causes
    // the ui-grid to hide the input.
    // Solution: Ctrl-a and then type what you want.
    const ctrlA = protractor.Key.chord(protractor.Key.CONTROL, 'a');
    await input.sendKeys(ctrlA, value, protractor.Key.ENTER);
  }

  it('edits a transaction change value of debit and credit', async () => {
    await GU.selectRow(gridId, 0);
    await FU.buttons.edit();

    // change the first row (index 0), debit and credit inputs (index 2 and 3)
    await editInput(0, 2, 100);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 100);

    await FU.buttons.submit();

    await FU.exists(by.id('validation-errored-alert'), false);
    await components.notification.hasSuccess();
  });

  // Test for validation
  it('prevents a single line transaction', async () => {
    await GU.selectRow(gridId, 0);
    await FU.buttons.edit();

    await GU.selectRow(editingGridId, 0);
    await FU.buttons.delete();
    await FU.buttons.submit();

    await FU.exists(by.id('validation-errored-alert'), true);

    await FU.buttons.cancel();
  });

  it('prevents an unbalanced transaction', async () => {
    await FU.buttons.edit();

    await editInput(0, 2, 100);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 50);

    await FU.buttons.submit();

    await FU.exists(by.id('validation-errored-alert'), true);

    await FU.buttons.cancel();
  });

  it('preventing transaction who have debit and credit null', async () => {
    await FU.buttons.edit();

    await editInput(0, 2, 0);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 0);

    await FU.buttons.submit();
    await FU.exists(by.id('validation-errored-alert'), true);
    await FU.buttons.cancel();
  });

  it('preventing transaction who was debited and credited in a same line', async () => {
    await FU.buttons.edit();

    await editInput(0, 2, 10);
    await editInput(0, 3, 10);

    await editInput(1, 2, 10);
    await editInput(1, 3, 0);

    await FU.buttons.submit();
    await FU.exists(by.id('validation-errored-alert'), true);
    await FU.buttons.cancel();
  });
});

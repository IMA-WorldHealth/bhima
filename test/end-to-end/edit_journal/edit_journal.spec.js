/* global browser, element, by */
const protractor = require('protractor');

const EC = protractor.ExpectedConditions;

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

describe('Edit Posting Journal', () => {
  const path = '#!/journal';
  const gridId = 'journal-grid';

  const editingGridId = 'transaction-edit-grid';


  // FIXME(@jniles) - I don't know why this works. But it does.
  const doubleClick = async element => {
    const e = await element.getWebElement();
    await browser.waitForAngularEnabled(false);
    await browser.actions({ bridge : true })
      .mouseMove(e)
      .doubleClick(e)
      .perform();

    await browser.waitForAngularEnabled(true);
  };

  before(() => helpers.navigate(path));

  async function openEditingModal() {
    await FU.buttons.edit();
    await browser.wait(EC.visibilityOf(element(by.id(editingGridId)), 2000));
  }

  it('edits a transaction change an account', async () => {
    await GU.selectRow(gridId, 0);

    await openEditingModal();

    const accountNumberCell = await GU.getCell(editingGridId, 0, 1);

    await doubleClick(accountNumberCell);

    await FU.typeahead('accountInputValue', '1100');

    await FU.modal.submit();
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

  it('edits a transaction to change the value of debit and credit', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    // change the first row (index 0), debit and credit inputs (index 2 and 3)
    await editInput(0, 2, 99);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 99);

    await FU.modal.submit();
    await FU.exists(by.id('validation-errored-alert'), false);
    await components.notification.hasSuccess();
  });

  it('prevents an unbalanced transaction', async () => {
    await GU.selectRow(gridId, 0);
    await openEditingModal();

    await editInput(0, 2, 100);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 50);

    await FU.modal.submit();

    await FU.exists(by.id('validation-errored-alert'), true);

    await FU.modal.cancel();
  });

  // Test for validation
  it('prevents a single line transaction', async () => {
    await openEditingModal();

    await GU.selectRow(editingGridId, 0);
    await FU.buttons.delete();
    await FU.modal.submit();

    await FU.exists(by.id('validation-errored-alert'), true);

    await FU.modal.cancel();
  });


  it('preventing transaction who have debit and credit null', async () => {
    await openEditingModal();

    await editInput(0, 2, 0);
    await editInput(0, 3, 0);

    await editInput(1, 2, 0);
    await editInput(1, 3, 0);

    await FU.modal.submit();
    await FU.exists(by.id('validation-errored-alert'), true);
    await FU.modal.cancel();
  });

  it('preventing transaction who was debited and credited in a same line', async () => {
    await openEditingModal();

    await editInput(0, 2, 10);
    await editInput(0, 3, 10);

    await editInput(1, 2, 10);
    await editInput(1, 3, 0);

    await FU.modal.submit();
    await FU.exists(by.id('validation-errored-alert'), true);
    await FU.modal.cancel();
  });
});

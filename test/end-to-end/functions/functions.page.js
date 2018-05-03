/* global element, by */

/**
 * This class is represents a function page in term of structure and
 * behaviour so it is a function page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class FunctionPage {
  constructor() {
    this.gridId = 'function-grid';
    this.functionGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 1;
  }

  /**
   * send back the number of functions in the grid
   */
  getFunctionCount() {
    return this.functionGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create function button click to show the dialog of creation
   */
  createFunction(title) {
    FU.buttons.create();
    FU.input('FunctionModalCtrl.function.fonction_txt', title.fonction_txt);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateFunction() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('FunctionModalCtrl.function.fonction_txt');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editFunction(fonction_txt, updateTitle) {
    GU.getGridIndexesMatchingText(this.gridId, fonction_txt)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('FunctionModalCtrl.function.fonction_txt', updateTitle.fonction_txt);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteFunction(fonction_txt) {
    GU.getGridIndexesMatchingText(this.gridId, fonction_txt)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }

  /**
   * cancel deletion process
   */
  cancelDeleteFunction(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used function
   */
  errorOnDeleteFunction(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasError();
  }

  /**
  * select the User Functions
  */
  selectUserFunction(functions) {
    components.multipleFunctionSelect.set(functions);    
  }

  /**
  * Submit button User Function
  */
  submitUserFunction() {
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

}

module.exports = FunctionPage;
/* jshint expr:true */
/* global element, by, browser */

const FU = require('./FormUtils');
const GU = require('./GridUtils');

/**
 * clickOnMethod
 * @description click on a dropdown button in a grid 
 * @param {number} rowIndex the index of the row 
 * @param {number} colIndex the index of the column 
 * @param {string} actionType the data-method type of the element 
 * @param {string} gridId the grid identifier 
 */
function clickOnMethod(rowIndex, colIndex, actionType, gridId) {

    const row = GU.getGrid(gridId)
        .$('.ui-grid-render-container-body')
        .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')
        .row(rowIndex));

    // click the <a> tag within the cell
    row
        .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid')
        .row(colIndex))
        .element(by.css('[data-method="action"]'))
        .click();
    
    $(`[data-action="${rowIndex}"]`)
    .$(`[data-method="${actionType}"]`).click();
}

module.exports.clickOnMethod = clickOnMethod;
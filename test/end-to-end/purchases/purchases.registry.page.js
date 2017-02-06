/* global element, by, browser */

'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/gridTestUtils.spec.js');

function PurchaseOrderRegistryPage() {
    let page = this;

    const gridId = page.gridId = 'PurchaseListGrid';
    const grid = GU.getGrid(gridId);

    page.editStatus = function editStatus(n) {
        const editStatusColumn = 8; 

        const row = grid
        .$('.ui-grid-render-container-body')
        .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')
            .row(n));

        row
        .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid')
        .row(editStatusColumn))
        .element(by.css('[data-method="edit"]'))
        .click();
    };
}

module.exports = PurchaseOrderRegistryPage;
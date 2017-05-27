/* global element, by, browser */

/**
 * This class represents an employee registry page
 * behaviour so it is an employee page object
 **/

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const grid = require('../shared/GridUtils');

function EmployeeRegistryPage (){
    'use strict';
    const page = this;
    const gridId = 'employee-registry';

    function employeeCount(number, message){
        grid.expectRowCount(gridId, number, message);
    }

    function filterCount (){
        const filters = $('[data-bh-filter-bar]').all(by.css('.label'));
        return filters.count();        
    }

    function search (){
        FU.buttons.search();
    }

    function clearFilter (){
        FU.buttons.clear();
    }

    page.employeeCount = employeeCount;   
    page.search = search; 
    page.filterCount = filterCount;
    page.clearFilter = clearFilter;
}

module.exports = EmployeeRegistryPage;
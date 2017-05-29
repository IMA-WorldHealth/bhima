/* global element, by */

/**
 * This class represents an employee registry page
 * behaviour so it is an employee page object
 **/

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const grid = require('../shared/GridUtils');

class EmployeeRegistryPage {
    constructor (){
        this.gridId = 'employee-registry';
    }
    

    employeeCount(number, message){
        grid.expectRowCount(this.gridId, number, message);
    }

    filterCount (){
        const filters = $('[data-bh-filter-bar]').all(by.css('.label'));
        return filters.count();        
    }

    search (){
        FU.buttons.search();
    }

    clearFilter (){
        FU.buttons.clear();
    }
}

module.exports = EmployeeRegistryPage;
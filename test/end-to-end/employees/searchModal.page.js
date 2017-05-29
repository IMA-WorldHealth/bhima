/* global element */

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 **/

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const grid = require('../shared/GridUtils');

class SearchModalPage{

    setDisplayName(displayName){
        FU.input('ModalCtrl.params.display_name', displayName);
    }

    submit (){
        FU.modal.submit();
    }

    selectSex (sex){
        return element(by.id(`${sex}`)).click();
    }

    setDateRange (range){
        return $(`[data-date-range="${range}"]`).click();
    }
}

module.exports = SearchModalPage;
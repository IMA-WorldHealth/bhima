/* global element, by, browser */

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 **/

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const grid = require('../shared/GridUtils');

function SearchModalPage (){
    'use strict';
    const page = this;

    function setDisplayName(displayName){
        FU.input('ModalCtrl.params.display_name', displayName);
    }

    function submit (){
        FU.modal.submit();
    }

    function selectSex (sex){
        return element(by.id(`${sex}`)).click();
    }

    function setDateRange (range){
        return $(`[data-date-range="${range}"]`).click();
    }

    page.setDisplayName = setDisplayName; 
    page.submit = submit;  
    page.selectSex = selectSex; 
    page.setDateRange = setDateRange;
}

module.exports = SearchModalPage;
/**
 * Created by Dedrick Kitamuka on 15/06/2016.
 */
/* global element, by, browser */

function modalPage () {
    var page = this;

    var todayButton = element(by.id('today'));
    var weekButton = element(by.id('week'));
    var monthButton = element(by.id('month'));
    var yearButton = element(by.id('year'));

    var referenceField = element(by.id('reference'));

    var serviceSelect = element(by.id('service'));
    var userSelect = element(by.id('user'));

    var allRadio = element(by.id('all'));
    var yesRadio = element(by.id('yes'));
    var noRadio = element(by.id('no'));


    var submitButton = element(by.id('submitButton'));


    //interfaces
    function setRange(range) {
        switch (range){
            case 'today' : todayButton.click();
                break;

            case 'week' : weekButton.click();
                break;

            case 'month' : monthButton.click();
                break;

            case 'year' : yearButton.click();
                break;
        }
    }

    function setReference(value) {
        referenceField.clear().sendKeys(value);
    }

    function setServiceChoice (choice) {
        serviceSelect.element(by.cssContainingText('option', choice));
    }

    function setUserChoice (choice) {
        userSelect.element(by.cssContainingText('option', choice));
    }

    function chooseDistributableOnly() {
        yesRadio.click();
    }

    function chooseNoDistributableOnly() {
        noRadio.click();
    }

    function chooseNoYesDistributable() {
        allRadio.click();
    }

    function submit (){
        submitButton.click();
    }

    // expose interfaces
    page.setRange = setRange;
    page.setReference = setReference;
    page.setServiceChoice = setServiceChoice;
    page.setUserChoice = setUserChoice;
    page.chooseDistributableOnly = chooseDistributableOnly;
    page.chooseNoDistributableOnly = chooseNoDistributableOnly;
    page.chooseNoYesDistributable = chooseNoYesDistributable;
    page.submit = submit;
}

module.exports = modalPage;

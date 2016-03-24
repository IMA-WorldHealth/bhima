/* global element, by */

/**
* Find Debtor Group component
* findDebtorGroup.js
* @public
*/
module.exports = {
  root     : element(by.css('[data-bh-find-debtorgroup-name]')),

  /**
  * @function search
  * @param {string} name The text for the debtor group name
  * @description This function permits to insert a debtor group text
  */
  search : function search(name) {
    var searchName  = name || 'Tes';
    var input = this.root.element(by.model('$ctrl.debtorGroupName'));
    input.sendKeys(searchName);
  },

  /**
  * @function select
  * @param {number} index The index of a debtor group in the list
  * @description Select a particular debtor group in the list of debtor groups
  */
  select : function select(index) {
    var searchIndex = index || 0;
    var select = this.root.element(by.css('[uib-typeahead-popup]'));
    var item = select.element(by.repeater('match in matches').row(searchIndex));
    item.click();
  },

  /**
  * @function popup
  * @description Trigger a click on the popup button for details of a debtor group
  */
  popup : function popup() {
    var popupButton = this.root.element(by.id('popupInfo'));
    popupButton.click();
  },

  /**
  * @function reload
  * @description Trigger a click on the reload button for selecting another debtor group
  */
  reload : function reload() {
    var reloadButton = this.root.element(by.id('reload'));
    reloadButton.click();
  },

  /**
  * @function test
  * @param {string} name The text for the debtor group name
  * @param {number} index The index of a debtor group in the list
  * @description Run a default test of use of the component
  */
  test : function test(name, index) {
    this.search(name);
    this.select(index);
    this.popup();
    this.reload();
  }
};


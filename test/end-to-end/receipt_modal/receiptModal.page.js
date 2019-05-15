/* global element, by */
/**
 *  The object modeling the receipt modal
 *  TODO: complete the page model
 */

function ReceiptModalPage() {
  const page = this;

  const closeButton = element(by.id('receipt_modal_close'));

  function close() {
    return closeButton.click();
  }

  page.close = close;
}

module.exports = ReceiptModalPage;

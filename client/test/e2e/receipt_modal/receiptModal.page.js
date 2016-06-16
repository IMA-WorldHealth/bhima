/**
 *  The object modeling the receipt modal
 *  TODO : complete the page model
 *  **/

function ReceiptModalPage(){
    var page = this;
    
    var closeButton = element(by.css('[data-action="close"]'));

    function close() {
        closeButton.click();
    }

    page.close = close;
}

module.exports = ReceiptModalPage;
/**
 * Created by Dedrick Kitamuka on 15/06/2016.
 */

/* global element, by */

function modalPage() {
  const page = this;

  const todayButton = element(by.id('today'));
  const weekButton = element(by.id('week'));
  const monthButton = element(by.id('month'));
  const yearButton = element(by.id('year'));

  const referenceField = element(by.id('reference'));

  const serviceSelect = element(by.id('service'));
  const userSelect = element(by.id('user'));

  const allRadio = element(by.id('all'));
  const yesRadio = element(by.id('yes'));
  const noRadio = element(by.id('no'));


  const submitButton = element(by.id('submitButton'));


  // interfaces
  function setRange(range) {
    switch (range) {
    case 'today': todayButton.click();
      break;

    case 'week': weekButton.click();
      break;

    case 'month': monthButton.click();
      break;

    case 'year': yearButton.click();
      break;
    }
  }

  function setReference(value) {
    referenceField.clear().sendKeys(value);
  }

  function setServiceChoice(choice) {
    serviceSelect.element(by.cssContainingText('option', choice));
  }

  function setUserChoice(choice) {
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

  function submit() {
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

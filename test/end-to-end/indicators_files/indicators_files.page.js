/* global element, by, $$ */
/* eslint class-methods-use-this:off */

/**
 * This class is represents a indicators_files page in term of structure and
 * behaviour so it is a indicators_files page object
 * */
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class IndicatorsFilesPage {

  constructor() {
    this.gridId = 'indicators-files';
    this.indicatorsFilesGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 6;
  }

  /**
   * send back the number of indicators_filess in the grid
   */
  expectNumberOfGridRows(number) {
    GU.expectRowCount(this.gridId, number, `Expected IndicatorsFiles Registry's ui-grid row count to be ${number}.`);
  }

  /**
   * create hospitalization indicators files
   */
  createHospitalizationIndicatorsFiles(
    fiscalYear, period, indicators, service
  ) {
    // click add and choose hospitalization
    this.openNewFile(1);
    // set fiscal year and period
    components.fiscalYearPeriodSelect.set(fiscalYear, period);
    // set the service
    components.serviceSelect.set(service);
    // set indicators variables
    components.inpuText.set('total_day_realized', indicators.total_day_realized);
    components.inpuText.set('total_beds', indicators.total_beds);
    components.inpuText.set('total_hospitalized_patient', indicators.total_hospitalized_patient);
    components.inpuText.set('total_death', indicators.total_death);
    // submit
    FU.buttons.submit();
    // check notification success
    components.notification.hasSuccess();
  }

  /**
   * create staff indicators files
   */
  createStaffIndicatorsFiles(
    fiscalYear, period, indicators
  ) {
    this.openNewFile(2);
    // set fiscal year and period
    components.fiscalYearPeriodSelect.set(fiscalYear, period);
    // set indicators variables
    components.inpuText.set('total_doctors', indicators.total_doctors);
    components.inpuText.set('total_nurses', indicators.total_nurses);
    components.inpuText.set('total_caregivers', indicators.total_caregivers);
    components.inpuText.set('total_staff', indicators.total_staff);
    components.inpuText.set('total_surgery_by_doctor', indicators.total_surgery_by_doctor);
    components.inpuText.set('total_visit', indicators.total_visit);
    components.inpuText.set('total_external_visit', indicators.total_external_visit);
    components.inpuText.set('total_hospitalized_patient', indicators.total_hospitalized_patient);
    components.inpuText.set('total_day_realized', indicators.total_day_realized);
    // submit
    FU.buttons.submit();
    // check notification success
    components.notification.hasSuccess();
  }

  /**
   * create finance indicators files
   */
  createFinanceIndicatorsFiles(
    fiscalYear, period, indicators
  ) {
    this.openNewFile(3);
    // set fiscal year and period
    components.fiscalYearPeriodSelect.set(fiscalYear, period);
    // set indicators variables
    components.inpuText.set('total_revenue', indicators.total_revenue);
    components.inpuText.set('total_subsidies', indicators.total_subsidies);
    components.inpuText.set('total_drugs_sale', indicators.total_drugs_sale);
    components.inpuText.set('total_expenses', indicators.total_expenses);
    components.inpuText.set('total_other_charge', indicators.total_other_charge);
    components.inpuText.set('total_drugs_purchased', indicators.total_drugs_purchased);
    components.inpuText.set('total_staff_charge', indicators.total_staff_charge);
    components.inpuText.set('total_operating_charge', indicators.total_operating_charge);
    components.inpuText.set('total_depreciation', indicators.total_depreciation);
    components.inpuText.set('total_debts', indicators.total_debts);
    components.inpuText.set('total_cash', indicators.total_cash);
    components.inpuText.set('total_stock_value', indicators.total_stock_value);
    components.inpuText.set('total_staff', indicators.total_staff);
    // submit
    FU.buttons.submit();
    // check notification success
    components.notification.hasSuccess();
  }

  openNewFile(key) {
    const map = {
      1 : '[data-method="add-hospitalization"]',
      2 : '[data-method="add-staff"]',
      3 : '[data-method="add-finance"]',
    };

    // open the dropdown menu
    $('[data-action="open-files-types"]').click();

    // click
    $(`${map[key]}`).click();
  }

  /**
   * search
   */
  search(options) {
    FU.buttons.search();

    // set to default values the form
    this.reset();

    if (options.fiscalYear && options.period) {
      components.fiscalYearPeriodSelect.set(options.fiscalYear, options.period);
    }

    if (options.service) {
      components.serviceSelect.set(options.service);
    }

    if (options.type) {
      FU.uiSelect('$ctrl.searchQuery.type_id', options.type);
    }

    if (options.status) {
      FU.uiSelect('$ctrl.searchQuery.status_id', options.status);
    }

    if (options.user) {
      components.userSelect.set(options.user);
    }

    FU.buttons.submit();
  }

  /**
   * reset
   */
  reset() {
    $$('[data-reset-input]').then(clearButtons => {
      // start clean from the bottom to the top
      // because if the clean start from the top and arrive in the bottom, top elements
      // are not visible
      for (let i = clearButtons.length - 1; i >= 0; i--) {
        const clearBtn = clearButtons[i];
        clearBtn.click();
      }
    });
  }
}

module.exports = IndicatorsFilesPage;

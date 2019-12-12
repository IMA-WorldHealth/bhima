angular.module('bhima.services')
  .service('RubricService', RubricService);

RubricService.$inject = ['PrototypeApiService'];

/**
 * @class RubricService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /rubrics/ URL.
*/
function RubricService(Api) {
  const service = new Api('/rubrics/');

  service.importIndexes = (lang) => {
    const url = service.url.concat('import_indexes');
    return service.$http.post(url, { lang })
      .then(service.util.unwrapHttpResponse);
  };

  service.indexesMap = [
    { id : 'is_base_index', label : 'PAYROLL_RUBRIC.IS_BASE_INDEX' },
    { id : 'is_day_index', label : 'PAYROLL_RUBRIC.IS_DAY_INDEX' },
    { id : 'is_reagistered_index', label : 'PAYROLL_RUBRIC.IS_REAGISTERED_INDEX' },
    { id : 'is_responsability', label : 'PAYROLL_RUBRIC.IS_RESPONSABILITY' },
    { id : 'is_other_profits', label : 'PAYROLL_RUBRIC.IS_OTHER_PROFIT' },
    { id : 'is_total_code', label : 'PAYROLL_RUBRIC.IS_TOTAL_CODE' },
    { id : 'is_day_worked', label : 'PAYROLL_RUBRIC.IS_DAY_WORKED' },
    { id : 'is_extra_day', label : 'PAYROLL_RUBRIC.IS_EXTRA_DAY' },
    { id : 'is_total_days', label : 'PAYROLL_RUBRIC.IS_TOTAL_DAYS' },
    { id : 'is_pay_rate', label : 'PAYROLL_RUBRIC.IS_PAY_RATE' },
    { id : 'is_gross_salary', label : 'PAYROLL_RUBRIC.IS_GROSS_SALARY' },
    { id : 'is_number_of_days', label : 'PAYROLL_RUBRIC.IS_NUMBER_OF_DAYS' },
  ];
  return service;
}

module.exports = rubircs();

function rubircs() {
  return [
    {
      indice_type :  'is_base_index',
      label :  'PAYROLL_RUBRIC.BASE_INDEX',
      abbr :  'Indice de base',
      is_indice : 1,
    },
    {
      indice_type :  'is_day_index',
      label :  'PAYROLL_RUBRIC.DAY_INDEX',
      abbr :  'Indice du jr',
      is_indice : 1,
    },
    {
      indice_type :  'is_reagistered_index',
      label :  'PAYROLL_RUBRIC.REAGISTERED_INDEX',
      abbr :  'Indice Réagisté',
      is_indice : 1,
    },
    {
      indice_type :  'is_responsability',
      label :  'PAYROLL_RUBRIC.RESPONSABILITY',
      abbr :  'Responsabilité',
      is_indice : 1,
    },
    {
      indice_type :  'is_other_profits',
      label :  'PAYROLL_RUBRIC.OTHER_PROFIT',
      abbr :  'Autre Profit',
      is_defined_employee : 1,
      is_indice : 1,
    },
    {
      indice_type :  'is_total_code',
      label :  'PAYROLL_RUBRIC.TOTAL_CODE',
      abbr :  'TtCode',
      is_indice : 1,
    },
    {
      indice_type :  'is_day_worked',
      label :  'PAYROLL_RUBRIC.DAY_WORKED',
      abbr :  'Jr presté',
      is_defined_employee   :  1,
      is_indice : 1,
    },
    {
      indice_type :  'is_extra_day',
      label :  'PAYROLL_RUBRIC.EXTRA_DAY',
      abbr :  'jr Suppl',
      is_defined_employee   :  1,
      is_indice : 1,
    },
    {
      indice_type :  'is_total_days',
      label :  'PAYROLL_RUBRIC.TOTAL_DAYS',
      abbr :  'ttjr',
      is_indice : 1,
    },
    {
      indice_type :  'is_pay_rate',
      label :  'PAYROLL_RUBRIC.PAY_RATE',
      abbr :  'TxPaie',
      is_indice : 1,
    },
    {
      indice_type :  'is_gross_salary',
      label :  'PAYROLL_RUBRIC.GROSS_SALARY',
      abbr :  'Brute',
      is_indice : 1,
    },
    {
      indice_type :  'is_number_of_days',
      label :  'PAYROLL_RUBRIC.NUMBER_OF_DAYS',
      abbr :  'NbrJr',
      is_indice : 1,
    },
  ];
}

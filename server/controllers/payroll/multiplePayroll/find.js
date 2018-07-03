/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter.
 */
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');


function find(options) {

  // ensure epected options are parsed appropriately as binary
  const filters = new FilterParser(options, { tableAlias : 'payroll' });
  let statusIds = [];

  if (options.status_id) {
    statusIds = statusIds.concat(options.status_id);
  }

  const sql = `
    SELECT payroll.employee_uuid, payroll.code, payroll.date_embauche, payroll.nb_enfant, payroll.individual_salary,
     payroll.account_id, payroll.creditor_uuid, payroll.display_name, payroll.sex, payroll.uuid, 
     payroll.payroll_configuration_id, payroll.currency_id, payroll.paiement_date, payroll.base_taxable, 
     payroll.basic_salary, payroll.gross_salary, payroll.grade_salary, payroll.text, payroll.net_salary, 
     payroll.working_day, payroll.total_day, payroll.daily_salary, payroll.amount_paid,
      payroll.status_id, payroll.status, (payroll.net_salary - payroll.amount_paid) AS balance
    FROM(
      SELECT BUID(employee.uuid) AS employee_uuid, employee.code, employee.date_embauche, employee.nb_enfant, 
      employee.individual_salary, creditor_group.account_id, BUID(employee.creditor_uuid) AS creditor_uuid,
        UPPER(patient.display_name) AS display_name, patient.sex, BUID(paiement.uuid) AS uuid, 
        paiement.payroll_configuration_id,  paiement.currency_id, paiement.paiement_date, paiement.base_taxable, 
        paiement.basic_salary, paiement.gross_salary, grade.basic_salary AS grade_salary, grade.text, 
        paiement.net_salary, paiement.working_day, paiement.total_day, paiement.daily_salary, paiement.amount_paid, 
        paiement.status_id, paiement_status.text AS status
        FROM employee 
        JOIN creditor ON creditor.uuid = employee.creditor_uuid  
        JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid 
        JOIN patient ON patient.uuid = employee.patient_uuid 
        JOIN grade ON employee.grade_uuid = grade.uuid
        JOIN paiement ON paiement.employee_uuid = employee.uuid
        JOIN payroll_configuration ON payroll_configuration.id = paiement.payroll_configuration_id
        JOIN config_employee ON config_employee.id = payroll_configuration.config_employee_id
        JOIN config_employee_item ON config_employee_item.employee_uuid = employee.uuid        
        JOIN paiement_status ON paiement_status.id = paiement.status_id
        WHERE paiement.payroll_configuration_id = '${options.payroll_configuration_id}'
      UNION 
        SELECT BUID(employee.uuid) AS employee_uuid, employee.code, employee.date_embauche, employee.nb_enfant, 
        employee.individual_salary, creditor_group.account_id, BUID(employee.creditor_uuid) AS creditor_uuid,
        UPPER(patient.display_name) AS display_name, patient.sex, NULL AS 'paiement_uuid',
        '${options.payroll_configuration_id}' AS payroll_configuration_id, '${options.currency_id}' AS currency_id, 
        NULL AS paiement_date, 0 AS base_taxable, 0 AS basic_salary, 0 AS gross_salary, 
        grade.basic_salary AS grade_salary, grade.text, 0 AS net_salary, 0 AS working_day, 0 AS total_day,
        0 AS daily_salary, 0 AS amount_paid, 1 AS status_id, 'PAYROLL_STATUS.WAITING_FOR_CONFIGURATION' AS status
        FROM employee 
        JOIN creditor ON creditor.uuid = employee.creditor_uuid  
        JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid 
        JOIN patient ON patient.uuid = employee.patient_uuid 
        JOIN grade ON employee.grade_uuid = grade.uuid
        JOIN config_employee_item ON config_employee_item.employee_uuid = employee.uuid
        JOIN config_employee ON config_employee.id = config_employee_item.config_employee_id
        JOIN payroll_configuration ON payroll_configuration.config_employee_id = config_employee.id        
        WHERE employee.uuid NOT IN (
          SELECT paiement.employee_uuid 
          FROM paiement 
          WHERE paiement.payroll_configuration_id = '${options.payroll_configuration_id}') 
          AND payroll_configuration.id = '${options.payroll_configuration_id}'
    ) AS payroll`;

  filters.fullText('display_name');
  filters.fullText('code');

  // Company currency filtering is optional only if you want to
  // know the currency for which the employees have been configured for payment
  if (options.filterCurrency) {
    filters.equals('currency_id');
  }

  filters.custom('status_id', 'payroll.status_id IN (?)', [statusIds]);
  filters.setOrder('ORDER BY payroll.display_name');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}

exports.find = find;
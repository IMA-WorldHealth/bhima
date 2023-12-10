const chai = require('chai');

const { expect } = chai;
const CostCenter = require('../../../server/controllers/finance/cost_center');

describe('test/server-unit/payroll/assignCostCenters', () => {
  const accountsCostCenter = [
    {
      account_id : 215,
      cost_center_id : 4,
    },
    {
      account_id : 220,
      cost_center_id : 4,
    },
    {
      account_id : 242,
      cost_center_id : 1,
    },
    {
      account_id : 243,
      cost_center_id : 6,
    },
    {
      account_id : 246,
      cost_center_id : 1,
    },
    {
      account_id : 249,
      cost_center_id : 1,
    },
    {
      account_id : 256,
      cost_center_id : 5,
    },
    {
      account_id : 258,
      cost_center_id : 3,
    },
    {
      account_id : 343,
      cost_center_id : 4,
    },
    {
      account_id : 345,
      cost_center_id : 4,
    },
    {
      account_id : 347,
      cost_center_id : 4,
    },
    {
      account_id : 347,
      cost_center_id : 1,
    },
    {
      account_id : 350,
      cost_center_id : 4,
    },
    {
      account_id : 353,
      cost_center_id : 4,
    },
    {
      account_id : 354,
      cost_center_id : 4,
      rincipal_center_id : null,
    },
    {
      account_id : 355,
      cost_center_id : 4,
    },
  ];

  const rubrics = [
    {
      configId : 5,
      config_rubric_id : 1,
      rubric_payroll_id : 5,
      PayrollConfig : 'Septembre 2021',
      id : 5,
      label : 'Transport',
      abbr : 'TPR',
      is_employee : 0,
      is_percent : 0,
      is_discount : 0,
      is_tax : 0,
      is_social_care : 1,
      is_defined_employee : 1,
      is_membership_fee : 0,
      debtor_account_id : 179,
      expense_account_id : 358,
      is_ipr : 0,
      is_associated_employee : 0,
      is_seniority_bonus : 0,
      is_family_allowances : 0,
      is_monetary_value : 1,
      position : 0,
      is_indice : 0,
      indice_type : null,
      indice_to_grap : 0,
      value : null,
      totals : 10,
    },
    {
      configId : 7,
      config_rubric_id : 1,
      rubric_payroll_id : 7,
      PayrollConfig : 'Septembre 2021',
      id : 7,
      label : 'Indemnité vie chère',
      abbr : 'v_cher',
      is_employee : 0,
      is_percent : 0,
      is_discount : 0,
      is_tax : 0,
      is_social_care : 0,
      is_defined_employee : 1,
      is_membership_fee : 0,
      debtor_account_id : 179,
      expense_account_id : 343,
      is_ipr : 0,
      is_associated_employee : 0,
      is_seniority_bonus : 0,
      is_family_allowances : 0,
      is_monetary_value : 1,
      position : 0,
      is_indice : 0,
      indice_type : null,
      indice_to_grap : 0,
      value : null,
      totals : 15,
    },
    {
      configId : 9,
      config_rubric_id : 1,
      rubric_payroll_id : 9,
      PayrollConfig : 'Septembre 2021',
      id : 9,
      label : 'Logement',
      abbr : 'logm',
      is_employee : 0,
      is_percent : 1,
      is_discount : 0,
      is_tax : 0,
      is_social_care : 1,
      is_defined_employee : 0,
      is_membership_fee : 0,
      debtor_account_id : 179,
      expense_account_id : 350,
      is_ipr : 0,
      is_associated_employee : 0,
      is_seniority_bonus : 0,
      is_family_allowances : 0,
      is_monetary_value : 1,
      position : 0,
      is_indice : 0,
      indice_type : null,
      indice_to_grap : 0,
      value : 30,
      totals : 180,
    },
  ];

  it('#assignCostCenterParams() Check if the account has been associated with a cost center', () => {
    const rubricsAssigned = CostCenter.assignCostCenterParams(accountsCostCenter, rubrics, 'expense_account_id');
    expect(rubricsAssigned[1].cost_center_id).to.equal(4);
    expect(rubricsAssigned[2].cost_center_id).to.equal(4);
  });
});

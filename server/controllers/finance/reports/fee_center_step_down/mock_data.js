/**
 * MOCK TEST DATASET
 *
 * This block of code is for test only purpose
 * its populate the database with mock data
 *
 * REMOVE ME WHEN FEATURE DONE
 * ===========================================
 */
const db = require('../../../../lib/db');

function generateTestDataset() {
  const feeCenters = [
    {
      id : 10,
      label : 'Accounting',
      is_principal : 0,
      step_order : 3,
      allocation_basis_id : 3,
    },
    {
      id : 11,
      label : 'Daycare Facility',
      is_principal : 0,
      step_order : 0,
      allocation_basis_id : 1,
    },
    {
      id : 12,
      label : 'IT',
      is_principal : 0,
      step_order : 2,
      allocation_basis_id : 2,
    },
    {
      id : 13,
      label : 'HR',
      is_principal : 0,
      step_order : 1,
      allocation_basis_id : 1,
    },
    {
      id : 14,
      label : 'Cutting',
      is_principal : 1,
      step_order : 4,
      allocation_basis_id : null,
    },
    {
      id : 15,
      label : 'Assembling',
      is_principal : 1,
      step_order : 5,
      allocation_basis_id : null,
    },
    {
      id : 16,
      label : 'Packaging',
      is_principal : 1,
      step_order : 6,
      allocation_basis_id : null,
    },
  ];
  const costCenterBasisValue = [
    { basis_id : 1, cost_center_id : 10, quantity : 8 },
    { basis_id : 1, cost_center_id : 11, quantity : 5 },
    { basis_id : 1, cost_center_id : 12, quantity : 9 },
    { basis_id : 1, cost_center_id : 13, quantity : 4 },
    { basis_id : 1, cost_center_id : 14, quantity : 20 },
    { basis_id : 1, cost_center_id : 15, quantity : 50 },
    { basis_id : 1, cost_center_id : 16, quantity : 5 },
    { basis_id : 2, cost_center_id : 10, quantity : 10 },
    { basis_id : 2, cost_center_id : 11, quantity : 2 },
    { basis_id : 2, cost_center_id : 12, quantity : 10 },
    { basis_id : 2, cost_center_id : 13, quantity : 5 },
    { basis_id : 2, cost_center_id : 14, quantity : 6 },
    { basis_id : 2, cost_center_id : 15, quantity : 4 },
    { basis_id : 2, cost_center_id : 16, quantity : 8 },
    { basis_id : 3, cost_center_id : 10, quantity : 250000 },
    { basis_id : 3, cost_center_id : 11, quantity : 50000 },
    { basis_id : 3, cost_center_id : 12, quantity : 200000 },
    { basis_id : 3, cost_center_id : 13, quantity : 300000 },
    { basis_id : 3, cost_center_id : 14, quantity : 500000 },
    { basis_id : 3, cost_center_id : 15, quantity : 700000 },
    { basis_id : 3, cost_center_id : 16, quantity : 400000 },
  ];
  const costCenterAggregate = [
    {
      period_id : 202108,
      cost_center_id : 10,
      principal_center_id : null,
      debit : 250000,
      credit : 0,
    },
    {
      period_id : 202108,
      cost_center_id : 11,
      principal_center_id : null,
      debit : 50000,
      credit : 0,
    },
    {
      period_id : 202108,
      cost_center_id : 12,
      principal_center_id : null,
      debit : 200000,
      credit : 0,
    },
    {
      period_id : 202108,
      cost_center_id : 13,
      principal_center_id : null,
      debit : 300000,
      credit : 0,
    },
    {
      period_id : 202108,
      cost_center_id : 14,
      principal_center_id : 14,
      debit : 500000,
      credit : 0,
    },
    {
      period_id : 202108,
      cost_center_id : 15,
      principal_center_id : 15,
      debit : 700000,
      credit : 0,
    },
    {
      period_id : 202108,
      cost_center_id : 16,
      principal_center_id : 16,
      debit : 400000,
      credit : 0,
    },
  ];

  return { feeCenters, costCenterAggregate, costCenterBasisValue };
}

function mount(feeCenters, costCenterBasisValue, costCenterAggregate) {
  const tx = db.transaction();
  feeCenters.forEach(item => {
    tx.addQuery('INSERT INTO fee_center SET ?;', item);
  });
  costCenterBasisValue.forEach(item => {
    tx.addQuery('INSERT INTO cost_center_basis_value SET ?;', item);
  });
  costCenterAggregate.forEach(item => {
    tx.addQuery('INSERT INTO cost_center_aggregate SET ?;', item);
  });
  return tx.execute();
}

function unmount() {
  const tx = db.transaction();
  tx.addQuery('DELETE FROM cost_center_aggregate WHERE cost_center_id >= 10 AND cost_center_id <= 16;');
  tx.addQuery('DELETE FROM cost_center_basis_value WHERE cost_center_id >= 10 AND cost_center_id <= 16;');
  tx.addQuery('DELETE FROM fee_center WHERE id >= 10 AND id <= 16;');
  return tx.execute();
}

async function generate() {
  const { feeCenters, costCenterBasisValue, costCenterAggregate } = generateTestDataset();
  // clean database
  await unmount();
  // populate database
  await mount(feeCenters, costCenterBasisValue, costCenterAggregate);
}

module.exports = { generate };

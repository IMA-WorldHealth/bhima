INSERT INTO `fee_center` (id, label, is_principal, step_order, allocation_basis_id) VALUES
  (10, 'Accounting', 0, 3, 3),
  (11, 'Daycare facility', 0, 0, 1),
  (12, 'IT', 0, 2, 2),
  (13, 'HR', 0, 1, 1),
  (14, 'Cutting', 1, 4, NULL),
  (15, 'Assembling', 1, 5, NULL),
  (16, 'Packaging', 1, 6, NULL);

INSERT INTO `cost_center_basis_value` (basis_id, cost_center_id, quantity) VALUES 
  (1, 10, 8), (1, 11, 5), (1, 12, 9), (1, 13, 4), (1, 14, 20), (1, 15, 50), (1, 16, 5),
  (2, 10, 10), (2, 11, 2), (2, 12, 10), (2, 13, 5), (2, 14, 6), (2, 15, 4), (2, 16, 8),
  (3, 10, 250000), (3, 11, 50000), (3, 12, 200000), (3, 13, 300000), (3, 14, 500000), (3, 15, 700000), (3, 16, 400000); 

INSERT INTO `cost_center_aggregate` (`period_id`, `cost_center_id`, `principal_center_id`, `debit`, `credit`) VALUES 
  (202108, 10, NULL, 250000, 0),
  (202108, 11, NULL, 50000, 0),
  (202108, 12, NULL, 200000, 0),
  (202108, 13, NULL, 300000, 0),
  (202108, 14, 14, 500000, 0),
  (202108, 15, 15, 700000, 0),
  (202108, 16, 16, 400000, 0);

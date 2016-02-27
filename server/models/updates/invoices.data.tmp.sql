/* Temporary file for inserting data to do with invoices, this should be merged
 * merged with server/models/test/data.sql after merging with master
 */

INSERT INTO `billing_service` VALUES 
  (1, 3626, 'Test Billing Service', 'Example billing service', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 3626, 'Second Test Billing Service', 'Example billing service 2', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group_billing_service` VALUES 
  (1, '112a9fb5-847d-4c6a-9b20-710fa8b4da24', 1, CURRENT_TIMESTAMP);
  /* (UUID(), '112a9fb5-847d-4c6a-9b20-710fa8b4da24', 2, CURRENT_TIMESTAMP); */

INSERT INTO `debitor_group_billing_service` VALUES 
  (1, '4de0fe47-177f-4d30-b95f-cff8166400b4', 2, CURRENT_TIMESTAMP);
  
INSERT INTO `subsidy` VALUES 
  (1, 3626, 'Test Subsidy', 'Subsidy for test purposes', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 3626, 'Second Test Subsidy', 'Second subsidy for test purposes', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group_subsidy` VALUES
  (1, '112a9fb5-847d-4c6a-9b20-710fa8b4da24', 1, CURRENT_TIMESTAMP);

INSERT INTO `debitor_group_subsidy` VALUES
  (1, '4de0fe47-177f-4d30-b95f-cff8166400b4', 1, CURRENT_TIMESTAMP);

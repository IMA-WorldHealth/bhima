DELIMITER $$
/*
  This file contains code for linking cost centers to various activities throughout the app.
*/


/*
@function GetCostCenterByAccountId()

@description
Retrieves the cost center id for an account by using its account_id. Each account should
have one and only one cost center.  If an account does not have a cost center, NULL will be
returned.

NOTE(@jniles) - Currently, BHIMA does not guarantee that only one cost center is associated with an
account, but when we do make guarantees, we will be able to modify this function to do it.
*/
CREATE FUNCTION GetCostCenterByAccountId(account_id INT)
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT cost_center_id FROM reference_cost_center WHERE account_reference_id IN (
      SELECT account_reference_id FROM account_reference_item WHERE account_reference_item.account_id = account_id
    )
  );
END $$

/*
@function GetCostCenterByServiceUuid()

@description
Retrieves the cost center id for a service using its service_uuid.  Each service should have one
and only one cost center assocaited with it.  If a service does not have a cost center, NULL will
be returned.

NOTE(@jniles) - Currently, BHIMA does not guarantee that only one cost center is associated with a
service, but when we do make guarantees, we will be able to modify this function to do it.
*/
CREATE FUNCTION GetCostCenterByServiceUuid(service_uuid BINARY(16))
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT cost_center_id FROM service_cost_center
    WHERE service_cost_center.service_uuid = service_uuid
  );
END $$

DELIMITER ;

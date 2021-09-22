DELIMITER $$
/*
  This file contains code for linking cost centers to various activities throughout the app.
*/


/*
@function GetCostCenterByAccountId()

@description
Retrieves the cost center id for an account by using its account_id. Each account should
have one and only one cost center.

NOTE(@jniles) - Currently, BHIMA does not guarantee this, but when we do make guarantees,
we will be able to modify this function to do it.
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
and only one cost center assocaited with it.

NOTE(@jniles) - Currently, BHIMA does not guarantee this, but when we do make guarantees,
we will be able to modify this function to do it.
*/
CREATE FUNCTION GetCostCenterByServiceUuid(service_uuid BINARY(16))
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT cost_center_id FROM service_cost_center
    WHERE service_cost_center.service_uuid = service_uuid
  );
END $$

/*
@function GetCostCenterByInvoiceUuid(invoice_uuid)

@params invoice_uuid BINARY(16) the invoice uuid

@description
Returns the cost center id for the invoice using the service_uuid in the invoice table
*/
CREATE FUNCTION GetCostCenterByInvoiceUuid(invoice_uuid BINARY(16))
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT GetCostCenterByServiceUuid(i.service_uuid)
	FROM invoice i 
	WHERE i.uuid = invoice_uuid
  );
END $$


DELIMITER ;

/*
@author jniles
@description
This file removes the previous version of the BUID() function, which was slow
and cumbersome, and replaces it with a faster version of itself.
*/


DELIMITER $$

DROP FUNCTION IF EXISTS BUID;

CREATE FUNCTION BUID(b BINARY(16))
RETURNS CHAR(32) DETERMINISTIC
BEGIN
  RETURN HEX(b);
END
$$

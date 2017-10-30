/*

--------
OVERVIEW
--------

This procedures file contains procedures to ensure data integrity.  It allows an
administrator to merge two locations if they have database access. No clientside
scripts currently access these procedures, but we may write a client interface
in the future.
*/


/*
CALL MergeLocations()

DESCRIPTION
This procedure merges two locations by changing all references to a single uuid.
A "location" is synonymous with a village.uuid.  The first parameter is the
village to remove, and the second is the new village uuid.  A user might want to
do this when there are duplicated locations.
*/
CREATE PROCEDURE MergeLocations(
  IN beforeUuid BINARY(16),
  IN afterUuid BINARY(16)
) BEGIN

  -- Go through every location in the database, replacing the location uuid with the new location uuid
  UPDATE patient SET origin_location_id = afterUuid WHERE origin_location_id = beforeUuid;
  UPDATE patient SET current_location_id = afterUuid WHERE current_location_id = beforeUuid;

  UPDATE debtor_group SET location_id = afterUuid WHERE location_id = beforeUuid;

  UPDATE enterprise SET location_id = afterUuid WHERE location_id = beforeUuid;

  -- delete the beforeUuid village and leave the afterUuid village.
  DELETE FROM village WHERE village.uuid = beforeUuid;
END $$

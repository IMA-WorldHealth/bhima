-- this stored procedure merges two locations, deleting the first location_uuid after
-- all locations have been migrated.
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

/**
 * @author sfount
 * @version 0.9.0
 * @date 30/08/2018
 * @description
 * - Performance improvements for `GenerateTransactionID()` SQL method
 * - Added additional transaction ID column to the `posting_journal`
 *   and `general_ledger` tables
 * - Added additional index to `posting_journal` and `general_ledger` tables
**/


-- SQL Function delimiter definition
DELIMITER $$

-- Add integer reference numbers to posting journal and general ledger
ALTER TABLE posting_journal
  ADD COLUMN trans_id_reference_number MEDIUMINT UNSIGNED NOT NULL,
  ADD INDEX (trans_id_reference_number);

ALTER TABLE general_ledger
  ADD COLUMN trans_id_reference_number MEDIUMINT UNSIGNED NOT NULL,
  ADD INDEX (trans_id_reference_number);

-- Populate new reference numbers using the existing String equivalent
UPDATE posting_journal SET trans_id_reference_number = SUBSTR(trans_id, 4);
UPDATE general_ledger SET trans_id_reference_number = SUBSTR(trans_id, 4);

-- Remove the current implementation of `GenerateTransactionId`
DROP FUNCTION GenerateTransactionId;

-- Implement the improved performance `GenerateTransactionId` function
-- (note_ the API will not change)
-- (note_ SUBSELECT vs. JOIN was tested, SUBSELECT was used because it works when there are no rows in journals
CREATE FUNCTION GenerateTransactionId(
  target_project_id SMALLINT(5)
)
RETURNS VARCHAR(100) DETERMINISTIC
BEGIN
  RETURN (
    SELECT CONCAT(
      (SELECT abbr AS project_string FROM project WHERE id = target_project_id),
      IFNULL(MAX(current_max) + 1, 1)
    ) AS id
    FROM (
      (
        SELECT trans_id_reference_number AS current_max
        FROM general_ledger
        WHERE project_id = target_project_id
        ORDER BY trans_id_reference_number DESC
        LIMIT 1
      )
      UNION
      (
        SELECT trans_id_reference_number AS current_max FROM posting_journal
        WHERE project_id = target_project_id
        ORDER BY trans_id_reference_number DESC
        LIMIT 1
      )
    )A
  );
END $$

-- Last updated 30/08/2018 23:53 @sfount

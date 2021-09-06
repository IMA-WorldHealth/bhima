DELIMITER $$

DROP PROCEDURE IF EXISTS FeeCenterCostWithIndexes$$
CREATE PROCEDURE FeeCenterCostWithIndexes(
  IN _dateFrom DATE,
  IN _dateTo DATE
)
BEGIN

  DROP TEMPORARY TABLE IF EXISTS fee_center_costs_with_indexes;
  CREATE TEMPORARY TABLE fee_center_costs_with_indexes AS 
    SELECT
        z.id, z.label AS fee_center_label,
        z.default_fee_center_index_id,
        z.is_principal,
        z.step_order,
        z.`value` AS direct_cost,
        fci.label AS fee_center_index_label,
        fciv.value AS fee_center_index_value  
    FROM 
    (
        (
          SELECT
            fc.id, fc.label, fc.is_principal, fc.step_order, fci.label AS default_fee_center_index_id,
            SUM(fct.debit - fct.credit) AS `value`
          FROM fee_center AS fc
          JOIN cost_center_aggregate fct ON fct.principal_center_id = fc.id
          JOIN `period` p ON p.id = fct.period_id 
          LEFT JOIN fee_center_index fci ON fci.id = fc.default_fee_center_index_id
          WHERE DATE(p.start_date) >= DATE(_dateFrom) AND DATE(p.end_date) <= DATE(_dateTo)
          GROUP BY fct.principal_center_id
        )
        UNION DISTINCT
        (
          SELECT
            fc.id, fc.label, fc.is_principal, fc.step_order, fci.label AS default_fee_center_index_id,
            SUM(fct.debit - fct.credit) AS `value`
          FROM fee_center AS fc
          JOIN cost_center_aggregate fct ON fct.cost_center_id = fc.id AND fct.principal_center_id IS NULL
          JOIN `period` p ON p.id = fct.period_id 
          LEFT JOIN fee_center_index fci ON fci.id = fc.default_fee_center_index_id
          WHERE DATE(p.start_date) >= DATE(_dateFrom) AND DATE(p.end_date) <= DATE(_dateTo)
          GROUP BY fct.cost_center_id
        )
    ) AS z 
    JOIN fee_center_index_value fciv ON fciv.fee_center_id = z.id 
    JOIN fee_center_index fci ON fci.id = fciv.fee_center_index_id 
    ORDER by z.step_order ASC;

  SELECT
    GROUP_CONCAT(DISTINCT
      CONCAT(
        'MAX(CASE WHEN fee_center_index_label = ''',
        fee_center_index_label,
        ''' then fee_center_index_value end) AS `',
        fee_center_index_label, '`'
      )
    ) INTO @sql
  FROM
    fee_center_costs_with_indexes;

  SET @sql = CONCAT('SELECT id, fee_center_label, is_principal, step_order, direct_cost, default_fee_center_index_id, ', @sql, ' FROM fee_center_costs_with_indexes GROUP BY id');

  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

END$$

DELIMITER ;

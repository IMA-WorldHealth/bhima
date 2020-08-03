-- from https://stackoverflow.com/questions/173814/using-alter-to-drop-a-column-if-it-exists-in-mysql

DELIMITER $$
DROP FUNCTION IF EXISTS column_exists;

CREATE FUNCTION column_exists(
  tname VARCHAR(64),
  cname VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (SELECT COUNT(*)
      FROM `INFORMATION_SCHEMA`.`COLUMNS`
      WHERE `TABLE_SCHEMA` = SCHEMA()
        AND `TABLE_NAME` = tname
        AND `COLUMN_NAME` = cname);
  END $$
DELIMITER ;

-- drop_column_if_exists:

DROP PROCEDURE IF EXISTS drop_column_if_exists;

DELIMITER $$
CREATE PROCEDURE drop_column_if_exists(
  tname VARCHAR(64),
  cname VARCHAR(64)
)
BEGIN
    IF column_exists(tname, cname)
    THEN
      SET @drop_column_if_exists = CONCAT('ALTER TABLE `', tname, '` DROP COLUMN `', cname, '`');
      PREPARE drop_query FROM @drop_column_if_exists;
      EXECUTE drop_query;
    END IF;
END $$


DELIMITER ;


-- From  https://stackoverflow.com/questions/2480148/how-can-i-employ-if-exists-for-creating-or-dropping-an-index-in-mysql
-- This procedure try to drop a table index if it exists
DELIMITER $$

DROP PROCEDURE IF EXISTS drop_index_if_exists $$
CREATE PROCEDURE drop_index_if_exists(in theTable varchar(128), in theIndexName varchar(128) )
BEGIN
 IF((SELECT COUNT(*) AS index_exists FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() and table_name =
theTable AND index_name = theIndexName) > 0) THEN
   SET @s = CONCAT('DROP INDEX ' , theIndexName , ' ON ' , theTable);
   PREPARE stmt FROM @s;
   EXECUTE stmt;
 END IF;
END $$

DELIMITER ;
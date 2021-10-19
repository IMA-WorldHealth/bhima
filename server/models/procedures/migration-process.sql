-- from https://stackoverflow.com/questions/173814/using-alter-to-drop-a-column-if-it-exists-in-mysql

DROP FUNCTION IF EXISTS bh_column_exists;

DELIMITER $$
CREATE FUNCTION bh_column_exists(
  tname VARCHAR(64) ,
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
  IN tname VARCHAR(64),
  IN cname VARCHAR(64)
)
BEGIN
    IF bh_column_exists(tname, cname)
    THEN
      SET @drop_column_if_exists = CONCAT("ALTER TABLE `", tname, "` DROP COLUMN `", cname, "`");
      PREPARE drop_query FROM @drop_column_if_exists;
      EXECUTE drop_query;
    END IF;
END $$
DELIMITER ;

-- add_column_if_missing:

DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER $$
CREATE PROCEDURE add_column_if_missing(
  IN tname VARCHAR(64),
  IN cname VARCHAR(64),
  IN typeinfo VARCHAR(128)
)
BEGIN
  IF NOT bh_column_exists(tname, cname)
  THEN
    SET @add_column_if_missing = CONCAT("ALTER TABLE `", tname, "` ADD COLUMN `", cname, "` ", typeinfo);
    PREPARE add_query FROM @add_column_if_missing;
    EXECUTE add_query;
  END IF;
END $$
DELIMITER ;


-- From  https://stackoverflow.com/questions/2480148/how-can-i-employ-if-exists-for-creating-or-dropping-an-index-in-mysql
-- This procedure try to drop a table index if it exists


DROP FUNCTION IF EXISTS index_exists;

DELIMITER $$
CREATE FUNCTION index_exists(
  theTable VARCHAR(64),
  theIndexName VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (SELECT COUNT(*) AS exist FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() and table_name =
theTable AND index_name = theIndexName);
  END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS drop_index_if_exists $$
CREATE PROCEDURE drop_index_if_exists(in theTable varchar(128), in theIndexName varchar(128) )
BEGIN
 IF(index_exists (theTable, theIndexName)) THEN
   SET @s = CONCAT('DROP INDEX ' , theIndexName , ' ON ' , theTable);
   PREPARE stmt FROM @s;
   EXECUTE stmt;
 END IF;
END $$
DELIMITER ;


--

DELIMITER $$
DROP FUNCTION IF EXISTS Constraint_exists$$
CREATE FUNCTION Constraint_exists(
  theTable VARCHAR(64),
  theConstraintName VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (
     SELECT COUNT(*) AS nbr
     FROM
      INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE()
     AND TABLE_NAME= theTable
    AND  CONSTRAINT_NAME = theConstraintName
   );
  END $$

DROP PROCEDURE IF EXISTS add_constraint_if_missing$$
CREATE PROCEDURE add_constraint_if_missing(
  IN tname VARCHAR(64),
  IN cname VARCHAR(64),
  IN cdetails VARCHAR(128)
)
BEGIN
  IF NOT Constraint_exists(tname, cname)
  THEN
    SET @add_constraint_if_missing = CONCAT("ALTER TABLE `", tname, "` ADD CONSTRAINT `", cname, "` ", cdetails);
    PREPARE add_query FROM @add_constraint_if_missing;
    EXECUTE add_query;
  END IF;
END $$
DELIMITER ;

DELIMITER $$

-- this procedure will be used for "ALTER TABLE table_name DROP FOREIGN KEY constraint_name";
-- example : CALL drop_foreign_key('table_name', 'constraint_name');

DROP PROCEDURE IF EXISTS drop_foreign_key $$
CREATE PROCEDURE drop_foreign_key(in theTable varchar(128), in theConstraintName varchar(128) )
BEGIN
 IF(Constraint_exists(theTable, theConstraintName) > 0) THEN

   SET @s = CONCAT(' ALTER TABLE ' , theTable , ' DROP FOREIGN KEY  ' , theConstraintName);
   PREPARE stmt FROM @s;
   EXECUTE stmt;
 END IF;
END $$

DELIMITER ;

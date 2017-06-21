-- update account categories from account type

-- title
UPDATE account SET type_id = 6 WHERE type_id = 4;

-- incomes
UPDATE account SET type_id = 4 WHERE type_id = 1;

-- expense
UPDATE account SET type_id = 5 WHERE type_id = 2;

-- assets
UPDATE account SET type_id = 1 WHERE LEFT(number, 1) IN (2, 3, 4, 5) AND type_id = 3;

-- equity
UPDATE account SET type_id = 3 WHERE LEFT(number, 1) IN (1) AND type_id = 3;
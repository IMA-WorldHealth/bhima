-- Set correct class to accounts
UPDATE account SET account.classe = LEFT(account.number, 1);

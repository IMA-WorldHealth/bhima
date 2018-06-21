-- The problem with the alphabetical display of the list of employees
-- is related to the fact that there are patients whose names begin with
-- the character "Space", this query can correct this problem for existing data
-- 
UPDATE patient SET patient.display_name = TRIM(patient.display_name);
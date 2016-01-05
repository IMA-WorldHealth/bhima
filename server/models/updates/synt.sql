-- Reset employee state
-- By: Dedrick Kitamuka
-- Date: 2015-11-27

INSERT INTO unit (`id`, `name`, `key`, `description`, `parent`, `url`, `path`) VALUES
(138, 'Employee State Pdf', 'TREE.EMPLOYEE_STATE', 'Situation Financiere employee' , 128, 'partials/reports_proposed/employee_state/', '/reports/employee_state/');


-- Deleting 
-- By Chris LOMAME
-- Date : 2015-12-16
-- No way to view this report because it is necessary to have a store in parameter
-- /reports/stock_store/:depotId

delete from unit where id = 134;

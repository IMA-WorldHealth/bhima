/**
 * Migration from version 1.16.0
 */


/*
 * @author: jmcameron
 * @date: 2020-11-18
 * @pull-release: TBD
 * @description: Fix typo in menu report name "System Usage Statistics"
 */
UPDATE `unit` SET name='System Usage Statistics', description='System Usage Statistics' WHERE id=250;

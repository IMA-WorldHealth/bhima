/*
 * DATABASE CHANGES FOR VERSION 1.5.0 TO 1.6.0 
 */

/*
 * @author: mbayopanda
 * @date: 2019-10-03
 */
DELETE FROM `cron` WHERE `label` = 'CRON.EACH_MINUTE';

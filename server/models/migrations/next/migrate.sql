/*
 * @author: jmcameron
 * @date: 2020-09-28
 * @description:  Move the stock-related settings from enterprise_setting
 *    to the new stock_setting table.
 * NOTE: This migration should be done immediately after building/loading
 *       the desired database.  If 'yarn dev' is run before the migration
 *       script, this migration will fail since it will try to add a row
 *       that already exists.
 */
INSERT INTO stock_setting(enterprise_id, month_average_consumption,
  default_min_months_security_stock, enable_auto_purchase_order_confirmation,
  enable_auto_stock_accounting, enable_daily_consumption,
  enable_strict_depot_permission, enable_supplier_credit)
SELECT enterprise_id, month_average_consumption,
  default_min_months_security_stock, enable_auto_purchase_order_confirmation,
  enable_auto_stock_accounting, enable_daily_consumption,
  enable_strict_depot_permission, enable_supplier_credit
FROM enterprise_setting;

ALTER TABLE enterprise_setting DROP COLUMN month_average_consumption;
ALTER TABLE enterprise_setting DROP COLUMN default_min_months_security_stock;
ALTER TABLE enterprise_setting DROP COLUMN enable_auto_purchase_order_confirmation;
ALTER TABLE enterprise_setting DROP COLUMN enable_auto_stock_accounting;
ALTER TABLE enterprise_setting DROP COLUMN enable_daily_consumption;
ALTER TABLE enterprise_setting DROP COLUMN enable_strict_depot_permission;
ALTER TABLE enterprise_setting DROP COLUMN enable_supplier_credit;

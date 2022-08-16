/**
 * @author: jmcameron
 * @description: Updates for inventory units
 * @date: 2021-08-12
 */

-- VANGA only uses one value of unit_id for its inventory.
-- It needs to changed from 18 (old Unité)) to 40 (new Unité))

UPDATE `inventory` SET unit_id=40;

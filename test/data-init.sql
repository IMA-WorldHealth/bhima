-- Enterprise
INSERT INTO `enterprise` VALUE (1,'IMA WorldHealth','IMA','243 81 504 0540','info@imaworldhealth.org',HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),NULL,2,103, NULL, NULL);

-- Project
INSERT INTO `project` VALUE (1,'IMA Kinshasa','KIN',1,1,0);

-- create a superuser
INSERT INTO user (id, username, password, display_name, email, deactivated) VALUE
  (1, 'superuser', PASSWORD('superuser'), 'Adminstrator', 'developper@imaworldhealth.org', 0);

-- superuser permission
INSERT INTO permission (unit_id, user_id)
SELECT unit.id, 1 FROM unit
ON DUPLICATE KEY UPDATE unit_id = unit_id, user_id = user_id;

-- superuser project persmission
INSERT INTO `project_permission` VALUES (1,1,1);

-- exchange rate for the current date
INSERT INTO `exchange_rate` VALUE (1, 1, 1, 1500.0000, NOW());
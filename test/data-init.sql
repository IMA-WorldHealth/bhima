-- locations (enterprise location only)
INSERT INTO `country` VALUES (HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f'),'Democratiq Republic of Congo'),(HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a51'), 'Test Hook Country');
INSERT INTO `province` VALUES (HUID('f6fc7469-7e58-45cb-b87c-f08af93edade'),'Bas Congo', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')), (HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a21'), 'Test Hook Province', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a51'));
INSERT INTO `sector` VALUES (HUID('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450'),'Tshikapa',HUID('f6fc7469-7e58-45cb-b87c-f08af93edade')), (HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a22'), 'Test Hook Sector', HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a21'));
INSERT INTO `village` VALUES (HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),'KELE2',HUID('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450')), (HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a22'), 'Test Hook Village',HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a22'));

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
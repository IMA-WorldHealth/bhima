
DELIMITER $$
CREATE PROCEDURE superUserRole(IN user_id INT, IN project_id INT)
BEGIN

    DECLARE roleUUID BINARY(16);
    
    SET roleUUID = HUID(UUID());
    
    INSERT INTO role(uuid, label, project_id)
    VALUES(roleUUID, 'Administrateur', project_id);

    INSERT INTO role_unit
    SELECT HUID(uuid()) as uuid,roleUUID, id FROM unit;

    INSERT INTO user_role(uuid, user_id, role_uuid) 
    VALUES(HUID(uuid()), user_id, roleUUID);

    INSERT INTO role_actions(uuid, role_uuid, actions_id)
    SELECT HUID(uuid()) as uuid, roleUUID, id FROM actions;
END$$
DELIMITER ;
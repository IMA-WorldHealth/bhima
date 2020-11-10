/**
 * Migration from the version 1.16.0
 */

/*
 * @author: jmcameron
 * @date: 2020-11-05 (updated 2020-11-10)
 * @pull-release: 5084
 * @description:  Make sure superuser can see the Stock Settings menu by default
 */

-- INSERT INTO `permission` (unit_id, user_id)  VALUES
-- (290, 1),     --admin
-- (290, 1000);  --superuser

INSERT INTO `role_unit` (uuid, role_uuid, unit_id) VALUES
-- superuser
(HUID('BA7E12D3D16A4091A78742FF6F841C73'), HUID('7B7DD0D692734955A703126FBD504B61'), 290),
-- admin
(HUID('EC3847EED01E4A9096BDBA80F71C2B4A'), HUID('129BFCACD4A311E88196230B165892D5'), 290);

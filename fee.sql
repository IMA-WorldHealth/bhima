-- Run at Vanga.

UPDATE invoice SET service_uuid = 0xFF4043582D4211EABC0EF44D306E0330 WHERE service_uuid = 0xFF4045352D4211EABC0EF44D306E0330;
DELETE FROM service_cost_center WHERE service_uuid = 0xFF4045352D4211EABC0EF44D306E0330;
DELETE FROM service WHERE uuid = 0xFF4045352D4211EABC0EF44D306E0330;

INSERT INTO `cost_center` (label, is_principal) VALUES
	("Administration", 0),
	("Buanderie / Sterilisation", 0),
	("Chirurgie / Salle d'Op", 1),
	("Clinique Privé", 1),
	("Dentistérie", 1),
	("Dispensaire", 0),
	("Echographie", 1),
	("Kinesitherapie", 1),
	("Laboratoire", 0),
	("Lazaret", 0),
	("Maternité", 1),
	("Médicament", 0),
	("Ophtalmologie", 1),
	("Orthopedie", 1),
	("Pavillion Chirgicale", 0),
	("Pavillion Medicale", 0),
	("Pediatrie", 1),
	("Poly-Clinique", 1),
	("Radiographie", 0),
	("Salle D'Urgence", 0);

/*
To properly model Vanga, I propose changing "medicament" to "pharmacy"
*/

/*
Attach cost centers to the correct service
*/
INSERT INTO service_cost_center (cost_center_id, service_uuid)
	SELECT cost_center.id, service.uuid FROM cost_center JOIN service ON cost_center.label = service.name;

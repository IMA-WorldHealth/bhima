-- Employee Test Data
-- Fonctions
INSERT INTO `fonction` VALUES
  (1, 'Infirmier'),
  (2, 'Medecin Directeur');

-- Services
INSERT INTO  `service` VALUES
  (1, 1, 'Administration', null, null),
  (2, 1, 'Medecine Interne', null, null);

-- Creditor group
INSERT INTO  `creditor_group` VALUES
  (1, 'b0fa5ed2-04f9-4cb3-92f7-61d6404696e7', 'Personnel [Creditor Group Test]', 3629, 0),
  (1, '8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2', 'Fournisseur [Creditor Group Test]', 3630, 0);

-- Creditor
INSERT INTO  `creditor` VALUES
  ('42d3756a-7770-4bb8-a899-7953cd859892', 'b0fa5ed2-04f9-4cb3-92f7-61d6404696e7', 'Personnel'),
  ('7ac4e83c-65f2-45a1-8357-8b025003d794', '8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2', 'Fournisseur');

-- Debitor
INSERT INTO `debitor` VALUES
  ('be0096dd-2929-41d2-912e-fb2259356fb5', '4de0fe47-177f-4d30-b95f-cff8166400b4', 'Employee/Test Debitor');

-- Grade
INSERT INTO `grade` VALUES
  ('9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3', 'A1', '1.1', 50);

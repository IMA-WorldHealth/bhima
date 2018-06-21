-- DESCRIPTION
-- First I wrote a SQL request to select all accounts of PCGC accounting referencial, 
-- these accounts have a property "is_ohada = 0" The following query allowed us 
-- to select this account (SELECT * FROM account WHERE account.is_ohada = 0)
-- 
-- And since the identifiers of the account table of 1x are the same as those 
-- of the 2x the following Request allow us to update these accounts at 
-- the level of the database bhima 2x, the update will continue to bloker these accounts and to hide


-- [10] COMPTES DES FONDS PROPRES ET EMPRUNTS A PLUS D'UN AN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1130; 

-- [10011000] CAPITAL PROPRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1131; 

-- [12001000] BENEFICE REPORTE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1132; 

-- [13001000] RESULTAT NET DE L'EXERCICE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1133; 

-- [14001000] PLUS-VALUE DE REEVALUATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1134; 

-- [15] SUBVENTIONS D'EQUIPEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1135; 

-- [1533] MBF SUBVENTIONS D'EQUIPEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1136; 

-- [15330101] HYDROELECTRIC SYSTEME ATTSHIK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1137; 

-- [15330102] BICYCLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1138; 

-- [15330103] MBF MAINT/EQUIPEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1139; 

-- [15330104] RENOVATION OF THE HYDROELECTRIC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1140; 

-- [15330105] WASHING MACHINE AND LANDING // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1141; 

-- [15330106] MBF ULTRASOND MACHINE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1142; 

-- [15330107] VEHICULE FOR THE IMCK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1143; 

-- [15330108] MBF FOR BED // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1144; 

-- [15330109] MFR SPECTROPHOTOMETRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1145; 

-- [15330110] SUBVENTIONS D'EQUIPEMENT CSBB // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1146; 

-- [15330111] SUBVENTIONS D'EQUIPEMENT PLCK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1147; 

-- [1532] PCUSA SUBVENTIONS D'EQUIPEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1148; 

-- [15320100] SUBVENTIONS D'EQUIPEMENT HBB // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1149; 

-- [15320101] SUBVENTIONS D'EQUIPEMENT OPHTALMOLOGIE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1150; 

-- [1534] SUBVENTIONS D'EQUIPEMENT ETAT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1151; 

-- [15340100] SUBVENTIONS D'EQUIPEMENT MORQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1152; 

-- [18001000] PROVISIONS POUR LITIGES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1153; 

-- [2] COMPTES DES VALEURS IMMOBILISEES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1154; 

-- [21] IMMOBILISATIONS CORPORELLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1155; 

-- [21001000] TERRAIN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1156; 

-- [22] AUTRES IMMOBILISATIONS CORPORELLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1157; 

-- [221] IMMEUBLES NON RESIDENTIELS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1158; 

-- [22101000] MORQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1159; 

-- [22101001] BATIMENT CME (25 ANS) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1160; 

-- [22101002] HOSPICE TSHITUDILU (25 ANS) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1161; 

-- [22101003] DORTOIR CME (25 ANS) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1162; 

-- [22101004] BATIMENT HOPITAL (25 ANS) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1163; 

-- [22101005] BUREAU ECOLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1164; 

-- [22101006] DEPOT CHANTIER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1165; 

-- [22101010] "E.P. BON BERGER LATRINE ET BATIMENT" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1166; 

-- [222] IMMEUBLES RESIDENTIELS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1167; 

-- [22201000] LOGEMENT DU PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1168; 

-- [22201001] MAISONS MEDECINS RESIDENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1169; 

-- [223] MATERIELS ET MOBILIERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1170; 

-- [2231] MATERIELS DE TRANSPORT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1171; 

-- [22310101] VEHICULES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1172; 

-- [22310102] BICYCLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1173; 

-- [22310103] MOTOCYCLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1174; 

-- [2232] MOBILIERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1175; 

-- [22320100] MOBILIERS HABITATIONS PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1176; 

-- [22320101] MOBILIERS OPHTALMOLOGIE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1177; 

-- [22320102] MOBILIERS PAX // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1178; 

-- [22320103] MOBILIERS CME // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1179; 

-- [22320104] MOBILIERS HOPITAL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1180; 

-- [22320105] MOBILIERS ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1181; 

-- [22320106] MOBILIERS DENTAIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1182; 

-- [22320107] MOBILIERS GUEST HOUSE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1183; 

-- [2233] MATERIELS ET EQUIPEMENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1184; 

-- [22330101] MATERIELS ET EQUIPEMENTS OPHTA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1185; 

-- [22330102] MATERIELS ET EQUIPEMENTS HOPITAL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1186; 

-- [22330103] MATERIELS ET EQUIPEMENTS PAX // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1187; 

-- [22330104] MATERIELS ET EQUIPEMENTS CENTRE MEDICAL D'ETUDES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1188; 

-- [22330105] MATERIELS ET EQUIPEMENT ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1189; 

-- [22330106] MATERIELS ET EQUIPEMENTS DENTAIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1190; 

-- [22330107] MATERIELS ET EQUIPEMENTS GH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1191; 

-- [22330108] MATERIELS ET EQUIPEMENTS ISTM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1192; 

-- [224] AUTRES IMMOBILISATIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1193; 

-- [22401000] SYSTEME SOLAIRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1194; 

-- [225] MACHINES ET AUTRES BIENS D'EQUIPEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1195; 

-- [22501000] GROUPE ELECTROGENE PAX // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1196; 

-- [22501001] GROUPE ELECTROGENE PAX 2 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1197; 

-- [22501002] GROUPE ELECTROGENE HBB // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1198; 

-- [226] MATERIELS HYDRO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1199; 

-- [22601000] BARRAGE ET AUTRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1200; 

-- [227] MATERIELS E-MAIL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1201; 

-- [22701000] E-MAIL ET ACCESSOIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1202; 

-- [23] IMMOBILISATIONS CORPORELLES ENCOURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1203; 

-- [231] IMMEUBLES NON RESIDENTIELS ENCOURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1204; 

-- [23101003] CONSTRUCTION REFECTOIRE CME // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1205; 

-- [232] IMMEUBLES RESIDENTIELS ENCOURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1206; 

-- [23201000] CONSTRUCTION MAISONS DU PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1207; 

-- [28] AMORTISSEMENTS ET PROVISIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1208; 

-- [281] AMORTISSEMENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1209; 

-- [28101000] AMORTISSEMENT BATIMENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1210; 

-- [28101001] AMORTISSEMENTS EQUIPEMENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1211; 

-- [28101002] AMORTISSEMENTS MATERIELS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1212; 

-- [28101003] AMORTISSEMENTS MOBILIERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1213; 

-- [282] PROVISIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1214; 

-- [28210100] PROVISIONS POUR DEPRECIATION TERRAIN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1215; 

-- [28201001] PROVISIONS POUR DEPRECIATION DES AUTRES IMMOBILISATIONS CORPORELLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1216; 

-- [29001000] IMMOBILISATIONS A REGULARISER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1217; 

-- [3] COMPTES DES STOCKS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1218; 

-- [3001] STOCKS MEDICAMENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1219; 

-- [30011100] Antidote // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1220; 

-- [30011101] Tension artérielle // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1221; 

-- [30011102] Diurétiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1222; 

-- [30011103] Système cardiovasculaire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1223; 

-- [30011104] Médicaments hématologiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1224; 

-- [30011105] Maladies métaboliques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1225; 

-- [30011106] Système gastro-intestinal // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1226; 

-- [30011107] Spasmolytiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1227; 

-- [30011108] "Médicaments pour le foie la vésicule et le pancréas" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1228; 

-- [30011109] "antiémetiques laxatifs et anti diarrhéiques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1229; 

-- [30011110] système uro-génital // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1230; 

-- [30011111] système respiratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1231; 

-- [30011112] Analgésiques - Antipyrétiques -Ains // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1232; 

-- [30011113] Analgésiques morphiniques et stupefiants (nt) (pt) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1233; 

-- [30011114] "Psychotropes hypnotiques sédatifs anxiolytiques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1234; 

-- [30011115] antiépileptiques et anticoparilsivants // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1235; 

-- [30011116] antiallergiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1236; 

-- [30011117] Glucocorticoides // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1237; 

-- [30011118] Médicaments de la Thyroïde // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1238; 

-- [30011119] Hormones sexuelles et contraceptions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1239; 

-- [30011120] Médicaments du diabète // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1240; 

-- [30011121] Médicaments anti-malaria // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1241; 

-- [30011122] Antibiotiques beta-lactames // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1242; 

-- [30011123] Antibiotiques non beta-lactames // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1243; 

-- [30011124] Antituberculeux-antilepreux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1244; 

-- [30011125] Médicaments antimycosiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1245; 

-- [30011126] "Médicaments antihelminthiques tilaires" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1246; 

-- [30011127] Médicaments antiviraux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1247; 

-- [30011128] "Vaccins immunoglobulines et sérums" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1248; 

-- [30011129] Médicaments antitumoraux et immunodépresseurs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1249; 

-- [30011130] "Minéraux vitamines et toniques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1250; 

-- [30011131] Médicaments à usage dermatologique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1251; 

-- [30011132] Médicaments à usage ophtalmique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1252; 

-- [30011133] Médicaments à usage otique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1253; 

-- [30011134] Médicaments des affections bucco-pharyngées // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1254; 

-- [30011135] Médicaments des affections vulvo-vaginales // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1255; 

-- [30011136] Anesthésiques locaux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1256; 

-- [30011137] Anesthésiques généraux et médicaments préopératoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1257; 

-- [30011138] Médicaments agissant sur la musculature utérine // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1258; 

-- [30011139] fluides IV et substituts du plasma // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1259; 

-- [30011140] tests diagnostiques et bandelettes diagnostiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1260; 

-- [30011159] Consommables d'urologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1261; 

-- [30011170] Matériel de Soins // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1262; 

-- [30011171] Consommables des soins // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1263; 

-- [30011172] Gants // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1264; 

-- [30011174] consommables de suture // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1265; 

-- [30011175] "Séringues aiguilles catheters et set" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1266; 

-- [30011176] "Tubes endotracheaux aspiration alimentations et drains thoraciques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1267; 

-- [30011180] Matériel et équipement de diagnostic // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1268; 

-- [30011181] Matériel de Traitement et de Procedures operatoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1269; 

-- [30011184] Kits // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1270; 

-- [30011185] Matériel de Pharmacie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1271; 

-- [30011186] Consommables de Pharmacie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1272; 

-- [30011187] Matériel d'Anesthésie et de Réanimation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1273; 

-- [30011188] Materiel de Traumatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1274; 

-- [30011189] Consommables de Traumatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1275; 

-- [30111000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1276; 

-- [30141000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1277; 

-- [31] Matières et Fournitures Consommées // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1278; 

-- [311] CONSOMMATIONS FOURNITURES MEDICALES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1279; 

-- [31111000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1280; 

-- [31111136] Anesthésiques locaux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1281; 

-- [31111137] Anesthésiques généraux et médicaments préopératoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1282; 

-- [31111141] TESTS DIAGNOSTIQUES ET BANDELETTES DIAGNOSTIQUES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1283; 

-- [31111142] MATERIEL ET EQUIPEMENT DE LABORATOIRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1284; 

-- [31111143] Réactifs de laboratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1285; 

-- [31111144] Consommable de laboratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1286; 

-- [31111145] Bactériologie : Coloration // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1287; 

-- [31111146] Chaine de froid // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1288; 

-- [31111147] Matériel et équipement de Microscope // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1289; 

-- [31111148] Consommables de microscopie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1290; 

-- [31111149] Bactériologie : milieux de culture // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1291; 

-- [31111152] Vetements professionnels // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1292; 

-- [31111158] Matériel et équipement d'urologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1293; 

-- [31111160] Matériel et équipement de stérilisation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1294; 

-- [31111161] Consommables de stérilisation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1295; 

-- [31111165] Matériels et équipement d'imagerie médicale et ECG // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1296; 

-- [31111166] Consommables d'imagerie médicale et ECG Service // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1297; 

-- [31111170] Matériel et équipement de soins // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1298; 

-- [31111173] Gants non stériles // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1299; 

-- [31111180] Matériels et équipement généraux de diagnostic // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1300; 

-- [31111181] Matériel et équipement de traitement et de procédures opératoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1301; 

-- [31111183] "Désinfectants antiseptiques et purification de l'eau" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1302; 

-- [31111184] Kits // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1303; 

-- [31111185] Matériel et équipement de pharmacie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1304; 

-- [31111186] Consommables de Pharmacie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1305; 

-- [31111187] Matériel et équipement d'anesthésie et de réanimation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1306; 

-- [31111188] Matériel et équipement de traumatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1307; 

-- [31121600] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1308; 

-- [31251000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1309; 

-- [31311150] Matériel et équipement administratif // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1310; 

-- [31311151] Consommables administratifs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1311; 

-- [31311500] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1312; 

-- [31601182] Consommables et matériel d'entretien hospitalier // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1313; 

-- [32011000] Emballages commerciaux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1314; 

-- [34011100] Produits ophtalmologie (production locale) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1315; 

-- [34011200] Perfusions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1316; 

-- [36011100] Stocks à l'extérieur // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1317; 

-- [38011100] Provisions pour dépréciation des stocks // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1318; 

-- [4] COMPTES DE TIERS ET A REGULARISER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1319; 

-- [40] FOURNISSEURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1320; 

-- [40001160] SNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1321; 

-- [40001170] AUTRES FOURNISSEURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1322; 

-- [40001180] REGIDESO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1323; 

-- [40001210] IMPROKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1324; 

-- [40001250] BTR ET CLTD BIAYA ROBERT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1325; 

-- [40001260] ROFFE PHARMA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1326; 

-- [40001270] CADIMEK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1327; 

-- [40001280] TAKAS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1328; 

-- [40001290] COALEX MEDICAL KIN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1329; 

-- [40002160] BADY PHARMACIE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1330; 

-- [40001240] CADMEKO/MBM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1331; 

-- [41] CLIENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1332; 

-- [41001130] ASS. PROV. KASAI OCCIDENTAL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1333; 

-- [41001180] BANQUE DU CONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1334; 

-- [41001520] GOUVERNORAT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1335; 

-- [41001590] HOTEL DE VILLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1336; 

-- [41001770] MAISON PROVINCIALE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1337; 

-- [41001970] MISS. CATH NTAMBUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1338; 

-- [41011010] ONPTZ // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1339; 

-- [41011020] OCC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1340; 

-- [41011040] OFF. DES ROUTES UAR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1341; 

-- [41011060] OFIDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1342; 

-- [41011260] SNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1343; 

-- [41011460] SONAS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1344; 

-- [41011560] SEP CONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1345; 

-- [41011630] DIR. DES CONTRIBUTIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1346; 

-- [41011640] MISS. CATH TSHIKULA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1347; 

-- [41011680] UNICEF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1348; 

-- [41011730] HEWA BORA AIRWAYS (HBA) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1349; 

-- [41011750] FORCES ARMEES CONGOLAISES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1350; 

-- [41011760] MISSION GREC ORTHODOXE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1351; 

-- [41011770] IRC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1352; 

-- [41011870] CISP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1353; 

-- [41011880] GTM KANANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1354; 

-- [41011890] BANQUE CONGOLAISE SPRL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1355; 

-- [41011910] FASS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1356; 

-- [41011920] MEDECINS DU MONDE-Belgique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1357; 

-- [41011930] PAIDECO (CTB) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1358; 

-- [41011940] ETS JEAN ASSAKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1359; 

-- [41011950] PNMLS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1360; 

-- [41201020] CPCO TRESORERIE GENERALE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1361; 

-- [41201060] CMCO MENNONITE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1362; 

-- [41201070] COORDIN. PROTESTANTE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1363; 

-- [41201090] UPRECO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1364; 

-- [41201120] HOPITAL BULAPE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1365; 

-- [41201145] PAROISSE BIKUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1366; 

-- [41201150] HOPITAL MUTOTO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1367; 

-- [41201160] IMPROKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1368; 

-- [41201180] JUKAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1369; 

-- [41201200] CPZA KATOKA SUD // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1370; 

-- [41201240] PAROISSE NDESHA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1371; 

-- [41201250] PAROISSE OEUCUMENIQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1372; 

-- [41201350] DENTAL CLINIC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1373; 

-- [41201360] SOCIETE BIBLIQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1374; 

-- [41201410] 31ème CPC/SEC. GENERAL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1375; 

-- [41201420] CENTRE MPOKOLO WA MOYO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1376; 

-- [41201440] ONG BUTOKE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1377; 

-- [41201450] PAROISSE BIKUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1378; 

-- [41201460] MONUC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1379; 

-- [41201470] OMS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1380; 

-- [41201490] HOPITAL LUEBO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1381; 

-- [41201510] DGRAD // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1382; 

-- [41201520] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1383; 

-- [41211460] CPC LUNGANDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1384; 

-- [41301000] CAUTIONS RECUES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1385; 

-- [41331000] CAUTIONS SALLE D'URGENCE PAX // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1386; 

-- [41314000] CAUTIONS RECUES OPHTA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1387; 

-- [41331500] CAUTIONS HOSP PAX // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1388; 

-- [41701000] IMPAYES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1389; 

-- [41711000] IMPAYES OPHTA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1390; 

-- [41771100] CLIENTS DOUTEUX // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1391; 

-- [42] PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1392; 

-- [42111040] DR FLETCHER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1393; 

-- [42121020] DR MULAJA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1394; 

-- [42121170] DR ROGER KAPEMBU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1395; 

-- [42131050] MUKENDI BALUIDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1396; 

-- [42131100] MPOYI LUMPUNGU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1397; 

-- [42131130] KAPINGA BAKATUSEKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1398; 

-- [42131140] BAJIKILE KASONGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1399; 

-- [42131150] TSHIABA KALUBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1400; 

-- [42131160] KAMANGUDU NDONDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1401; 

-- [42131180] KATUJUDI NKUNA (H) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1402; 

-- [42131190] KAZADI MUKENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1403; 

-- [42131200] GIBENDE AMBONGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1404; 

-- [42131210] KWETE SHAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1405; 

-- [42131220] TSHISANGA NDEMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1406; 

-- [42131230] LUPANTSHIA PALELE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1407; 

-- [42131250] BUABUA KAYEMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1408; 

-- [42131260] NGALAMULUME LUKENGU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1409; 

-- [42131280] TSHITALA BADINENGANYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1410; 

-- [42131300] TSHIBOLA TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1411; 

-- [42131310] BENABIABO NTOLEKELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1412; 

-- [42131330] MUAKUYA MALU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1413; 

-- [42131340] NGALULA BATUBENGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1414; 

-- [42131370] BENGESHA NGINDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1415; 

-- [42131380] NKASHAMA MUYEMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1416; 

-- [42131470] KABEDI NKONKO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1417; 

-- [42131520] NTUMBA BAKAJIKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1418; 

-- [42131540] NGALAMULUME NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1419; 

-- [42131610] KATENDE BITSHIDIBIBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1420; 

-- [42131620] MULUMBA KAYEMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1421; 

-- [42131660] KALUINA JIBIKILAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1422; 

-- [42131670] MBUYI MUNTUABO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1423; 

-- [42131710] KADIATA MUDIBANGANYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1424; 

-- [42131730] KATOMBE MUBIKAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1425; 

-- [42131770] BANANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1426; 

-- [42131780] MULAMA NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1427; 

-- [42131790] KATUAMBI BIPENDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1428; 

-- [42131830] KALONGA MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1429; 

-- [42131860] KATUJUDI SIMONE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1430; 

-- [42131890] SEKUNDO NASSOZA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1431; 

-- [42131910] TUINDILE KATAMBUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1432; 

-- [42131950] BIMINE DIBELAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1433; 

-- [42131990] NTEFU KABEMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1434; 

-- [42141020] MUBIAYI BUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1435; 

-- [42141080] TUSEKU MUYAYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1436; 

-- [42141100] KENABUILA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1437; 

-- [42141140] BABADI KABAMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1438; 

-- [42141150] BAMBI MUKENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1439; 

-- [42141210] NDAYE KATEBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1440; 

-- [42141240] KANKONDE TSHIMANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1441; 

-- [42141270] KANKU SHABANTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1442; 

-- [42141290] BAKADISULA MPINDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1443; 

-- [42141300] TSHIONDO MAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1444; 

-- [42141350] NZEBA KALELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1445; 

-- [42141420] NTUMBA MUNTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1446; 

-- [42141440] NTUMBA SOKOMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1447; 

-- [42141460] BASUNGILA MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1448; 

-- [42141540] BEYA BEYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1449; 

-- [42141560] KABIBU BIMVULU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1450; 

-- [42141590] MUANZA MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1451; 

-- [42141600] TSHIAMBA KABONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1452; 

-- [42141610] MILOLO KAYEMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1453; 

-- [42141650] KABILA MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1454; 

-- [42141660] TSHIBUABUA LUBUELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1455; 

-- [42141680] KAMUANYA TSHIMANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1456; 

-- [42141690] KAJIDI TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1457; 

-- [42141700] KUTEKEMENYI MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1458; 

-- [42141720] NGONDO KABASELE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1459; 

-- [42141730] LULUA LUKADI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1460; 

-- [42141760] BAKATUSENGA BULEDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1461; 

-- [42141770] UMBA CHICO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1462; 

-- [42141790] KAPINGA TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1463; 

-- [42141810] BEYA NDONDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1464; 

-- [42141820] NGINDU KALONJI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1465; 

-- [42141830] NTAMBUE MUPINDULA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1466; 

-- [42141840] TSHIBUABUA NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1467; 

-- [42141880] BAPELA BEYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1468; 

-- [42141920] KANDA KANDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1469; 

-- [42141930] LUSHONYI KABONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1470; 

-- [42141970] MUTEBA BANTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1471; 

-- [42141990] DR REMY SABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1472; 

-- [42151100] TSHIMBOMBO BAKAJIKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1473; 

-- [42151410] BASUE MULAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1474; 

-- [42151440] BENABIABO KABANGU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1475; 

-- [42151480] KABAMUSU MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1476; 

-- [42151490] KABINDA MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1477; 

-- [42151540] MALU MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1478; 

-- [42151610] MUNYOKA BADIANJILE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1479; 

-- [42151680] NTUMBA LUENDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1480; 

-- [42151750] TSHISHIKU LUBOYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1481; 

-- [42151770] KADIATA TSHIKANANA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1482; 

-- [42151810] MUTOMBO NGALULA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1483; 

-- [42151830] MUKUNA DIBAMBU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1484; 

-- [42151840] MUSUBE MUKENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1485; 

-- [42151920] PAST KABASELE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1486; 

-- [42151950] BENDE KAPUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1487; 

-- [42151980] DEMBO MUTOMBO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1488; 

-- [42151990] KANDE BAKANTOBOLELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1489; 

-- [42161040] KABANGE MBUYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1490; 

-- [42161050] DR NDANDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1491; 

-- [42161060] NTUMBA LUTULU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1492; 

-- [42161080] KABUTAKAPUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1493; 

-- [42161130] BUABUA TSHIPAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1494; 

-- [42161140] NGALULA NKITABUNGI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1495; 

-- [42161180] MAYAMBI NZAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1496; 

-- [42161190] PASTEUR SHAMWUIMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1497; 

-- [42161230] BALANDA MUKUAYITA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1498; 

-- [42161240] SOMBAMANYA NDAYE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1499; 

-- [42161250] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1500; 

-- [42161270] BANSHIMI BEYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1501; 

-- [42161280] TSHIADIMUNA MATANDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1502; 

-- [42161290] KATUENABANGI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1503; 

-- [42161310] MAMBA MPUNGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1504; 

-- [42161320] DR MVITA KANDE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1505; 

-- [42161930] MUZADI NDAYE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1506; 

-- [42161950] LUSAMBA TSHIABA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1507; 

-- [42161960] KAFULA MPUTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1508; 

-- [42161980] BAMANYE LUFU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1509; 

-- [42161990] KATUBADI MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1510; 

-- [42171000] MUMBA TSHISHIMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1511; 

-- [42171100] BATENA TSHISENGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1512; 

-- [42171110] BETU MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1513; 

-- [42171120] BENYI BIMINE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1514; 

-- [42171130] MUIPATAYI MUKUAYITA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1515; 

-- [42171150] NSANGAMAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1516; 

-- [42171160] BALUID MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1517; 

-- [42171170] BIKEMU KAPUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1518; 

-- [42171180] META ILUNGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1519; 

-- [42171200] KAMAYI MULUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1520; 

-- [42171260] NSAFU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1521; 

-- [42171270] NKOLE NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1522; 

-- [42171280] KEBA KASONGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1523; 

-- [42171310] MAYUWA KABANGELE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1524; 

-- [42171320] ILUNGA NKASHAMA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1525; 

-- [42171340] MILOLO KUINJIDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1526; 

-- [42171410] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1527; 

-- [42171550] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1528; 

-- [42201000] SALAIRES NETS A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1529; 

-- [42201010] RESTAU ET TRANSP. A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1530; 

-- [42201020] PRIME D'INTERIM A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1531; 

-- [42201030] PRIMES SUPPL TRANSP. A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1532; 

-- [42201040] PRIMES D'ENCOURAGEMENT A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1533; 

-- [42201050] PRIMES DE FIDELITE A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1534; 

-- [42201060] PRIMES DE FIN CARRIERE A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1535; 

-- [43] ETAT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1536; 

-- [43001000] CPR A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1537; 

-- [462] DEBITEURS ET CREDITEURS DIVERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1538; 

-- [46201010] ZSR TSHIKAJI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1539; 

-- [46201120] CSBB (ECOLE PRIMAIRE) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1540; 

-- [46201140] GUEST DEPARTMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1541; 

-- [46201330] PAROISSE IMCK TSHIKAJI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1542; 

-- [463] COMPTES DES PROJETS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1543; 

-- [4631] ECOH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1544; 

-- [46311121] ECHO MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1545; 

-- [46311122] ECHO WOMEN'S DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1546; 

-- [46311123] ECOH AGRICULTURAL DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1547; 

-- [46311124] ECOH NUTRITION REAB. (CN) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1548; 

-- [46311125] ECOH INDIGENT CARE PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1549; 

-- [46311126] ECOH TSHIKAJI HEALTH CENTER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1550; 

-- [46311127] ECOH ORPHAN SCHOR EDUC PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1551; 

-- [46311128] ECOH HMHC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1552; 

-- [46311130] ECOH CERVICAL CANCER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1553; 

-- [46311131] ECOH BCZS COM. HEALTH PROGRAM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1554; 

-- [46311350] ECOH 320802 MOBILITY IN MISSION 0096AA-08 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1555; 

-- [4632] ECO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1556; 

-- [46321100] ECO MISSIONNARY HOUSING // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1557; 

-- [46321270] ECO CHARITY FUNDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1558; 

-- [46321400] ECO 320902 ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1559; 

-- [46321510] ECO 320202/402 GENERAL N.D. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1560; 

-- [46321490] ECO KAJIDI JONATHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1561; 

-- [4633] MBF PROJECTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1562; 

-- [46331121] MBF MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1563; 

-- [46331122] MBF WOMEN DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1564; 

-- [46331127] MBF ORPHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1565; 

-- [46331128] MBF MOTHER CARE BABY CARE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1566; 

-- [46331129] MBF C-GSH FISTULA REPAIR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1567; 

-- [46331350] MBF IMCK'S TOYOTA LAND C. 0448AA-15 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1568; 

-- [46331400] MBF ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1569; 

-- [46331401] MBF ISTM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1570; 

-- [46331510] MBF GENERAL NON DESIGNE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1571; 

-- [46331540] MBF HYDRO ENTRETIEN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1572; 

-- [46341400] ROW ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1573; 

-- [464] AUTRES DEBITEURS ET CREDITEURS DIVERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1574; 

-- [46401000] SONAS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1575; 

-- [46411000] COTISATIONS INSS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1576; 

-- [46421000] COTISATIONS INPP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1577; 

-- [46421100] COTISATION SYNDICALE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1578; 

-- [46620202] ECOH/FISTULE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1579; 

-- [46641000] LOYERS HABITATIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1580; 

-- [46641100] CENTRE DE NUTRITION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1581; 

-- [46641200] GUEST HOUSE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1582; 

-- [46651130] CLINIQUE DENTAIRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1583; 

-- [46651140] CNE (COMM. NAT. DE L'ENERGIE) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1584; 

-- [46651250] TABITHA MARIE MULANGA DORCAS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1585; 

-- [46661260] ECOLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1586; 

-- [46661280] GBH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1587; 

-- [46661290] RENOVATION HYDROELECTRIC SYSTEM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1588; 

-- [46661310] LUKENGU NGALAMULUME // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1589; 

-- [46661450] IMPROKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1590; 

-- [46661520] BOURSES RESIDENTS IMCK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1591; 

-- [46661590] ISTM TSHIKAJI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1592; 

-- [46661610] CACOSME ACTION SOCIALE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1593; 

-- [46661620] FRS PERFECTIONNEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1594; 

-- [46661640] BOURSE KAJIDI TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1595; 

-- [46661800] CENTRE MEDICAL D'ETUDES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1596; 

-- [46661830] DEPARTEMENT MEDICAL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1597; 

-- [46661860] MORQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1598; 

-- [46661870] REFECTOIRE CME (LOYER) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1599; 

-- [46661880] BICYCLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1600; 

-- [46661890] PROJET REPARATION HYDRO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1601; 

-- [47] COMPTES DE REGULARISATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1602; 

-- [47001000] REGULARISATION DE PASSIF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1603; 

-- [47101000] REGULARISATION D'ACTIF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1604; 

-- [47121000] CHARGES COMPTABILISES D'AVANCE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1605; 

-- [47201000] CHARGES A PAYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1606; 

-- [48101000] PROVISIONS POUR IMPAYES MALADES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1607; 

-- [48111000] PROV. POUR DEPRECIATIONS DES CREANCES DOUTEUSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1608; 

-- [49001000] COMPTE D'ATTENTE (ACTIF) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1609; 

-- [49101000] COMPTE D'ATTENTE (PASSIF) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1610; 

-- [49001100] AVANCE S/ACHAT A JUSTIFIER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1611; 

-- [5] COMPTES FINANCIERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1612; 

-- [56] BANQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1613; 

-- [56001000] IMCK OPERATING GENERAL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1614; 

-- [56011000] BCZ // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1615; 

-- [56011001] BCDC/USD // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1616; 

-- [56031000] WOCHOVIA BANK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1617; 

-- [56041000] CITY BANK OPHTALMOLOGY // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1618; 

-- [56051000] IMCK RESERVES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1619; 

-- [56101000] IMCK PCUSA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1620; 

-- [56201000] IMCK MBF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1621; 

-- [56701000] PNCBANK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1622; 

-- [56771100] PNCBANK-COMPTE BLOQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1623; 

-- [57] CAISSE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1624; 

-- [57101010] CAISSE PPLE HBB FC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1625; 

-- [57101020] CAISSE PPLE HBB $ // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1626; 

-- [57201010] CAISSE PAX FC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1627; 

-- [57301000] GRAND COFFRE $ // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1628; 

-- [573] COMPTES DES FONDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1629; 

-- [5731] ECOH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1630; 

-- [57311121] ECHO MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1631; 

-- [57311122] ECHO WOMEN'S DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1632; 

-- [57311123] ECOH AGRICULTURAL DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1633; 

-- [57311124] ECOH NUTRITION REAB. (CN) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1634; 

-- [57311125] ECOH INDIGENT CARE PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1635; 

-- [57311126] ECOH TSHIKAJI HEALTH CENTER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1636; 

-- [57311127] ECOH ORPHAN SCHOR EDUC PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1637; 

-- [57311128] ECOH HMHC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1638; 

-- [57311129] ECOH FISTULA PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1639; 

-- [57311130] ECOH CERVICAL CANCER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1640; 

-- [57311131] ECOH BCZS COM. HEALTH PROGRAM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1641; 

-- [57311350] ECOH 320802 MOBILITY IN MISSION 0096AA-08 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1642; 

-- [5732] ECO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1643; 

-- [57321100] ECO MISSIONNARY HOUSING // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1644; 

-- [57321124] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1645; 

-- [57321270] ECO CHARITY FUNDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1646; 

-- [57321510] ECO 320202/402 GENERAL N.D. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1647; 

-- [57321400] ECO 320902 ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1648; 

-- [57321490] ECO KAJIDI JONATHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1649; 

-- [5733] MBF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1650; 

-- [57331121] MBF MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1651; 

-- [57331122] MBF WOMEN DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1652; 

-- [57331127] MBF ORPHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1653; 

-- [57331128] MBF MOTHER CARE BABY CARE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1654; 

-- [57331129] MBF C-GSH FISTULA REPAIR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1655; 

-- [57331350] MBF IMCK'S TOYOTA LAND C. 0448AA-15 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1656; 

-- [57331400] MBF ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1657; 

-- [57331401] MBF ISTM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1658; 

-- [57331510] MBF GENERAL NON DESIGNE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1659; 

-- [57331540] MBF HYDRO ENTRETIEN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1660; 

-- [57341400] ROW ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1661; 

-- [57351129] FISTULE UNICEF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1662; 

-- [59] COMPTES DE VIREMENT INTERNE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1663; 

-- [59001000] TRANSFERT FTR-CAISSE PPLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1664; 

-- [59051600] TRANSFERT FTR-FONDS DIVERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1665; 

-- [59071000] TRF GRAND COFFRE CSSE PPLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1666; 

-- [59101000] TRANSFERT BCZ-CAISSE PPLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1667; 

-- [59101001] TFT BCDC USD - CAISSE PPLE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1668; 

-- [59131200] VIREMENT CAISSE PAX-BCDC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1669; 

-- [59131300] VIREMENT CAISSE HBB-BCDC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1670; 

-- [59201000] TRANSFERT PAX-CAISSE PPLE FC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1671; 

-- [59501000] TRANSFERT CLINIQUE DENTAIRE-CAISSE PPLE FC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1672; 

-- [59501001] TRANSFERT CLINIQUE DENTAIRE-CAISSE PPLE $ // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1673; 

-- [59901000] OPERATION DE CHANGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1674; 

-- [6] COMPTES DES CHARGES ET PERTES PAR NATURE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1675; 

-- [60] STOCKS VENDUS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1676; 

-- [60011100] Antidote // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1677; 

-- [60011101] Tension artérielle // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1678; 

-- [60011102] Diurétiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1679; 

-- [60011103] Système cardiovasculaire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1680; 

-- [60011104] Médicaments hématologiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1681; 

-- [60011105] Maladies métaboliques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1682; 

-- [60011106] Système gastro-intestinal // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1683; 

-- [60011107] Spasmolytiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1684; 

-- [60011108] "Médicaments pour le foie la vésicule et le pancréas" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1685; 

-- [60011109] "antiémetiques laxatifs et anti diarrhéiques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1686; 

-- [60011110] système uro-génital // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1687; 

-- [60011111] système respiratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1688; 

-- [60011112] Analgésiques - Antipyrétiques -Ains // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1689; 

-- [60011113] Analgésiques morphiniques et stupefiants (nt) (pt) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1690; 

-- [60011114] "Psychotropes hypnotiques sédatifs anxiolytiques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1691; 

-- [60011115] antiépileptiques et anticoparilsivants // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1692; 

-- [60011116] antiallergiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1693; 

-- [60011117] Glucocorticoides // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1694; 

-- [60011118] Médicaments de la Thyroïde // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1695; 

-- [60011119] Hormones sexuelles et contraceptions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1696; 

-- [60011120] Médicaments du diabète // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1697; 

-- [60011121] Médicaments anti-malaria // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1698; 

-- [60011122] Antibiotiques beta-lactames // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1699; 

-- [60011123] Antibiotiques non beta-lactames // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1700; 

-- [60011124] Antituberculeux-antilepreux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1701; 

-- [60011125] Médicaments antimycosiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1702; 

-- [60011126] "Médicaments antihelminthiques tilaires" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1703; 

-- [60011127] Médicaments antiviraux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1704; 

-- [60011128] "Vaccins immunoglobulines et sérums" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1705; 

-- [60011129] Médicaments antitumoraux et immunodépresseurs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1706; 

-- [60011130] "Minéraux vitamines et toniques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1707; 

-- [60011131] Médicaments à usage dermatologique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1708; 

-- [60011132] Médicaments à usage ophtalmique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1709; 

-- [60011133] Médicaments à usage otique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1710; 

-- [60011134] Médicaments des affections bucco-pharyngées // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1711; 

-- [60011135] Médicaments des affections vulvo-vaginales // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1712; 

-- [60011138] Médicaments agissant sur la musculature utérine // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1713; 

-- [60011139] fluides IV et substituts du plasma // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1714; 

-- [60011140] tests diagnostiques et bandelettes diagnostiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1715; 

-- [60011159] Consommables d'urologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1716; 

-- [60011171] Consommables des soins // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1717; 

-- [60011172] Gants // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1718; 

-- [60011174] consommables de suture // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1719; 

-- [60011175] "Séringues aiguilles catheters et set" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1720; 

-- [60011176] "Tubes endotracheaux aspiration alimentations et drains thoraciques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1721; 

-- [60011189] Consommables de Traumatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1722; 

-- [60211000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1723; 

-- [611] CONSOMMATIONS FOURNITURES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1724; 

-- [61111000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1725; 

-- [61111129] REPAS MALADES FISTULEUSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1726; 

-- [61112170] PRODUITS ALIMENTAIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1727; 

-- [61111136] Anesthésiques locaux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1728; 

-- [61112181] PRODUITS ALIMENTAIRES GUEST HOUSEs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1729; 

-- [61111137] Anesthésiques généraux et médicaments préopératoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1730; 

-- [61111141] TESTS DIAGNOSTIQUES ET BANDELETTES DIAGNOSTIQUES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1731; 

-- [61111142] MATERIEL ET EQUIPEMENT DE LABORATOIRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1732; 

-- [61111143] Réactifs de laboratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1733; 

-- [61111144] Consommable de laboratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1734; 

-- [61111145] Bactériologie : Coloration // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1735; 

-- [61111146] Chaine de froid // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1736; 

-- [61111147] Matériel et équipement de Microscope // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1737; 

-- [61111148] Consommables de microscopie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1738; 

-- [61111149] Bactériologie : milieux de culture // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1739; 

-- [61111152] Vetements professionnels // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1740; 

-- [61111158] Matériel et équipement d'urologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1741; 

-- [61111160] Matériel et équipement de stérilisation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1742; 

-- [61111161] Consommables de stérilisation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1743; 

-- [61111165] Matériels et équipement d'imagerie médicale et ECG // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1744; 

-- [61111166] Consommables d'imagerie médicale et ECG Service // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1745; 

-- [61111170] Matériel et équipement de soins // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1746; 

-- [61111173] GANTS NON STERILES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1747; 

-- [61111180] Matériel et équipement de diagnostic // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1748; 

-- [61111181] Matériel de Traitement et de Procedures operatoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1749; 

-- [61111183] "Désinfectants antiseptiques et purification de l'eau" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1750; 

-- [61111184] Kits // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1751; 

-- [61111185] Matériel de Pharmacie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1752; 

-- [61111186] Consommables de Pharmacie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1753; 

-- [61111187] Matériel d'Anesthésie et de Réanimation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1754; 

-- [61111188] Materiel de Traumatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1755; 

-- [61112180] PRODUITS ALIMENTAIRES GUEST HOUSE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1756; 

-- [61121600] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1757; 

-- [61311000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1758; 

-- [61311150] Matériel et équipement administratif // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1759; 

-- [61311151] Consommables administratifs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1760; 

-- [614] CARBURANT ET LUBRIFIANT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1761; 

-- [61401000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1762; 

-- [6141] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1763; 

-- [61411000] Carburant // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1764; 

-- [61411100] Lubrifiant // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1765; 

-- [61411200] Moto recouvrement // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1766; 

-- [61461350] Mobility in mission // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1767; 

-- [61431350] IMCK LC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1768; 

-- [615] EAU ET ELECTRICITE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1769; 

-- [6156] a preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1770; 

-- [61561000] Eau // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1771; 

-- [61561100] Electricité // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1772; 

-- [61601000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1773; 

-- [61601010] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1774; 

-- [61601182] Consommable et matériel d'entretien hospitalier // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1775; 

-- [618] PIECES DE RECHANGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1776; 

-- [61831350] IMCK LC 00 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1777; 

-- [61861350] Mobility in mission 0098 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1778; 

-- [61871000] Pièces de rechange LC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1779; 

-- [61871100] Groupe électrogène // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1780; 

-- [61871200] Moto recouvrement // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1781; 

-- [61871300] Hydro // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1782; 

-- [61900100] AUTRES FOURNITURES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1783; 

-- [61901000] PETIT MATERIEL ET MOBILIER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1784; 

-- [621] TRANSPORT CONSOMME // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1785; 

-- [62101000] Transport personnel // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1786; 

-- [62111129] Transport malades fistuleuses // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1787; 

-- [623] AUTRES FRAIS DE TRANSPORT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1788; 

-- [62301000] Déplacements et voyages // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1789; 

-- [62801000] DIVERS FRAIS DE VOYAGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1790; 

-- [63] AUTRES SERVICES CONSOMMES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1791; 

-- [630] a effacer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1792; 

-- [63001000] Loyer et charges locatives // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1793; 

-- [631] FRAIS D'ENTRETIEN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1794; 

-- [63111000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1795; 

-- [63121000] ENTRETIEN TERRAIN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1796; 

-- [63151000] ENTRETIEN MAT. DE TRANSPORT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1797; 

-- [63161350] Entretien LC mobility // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1798; 

-- [63171100] Entretien groupe électrogène // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1799; 

-- [632] FRAIS FIDICIAIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1800; 

-- [63201000] Frais d'acte notarial // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1801; 

-- [63201010] HONORAIRES AVOCAT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1802; 

-- [63201030] HONORAIRES AUDITEURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1803; 

-- [63211100] FIDICIAIRE KAPUKU MUAMBA ALIDOR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1804; 

-- [63211129] HONORAIRES S/OPERATIONS FISTULEUSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1805; 

-- [63221000] AVOCAT BEYA MARCEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1806; 

-- [63221100] AVOCAT MUBALU KANKOLONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1807; 

-- [633] FRAIS BANCAIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1808; 

-- [6330] a effacer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1809; 

-- [63301000] Frais bancaires PNC BANK // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1810; 

-- [63301001] Frais bancaires Wells Fargo / Wachovia // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1811; 

-- [63301002] Frais bancaires CITI bank // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1812; 

-- [63301003] Frais bancaires BCDC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1813; 

-- [63301004] Frais bancaires FT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1814; 

-- [63301200] "Frais d'hotel restaurant" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1815; 

-- [63301300] FRAIS POSTES ET TELECOMMUNICATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1816; 

-- [63301400] AUTRES SERVICES EXTERIEURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1817; 

-- [6331] ECOH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1818; 

-- [63311121] ECOH MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1819; 

-- [63311122] ECOH WOMEN'S DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1820; 

-- [63311123] ECOH AGRICULTURAL DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1821; 

-- [63311124] ECOH NUTRITION REAB. (CN) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1822; 

-- [63311125] ECOH INDIGENT CARE PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1823; 

-- [63311126] ECOH TSHIKAJI HEALTH CENTER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1824; 

-- [63311127] ECOH ORPHAN SCHOR EDUC PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1825; 

-- [63311128] ECOH HMHC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1826; 

-- [63311129] ECOH FISTULA PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1827; 

-- [63311130] ECOH CERVICAL CANCER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1828; 

-- [63311131] ECOH BCZS COM. HEALTH PROGRAM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1829; 

-- [63311350] ECOH 320802 MOBILITY IN MISSION 0096AA-08 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1830; 

-- [6332] ECO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1831; 

-- [63321100] ECO MISSIONNARY HOUSING // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1832; 

-- [63321270] ECO CHARITY FUNDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1833; 

-- [63321400] ECO 320902 ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1834; 

-- [63321510] ECO 320202/402 GENERAL N.D. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1835; 

-- [63321490] ECO KAJIDI JONATHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1836; 

-- [6333] MBF PROJECTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1837; 

-- [63331121] MBF MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1838; 

-- [63331122] MBF WOMEN DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1839; 

-- [63331127] MBF ORPHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1840; 

-- [63331128] MBF MOTHER CARE BABY CARE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1841; 

-- [63331129] MBF C-GSH FISTULA REPAIR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1842; 

-- [63331350] MBF IMCK'S TOYOTA LAND C. 0448AA-15 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1843; 

-- [63331400] MBF ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1844; 

-- [63331401] MBF ISTM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1845; 

-- [63331510] MBF GENERAL NON DESIGNE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1846; 

-- [63331540] MBF HYDRO ENTRETIEN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1847; 

-- [63341400] ROW ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1848; 

-- [64] CHARGES ET PERTES DIVERSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1849; 

-- [640] ASSURANCES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1850; 

-- [64071000] ASSURANCES VEHICULES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1851; 

-- [64071100] ASSURANCES MOTOS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1852; 

-- [645] COTISATIONS ET AUTRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1853; 

-- [64511000] ASSISTANCES AU PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1854; 

-- [64511100] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1855; 

-- [64521000] COTISATIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1856; 

-- [64521100] DONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1857; 

-- [64521110] REPRESENTATION DES TRAVAILLEURS AUX DEFILES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1858; 

-- [64521120] REPRESENTATION A L'EPN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1859; 

-- [64601000] DIFFERENCE DE CHANGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1860; 

-- [64601100] PERTE DE L'INVENTAIRE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1861; 

-- [64701000] SOINS GRATUITS (CHARITE) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1862; 

-- [64701100] CREANCES IRRECOUVRABLES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1863; 

-- [64801000] AMENDES PENALES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1864; 

-- [64901000] CONSEIL D'ADMINISTRATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1865; 

-- [64931000] PERTES S/EXERCICES ANTERIEURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1866; 

-- [64961000] CHARGES ET PERTES DIVERSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1867; 

-- [64971000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1868; 

-- [65] CHARGES DU PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1869; 

-- [651] SALAIRES ET PRIMES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1870; 

-- [65111000] SALAIRES BRUTS ET PRIMES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1871; 

-- [65111129] PRIME S/OPERATIONS FISTULES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1872; 

-- [65117115] SANGAMAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1873; 

-- [65121020] MULAJA MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1874; 

-- [65121150] KABASELE KABATA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1875; 

-- [65121170] KAPEMBU KANDE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1876; 

-- [65131100] MPOI LUMPUNGU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1877; 

-- [65131130] KAPINGA BAKATUSEKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1878; 

-- [65131140] BAJIKILE KASONGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1879; 

-- [65131150] TSHIABA KALUBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1880; 

-- [65131160] KAMANGUDU NDONDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1881; 

-- [65131180] KATUJUDI NKUNA (H) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1882; 

-- [65131190] KAZADI MUKENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1883; 

-- [65131200] GIBENDE ABONGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1884; 

-- [65131210] KUETE SHAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1885; 

-- [65131220] TSHISANGA NDEMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1886; 

-- [65131230] LUPANTSHIA PALELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1887; 

-- [65131250] BUABUA KAYEMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1888; 

-- [65131260] NGALAMULUME LUKENGU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1889; 

-- [65131280] TSHITALA BADINENGANYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1890; 

-- [65131300] TSHIBOLA TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1891; 

-- [65131330] MUAKUYA MALU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1892; 

-- [65131340] NGALULA BATUBENGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1893; 

-- [65131370] BENGESHA NGINDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1894; 

-- [65131380] NKASHAMA MUYEMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1895; 

-- [65131470] KABEDI NKONKO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1896; 

-- [65131520] NTUMBA BAKAJIKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1897; 

-- [65131540] NGALAMULUME NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1898; 

-- [65131600] MUSHIYA KABEMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1899; 

-- [65131610] KATENDE BITSHIDI BIBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1900; 

-- [65131620] MULUMBA KAYEMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1901; 

-- [65131660] KALUINA JIBIKILAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1902; 

-- [65131670] MBUYI MUNTUABO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1903; 

-- [65131710] KADIATA MUDIBANGANYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1904; 

-- [65131730] KATOMBE MUBIKAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1905; 

-- [65131770] BANANGA BATAMINA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1906; 

-- [65131790] KATUAMBI BIPENDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1907; 

-- [65131830] KALONGA MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1908; 

-- [65131860] KATUJUDI NKUNA (F) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1909; 

-- [65131890] SEKUNDO NASSOZA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1910; 

-- [65131910] TUINDILA KATEMBUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1911; 

-- [65131950] BIMINE DIBELAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1912; 

-- [65131990] NTEFU KABEMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1913; 

-- [65141000] ALLOCATIONS FAMILIALES LEGALES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1914; 

-- [65141020] MUBIAYI BUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1915; 

-- [65141080] TUSEKU MUYAYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1916; 

-- [65141100] KENA BUILA SHINDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1917; 

-- [65141110] BETU MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1918; 

-- [65141140] BABADI KABAMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1919; 

-- [65141150] BAMBI MUKENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1920; 

-- [65141210] NDAYE KATEBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1921; 

-- [65141240] KANKONDE TSHIMANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1922; 

-- [65141280] KAZAI KAMUNA KAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1923; 

-- [65141290] BAKADISULA MPINDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1924; 

-- [65141300] TSHIONDO MAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1925; 

-- [65141350] NZEBA KALELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1926; 

-- [65141420] NTUMBA MUNTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1927; 

-- [65141440] NTUMBA SOKOMBE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1928; 

-- [65141460] BASUNGILA MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1929; 

-- [65141540] BEYA BEYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1930; 

-- [65141560] KABIBU BIMVULU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1931; 

-- [65141590] MUANZA MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1932; 

-- [65141600] TSHIAMBA KABONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1933; 

-- [65141610] MILOLO TSHIKOLO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1934; 

-- [65141650] KABILA MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1935; 

-- [65141660] TSHIBUABUA LUBUELA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1936; 

-- [65141680] KAMUANYA TSHIMANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1937; 

-- [65141690] KAJIDI TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1938; 

-- [65141700] KUTEKEMENYI MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1939; 

-- [65141720] NGONDO KENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1940; 

-- [65141730] LULUA LUKADI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1941; 

-- [65141760] BAKATUSENGA BULEDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1942; 

-- [65141770] UMBA CHICO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1943; 

-- [65141780] KANUASHI KAPUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1944; 

-- [65141790] KAPINGA TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1945; 

-- [65141810] BEYA NDONDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1946; 

-- [65141820] NGINDU KALONJI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1947; 

-- [65141830] NTAMBUE MUPINDULA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1948; 

-- [65141840] TSHIBUABUA NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1949; 

-- [65141850] TSHIMANGA KADIMA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1950; 

-- [65141880] BAPELE BEYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1951; 

-- [65141920] KANDA KANDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1952; 

-- [65141930] LUSHONYI KABONGO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1953; 

-- [65141970] MUTEBA BANTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1954; 

-- [65151040] NYENGELE MAKENGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1955; 

-- [65151080] BILONDA BEYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1956; 

-- [65151100] TSHIBOMBO BAKAJIKA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1957; 

-- [65151410] BASUE MULAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1958; 

-- [65151440] BENA BIABU KABANGU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1959; 

-- [65151450] BILEWO MUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1960; 

-- [65151480] KABAMUSU MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1961; 

-- [65151490] KABINDA MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1962; 

-- [65151500] KAPEMBA KA KAMANGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1963; 

-- [65151540] MALU MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1964; 

-- [65151580] MUADI ILUNGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1965; 

-- [65151600] MULENDA MUKENGESHAYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1966; 

-- [65151610] MUNYOKA BADIANJILE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1967; 

-- [65151680] NTUMBA LUENDU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1968; 

-- [65151750] TSHISHIKU LUBOYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1969; 

-- [65151770] KADIATA TSHIKANANA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1970; 

-- [65151810] MUTOMBO NTITA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1971; 

-- [65151830] MUKUNA DIBAMBU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1972; 

-- [65151840] MUSUBE MUKENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1973; 

-- [65151850] KANKU SHABANTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1974; 

-- [65151920] KABASELE BANTUBIABO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1975; 

-- [65151940] ILUNGA ILUNGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1976; 

-- [65151950] BENDE KAPUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1977; 

-- [65151980] NDEMBU MUTOMBO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1978; 

-- [65151990] KANDE BAKANTOMBOLOLA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1979; 

-- [65161040] KABANGE MBUYI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1980; 

-- [65161050] NDANDU MAYIMONA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1981; 

-- [65161060] NTUMBA LUTULU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1982; 

-- [65161080] KABUTAKAPUA NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1983; 

-- [65161130] BUABUA TSHIPAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1984; 

-- [65161140] NGALULA NKITA BUNGI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1985; 

-- [65161180] MAYAMBI NZAMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1986; 

-- [65161190] SHAMUIMBA MBOMBO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1987; 

-- [65161240] SOMBAMANYA NDAYE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1988; 

-- [65161250] KATUKADI TSHITENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1989; 

-- [65161270] BANSHIMI BEYA MPUTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1990; 

-- [65161280] TSHIADIMUNA MATANDA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1991; 

-- [65161310] MAMBA MPUNGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1992; 

-- [65161320] MVITA KANDE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1993; 

-- [65161810] MULUMBA KAVULA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1994; 

-- [65161920] KOBO KARUNDZU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1995; 

-- [65161930] MUZADI NDAYE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1996; 

-- [65161940] NGALULA TSHIBUABUA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1997; 

-- [65161950] LUSAMBA TSHIABA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1998; 

-- [65161960] KAFULA MPUTU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 1999; 

-- [65161980] BAMANYE LUFU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2000; 

-- [65161990] KATUBADI MUAMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2001; 

-- [65171000] MUMBA TSHISHIMBI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2002; 

-- [65171100] BATENA TSHISENGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2003; 

-- [65171120] BENYI BIMINE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2004; 

-- [65171130] MUTAPAYI MUKUAYITA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2005; 

-- [65171140] KATUENA BANGI MANGALA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2006; 

-- [65171160] BALUIDI MUKENDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2007; 

-- [65171170] BIKEMU KAPUKU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2008; 

-- [65171200] KAMAYI MULUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2009; 

-- [65171260] NSAFU KAPEMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2010; 

-- [65171270] NKOLE NTUMBA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2011; 

-- [65171280] KEBA KASONGA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2012; 

-- [65171290] MBUYI KABUYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2013; 

-- [65171300] NGONDO KABASELE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2014; 

-- [65171310] MAYUWA KABENGELE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2015; 

-- [65171320] ILUNGA NKASHAMA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2016; 

-- [65171330] MBALANDA MUKUAYITA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2017; 

-- [65171340] MILOLO KUINJIDI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2018; 

-- [65171350] KABUYA KABUYA // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2019; 

-- [65171360] MABUDI KABIBU // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2020; 

-- [65171370] MUANGE SABUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2021; 

-- [65171380] TSHITA KALONJI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2022; 

-- [65171390] MUKENDI TSHITADI // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2023; 

-- [652] AUTRES CHARGES DU PERSONNEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2024; 

-- [65211000] CHARGES SOCIALES DIVERSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2025; 

-- [65301000] INDEMNITES DIVERSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2026; 

-- [65321000] FRS PHARMACEUTIQUES CASH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2027; 

-- [65321100] FRAIS FUNERAIRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2028; 

-- [65321200] SOINS MEDICAUX EN NATURE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2029; 

-- [65331000] INDEMNITES DE TRANSPORT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2030; 

-- [65341000] INDEMNITES DE LOGEMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2031; 

-- [65351000] INDEMNITE DE FIN CARRIERE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2032; 

-- [66] CONTRIBUTIONS ET TAXES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2033; 

-- [66141000] AMENDES ET PENALITES FISCALES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2034; 

-- [66201000] CONTRÔLE TECHNIQUE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2035; 

-- [66301000] TAXES DIVERSES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2036; 

-- [68001000] DOTATIONS AUX AMORTISSEMENTS ET PROVISIONS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2037; 

-- [7] COMPTES DE PRODUITS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2038; 

-- [700] VENTE MEDICAMENTS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2039; 

-- [70011000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2040; 

-- [70011100] Antidote // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2041; 

-- [70011101] Tension artérielle // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2042; 

-- [70011102] Diurétiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2043; 

-- [70011103] Système cardiovasculaire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2044; 

-- [70011104] Médicaments hématologiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2045; 

-- [70011105] Maladies métaboliques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2046; 

-- [70011106] Système gastro-intestinal // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2047; 

-- [70011107] Spasmolytiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2048; 

-- [70011108] "Médicaments pour le foie la vésicule et le pancréas" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2049; 

-- [70011109] "antiémetiques laxatifs et anti diarrhéiques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2050; 

-- [70011110] système uro-génital // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2051; 

-- [70011111] système respiratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2052; 

-- [70011112] Analgésiques - Antipyrétiques -Ains // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2053; 

-- [70011113] Analgésiques morphiniques et stupefiants (nt) (pt) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2054; 

-- [70011114] "Psychotropes hypnotiques sédatifs anxiolytiques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2055; 

-- [70011115] antiépileptiques et anticoparilsivants // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2056; 

-- [70011116] antiallergiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2057; 

-- [70011117] Glucocorticoides // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2058; 

-- [70011118] Médicaments de la Thyroïde // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2059; 

-- [70011119] Hormones sexuelles et contraceptions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2060; 

-- [70011120] Médicaments du diabète // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2061; 

-- [70011121] Médicaments anti-malaria // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2062; 

-- [70011122] Antibiotiques beta-lactames // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2063; 

-- [70011123] Antibiotiques non beta-lactames // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2064; 

-- [70011124] Antituberculeux-antilepreux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2065; 

-- [70011125] Médicaments antimycosiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2066; 

-- [70011126] "Médicaments antihelminthiques tilaires" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2067; 

-- [70011127] Médicaments antiviraux // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2068; 

-- [70011128] "Vaccins immunoglobulines et sérums" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2069; 

-- [70011129] Médicaments antitumoraux et immunodépresseurs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2070; 

-- [70011130] "Minéraux vitamines et toniques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2071; 

-- [70011131] Médicaments à usage dermatologique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2072; 

-- [70011132] Médicaments à usage ophtalmique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2073; 

-- [70011133] Médicaments à usage otique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2074; 

-- [70011134] Médicaments des affections bucco-pharyngées // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2075; 

-- [70011135] Médicaments des affections vulvo-vaginales // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2076; 

-- [70011138] Médicaments agissant sur la musculature utérine // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2077; 

-- [70011139] fluides IV et substituts du plasma // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2078; 

-- [70011140] tests diagnostiques et bandelettes diagnostiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2079; 

-- [70011159] Consommables d'urologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2080; 

-- [70011171] Consommables des soins // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2081; 

-- [70011172] Gants // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2082; 

-- [70011174] consommables de suture // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2083; 

-- [70011175] "Séringues aiguilles catheters et set" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2084; 

-- [70011176] "Tubes endotracheaux aspiration alimentations et drains thoraciques" // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2085; 

-- [70011189] Consommables de Traumatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2086; 

-- [70301000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2087; 

-- [710] ACTES/PRODUCTIONS VENDUES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2088; 

-- [71011001] Anesthésie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2089; 

-- [71011002] Biopsie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2090; 

-- [71011003] Brulures // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2091; 

-- [71011004] Certificats et autres frais administratifs // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2092; 

-- [71011005] chirurgie tube digestif // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2093; 

-- [71011006] consultation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2094; 

-- [71011007] Corps étrangers // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2095; 

-- [71011008] Examen complémentaire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2096; 

-- [71011009] Excisions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2097; 

-- [71011010] Greffes dermo-épidermiques // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2098; 

-- [71011011] Gynécologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2099; 

-- [71011012] Hernies // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2100; 

-- [71011013] Hospitalisation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2101; 

-- [71011014] Incisions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2102; 

-- [71011015] Injections // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2103; 

-- [71011016] Laboratoire // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2104; 

-- [71011017] Laboratoire Bactériologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2105; 

-- [71011018] Laboratoire Biochimie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2106; 

-- [71011019] Laboratoire hématologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2107; 

-- [71011020] Laboratoire Hémostase // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2108; 

-- [71011021] Laboratoire Ionogramme // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2109; 

-- [71011022] Laboratoire Parasitologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2110; 

-- [71011023] Laboratoire Sérologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2111; 

-- [71011024] Laparatomie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2112; 

-- [71011025] Obstétrique // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2113; 

-- [71011026] Ophtalmologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2114; 

-- [71011027] Orthopédie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2115; 

-- [71011028] Traumatologie fractures fermées // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2116; 

-- [71011029] Traumatologies fractures ouvertes // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2117; 

-- [71011030] Traumatologie luxation // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2118; 

-- [71011031] Platres // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2119; 

-- [71011032] Ponctions // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2120; 

-- [71011033] Radiologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2121; 

-- [71011034] Endoscopie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2122; 

-- [71011035] Soins infirmiers ambulatoires // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2123; 

-- [71011036] Petite chirurgie sutures // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2124; 

-- [71011037] Urologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2125; 

-- [71011038] Stomatologie // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2126; 

-- [71011039] O.R.L. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2127; 

-- [71011040] Amputations // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2128; 

-- [71011600] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2129; 

-- [71011100] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2130; 

-- [71011110] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2131; 

-- [71011120] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2132; 

-- [71011700] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2133; 

-- [71019100] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2134; 

-- [71161000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2135; 

-- [72001000] PRODUCTIONS STOCKEES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2136; 

-- [74] PRODUITS ET PROFITS DIVERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2137; 

-- [74031000] LOYER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2138; 

-- [74611000] PRODUITS DE CHANGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2139; 

-- [74611100] PRODUITS ET PROFITS DIVERS HE/GH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2140; 

-- [74611200] PRODUITS TRANSPORT BRIQUES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2141; 

-- [74611300] PRODUITS FRS DE RECHERCHE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2142; 

-- [74611350] PRODUITS ET PROFITS DIVERS/CE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2143; 

-- [74611400] PRODUITS FRS DE STAGE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2144; 

-- [74621000] PRODUITS DIVERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2145; 

-- [74641000] PRODUITS S/EXERCICES ANTERIEURS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2146; 

-- [76151000] DIVERS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2147; 

-- [76] SUBVENTIONS D'EXPLOITATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2148; 

-- [7611] ECOH // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2149; 

-- [76111121] ECHO MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2150; 

-- [76111122] ECHO WOMEN'S DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2151; 

-- [76111123] ECOH AGRICULTURAL DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2152; 

-- [76111124] ECOH NUTRITION REAB. (CN) // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2153; 

-- [76111125] ECOH INDIGENT CARE PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2154; 

-- [76111126] ECOH TSHIKAJI HEALTH CENTER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2155; 

-- [76111127] ECOH ORPHAN SCHOR EDUC PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2156; 

-- [76111128] ECOH HMHC // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2157; 

-- [76111129] ECOH FISTULA PROJECT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2158; 

-- [76111130] ECOH CERVICAL CANCER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2159; 

-- [76111131] ECOH BCZS COM. HEALTH PROGRAM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2160; 

-- [76111350] ECOH 320802 MOBILITY IN MISSION 0096AA-08 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2161; 

-- [7612] ECO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2162; 

-- [76121100] ECO MISSIONNARY HOUSING // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2163; 

-- [76121270] ECO CHARITY FUNDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2164; 

-- [76121510] ECO 320202/402 GENERAL N.D. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2165; 

-- [76121400] ECO 320902 ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2166; 

-- [76121490] ECO KAJIDI JONATHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2167; 

-- [7613] MBF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2168; 

-- [76131121] MBF MORINGA TREE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2169; 

-- [76131122] MBF WOMEN DEVELOPMENT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2170; 

-- [76131127] MBF ORPHAN SCHOLARSHIP // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2171; 

-- [76131128] MBF MOTHER CARE BABY CARE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2172; 

-- [76131129] MBF C-GSH FISTULA REPAIR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2173; 

-- [76131350] MBF IMCK'S TOYOTA LAND C. 0448AA-15 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2174; 

-- [76131400] MBF ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2175; 

-- [76131401] MBF ISTM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2176; 

-- [76131510] MBF GENERAL NON DESIGNE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2177; 

-- [76131540] MBF HYDRO ENTRETIEN // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2178; 

-- [76141400] ROW ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2179; 

-- [762] PC USA ECO // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2180; 

-- [76211] ECO 320202 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2181; 

-- [76211131] ECO BCZS Com. Health Prog. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2182; 

-- [76211300] ECO GENERAL N.D. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2183; 

-- [76211350] ECO MOBILITY IN MISSION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2184; 

-- [76211401] ECO SUPPORT OF THE NURSING SCHOOL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2185; 

-- [76211450] ECO CHARITY FUNDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2186; 

-- [7622] ECO 320402 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2187; 

-- [76221131] ECO BCZS Com. Health Prog. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2188; 

-- [76221300] ECO GENERAL N.D. // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2189; 

-- [76221350] ECO MOBILITY IN MISSION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2190; 

-- [76221401] ECO SUPPORT OF THE NURSING SCHOOL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2191; 

-- [76221450] ECO CHARITY FUNDS // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2192; 

-- [7623] ECO 320902 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2193; 

-- [76231400] ECO ITM // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2194; 

-- [7624] ECO862737 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2195; 

-- [76240001] ECO 862737 FOUNDERS CHAPEL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2196; 

-- [763] MBF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2197; 

-- [7631] MBF // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2198; 

-- [76311129] MBF C-GSH FISTULA REPAIR // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2199; 

-- [76311300] MBF GENERAL NON DESIGNE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2200; 

-- [76311350] MBF IMCK'S TOYOTA LAND C. 0448AA-15 // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2201; 

-- [76311401] MBF SUPPORT FOR NURSING SCHOOL // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2202; 

-- [76311450] MBF CHARITY FUNDS INDIGENT CARE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2203; 

-- [78001000] Reprise subvention d'équipement // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2204; 

-- [8] COMPTES DES SOLDES DE GESTION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2205; 

-- [80011000] MARGE BRUTE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2206; 

-- [81011000] VALEUR AJOUTEE // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2207; 

-- [82011000] RESULTAT BRUT D'EXPLOITATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2208; 

-- [83011000] RESULTAT NET D'EXPLOITATION // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2209; 

-- [84011000] RESULTAT S/CESSION IMMO ET TITRES // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2210; 

-- [85011000] RESULTAT AVANT IMPOT // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2211; 

-- [87011000] RESULTAT DE LA PERIODE A AFFECTER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2212; 

-- [71161100] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2213; 

-- [71015000] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2214; 

-- [71011800] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2215; 

-- [71101100] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2216; 

-- [71012100] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2217; 

-- [71011300] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2218; 

-- [70011200] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2219; 

-- [10113100] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2220; 

-- [71011200] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2221; 

-- [71888888] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2222; 

-- [41211470] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2223; 

-- [70211000] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2224; 

-- [74611500] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2225; 

-- [71014100] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2226; 

-- [57188888] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2227; 

-- [71019000] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2228; 

-- [41011980] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2229; 

-- [41201530] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2230; 

-- [70031400] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2231; 

-- [41011970] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2232; 

-- [64751100] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2233; 

-- [71051000] A preparer // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2234; 

-- [63411000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2235; 

-- [46651270] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2236; 

-- [31121700] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2237; 

-- [46651280] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2238; 

-- [41331400] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2239; 

-- [61421110] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2240; 

-- [42171470] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2241; 

-- [42141280] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2242; 

-- [42151600] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2243; 

-- [42151080] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2244; 

-- [42171460] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2245; 

-- [42171450] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2246; 

-- [42171380] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2247; 

-- [42171290] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2248; 

-- [42151940] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2249; 

-- [42171480] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2250; 

-- [42161940] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2251; 

-- [42171140] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2252; 

-- [42171540] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2253; 

-- [61121700] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2254; 

-- [74611450] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2255; 

-- [60111000] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2256; 

-- [42151580] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2257; 

-- [42131590] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 2258; 

-- [31121610] A preciser // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 3658; 

-- [41201330] A PRECISER // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 3690; 

-- [86511011] Reprises de subventions d'investissement mobiliers // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 3999; 

-- [86511012] Reprises de subventions d'equipement // IS_OHADA = 0 
UPDATE account SET account.locked = 1, account.hidden = 1 WHERE account.id = 4000;
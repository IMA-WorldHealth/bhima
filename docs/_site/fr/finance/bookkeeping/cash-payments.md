# La fenêtre de trésorerie

La fenêtre de caisse est responsable de recevoir les paiements des patients. Deux types de paiements sont pris en charge:

1. **Les paiements de factures** sont effectués pour des biens et services facturés dans le module [Facture patient](/patient-invoices.md).
2. **Les paiements anticipés** sont effectués en prévision des biens et services futurs rendus.

Les deux types de paiement génèrent des transactions avec un identifiant d’enregistrement `CP`.

<div class = "bs-callout bs-callout-info">
<h4> Aucun paiement anticipé? </h4>
Toutes les institutions ne demandent pas d'avance aux patients. Les paiements anticipés peuvent être entièrement désactivés dans les paramètres d'entreprise si l'institution ne collecte pas les paiements anticipés.
</div>

## Configuration de la fenêtre de paiement

Lorsqu'un utilisateur accède pour la première fois à la fenêtre de paiement, il lui sera demandé de choisir une caisse à utiliser. La caisse sélectionnée déterminera directement le compte de caisse utilisé dans les transactions financières sous-jacentes. Deux facteurs déterminent quelles caisses un utilisateur est présenté:

1. La caisse doit avoir été créée et configurée dans le [module caisses](#).
2. L'utilisateur doit être autorisé à accéder à la caisse depuis le module [user management](#).

Les caisses correspondent généralement à des emplacements physiques et sont donc classées par projet. Si la caisse souhaitée ne figure pas dans la liste, vérifiez que les deux conditions ci-dessus sont remplies pour l'utilisateur et la caisse.

Si un utilisateur souhaite changer de caisse, il peut le faire en cliquant sur **Menu &gt; Changer de caisse**. Cela fera apparaître le modal de sélection de la caisse.

## Création d'un paiement en espèces

Un paiement en espèces nécessite les champs suivants:

1. **Patient** - Tous les paiements en espèces sont effectués par les patients. Le patient configure directement le compte du débiteur dans la transaction sous-jacente via le groupe de débiteurs du patient.
2. **Date**
3. **Devise** - La devise définit le compte de caisse sous-jacent. Les guichets qui acceptent plusieurs devises doivent mettre chaque valeur de devise dans le compte de devise approprié. Le champ de devise gère cela automatiquement pour le caissier.
4. **Type** - permet de choisir entre un paiement anticipé et un paiement sur facture. Voir la distinction ci-dessous.
5. **Notes** - toute information supplémentaire à inclure sur la facture.
6. **Montant** - le montant payé par le patient.

<div class = "bs-callout bs-callout-warning">
<h4> Limitation des paiements par groupe de débiteurs </h4>
Seuls les clients payant en espèces devraient être autorisés à effectuer des paiements au guichet. Pour éviter de recevoir accidentellement de l'argent d'un client qui ne devrait pas payer au guichet, assurez-vous de modifier le paramètre "accepter les paiements en espèces" de son groupe de débiteurs!
</div>

### Paiements Facture

Le paiement le plus courant concerne une ou plusieurs factures. Pour créer ce paiement, le caissier devra choisir le type _invoice payment_. Ce faisant, un bouton apparaît avec le texte "Sélectionner les factures". Cliquez sur ce bouton pour afficher le mode de sélection de la facture.

Les patients ne peuvent payer que pour les factures effectuées sur leur compte personnel. Si un patient n'a pas été sélectionné dans l'entrée **patient**, un message d'erreur s'affiche pour indiquer à l'utilisateur de remplir ce champ avant de sélectionner les factures. Si un patient a été sélectionné, une liste de zéro ou plusieurs factures non équilibrées apparaîtra. Si le patient n'a pas été facturé ou s'il a payé l'intégralité de ses factures, sa liste de factures sera vide. S'il existe une ou plusieurs factures non équilibrées, celles-ci seront répertoriées. La sélection d'une ou plusieurs de ces factures les mettra en file d'attente pour le paiement.

Un patient est autorisé à payer le montant total de toutes les factures facturées. Les paiements partiels seront affectés à chaque facture du plus ancien au plus récent jusqu'à ce que le paiement ait été utilisé. Malgré le paiement de plusieurs factures, un paiement de facture générera toujours une transaction unique contenant une seule ligne déplaçant le paiement total dans le compte de la caisse et une ligne pour chaque facture payée. Un exemple de transaction pour un paiement sur deux factures \(`` IV.TPA.1` et `IV.TPA.2` \) pourrait ressembler à ceci:

| Transaction | Record | **Compte** | Débit | Crédit | Entité | Référence |
| --- | --- | --- | --- | --- | --- | --- |
| TRANS1 | CP.TPA.1 | 570001 | 10,00 $ | | | |
| TRANS1 | CP.TPA.1 | 410001 | | 4,50 $ | PA.HEV.1 | IV.TPA.1 |
| TRANS1 | CP.TPA.1 | 410001 | | 5,50 $ | PA.HEV.1 | IV.TPA.2 |
| | | | **10,00 $** | **10,00 $** | | - |

Dans la transaction ci-dessus, le compte de caisse \(570001 \) est **débité de 10,00 $**, ce qui indique que le patient a versé de l’argent sur ce compte. Le compte du patient \(410001\) est **crédité pour chaque facture payée**. Les références aux factures sont jointes à la transaction sur la ligne correspondante.

### Prépaiements

Certaines institutions acceptent les «paiements anticipés». Ces paiements sont effectués sans référence à une facture, en prévision de futures factures faites contre le patient.

Par rapport aux paiements de factures, la création d'un paiement anticipé est simple. L'utilisateur doit sélectionner l'option de paiement anticipé et saisir le montant reçu dans le formulaire de paiement en espèces. La transaction sous-jacente générée contiendra deux lignes: une qui débite la caisse et une seconde qui crédite le compte du patient.
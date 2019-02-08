# Gestion des patients

La grande majorité des clients de l'hôpital sont des patients. BHIMA se concentrant principalement sur les aspects de comptabilité et de gestion de l’hôpital, la composante dossiers médicaux de BHIMA est sous-développée. Au lieu de cela, la fonction première des patients est de créer un débiteur auquel attacher un historique financier. Malgré l'accent mis sur la finance, BHIMA prend en charge quelques caractéristiques purement médicales, notamment les données démographiques et biométriques associées aux patients, un outil permettant de joindre des documents aux patients, la gestion de groupes de patients et la gestion des visites de patients.

<div class = "bs-callout bs-callout-primary">
<h4> Avez-vous une recommandation? </h4>
Si vous avez des recommandations sur des fonctionnalités manquant dans BHIMA ou sur les moyens d'améliorer les dossiers médicaux, veuillez contacter les développeurs. Nous aimerions vraiment en savoir plus!
</div>

Les patients jouent le rôle duel d'être à la fois une personne malade nécessitant un traitement et un débiteur qui développe des antécédents financiers. Il est utile de séparer ces deux concepts car ils ont des préoccupations différentes. Les diagrammes ci-dessous tentent de distinguer ces concepts:

**Flux de travail médical**

```mermaid
graphe LR
    PR [Enregistrement du patient] -> PL [Registre des patients]
    PL -> PRec (Dossier Patient)
    PRec -> MPG {Modifier le groupe de patients}
    PRec -> OMD {Modifier le groupe de débiteurs}
    PRec -> UP {Télécharger une photo}
    PRec -> UD {Upload Documents}
```

**Workflow financier**

```mermaid
graphe LR
    PR [Enregistrement du patient] -> PL [Registre des patients]
    PL -> IV [Facturation]
    IV -> CP [Paiements en espèces]
    PL -> CP
```

## Enregistrement du patient

BHIMA s'attend à ce que l'enregistrement du patient soit la première étape du début du traitement du patient. Le module Enregistrement du patient divise la page d'enregistrement en informations _required_ et informations_optional_. Ces panneaux fonctionnent comme leur nom l'indique: une inscription réussie doit contenir au minimum les informations requises. Une fois les informations requises complétées, cliquez sur le bouton bleu pour enregistrer le patient.

<div class = "bs-callout bs-callout-primary">
<h4> Quelle est la différence entre l'origine et l'emplacement actuel? </h4>
Vous remarquerez un champ en double défini dans les informations requises - "Lieu d'origine" et "Emplacement actuel". Cette information est importante pour localiser les patients lorsqu'ils ont quitté l'hôpital. Le lieu "d'origine" d'un patient est celui d'où provient traditionnellement sa famille, tandis que son lieu actuel correspond à son lieu d'origine. Souvent, le lieu d'origine du patient est une meilleure adresse car sa famille sera toujours en mesure de le localiser.
</div>

Une fois qu'un patient est enregistré avec succès, le module produira une carte de patient. La carte patient est conçue pour être imprimée et emportée avec le patient. Elle contient le minimum d'informations nécessaire pour localiser le patient dans le système, y compris un code à barres pour une référence rapide. Si possible, ceux-ci devraient être transportés avec le patient et ramenés à la maison jusqu'à sa prochaine visite à l'hôpital.

<div class = "bs-callout bs-callout-warning">
<h4> Obtenez le groupe de débiteur à droite! </h4>
Il est primordial d’affecter le groupe de débiteurs approprié à un patient. Le groupe de débiteurs détermine directement le compte du patient. Vous pourriez penser à cela comme "qui reçoit la facture." Si le patient est un patient qui paye en espèces et qu'il est affecté à un groupe couru, il peut être libéré de l'hôpital sans payer!
</div>

Une fois qu'un patient est enregistré, il apparaîtra dans le [Registre des patients] (# le registre du patient) et une page du dossier du patient sera créée pour lui.

## Registre des patients

Le registre des patients est une grille de tous les patients enregistrés. La grille prend en charge les fonctionnalités de grille suivantes: [filtrage de données](/grid-features/data-filtering.md), [manipulation de colonne](/grid-features/column-sorting.md), [modifications persistantes](/grid-features/saving-changes.md) et [exportation de données](/grid-features/data-exporting.md).

La grille contient des liens incorporés pour lier rapidement d'autres parties de l'application. La colonne **Référence** contient un lien vers la fiche du patient pour une inspection rapide. La colonne **Nom** renvoie à la page du dossier du patient. Enfin, le menu déroulant **Actions** à l'extrême droite relie les emplacements suivants:

1. **Enregistrement** est un lien supplémentaire vers le dossier du patient.
2. **Modifier** est un lien vers [modifier l'enregistrement du patient](#modifying-a-patients-registration).
3. **Carte** est un lien supplémentaire vers la carte du patient.
4. **Voir l'activité financière** est un lien direct vers le document d'activité financière du patient.
5. **Voir les factures** est un lien direct vers le registre des factures, préfiltré sur le patient actuel.
6. **Voir les paiements en espèces** est un lien direct vers le registre des paiements en espèces, préfiltré sur le patient actuel.
7. **View Vouchers** est un lien direct vers le registre de voucher, préfiltré sur le patient actuel.

## <a id="modifying-a-patients-registration">Modification du dossier d'un patient</a>

Si un patient est mal enregistré, ne paniquez pas - il est toujours possible de mettre à jour et de modifier ses informations via le module Patient Edit. Ce module est accessible de deux manières:

1. Localisez le patient dans le registre des patients. Utilisez le menu déroulant des actions dans la colonne la plus à droite pour cliquer sur **Actions & gt; Modifier**. Cela vous mènera au dossier du patient sous forme modifiable.
2. Si vous vous trouvez déjà sur la page du dossier du patient, vous pouvez cliquer sur le bouton **Modifier les détails**. Cela vous mènera au dossier du patient sous forme modifiable.

Le formulaire modifiable est divisé en trois sections: Détails du patient, Informations facultatives et Informations financières. Ces trois panneaux correspondent approximativement aux informations d'enregistrement initiales. Vous remarquerez que cette interface permet également à l'utilisateur de modifier [Groupes de patients](./patient-groups.md).

<div class = "bs-callout bs-callout-danger">
<h4> Changer le groupe de débiteurs </h4>
N'oubliez pas que le groupe de débiteurs a de profondes implications sur les antécédents financiers du patient. Si le patient a des factures en suspens, les dissocier avec leur groupe peut les rendre impayables. Il est préférable de s’assurer que le patient a des antécédents financiers sains avant de tenter de changer de groupe de débiteurs afin d’éviter les incohérences.
</div>
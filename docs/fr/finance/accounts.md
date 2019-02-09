# Gestion de compte

_Situé à : **Finance> Gestion de compte**_

BHIMA permet à un utilisateur de créer un plan comptable détaillé. Tous les comptes doivent spécifier les points d’information suivants:

1. **Numéro** - un numéro unique pour identifier le compte. La longueur ne doit pas dépasser 12 caractères.

2. **Label** - une étiquette textuelle souvent affichée avec le numéro de compte pour identifier la fonction du compte.

3. **Type** - Le type de compte détermine le comportement du compte. Un type de compte peut être:

    1. _Titre_ - un compte label utilisé pour regrouper les sous-comptes. Les comptes de titres ne sont jamais utilisés directement, mais cumulent des totaux dans les rapports.
    2. _Liability_ - contient les comptes clients
    3. _Asset_ - Comptes bancaires, de trésorerie et autres comptes d'actifs
    4. _Capital_: contient les gains en capital, les immobilisations matérielles et les autres comptes de capital.
    5. _Revenu_
    6. _Expense_

4. **Parent** - le compte parent détermine le groupe de comptes. Par défaut, un compte de niveau supérieur tombera sous le _nœud racine_. Cependant, tout compte de titre peut être un compte parent, permettant à l'utilisateur de créer une arborescence de comptes.

## Navigation dans la liste des comptes

BHIMA présente la liste des comptes avec une arborescence de comptes parents et enfants. Les comptes parents sont des comptes _title_, sont présentés en gras et peuvent contenir zéro ou plusieurs comptes enfants. Ces comptes enfants sont affichés légèrement en retrait sous les comptes parents.

<div class = "bs-callout bs-callout-primary">
<h4> Remarque! </h4>
Il est important de noter que la structure d'imbrication dans la gestion des comptes est déterminée par les relations parent / enfant et non par le numéro de compte. Toutefois, pour éviter toute confusion, il est conseillé de déterminer le niveau du compte dans l’arborescence en fonction du numéro de compte.
</div>

## Créer un compte

Pour créer un nouveau compte, le bouton **Créer un compte** dans le coin supérieur droit ouvre un formulaire modal pour créer un nouveau compte. Une fois que l'utilisateur a rempli les champs obligatoires, il peut soumettre le modal pour créer un nouveau compte.

Une autre méthode pour créer un compte consiste à cliquer sur le bouton **Ajouter un compte enfant** intégré dans la grille. Ce bouton apparaît sur les comptes de titre et préconfigurera le mode de création de compte avec la propriété parent définie sur le compte de titre choisi.

Si l'utilisateur souhaite créer plusieurs comptes, il peut cocher la case **Ajouter un autre compte**. Cela conservera le modal, permettant à l'utilisateur de soumettre plusieurs comptes sans avoir à rouvrir le modal.

## Mise à jour d'un compte

Seules deux propriétés de compte peuvent être mises à jour après la création d'un compte: le libellé du compte et le parent du compte actuel. Cela permet à un certain nombre de comptes de regroupement sans changer leur type de solde sous-jacent. Si des modifications plus importantes doivent être apportées, le compte doit être fermé et / ou supprimé et un deuxième compte doit être créé.

## Supprimer un compte

Si un compte n'a pas encore été utilisé, il peut être supprimé via le menu déroulant de la grille du compte. Cependant, BHIMA empêchera l'utilisateur de supprimer le compte s'il est utilisé n'importe où dans le système. La protection est en place pour empêcher les utilisateurs de supprimer accidentellement des comptes critiques qui sont utilisés pour des débiteurs ou qui peuvent contenir des soldes.

## D'autres actions

En plus des opérations CRUD de base sur les comptes, les utilisateurs peuvent éventuellement masquer ou verrouiller des comptes.

### Comptes cachés

Cacher un compte sert uniquement à la facilité d'utilisation et n'affecte pas la fonction de comptabilité du système. Les comptes cachés ne sont cachés que des sélections en face de l'utilisateur. Par exemple, ils n'apparaîtront plus dans l'entrée de sélection de compte Gestion de groupe de débiteurs, ni dans la tête de type dans Compenses complexes. Cependant, ils continueront à être présentés dans des rapports pertinents. Cela permet aux comptes anciens, fermés et non utilisés d'être supprimés en toute sécurité de l'interface utilisateur sans changer la nature du compte.

### Comptes verrouillés

Le verrouillage d'un compte empêche l'utilisateur de publier d'autres mouvements sur ce compte. Pour éviter toute confusion générale, cette règle est appliquée lors des contrôles de la balance de vérification, plutôt que pour chaque paiement en espèces, facture ou pièce justificative. Il est important de noter qu'un compte verrouillé sera toujours disponible pour être utilisé dans tout le système. Pour empêcher son utilisation, un utilisateur doit également le cacher.
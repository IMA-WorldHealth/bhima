## Modification de transactions <span id="modifying-transactions">#</span>

Parfois, une transaction doit être modifiée pour refléter les modifications apportées à la transaction \ (comme lors de la négociation du prix \) ou pour corriger des fautes de frappe. La modification des transactions s’effectue d’abord en sélectionnant la transaction, puis en cliquant sur le bouton "éditer", qui s’allumera en vert. Si le bouton Modifier n'est pas en surbrillance, cela signifie qu'une transaction n'est pas sélectionnée ou que plusieurs transactions ont été sélectionnées. Une seule transaction peut être modifiée à la fois.

Pour commencer à modifier une transaction, vous devez d’abord [sélectionner une ligne ou une transaction](.../../grid-features/row-selection.md). La sélection d’une partie de la transaction sélectionne l’ensemble de la transaction à modifier.

Toutes les propriétés d'une transaction ne peuvent pas être modifiées. Les propriétés suivantes d'une transaction peuvent être modifiées:

 1. Description de la transaction
 2. Date de la transaction
 3. Débit
 4. crédit
 5. Référence
 6. Enregistrer
 7. Type de transaction

En plus de modifier les valeurs dans la transaction, le modal d'édition permet également à l'utilisateur de:

 1. Supprimer des lignes d'une transaction
 2. Ajouter des lignes à une transaction

Notez que toutes les règles de validation des transactions régulières continuent de s'appliquer et que la validation est effectuée lorsque l'utilisateur tente de soumettre ses modifications.

Notez que les valeurs (débits et crédits) d'une transaction peuvent être modifiées, mais que la devise de la transaction ne peut pas être modifiée. Si une transaction a été effectuée dans la mauvaise devise, elle doit être annulée et complétée. Ceci afin d'éviter toute confusion lors de l'analyse. Assurez-vous de noter la devise de la transaction avant de modifier les valeurs de la transaction.

### Modification des transactions publiées

Si une transaction a été enregistrée, elle ne doit plus être modifiée. Cependant, dans la pratique, il peut être nécessaire de corriger les erreurs postées. Pour faciliter cette procédure, BHIMA permet à l'utilisateur de modifier les transactions comme si elles n'étaient pas postées, en utilisant les mêmes mécanismes que les [transactions non postées](#modifying-transactions). En dessous, le logiciel génère un enregistrement inversé, puis un nouvel enregistrement avec les valeurs précédentes et modifiées.

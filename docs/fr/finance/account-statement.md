# Module de relevé de compte

Le module Relevé de compte fournit une vue détaillée des transactions dans le [grand livre](/general-ledger.md) pour un compte particulier. Il est identique au rapport de relevé de compte \(disponible dans Rapports &gt; Rapport de relevé de compte\). Étant donné que les informations sont destinées au grand livre, elles doivent déjà avoir été publiées dans le journal.

Le module est divisé en sections: la barre de filtre, la grille et le pied de page.

#### Barre de filtre

Le module nécessite les [filtres par défaut](/grid-features.md) standard de limite et de période. De plus, vous devez fournir un compte par défaut. Cela permet au module de supposer qu'un compte est toujours défini et d'afficher de manière significative les soldes et mouvements d'ouverture tout au long de la période.

#### La grille

Le cœur du module est une grille supportant un grand nombre des [caractéristiques de la grille](/grid-features.md) présentes dans BHIMA. Cette vue diffère du Journal en limitant les enregistrements à un seul compte. En règle générale, la vue montrera un seul côté d'une transaction. Pour afficher l’autre côté de la transaction, vous pouvez suivre les liens de la colonne **Transaction ID** pour afficher la transaction dans le [Journal](/journal-module.md).
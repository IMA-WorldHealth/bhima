# Balance d'essai

La balance de vérification a pour objectif de donner une vue synthétique des données du journal avant leur publication. C'est une proposition permettant au comptable de détecter les erreurs dans les comptes attribués aux transactions. Le flux de travail ressemble à ceci:

```mermaid
graphe LR;
    J [Journal] -> T [Balance de première instance]
    T -> G [Grand livre]
```

## Exécuter une balance d'essai

La balance de vérification est un rapport exécuté sur les transactions sélectionnées \(voir la section [Sélection de ligne](/grid-features/row-selection.md)\). Une fois qu'une ou plusieurs lignes sont sélectionnées, utilisez la balance d'évaluation du menu \(**Menu** &gt; **Balance de vérification**\). Cette action fera apparaître le modal de la balance de vérification.

<div class = "bs-callout bs-callout-warning">
<h4> Les pièges communs </h4>

Parfois, la balance de vérification refuse d'ouvrir avec une barre d'erreur jaune. Cela peut se produire pour plusieurs raisons:
 1. Assurez-vous d'avoir sélectionné au moins une transaction non postée.
 2. Assurez-vous de n'avoir sélectionné aucune transaction enregistrée. Pour ce faire, le moyen le plus simple consiste à filtrer toutes les transactions enregistrées via le modal de recherche.
</div>

Le modal peut être dans deux états: _correct_ et _error_.
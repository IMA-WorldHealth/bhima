# Filtrage en ligne

Certaines grilles supportent _inline filtering_, la possibilité de filtrer les données côté client sans avoir à interroger à nouveau le serveur. Les avantages du filtrage côté client sont les suivants:

1. Généralement plus rapide pour les petites opérations. Pas besoin de télécharger à nouveau et de formater les données pour la présentation.
2. Les données sont filtrées dynamiquement. Au lieu d'appuyer sur un bouton d'envoi pour appliquer les modifications, les modifications sont reflétées sous la forme d'un type d'utilisateur.

Cependant, il y a quelques inconvénients à garder à l'esprit:

1. _Etant donné qu'aucune nouvelle donnée n'est téléchargée, les filtres ne s'appliqueront qu'à l'ensemble de données déjà téléchargé. Si le téléchargement a été pré-filtré sur le serveur, il se peut que vous ne disposiez pas d'un jeu de données complet. Assurez-vous toujours que votre jeu de données local contient suffisamment d'informations pour fournir une analyse._

2. _Sur les machines à faible puissance, cette opération peut ralentir la machine, en particulier dans les modules plus lourds comme le journal ou le relevé de compte._

Par défaut, le filtrage en ligne est désactivé sur toutes les grilles. Pour l'activer, cliquez sur le bouton **Filtre** en haut du module. Lorsqu'il est activé, ce bouton devient bleu clair. Les entrées du filtre en ligne apparaîtront juste sous les en-têtes de colonne de la grille. Taper dans l’un d’eux filtrera le contenu de la grille.

<div class = "bs-callout bs-callout-warning">
<h4> Assurez-vous de disposer d'un jeu de données complet </h4>
N'oubliez pas de toujours vérifier que vous avez l'intégralité du jeu de données avant de filtrer, sinon vous risquez d'obtenir des résultats trompeurs.
</div>
# Aperçu des modules financiers

Avant d'entrer dans les détails de chaque module financier, il est important de garder à l'esprit le flux de données global dans BHIMA.

![Financial Overview](../../images/finance/Financial Overview - Receipts through Reports.svg)

Le diagramme ci-dessus montre le flux de saisie des données dans le système, couvrant les trois enregistrements de base de BHIMA: **Paiements en espèce**, **Factures patient** et **Pièces de journal**.

Chaque enregistrement est sauvegardé par une transaction écrite dans le [Journal](/ledgers/posting-journal.md). Grâce à un processus de validation appelé balance de contrôle, les transactions dans le journal sont enregistrées dans le [grand livre](/ledgers/general-ledger.md), après quoi la transaction est inaltérable.

Toutes les activités financières enregistrées avec BHIMA sont représentées par deux entités:

1. L'enregistrement d'origine contient tous les détails et métadonnées concernant l'activité. Il peut s'agir d'un paiement en espèces, d'une facture patient ou d'un journal.

2. La transaction financière réelle qui est écrite dans le journal et lie directement l'enregistrement d'origine en tant que source \(raison de l'existence\) pour cette transaction financière.

<p style="text-align:justify">
Bien que la transaction puisse être modifiée dans le journal, le document d'origine ne peut pas être modifié et conserve un enregistrement des valeurs d'origine telles qu'elles ont été entrées dans l'application.
</p>

<p style="text-align:justify">
La seule exception à cette règle est la suppression. Si une transaction ou un enregistrement est supprimé, l’enregistrement et les données du journal sont supprimés. Seules les transactions non postées peuvent être supprimées.
</p>

<div class = "bs-callout bs-callout-success">
  <h4> Pour supprimer ou inverser?</h4>
  <p style="text-align:justify">
  Pour corriger les erreurs, les transactions dans BHIMA peuvent être soit supprimées, soit annulées via une écriture de correction ultérieure. La suppression est une suppression permanente d'une transaction et est souvent utilisée pour les erreurs temporaires des utilisateurs qui sont immédiatement corrigées. Reversal écrit une deuxième transaction qui a la même valeur opposée à la transaction "erronée" d'origine.
  </p>

  <p style="text-align:justify">
  Cette opération "inverse" logiquement les finances et préserve tout l'historique. Elle est souvent utilisée pour des processus tels qu'un remboursement inattendu. La politique que vous choisissez d’utiliser est votre préférence, mais il est important d’avoir une politique uniforme afin d’éviter de futurs maux de tête lors de la vérification des comptes. La suppression de transactions mal formées ou incorrectes génère un historique des transactions plus clair, mais les inversions refléteront le processus réel par lequel les transactions ont été dérivées.
  </p>
</div>

<p style="text-align:justify">
Une fois qu'une transaction est créée dans le journal via un coupon, une facture ou un paiement en espèces, la transaction est examinée par un comptable et enregistrée vérifiée via le processus de balance de vérification, après quoi elle apparaît dans le grand livre et dans les rapports ultérieurs.
</p>

## Comptabilité en partie double

<p style="text-align:justify">
BHIMA est un logiciel de comptabilité en partie double. Dans la comptabilité en partie double, les transactions sont composées de deux lignes ou plus, chacune correspondant à un seul compte. Les valeurs entrées ou sorties des comptes sont enregistrées sous la forme <em>debits</em> ou <em>credits</em>.

Les débits et les crédits sont des opposés, mais leur comportement n'est pas toujours intuitif ni bien défini. En général, on peut considérer les débits comme des nombres positifs et les crédits comme des nombres négatifs.
</p>

[Cette source](https://debitoor.com/dictionary/debit) fournit les définitions suivantes la première est erronée en ligne et est corrigée ci-dessous:

1. Débit d'un compte débiteur implique une augmentation de la dette du débiteur. En revanche, créditer un compte débiteur implique une réduction de sa dette envers l'entreprise.

2. Débit d'un compte d'actif implique que les actifs augmentent. En revanche, créditer un compte d’actif réduit l’actif.

3. Débiter un compte de revenu implique que le revenu diminue. Créditer le compte de revenu augmente le revenu.

4. Débiter un compte de dépenses implique une augmentation des coûts. Créditer un compte de dépenses implique que le coût diminue.

<p style="text-align:justify">
Les débits et les crédits doivent balancé une transaction. Toutes choses étant égales par ailleurs, les comptes de revenus détiendront un solde créditeur tandis que les comptes de dépenses détiendront un solde débiteur.
</p>

<div class = "bs-callout bs-callout-info">
<h4> Maintenir les débits et les crédits en ligne droite </h4>

<p style="text-align:justify">
Le concept de débits et de crédits s’apprend par l’expérience et même des comptables chevronnés confondent leurs rôles. Un scénario simple pour résoudre le problème consiste à imaginer des transactions avec une caisse ou un compte bancaire.
</p>

<p style="text-align:justify">
Pour placer de l'argent dans la caisse un compte d'actif, vous <strong>débitez</strong> la caisse, augmentant ainsi sa valeur. Étant donné que la transaction doit être équilibrée, le côté opposé de la transaction doit conserver une valeur <strong>crédit</strong>. S'il s'agit d'un client payant ses dettes, il doit avoir commencé la transaction avec une valeur <strong>débit</strong>. Par conséquent, l'opération de facturation doit avoir <strong>débité</strong> le client et crédité un compte de revenu.
</p>
</div>

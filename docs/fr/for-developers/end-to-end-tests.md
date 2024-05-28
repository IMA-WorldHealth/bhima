# Tests de bout en bout

BHIMA dispose d'une large collection de tests de bout en bout utilisant le [Environnement de test de Playwright](https://playwright.dev/docs/intro).  Les directives suivantes pour faire fonctionner les tests dans votre environnement.  Cette description suppose que vous avez déjà configuré l'environnement de développement BHIMA (voir [Installation](./installing-bhima.md)).

1. Installer Playwwright:
```bash
  npm install playwright
```

2. Vérifiez que tout est cohérent. Les commandes suivantes doivent donner les mêmes numéros de version :
```bash
  grep 'playwright/test' package.json
  npx playwright --version
```

3. Installer les navigateurs requis par Playwright
```bash
  npx playwright install
```
NOTE:  Si vous mettez à niveau votre version de Playwright dans votre sandbox, vous devrez peut-être réexécuter cette commande pour mettre à jour les navigateurs de Playwright.

4. Exécutez les tests de bout en bout (voir `package.json` pour les commandes).

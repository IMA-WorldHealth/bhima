# Installation de BHIMA

NB: ce sont les instructions pour installer l'environnement de développement BHIMA. Si vous souhaitez déployer BHIMA en production, consultez nos [instructions de déploiement pour Digital Ocean](../getting-started/deploying-digital-ocean.md).

Le logiciel BHIMA peut être complexe à installer. Nous ne prenons officiellement en charge que Linux. Le guide suivant suppose donc que vous configurez BHIMA dans un environnement Linux basé sur Debian.

Ce guide vous permettra de vous familiariser avec bhima localement. Veuillez noter que bhima est en développement actif et a tendance à aller vite et à casser des choses. Si vous êtes intéressé par les progrès du développement, envoyez-nous une ligne à [developers@imaworldhealth.org](mailto: developers@imaworldhealth.org).

### Dépendances

Avant de commencer le processus d'installation, assurez-vous que toutes les dépendances bhima sont installées localement. Nous ne testons que sous Linux. Il est donc préférable d’utiliser une version de Linux que vous connaissez bien. Assurez-vous d'avoir la version récente de:

1. [MySQL](http://dev.mysql.com/downloads/) \(5.6 ou plus récent \)
2. [Redis](https://redis.io)
3. [curl](https://curl.haxx.se/)
4. [NodeJS](https://nodejs.org/en/) \(nous vous recommandons d’utiliser le [gestionnaire de version de node](https://github.com/creationix/nvm) sous Linux. Notez que nous ne testons que sur des versions stables. et bord \).
5. [yarn](https://yarnpkg.com)
6. [git](https://git-scm.com/downloads)

### Instructions détaillées sur l'installation des dépendances pour Ubuntu \(vérifiées/installées spécifiquement avec VirtualBox\)

```bash
# Exécutez la commande suivante pour mettre à jour les listes de paquets:
sudo apt-get update

#Installer MySQL avec la commande suivante:
sudo apt-get install mysql-server

# Exécutez les commandes suivantes pour installer Redis:
sudo apt-get install redis-server

# Exécutez les commandes suivantes pour installer curl:
sudo apt-get install curl

#Installer le gestionnaire de version de noeud localement
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | frapper

# Configurez les variables d'environnement pour le gestionnaire de version de noeud
export NVM_DIR = "$ HOME/.nvm"
[-s "$ NVM_DIR/nvm.sh"] && \. "$ NVM_DIR \ nvm.sh" # Ceci charge nvm

#Téléchargez NodeJS LTS
nvm install lts/*

#Installe yarn sans réinstaller NodeJS
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install fil --no-install-recommend

# Exécutez la commande suivante pour installer git:
sudo apt-get install git
```

### Obtenir la source

Clonez la source à l'aide de git à partir du [référentiel github](https://github.com/IMA-WorldHealth/bhima) à l'aide des commandes suivantes:

```bash
git clone https://github.com/IMA-WorldHealth/bhima.git bhima
cd bhima
```

### Construire à partir de la source

Tous nos scripts de construction se trouvent dans le fichier `package.json`. Nous utilisons [gulpjs](http://www.gulpjs.com) en interne, mais vous ne devriez jamais avoir besoin d'appeler explicitement gulp.

Pour exécuter les scripts de construction, vous pouvez utiliser `yarn` ou` npm`. Nous utiliserons `fil 'pour le reste de ce guide. Notez que l'utilisation de `npm` peut nécessiter que vous utilisiez` npm run` où il est indiqué `yarn` ci-dessous.

```bash
# Dans le répertoire bhima /
# installer tous les modules de noeuds

yarn install

# Si cette commande vous donne une erreur (par exemple, si vous utilisez Parallels), essayez d’exécuter la commande suivante:
git config -global url. "https: //" .insteadOf git: //
```

Les dépendances devraient maintenant être définies!

BHIMA utilise des variables d'environnement pour se connecter à la base de données et basculer entre des fonctionnalités. Ceux-ci se trouvent dans le fichier `.env.development` inclus dans le niveau supérieur du référentiel. Par défaut, le script de construction copiera tous les fichiers nommés `.env.*` Dans le dossier de construction `bin /` lors de la génération de l'application. Au moment de l'exécution, le fichier correspondant à `.env. $ NODE_ENV` sera utilisé pour configurer l'application. Pour l'instance de noeud par défaut, `NODE_ENV =" development "`. Veuillez définir ceci globalement, s'il n'est pas défini par défaut sur votre machine.

Avant de construire, éditez votre `.env.development` pour configurer vos paramètres de connexion à la base de données MySQL. Leurs variables doivent être explicites.

Utilisez la commande suivante pour modifier le fichier .env.development si vous le souhaitez \(apportez vos modifications, puis tapez ctrl + x pour quitter et enregistrer \):

```bash
nano .env.development
```

### Configurez l'utilisateur bhima dans MySQL et construisez l'application.

```bash
# Exécutez les commandes suivantes pour créer l'utilisateur bhima dans MySQL afin qu'il puisse construire la base de données (assurez-vous que l'utilisateur et #password correspondent tous les deux à ce que vous avez défini dans le fichier .env.development):

sudo mysql -u root -p
CREATE USER 'bhima' @ 'localhost' IDENTIFIED BY 'mot de passe';
Accordez tous les privilèges sur *. * TO 'bhima' @ 'localhost';
#Utilisez ctrl + z pour revenir à l'invite du terminal principal
```

Ensuite, construisez l'application avec

```bash
# construire l'application

NODE_ENV="development" yarn build
```

### Création d'une base de données

_NOTE: BHIMA s'exécute dans _`sql_mode = 'STRICT_ALL_TABLES'`_. Bien qu'il ne soit pas nécessaire que cette option soit définie pour générer la base de données, les tests ne seront pas validés à moins que le code SQL correct \_MODE soit défini._

```bash
#Pour configurer MySQL avec ce paramètre, exécutez les commandes suivantes:
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

#Under dans la section [mysqld], ajoutez le texte suivant:
sql-mode = STRICT_ALL_TABLES

# save and quit, puis redémarrez mysql avec la commande suivante:
sudo service mysql redémarrer
```

La structure de la base de données est contenue dans les fichiers `server/models/*. Sql`. Vous pouvez les exécuter un par un dans l'ordre ci-dessous ou simplement lancer `yarn build: db`.

1. `server/models/schema.sql`
2. `server/models/triggers.sql`
3. `server/models/functions.sql`
4. `server/models/procedures.sql`
5. `server/models/admin.sql`

Ceci configure le schéma de base, les déclencheurs et les routines. Les scripts suivants créeront un ensemble de données de base avec lequel commencer à jouer:

1. `server/models/icd10.sql`
2. `server/models/bhima.sql`
3. `test/data.sql`

Vous pouvez exécuter tout cela en utilisant la commande suivante: `yarn build:db` Vous pouvez également utiliser le script`./sh/build-database.sh`, personnalisé à l'aide de vos variables d'environnement, comme indiqué ci-dessous:

```bash
# installer la base de données
DB_USER='moi' DB_PASS='MonPassword' DB_NAME='bhima' ./sh/build-database.sh
```

### Exécution de l'application

Exécuter l'application est super facile! Tapez simplement `yarn dev` dans le répertoire racine de l'application.

### Vérifier l'installation

Si vous avez modifié la variable `$PORT` dans le fichier`.env`, votre application écoutera sur ce port. Par défaut, il est `8080`.

Accédez à [https://localhost:8080](https://localhost:8080) dans le navigateur pour vérifier l'installation. Vous devriez être accueilli avec une page de connexion.

### Test de l'application

Nos tests sont répartis en tests unitaires, tests de bout en bout et tests d'intégration. Il y a plus d'informations sur les tests dans le [wiki](https://github.com/IMA-WorldHealth/bhima/wiki).

1. **Tests d'intégration** - Ils testent l'intégration serveur + base de données et généralement nos API. Tous les points de terminaison API accessibles doivent généralement être associés à un test d'intégration. Pour les exécuter, tapez `test de fil: intégration`.
2. **Tests unitaires de serveur** - Les bibliothèques de serveur sont testées d'unité avec mocha et chai, de manière similaire aux tests d'intégration. Pour les exécuter, tapez
   `test de fil: unité-serveur.`
3. **Tests d'unité client** - Les composants client sont testés avec karma et doivent être installés si vous avez installé toutes les dépendances. Karma lance un navigateur chrome pour exécuter les tests. Pour les exécuter, tapez `test de fil: unité-client`.
4. **Tests de bout en bout** - L'ensemble de la pile est testée avec \(souvent flaky \) des tests de bout en bout à l'aide de [rapporteur](https://github.com/IMA-WorldHealth/bhima/blob/master/docs/protractortest.org). Le rapporteur dépend de `webdriver-manager` qui doit être installé séparément. Voir leur documentation pour plus d'informations. Les tests de bout en bout peuvent être exécutés avec `yarn test:ends`.

Vous pouvez exécuter tous les tests en tapant simplement `yarn test`.

Profitez de l'aide bhima!

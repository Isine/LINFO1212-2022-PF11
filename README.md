# LINFO1212 - 2022 - Projet d'approfondissement en sciences informatiques - SyllaExchange

## Outils nécessaire :
- Executeur de commande
- Navigateur internet

## Packages nécessaire :
- ejs
- express
- express-session
- sequelize
- sqlite3
- multer
- crypto
- jest (Pour les tests)

## Installation :
Commencez par installer NodeJS, pour cela suivez le guide sur le site officiel du logiciel (https://nodejs.org/). Vous pouvez verifier que NodeJS est bien installé en executant la commande suivante: "node -v" & "npm -v" et vous assurez que vous êtes sur la dernière version du programme. 

Maintenant, créez un dossier qui contindera tout les fichiers sur site. Ouvrez un terminal de commande dans ce dossier et lancez la commande: "npm init -y". Ensuite copier/coller les fichiers du serveur dans votre dossier et taper la commande "npm install" pour installer tout les packages nécessaire. Si un package ne s'installe pas, utilisez la commande: "npm install 'package'". 

Lorsque l'installation est terminer, il vous suffit d'executer la commande: "node index.js" et de vous rendre sur la page "https://localhost:8080/". Notez que votre navigateur peut vous indiquer que le site n'est pas sécurisé car le certificat n’a pas été créé par une autorité reconnue. Il ne vous reste plus qu'a profiter du site.

Note: Pour lancer, les tests, il suffit de lancer la commande 'npm test' à la place de la commande "node index.js".

## Fichiers du site :
- Dossier "private" contient les pages 'ejs', le fichier 'css', le dossier "images" ainsi que des scripts utiles au site.
- Dossier "Images" dans le dossier "private" contient toutes les images du site.
- Dossier "articles" dans le dossier "images" contient les images des articles du site
- Dossier "test" contient les tests pour les différentes fonctions utilisés par le site (A lancer avec jest)
- Fichier "cert.pem" sert au lancement https du site
- Fichier "key.pem" sert au lancement https du site
- Fichier "database.js" permet d'intéragir avec la base de donnée
- Fichier "index.js" permet de lancer le site comme expliquer plus haut
- Fichier "README.md" est le fichier actuel qui vous explique ce que vous devez savoir
- Fichier "package.json" pour faciliter l'installation des dépendances


### auteurs :
- Senisi Lobo Marco
- Schul Louis
- Daiki Marouane

### Groupe: PF11

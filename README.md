# Web_OneWorldProject
The One World Project : Project group to make our world a better place

CAHIER DES CHARGES

Nom du projet : One World Project

Description : Un site web présentant de multiples projets dont l’objectif commun est de rendre le monde meilleur. Chacun de ces projets est impliqué dans un domaine (environnement, santé, informatique…).
C’est projets n’arrivent pas tout seul :  des utilisateurs du site ayant un compte peuvent créer des projets, adhérer à des projets ou bien uniquement les suivre. Un utilisateur.
Afin d’éviter des emplois abusifs de ces droits, certains utilisateurs bénéficient du statut modérateur ayant pour droit de supprimer des comptes utilisateurs et des projets, même s’ils n’en sont pas l’auteur, en plus des droits normaux de tout utilisateurs.

CLIENT (non-utilisateur) :
- Effectuer une recherche de projets
- Créer un compte pour bénéficier de plus de droit. 
- Reçoit un mail de confirmation après création du compte.


UTILISATEURS (normal) : 
Un utilisateur peut : 
- Effectuer une recherche de projet par catégorie ou nom (ou auteur ?)
- Se connecter à son compte
- Effacer son compte
- Se déconnecter
- Créer un projet
- Effacer SON projet.
- Adhérer à un ou plusieurs projet
- Suivre un ou plusieurs projet.
- (Enrichir son projet de notifications régulières - choix file déroulante d’un de SES projets.) BONUS
- (Commentaires (sous les projets ?)) BONUS
- (Communication avec d’autres utilisateurs ?) BONUS

UTILISATEURS (modérateurs) :
- Bénéficie de tous les droits d’un utilisateur normal.
- Peut supprimer un projet jugé inadapté au concept du site (même s’il n’en est pas l’instigateur).
- Peut supprimer un utilisateur.

PROJET : 
- A un créateur
- A des adhérents
- A des abonnés.
- A une description.
- A un titre.
- A une catégorie. 
- A une date de création
- (Envoie les notifications à ses adhérents et followers par mail.) BONUS
- (Peut être commenté) BONUS
- Peut être supprimer.


Structure du programme (MVC)


BDD <=> model.js <=> serveur (express) <==> Client (navigateur).

serveur stylesheet (si besoin) ^


Répertoires : 
- Principal : racine du contient la BDD, les serveurs (principal et feuille de style), les autres répertoires, les modules nodes.
- Vues : contient les fichiers html à charger + (1 header, 1 footer) modifiables grâce au gestionnaire de templates mustache
- Resources : contient les images et autres outils nécessaires au site
- Styles : contient le ou les fichiers css supplémentaires, ajoutés au Bootstrap.
- Scripts (si besoin) contient les fichiers JS à exécuter côté client.




Texte page d’accueil : 

Depuis toujours, l’Homme se sert des ressources naturelles de la Terre pour créer, façonner son propre environnement, dans le but de se protéger et d’évoluer.
Cependant, depuis plusieurs décennies, la question de l’utilisation de ces ressources fait débat. En effet, beaucoup de ressources utilisées sont épuisables ou s’effacent petit-à-petit de la surface du globe, notre mode de vie s’en trouvant dégradé. Les conséquences de ces exploitations de masse des ressources de notre planète mènent à des changements climatiques sans précédents, des disparitions d’espèces de toutes sortes, et menace directement notre monde. Des prises de conscience émergent et de plus en plus de gouvernement, de multinationales et d’autres acteurs prennent des mesures pour limiter leur impact. Pour accompagner cela à toutes les échelles, nous avons créé One World Project pour montrer les projets existants en matière d’écologie et la création de tels projets. Ce concept ce base sur les valeurs de soutien, de partenariats, d’échanges et de solidarité.

Nous avons besoin de vous ! Alors rejoignez l’aventure !





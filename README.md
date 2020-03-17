# Web_OneWorldProject
PROJET Web - Rendre le monde meilleur

Par Loïc NEYRAT et Robin SEVERAC.

Nom du site web : The One World Project

Slogan : A project group to make our world a better place.

DESCRIPTION :

Un site web présentant de multiples projets dont l’objectif commun est de rendre le monde meilleur. Chacun de ces projets est impliqué dans un domaine (environnement, santé, informatique…). Les projets sont créés et enrichis sur notre site par des utilisateurs du site, ayant un compte. Ces utilisateurs peuvent créer des projets, adhérer à des projets ou bien uniquement les suivre.

Afin d’éviter tout emploi abusif de ces droits, certains utilisateurs bénéficient du statut de modérateur, ayant pour droit supplémentaire de supprimer des comptes utilisateurs et des projets, même s’ils n’en sont pas l’auteur.

 

CAHIER DES CHARGES

CLIENT (non-utilisateur) :

    Effectuer une recherche de projets
    Créer un compte pour bénéficier de plus de droit.
    Reçoit un mail de confirmation après création du compte.

UTILISATEURS (normal) : Un utilisateur peut :

    Effectuer une recherche de projet par catégorie ou nom (ou auteur ?)
    Se connecter à son compte
    Effacer son compte
    Se déconnecter
    Créer un projet
    Effacer SON projet.
    Adhérer à un ou plusieurs projet
    Suivre un ou plusieurs projet.
    BONUS (Enrichir son projet de notifications régulières - choix file déroulante d’un de SES projets.)
    BONUS (Commentaires (sous les projets ?))
    BONUS (Communication avec d’autres utilisateurs ?)

UTILISATEURS (modérateurs) :

    Bénéficie de tous les droits d’un utilisateur normal.
    Peut supprimer un projet jugé inadapté au concept du site (même s’il n’en est pas l’instigateur).
    Peut supprimer un utilisateur.

PROJET :

    A un créateur
    A des adhérents
    A des abonnés.
    A une description.
    A un titre.
    A une catégorie.
    A une date de création
    Peut être supprimer par son créateur ou un modérateur.
    BONUS (Envoie les notifications à ses adhérents et followers par mail.)
    BONUS (Peut être commenté).

 

STRUCTURE DU PROGRAMME

Nous avons choisi une structure en Modèle-Vues-contrôleur.

Répertoires (à partir de la racine du projet) :

    Views : contient les fichiers html à charger + (1 header, 1 footer) modifiables grâce au gestionnaire de templates mustache (selon si l'utilisateur est connecté ou non).
    Resources : contient les images et autres outils nécessaires au site.
    Styles : contient le ou les fichiers css supplémentaires propre au projet.
    Scripts (si besoin) contient les quelques fichiers JavaScript à exécuter côté client.
    Principal : racine du projet, contient la base de données sqlite, le serveur principal (server.js) et le serveur de ressources utilisés pour les requêtes du clients correspondant à une feuille de style ou une image, les répertoires pré-cités, un répertoire node_modules créé par la commande npm install <module>.

 

ROUTES DU SERVEUR PRINCIPAL

    "/" (﻿get)﻿ => Renvoie sur la page d'accueil du site.

    "/home/:username" (get) => Envoie vers la page d'accueil de l'utilisateur ayant pour pseudo "username" une fois connecté.

    "/login" (post) => Envoie des données saisies dans le formulaire de connexion. Redirection vers "/" si la connexion a échoué ou si les données saisies sont invalides, vers "/home/:username" sinon

    "/signup" (post) =>  Même comportement que "/login" mais adapté à la validation des données du formulaire d'inscription.
    ﻿"/search?query=recherche de l'utilisateur" (get) => Envoie, après vérification des données saisies dans le champ de recherche, une page contenant la liste des projets résultant de la recherche dans la base de données.

    "/project?projectId=numéro du projet sur lequel l'utilisateur a cliqué" (get) => Renvoie la page complète et détaillée du projet.

    "/delete-project-form?projectId=" (get) => renvoie sur le formulaire de suppression du projet.

    "/delete-project/:projectId" (get) => redirection vers "/home/:username si la suppression a réussi, message d'erreur sinon.

    "/update-project-form?projectId=" (get) => Envoie du formulaire de modification de projet chargé avec les données relatives au projet demandé.

    "/update/:projectId" (post) => Envoie vers la page complète et détaillé du projet si la modification a réussi, affiche un message d'erreur sur le formulaire sinon.

    "/create-project-form/:username" (get) => Envoie vers le formulaire de création d'un projet en vérifiant que l'utilisateur est bien connecté.

    "/create-project" (post) => Envoie vers la page du projet nouvellement créé si la création a réussie, messae d'erreur sur le formulaire sinon.

    "/delete-user-form" (get) => Envoie vers le formulaire de suppression d'un utilisateur (modérateur uniquement).

    "/delete-user? username=" (get) => Supprime l'utilisateur dont le nom est mis dans l'url (si utilisateur normal => le username peut uniquement être le sien").


COOKIE CÔTE CLIENT

1 cookie session (tiers)

1 cookie stockant le status de l'utilisateur (normal ou modérateur)


Texte page d’accueil : 

Depuis toujours, l’Homme se sert des ressources naturelles de la Terre pour créer, façonner son propre environnement, dans le but de se protéger et d’évoluer.
Cependant, depuis plusieurs décennies, la question de l’utilisation de ces ressources fait débat. En effet, beaucoup de ressources utilisées sont épuisables ou s’effacent petit-à-petit de la surface du globe, notre mode de vie s’en trouvant dégradé. Les conséquences de ces exploitations de masse des ressources de notre planète mènent à des changements climatiques sans précédents, des disparitions d’espèces de toutes sortes, et menace directement notre monde. Des prises de conscience émergent et de plus en plus de gouvernement, de multinationales et d’autres acteurs prennent des mesures pour limiter leur impact. Pour accompagner cela à toutes les échelles, nous avons créé One World Project pour montrer les projets existants en matière d’écologie et la création de tels projets. Ce concept ce base sur les valeurs de soutien, de partenariats, d’échanges et de solidarité.

Nous avons besoin de vous ! Alors rejoignez l’aventure !





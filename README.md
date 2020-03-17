# Web_OneWorldProject
PROJET Web - Rendre le monde meilleur

Par Loïc NEYRAT et Robin SEVERAC.

Nom du site web : The One World Project

Slogan : A project group to make our world a better place.

DESCRIPTION :

Un site web présentant de multiples projets dont l’objectif commun est de rendre le monde meilleur. Chacun de ces projets est impliqué dans un domaine (environnement, santé, informatique…). Les projets sont créés et enrichis sur notre site par des utilisateurs du site, ayant un compte. Ces utilisateurs peuvent créer des projets, adhérer à des projets ou bien uniquement les suivre.

Afin d’éviter tout emploi abusif de ces droits, certains utilisateurs bénéficient du statut de modérateur, ayant pour droit supplémentaire de supprimer des comptes utilisateurs et des projets, même s’ils n’en sont pas l’auteur.

 

CAHIER DES CHARGES

*certains éléments sont indiqués comme étant des bonus : ils ne seront réalisés que si le temps nous le permet, en prenant en considération leur complexité et les autres projets que nous avons a réaliser pour la Licence.

*ce cahier des charges constitue un prévisionnel de ce qui sera fait. Tout peut être amené à changer en cours de production.

CLIENT (non-utilisateur) :

    Effectuer une recherche de projets
    Créer un compte pour bénéficier de plus de droit.
    Reçoit un mail de confirmation après création du compte.

UTILISATEURS (normal) : Un utilisateur peut :

    Effectuer une recherche de projet par catégorie, nom et créateur.
    Se connecter à son compte
    Effacer son compte
    Se déconnecter
    Créer un projet
    Effacer SON projet.
    Adhérer à un ou plusieurs projet
    Suivre un ou plusieurs projet.
    BONUS (Enrichir son projet de notifications régulières - choix file déroulante d’un de SES projets.)
    BONUS (Commentaires sous les événements des projets qu'il suit)
    BONUS (Communication avec d’autres utilisateurs)

(BONUS) UTILISATEURS (modérateurs) :

    Bénéficie de tous les droits d’un utilisateur normal.
    Peut supprimer un projet jugé inadapté au concept du site (même s’il n’en est pas l’instigateur).
    Peut supprimer un utilisateur.

UTILISATEUR (administrateur) :

    Bénéficie de tous les droits d'un modérateur. 
    Peut nommer un utilisateur modérateur.


PROJET :
    A un créateur.
    A des adhérents.
    A des abonnés.
    A une description.
    A un titre.
    A une catégorie.
    A une date de création. 
    Est associé a des mots-clefs choisis par le créateur.
    Peut être supprimer par son créateur ou un modérateur.
    A de potentiels événements associés (ajoutés par des membres ayant un statut particulier au sein du projet, ou par le créateur lui-même)
    BONUS (Envoie les notifications à ses adhérents et followers par mail.)
    BONUS (Peut être commenté).

 

STRUCTURE DU PROGRAMME

Nous avons choisi une structure en Modèle-Vues-contrôleur.

Répertoires (à partir de la racine du projet) :

    Views : contient les fichiers html à charger + (1 header, 1 footer) modifiables grâce au gestionnaire de templates mustache (selon si l'utilisateur est connecté ou non).
    Resources : contient les images et autres outils nécessaires au site.
    Styles : contient le ou les fichiers css supplémentaires propre au projet.
    Scripts (si besoin) contient les quelques fichiers JavaScript à exécuter côté client.
    Model : contient le fichier javascript gérant les interactions avec la base de données.
    Principal : racine du projet, contient la base de données sqlite, le serveur principal (server.js) et le serveur de ressources utilisés pour les requêtes du clients correspondant à une feuille de style ou une image, les répertoires pré-cités, un répertoire node_modules créé par la commande npm install <module>.


TABLES SQL

USERS: email (PRIMARY KEY), username (UNIQUE), password, status;

PROJECTS: projectId, title, description, creator, date;

PROJECT_MEMBERS: projectId, users, status;

PROJECT_KEYWORDS: projectId, keyword;

PROJECT_EVENTS: projectId, event, date;

 

ROUTES DU SERVEUR PRINCIPAL

    ACCUEIL
        "/" (﻿get)﻿ => Renvoie sur la page d'accueil du site, contenant un texte d'introduction au projet.

        "/login-form" (get) => Renvoie sur le formulaire de connexion utilisateur.
        
        "/signup-form" (get) => Renvoie sur le formulaire de création d'un compte utilisateur.

        "/home/:username" (get) => Envoie vers la page d'accueil de l'utilisateur ayant pour pseudo "username" une fois connecté. Cette page contient la liste es projets suivis, créés par l'utilisateur, ou dont il est membre.

    CONNEXION/CREATION DE COMPTE
        "/login" (post) => Envoie des données saisies dans le formulaire de connexion. Redirection vers "/" si la connexion a échoué ou si les données saisies sont invalides, vers "/home/:username" sinon

        "/signup" (post) =>  Même comportement que "/login" mais adapté à la validation des données du formulaire d'inscription.


    RECHERCHE
        ﻿"/search?query=recherche de l'utilisateur" (get) => Envoie, après vérification des données saisies dans le champ de recherche, une page contenant la liste des projets résultant de la recherche dans la base de données.

        "/project?projectId=numéro du projet sur lequel l'utilisateur a cliqué" (get) => Renvoie la page complète et détaillée du projet.
    

    GESTION D'UN PROJET
        "/create-project-form/:username" (get) => Envoie vers le formulaire de création d'un projet en vérifiant que l'utilisateur est bien connecté.

        "/create-project/" (post) => Envoie vers la page du projet nouvellement créé si la création a réussie, message d'erreur sur le formulaire sinon.

        "/update-project-form/:projectId (get) => Envoie du formulaire de modification de projet chargé avec les données relatives au projet demandé.

        "/update/:projectId" (post) => Envoie vers la page complète et détaillée du projet si la modification a réussi, affiche un message d'erreur sur le formulaire sinon.

        "/delete-project-form/:projectId" (get) => renvoie sur le formulaire de suppression du projet après vérification que l'utilisateur peut effectivement le supprimer.

        "/delete-project" (get) => récupère les informations du formulaire (ici, le projectId). Redirection vers "/home/:username si la suppression a réussi, message d'erreur sinon.

        "/project-member-list" (get) => uniquement pour les modérateurs et le créateur. Renvoie la liste des membres d'un projet (sans inclure les abonnés).

    POUR UN UTILISATEUR
        "/follow/:projectId" (get) => ajoute le projet aux projets suivis, renvoie vers le projet détaillé si réussi, vers une page d'erreur sinon. 

        "/join/:projectId" (get) => ajoute le projet aux projets dont l'utilisateur est membre, renvoie vers le projet détaillé si réussi, vers une page d'erreur sinon. 

        "/unfollow/:projectId" (get) => supprime le projet des projets suivis, renvoie vers le projet détaillé si réussi, vers une page d'erreur sinon.

        "/leave/:projectId" (get) => supprime le projet des projets dont l'utilisateur est membre, renvoie vers le projet détaillé si réussi, vers une page d'erreur sinon.

        


    ADMINISTRATION
        "/delete-user/:username" (get) => Envoie vers le formulaire de confirmation de suppression d'un utilisateur. Si utilisateur a le statut "regular", le username est forcément le sien.  

        "/user-list" (get)  => renvoie la liste des utilisateurs du site classée par ordre alphabétique.

        (BONUS) "/change-status-form/:username" (get) => renvoie le formulaire pour modifier le statut d'un utilisateur.

        (BONUS) "/change-status" (get) => récupère les informations du formulaire, effectue le changement. Renvoie vers la liste des utilisateurs mise à jour si réussi, message d'erreur sinon.


LES VUES : 
    - header : contient un champ de recherche, un bouton qui renvoie à la page d'accueil, un menant vers les projets suivis par l'utilisateur (si connecté), un autre renvoyant vers la page des notifications (si implémentées).
    - footer : contient nos noms en tant qu'auteur du site et le lien vers le projet gitHub.
    - index.html : page d'accueil sur le site.
    - signup-form.html : Contiendra le formulaire de création de compte.
    - login-form.html :  Contiendra le formulaire de connexion.

    POUR LES PROJETS : 
    - project-details : affiche les détails d'un projet (titre, description, créateur, mot clef...) et les événements associés. Permet à un utilisateur connecté de suivre le projet, d'y adhérer (ou de cesser de le suivre/d'y adhérer). Permet au créateur de supprimer le projet. 
    - create-project-form : affiche le formulaire de création de projet. 
    - update-project-form : formulaire de mise à jour du projet.
    - confirm-project-delete : formulaire de confirmation de la suppression d'un projet. 
    - project-members-list : montre la liste des membres d'un projet (username) et leur statut. Permet aux modérateurs et au créateur d'exclure certains membres. Au créateur : affiche le bouton pour modifier le statut d'un des membres.
    - update-status-form : affiche le formulaire pour modifier le statut d'un membre d'un projet.

    POUR UN UTILISATEUR :
    - home.html : page d'accueil de l'utilisateur connecté. Affiche la liste des projets créés, suivis et ceux dont l'utilisateur est membre. 
    - (BONUS) notifications : affiche la liste des notifications de l'utilisateur.

    POUR LES ADMINISTRATEURS DU SITE :
    - users-list : affiche la liste des utilisateurs classée par ordre alphabétique. Permet de modifier le statut d'un utilisateur(BONUS), ou de supprimer son compte.
    - confirm-user-delete : formulaire de confirmation de la suppression d'un utilisateur.
    - (BONUS) set-moderator-form : pour l'administrateur uniquement : formulaire pour modifier le statut d'un utilisateur.  



COOKIES COTE CLIENT

1 cookie session (tiers)

1 cookie stockant le statut de l'utilisateur (normal ou modérateur) (possiblement placé avec le cookie de session, si nous le pouvons)


PROGRAMME PREVISIONNEL (sous réserve de modifications)

A chaque semaine correspondra une partie des routes du serveur à accomplir ainsi que toutes les fonctions, vues et autres outils qui y sont rattachés : 
- Du 16 au 18 Mars : partie préliminaire
        • Création de l'arboscence de fichiers.
        • Création du modèle
        • Importation des modules nécessiares grâce à la commande npm
        • Créatin du header.html et du footer.html
        • Importation de ressources (images)
        • Création du stylesheets supplémentaires style.css
        • Création du serveur principal (server.js) et du serveur de ressources (resourcesServer.js);

- Du 19 au 26 Mars : partie ACCUEIL 
        • Création des vues index.html, login-form.html, signup-form.html.
        • Création des routes associées à la demande des formulaires.
        • Création des routes associées à la gestion des données renvoyées par les formulaires.
        • Création des méthodes de validation des données et de sécurité.
        • Raccordement au modèle.

- Du 27 Mars au 2 Avril : Partie UTILISATEURS et ADMINISTRATEUR
        • Création de home.html et de sa route associée.
        • Mise en lien avec le générateur de template.

- Du 3 au 9 Avril : partie PROJETS (1)
        • Création des formulaires create-project-form, update-project-form, confirm-project-delete, update-status-form.
        • Création des routes "get" et "post" pour les formulaires pré-cités.
        • Mise en lien avec le modèle.

- Du 10 au 16 Avril : partie PROJETS (2)
        • Création des pages project-details et project-members-list.
        • Création des routes associées.
        • Mise en lien et essais des pages avec le moteur de template mustache.
        • Raccordement au modèle.

- Du 17 au 23 Avril : REGLAGES D'EVENTUELS BUGS, OPTIMISATION / AMELIORATION DU CODE, BONUS






Texte page d’accueil : 

Depuis toujours, l’Homme se sert des ressources naturelles de la Terre pour créer, façonner son propre environnement, dans le but de se protéger et d’évoluer.
Cependant, depuis plusieurs décennies, la question de l’utilisation de ces ressources fait débat. En effet, beaucoup de ressources utilisées sont épuisables ou s’effacent petit-à-petit de la surface du globe, notre mode de vie s’en trouvant dégradé. Les conséquences de ces exploitations de masse des ressources de notre planète mènent à des changements climatiques sans précédents, des disparitions d’espèces de toutes sortes, et menace directement notre monde. Des prises de conscience émergent et de plus en plus de gouvernement, de multinationales et d’autres acteurs prennent des mesures pour limiter leur impact. Pour accompagner cela à toutes les échelles, nous avons créé One World Project pour montrer les projets existants en matière d’écologie et la création de tels projets. Ce concept ce base sur les valeurs de soutien, de partenariats, d’échanges et de solidarité.

Nous avons besoin de vous ! Alors rejoignez l’aventure !

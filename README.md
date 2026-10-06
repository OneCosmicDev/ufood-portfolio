# UFood — Découverte de restaurants

J’ai participé au développement d’UFood dans le cadre du cours GLO-3102 à l’Université Laval. Avec mon équipe, j’ai travaillé sur une application qui aide à trouver un restaurant, à conserver ses bonnes adresses et à partager ses visites.

**Université Laval · GLO-3102 · Automne 2025**

**Début documenté : 10 septembre 2025** — [repères chronologiques](PROVENANCE.md#repères-chronologiques)

**Technologies : React · TypeScript · TanStack Query · Jest · React Testing Library**

## Ce que fait le projet

UFood regroupe la recherche de restaurants et le suivi des expériences des utilisateurs dans une même interface. L’application permet de filtrer les restaurants par cuisine ou par prix, de consulter leurs informations et leur localisation, d’enregistrer une visite avec une note et un commentaire, puis de gérer des listes de favoris. Elle comprend aussi des profils et des fonctions de suivi entre utilisateurs. Le frontend communique avec l’API fournie dans le cours.

## Ma contribution

J’ai surtout travaillé sur la recherche, les interactions entre utilisateurs et les tests du frontend.

- J’ai développé la recherche de restaurants, les filtres et plusieurs adaptations des cartes pour l’affichage mobile.
- J’ai complété les traductions de plusieurs parcours et corrigé la conservation de la langue pendant la navigation.
- J’ai intégré la déclaration d’une visite : formulaire, validation, appels API, chargement et messages d’erreur.
- J’ai ajouté la recherche d’utilisateurs, le suivi et les listes d’abonnements, avec les hooks et les composants React associés.
- J’ai configuré Jest, React Testing Library et l’exécution des tests dans GitHub Actions, puis écrit des tests de la page d’accueil, de la recherche et des filtres.

Je détaille les fichiers et les références de mon travail dans [CONTRIBUTIONS.md](CONTRIBUTIONS.md).

## Ce que j’ai appris

J’ai appris à construire un parcours complet autour d’une API. Une action comme enregistrer une visite implique autant la validation du formulaire que la gestion des erreurs et la mise à jour des données affichées. Le travail sur le suivi d’utilisateurs m’a notamment amené à gérer l’invalidation du cache pour que l’interface reflète les changements.

J’ai aussi renforcé ma pratique des tests de composants : simuler les dépendances, reproduire les interactions d’un utilisateur et vérifier le comportement attendu. Le travail en équipe m’a appris à intégrer mes changements dans des composants partagés et à tenir compte des commentaires de revue.

## Mon équipe et le cadre du cours

J’ai réalisé ce projet avec William Blanchet Lafrenière, Dania Mahfoud, Félix Bégin, Benjamin Drolet et Jordan Quist. Leurs contributions font partie intégrante de l’application présentée ici.

L’énoncé, les ressources pédagogiques et l’API proviennent du cours GLO-3102. Je présente mon travail sur le frontend en conservant ces crédits.

## Lancer le projet

Prérequis : Node.js 22.19 ou supérieur et npm.

```sh
npm ci
npm run dev
```

L’interface est disponible à `http://localhost:8080`. Elle utilise l’API externe du cours ; la disponibilité de cette API conditionne les fonctions connectées.

```sh
npm test -- --runInBand
npm run build
```

## État du projet

Les **149 tests Jest passent** et le frontend compile avec webpack.

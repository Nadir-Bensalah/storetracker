# Recette manuelle iOS et Android

Ce que les tests automatiques ne voient pas : le rendu natif, les permissions, les gestes, l'accessibilité réelle. À passer sur un iPhone (iOS 26 ou plus) et un Android (14 ou plus), en debug pour la dernière section.

Cocher **iOS** et **Android** séparément. Chaque ligne dit quoi faire et ce qu'on doit voir.

## Démarrage

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 1 | Lancement à froid, mode clair | Splash blanc avec le logotype, puis l'app, sans flash d'une autre couleur | ☐ | ☐ |
| 2 | Lancement à froid, mode sombre | Splash sombre, logotype clair | ☐ | ☐ |
| 3 | Premier lancement | Onboarding : langue d'abord, dans la langue du téléphone | ☐ | ☐ |
| 4 | Changer de langue à l'étape 1 | Tout l'écran change de langue immédiatement | ☐ | ☐ |
| 5 | Étape 2, « Autoriser la localisation » | La vraie demande système apparaît, avec le texte traduit | ☐ | ☐ |
| 6 | Relancer l'app | Plus d'onboarding | ☐ | ☐ |

## Localisation

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 7 | Autoriser | Carte, « Autour de vous », distances, tri par proximité | ☐ | ☐ |
| 8 | Refuser | Pas de distance ; encart « Activer la localisation » ; liste alphabétique | ☐ | ☐ |
| 9 | Refuser définitivement | L'encart propose « Ouvrir les réglages » | ☐ | ☐ |
| 10 | Autoriser dans les réglages puis revenir | L'app le détecte au retour, sans relance | ☐ | ☐ |
| 11 | Service de localisation coupé | Message « service désactivé » | ☐ | ☐ |

## Accueil et liste

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 12 | Tirer la page vers le bas | La photo s'étire, aucun vide blanc en haut | ☐ | ☐ |
| 13 | Faire défiler | Barre d'état claire sur la photo, puis sombre sur fond clair | ☐ | ☐ |
| 14 | Rechercher « lyon », puis « laUziere » | Résultats après une courte pause ; accents et casse ignorés | ☐ | ☐ |
| 15 | Rechercher « zzz » | Message d'absence de résultat | ☐ | ☐ |
| 16 | Carrousel « Autour de vous » | Défilement aimanté carte par carte | ☐ | ☐ |
| 17 | Descendre jusqu'en bas | Pages suivantes chargées, puis « Vous avez tout vu » | ☐ | ☐ |
| 18 | Tirer pour rafraîchir | Indicateur natif, liste rechargée | ☐ | ☐ |
| 19 | Trier (avec localisation) | Menu natif : plus proches ou A à Z | ☐ | ☐ |

## Détail et carte

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 20 | Ouvrir un magasin | Transition native ; retour par glissement (iOS) ou bouton et geste système (Android) | ☐ | ☐ |
| 21 | Glisser les photos | Pagination, compteur « 1 / 2 » | ☐ | ☐ |
| 22 | Tirer vers le bas | La photo s'étire | ☐ | ☐ |
| 23 | Déplier les horaires | Semaine entière, jour courant en gras | ☐ | ☐ |
| 24 | Toucher la carte | Feuille plein écran : magasin, position, tracé à vol d'oiseau, durée estimée | ☐ | ☐ |
| 25 | « Itinéraire » | Ouvre Plans (iOS) ou le choix de l'app de cartes (Android) | ☐ | ☐ |
| 26 | « Appeler » | Propose l'appel (numéro fictif ARCEP) | ☐ | ☐ |
| 27 | Partager | Feuille de partage du système | ☐ | ☐ |

## Favoris et persistance

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 28 | Ajouter un favori | Cœur plein, retour haptique, animation | ☐ | ☐ |
| 29 | Onglet Favoris | Le magasin y est ; retirer le cœur l'enlève avec une animation | ☐ | ☐ |
| 30 | Tuer et relancer l'app | Favoris, langue et apparence conservés | ☐ | ☐ |
| 30b | Installer la nouvelle version par-dessus l'ancienne, avec des favoris existants | Favoris toujours là, fiches ouvrables, aucun plantage | ☐ | ☐ |

## Paramètres

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 31 | Roue dentée | Feuille native (iOS), écran plein (Android) | ☐ | ☐ |
| 32 | Français ↔ English | Toute l'app bascule, y compris les onglets | ☐ | ☐ |
| 33 | Clair, Sombre, Système | Toute l'app suit, barre d'onglets, carte et feuilles comprises | ☐ | ☐ |
| 34 | Système + changer le mode du téléphone | L'app suit en direct | ☐ | ☐ |

## Réseau

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 35 | Mode avion, ouvrir Favoris puis un favori | Favoris lisibles, bandeau « Hors connexion », détail enregistré | ☐ | ☐ |
| 36 | Mode avion, nouvelle recherche | Message hors connexion avec « Réessayer » | ☐ | ☐ |
| 37 | Réseau revenu | La liste se recharge seule | ☐ | ☐ |
| 38 | Debug : « Simuler une panne de l'API » | État d'erreur, puis « Réessayer » après avoir coupé la panne | ☐ | ☐ |

## Écrans et natif

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 39 | Petit écran (iPhone SE, Android 5 pouces) | Rien de coupé, tout reste atteignable par défilement | ☐ | ☐ |
| 40 | Grand écran et tablette | Mise en page propre, pas étirée de façon absurde | ☐ | ☐ |
| 41 | Paysage | Lisible, rien sous l'encoche | ☐ | ☐ |
| 42 | Clavier ouvert sur la recherche | Le champ reste visible ; défiler ferme le clavier | ☐ | ☐ |
| 43 | Onglets | Barre système : Liquid Glass sur iOS 26+, Material 3 sur Android | ☐ | ☐ |
| 44 | Bord à bord Android | Contenu sous les barres système, sans chevauchement de texte | n/a | ☐ |

## Accessibilité

| | Action | Attendu | iOS | Android |
|---|---|---|---|---|
| 45 | Taille de texte maximale | Lignes qui grandissent, aucun texte tronqué au milieu d'un mot important | ☐ | ☐ |
| 46 | VoiceOver / TalkBack sur une ligne | Une seule annonce : nom, adresse, statut, distance ; le cœur est un bouton séparé | ☐ | ☐ |
| 47 | VoiceOver / TalkBack sur le cœur | « Ajouter aux favoris », puis annonce de l'ajout | ☐ | ☐ |
| 48 | VoiceOver / TalkBack, parcours complet | Onboarding, recherche, détail, favori, réglages, sans élément muet | ☐ | ☐ |
| 49 | Réduire les animations | Squelettes fixes, apparitions sans animation | ☐ | ☐ |
| 50 | Contraste en clair et en sombre | Statuts lisibles, jamais portés par la seule couleur | ☐ | ☐ |

# Dix couches pour toi

Un cadeau à déballer en 10 couches. Chaque couche est un mini-jeu ; une fois gagnée, elle révèle
un fragment de déclaration. À la fin, les 10 fragments se réunissent en une seule lettre.

## Personnaliser
Tout se règle dans le bloc `CONFIG` en haut de `app.js` :

- `prenom` / `surnom` / `deQui` : accueil, début et signature de la lettre
- `layers[1..10].fragment` : le morceau de déclaration caché sous chaque couche
- réglages des jeux : tempo du cœur, emojis du memory, mots à remettre dans l'ordre,
  questions du quiz (`answer` = position de la bonne réponse, 0 = première), phrase à gratter,
  code du cadenas (4 chiffres) + indice
- `finale` : dernier mot, photos, question finale

## Fichiers à ajouter (facultatifs)
- `images/souvenir1.jpg` … `souvenir6.jpg` : les 6 photos du memory (couche 2) — tant qu'une manque, un emoji la remplace
- `images/puzzle.jpg` : image du puzzle (carrée de préférence) — sinon une image de secours
- `images/photo1.jpg`, `photo2.jpg`, `photo3.jpg` : polaroids de la finale

Un fichier absent ne casse rien.

## Tester
Ajoute `?couche=7` à l'adresse pour sauter directement à une couche, `?couche=11` pour la finale.
Si quelqu'un bloque plus d'une minute sur un jeu, un lien « Je suis bloqué·e » apparaît.

## Les 10 couches
1. Le cœur qui bat — taper en rythme
2. Nos souvenirs — memory
3. Le fil rouge — relier les points en cœur
4. Les mots doux — anagrammes
5. Pluie de cœurs — attraper les cœurs
6. Le puzzle — échanger les pièces
7. Notre constellation — mémoriser une séquence d'étoiles (elles forment un « T »)
8. Le quiz de nous
9. La lettre effacée — carte à gratter
10. La serrure du cœur — cadenas à code (0102, soit le 01/02)
Finale : maintenir le cœur pour l'ouvrir → lettre complète, photos, question (le « Non » s'enfuit).

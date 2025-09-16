
# PWA Kaolack — Guide rapide iPhone

## 1) Copie ces fichiers à la racine de ton projet (même dossier que ton HTML)
- `manifest.webmanifest`
- `sw.js`
- `icons/icon-192.png`
- `icons/icon-512.png`

Et place aussi `logo-salvi.png` à la racine (ou change le chemin dans le manifest et dans Lamoadaire-pwa.html).

## 2) Héberge en HTTPS
- iOS exige HTTPS pour le service worker.
- Tu peux utiliser Netlify, Vercel, GitHub Pages ou un serveur Nginx/Apache avec TLS.

## 3) Test rapide avec le fichier fourni
- Déploie `Lamoadaire-pwa.html` (inclus ici) et ouvre l’URL sur Safari iOS.
- Dans Safari : bouton "Partager" → "Ajouter à l’écran d’accueil".
- Lance depuis l’icône installée (plein écran).

## 4) Intégration dans TON fichier HTML principal
Dans ta page principale (ex: `index.html`), ajoute dans <head> :
<link rel="manifest" href="./manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="./icons/icon-192.png">
<meta name="theme-color" content="#0f172a">

Et juste avant </body> :
<script>
if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js'); }
</script>

## 5) Astuces
- Mets toutes tes ressources (Leaflet, XLSX, images) en HTTPS.
- Si tu utilises des CDN, garde bien les URLs https://
- Pour que le PWA démarre sur ta vraie page, change `start_url` dans `manifest.webmanifest` vers ton fichier (ex: "./index.html").

Bon test !

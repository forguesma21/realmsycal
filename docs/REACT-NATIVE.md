# React Native — démarrage

Projet [**React Native**](https://reactnative.dev) à la racine du dépôt.

> Complétez d’abord le guide [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment).

## Étape 1 : Metro

Depuis la racine du projet :

```sh
npm start
```

## Étape 2 : Lancer l’app

Avec Metro actif, dans un autre terminal :

### Android

```sh
npm run android
```

### iOS

Installer les dépendances CocoaPods (premier clone ou après mise à jour des deps natives) :

```sh
bundle install
bundle exec pod install
```

Puis :

```sh
npm run ios
```

## Rechargement

- **Android** : <kbd>R</kbd> deux fois ou **Reload** dans le menu dev (<kbd>Ctrl</kbd>+<kbd>M</kbd> / <kbd>Cmd</kbd>+<kbd>M</kbd>).
- **iOS** : <kbd>R</kbd> dans le simulateur.

## Dépannage

Voir [Troubleshooting](https://reactnative.dev/docs/troubleshooting) sur le site React Native.

## Ressources

- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Dépôt GitHub](https://github.com/facebook/react-native)

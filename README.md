# 🗺️ Realmsycal

> *Wander freely, for Realmsycal remembers.* 🧭✨

A whimsical local companion for Minecraft explorers — save, name, and revisit every magical coordinate across your realms 🌍🍄

---

## ✨ What is it?

Realmsycal lets you **centralize all your important Minecraft coordinates** (X, Y, Z) in one cozy place 📖, organized by realm. No more scattered screenshots or forgotten notes — your bases, villages, strongholds and secret caves all live here. Designed to be used **in your browser while you play** 🎮, especially on mobile 📱.

---

## 🏰 Features

- 🌐 **Multiple realms** — switch between your worlds from the selector at the top of the screen
- 📋 **Places list** — name, coordinates and notes for every saved location
- 🎨 **Filter by type** — show only villages, bases, strongholds, etc. (colored tags)
- 🗺️ **X/Z map view** — flat map with markers positioned by X and Z ; Y stays visible in the list
- 📱 **Mobile-friendly** — list and map accessible via floating button on small screens
- 🔄 **Reload data** — button to re-read the coordinates file after any changes

---

## 📂 Supported Formats

### JSON file (`coords.json`)

Data is read from a **JSON** file structured like this:

```json
{
  "realms": [
    {
      "id": "my-realm",
      "name": "My Realm",
      "places": [
        {
          "name": "My Base",
          "type": "base",
          "x": -676,
          "y": 62,
          "z": 742,
          "notes": "Nether portal nearby"
        }
      ]
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` or `label` | ✅ | Display name of the place |
| `x`, `z` | ✅ | Horizontal coordinates (numbers) |
| `y` | ❌ | Height — can be omitted |
| `type` | ❌ | Place type (see below) |
| `notes` | ❌ | Free text notes |
| `id` | ❌ | Stable identifier — auto-generated if omitted |

Default file location: `web/public/coords.json`

---

## 🏷️ Place Types

Recognized values for the `type` field (each gets a dedicated color and filter) :

`spawn` 🌱 `village` 🏘️ `ancient city` 🏚️ `stronghold` 🔮 `lush cave` 🌿 `base` 🏠 `ocean monument` 🌊 `pillager` ⚔️ `shipwreck` ⚓ `jungle temple` 🌴 `desert temple` 🏜️ `mineshaft` ⛏️ `trial chambers` 🗝️ `ruined portal` 🌀 `mine` 🪨 `divers` 🎒

> Custom types are also accepted — they'll display with a neutral color 🎨

---

## 🛠️ For Developers

Local installation, Express/MongoDB API and React Native app — see [docs/DEVELOPPEMENT.md](docs/DEVELOPPEMENT.md) 📄
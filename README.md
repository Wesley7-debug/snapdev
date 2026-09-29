# markdev — find who's building around you

A Snap Map for builders. A live world map showing developers, founders,
designers and makers — search people *and* places, tap any avatar for the
full profile in a bottom drawer, join the map yourself in 30 seconds with
no account and no password.

Built by SlyCodez ([@slycodez](https://x.com/slycodez)).

## Features

- **Live builder map** (MapLibre GL + free CARTO basemaps, no token needed)
- **Snap-style UI** — top search pill, vertical icon dock, bottom drawers, centered modals
- **User + place search** — type a name, stack or project and the map glides
  to the best match; type a city (Lagos, Abeokuta, Tokyo…) for place
  suggestions that fly you there
- **🎲 Explore dice** — jump to a random builder anywhere in the world
- **Full profiles in drawers** — bio, stack chips, X/GitHub/website links
  (X opens the person's account), approximate area only
- **Join in 30 seconds** — name, unique username (live availability check),
  role, X handle + optional links; GPS or place-picker location with a
  plain-language confirmation card
- **Privacy first** — exact coords never leave the server; the map only ever
  shows jittered approximate locations. Hide/show yourself anytime, greyed
  out while hidden. No login, just an anonymous device ID
- **Edit profile modal** — update everything (username stays fixed)
- **Worldwide demo seed** (~60 builders across 5 continents)

## Stack

Next.js 16 (app router) · React 19 · Tailwind CSS 4 · MapLibre GL JS ·
MongoDB + Mongoose · Sora font

## Getting started

```bash
npm install
```

Create `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/markdev
# optional: NEXT_PUBLIC_CARTO_BASEMAP=voyager | positron | dark-matter
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app auto-seeds demo
builders on first load (see API below to wipe + reseed).

## Scripts

| Command       | What it does              |
| ------------- | ------------------------- |
| `npm run dev` | Start dev server          |
| `npm run build` | Production build        |
| `npm start`   | Serve production build    |
| `npm run lint` | Run ESLint               |

## API

| Endpoint | Method | Purpose |
| -------- | ------ | ------- |
| `/api/nearby?lng=&lat=&q=&roles=&statuses=&limit=` | GET | Nearest builders (approx coords + distance, no 150km cap — zoom out to see the world) |
| `/api/profiles?anonymousId=` | GET | Your own profile (private coords included, owner only) |
| `/api/profiles` | POST | Create profile (409 `username is taken`) |
| `/api/profiles` | PATCH | Update profile / visibility / location |
| `/api/profiles/check?username=` | GET | Live username availability `{ taken, valid }` |
| `/api/seed` | POST | Upsert worldwide demos (never duplicates) |
| `/api/seed` | DELETE | **Wipe ALL profiles, then reseed fresh (dev only)** |

## Project structure

```
app/
  page.tsx            # Snap-style home: map + dock + modals + drawers
  api/nearby|profiles|seed|users
  u/[username]/       # full-profile card component (drawers use it; no routing)
components/
  home/               # SnapTopBar, SnapDock, SnapModal, Drawer
  map/                # MapView, markers, clustering
  onboarding/         # add-yourself flow (fields, location, validation)
  profile/            # EditProfileModal
hooks/                # useMe, useBuilders, useMapCenter
lib/                  # geo + places, mongo, anonymous id, client location
models/               # Profile schema (unique username index, 2dsphere)
```

## Privacy model

- `location` (exact) is stored but **never sent to any client except the
  owner** via the anonymous-ID lookup.
- `publicLocation` is jittered ~300–800m at write time; every public surface
  (`/api/nearby`, drawers, markers) uses only that.

# Base Camp By EPIC — Netlify version

A shared mandate tracker. Everyone who knows the password sees the same data and can edit it. Changes save automatically and other people's screens refresh every 30 seconds.

## What's in the folder

- `public/index.html` — the tracker page
- `netlify/functions/state.mjs` — the small shared-storage function (uses Netlify Blobs, nothing else to set up)
- `netlify.toml`, `package.json` — Netlify settings

## Deploy (one time, about 10 minutes)

Netlify needs the function built, so a plain drag-and-drop of `index.html` alone is not enough. Use one of these:

**Option A — GitHub (recommended, easiest to update later)**
1. Create a new private GitHub repo and upload everything in this folder.
2. In Netlify: Add new site > Import an existing project > pick the repo. Leave build settings as they are (they come from `netlify.toml`).
3. Before the first deploy finishes, go to Site configuration > Environment variables > Add a variable:
   `BASECAMP_PASSWORD` = the password you want your team to use.
4. Deploy (or Deploys > Trigger deploy if you added the variable afterwards).

**Option B — Netlify CLI**
1. `npm install -g netlify-cli`, then in this folder run `npm install`.
2. `netlify login`, then `netlify init` (create a new site).
3. `netlify env:set BASECAMP_PASSWORD "your-password"`
4. `netlify deploy --prod`

## Using it

- Open the site link, enter the password once (the browser remembers it).
- Edit numbers and notes; use "Mark as live", "Move to closed" and "+ Add new mandate" as before.
- The Morning Punch tab and the Teams "Spoken To" sync are removed — enter those numbers by hand each morning.

## Good to know

- The starting data is the version last published in Claude. Edits that only lived in someone's own browser on the Claude version are not carried over.
- If two people edit the same field at the same moment, the last save wins. Different fields and different cards never clash.
- Anyone with the password can edit everything. To change the password, update `BASECAMP_PASSWORD` in Netlify and redeploy; everyone will be asked again.
- There is no "reset all" button, since it would wipe everyone's edits. "Reset row" on a card still works.

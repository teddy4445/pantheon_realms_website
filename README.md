# Pantheon Realms — website

![Six champions overlook the realms](images/new/hero-six-realms.png)

The public-facing, static companion site for **Pantheon Realms**, an offline mythological strategy game. This repository contains the landing page, pantheon rosters, interactive town development showcase, gameplay gallery and release download settings.

**[Game source and developer documentation](https://github.com/teddy4445/pantheon_realms)** · **[Windows 1.0.0 download](https://drive.google.com/file/d/1BdPPimif77vCDrNtWFaPW5CY9SzySu6X/view?usp=sharing)**

## Preview

No dependency installation or build step is required. Open `index.html` directly, or use the included Node preview server:

```bash
node production/serve-preview.mjs
```

Open **http://127.0.0.1:5195**. The `/preview-repo/` route also tests hosting under a repository subpath. Stop the server with Ctrl+C.

## File map

| File | Responsibility |
| --- | --- |
| [index.html](index.html) | Page content, accessibility structure, faction templates and no-JavaScript download links. |
| [styles.css](styles.css) | Base layout, local fonts, color and responsive styling. |
| [refresh.css](refresh.css) | Painted showcase, city animation and current release sections. |
| [site-config.js](site-config.js) | Application version, build date, installer URL, size, checksum and repository links. |
| [script.js](script.js) | Mobile navigation, keyboard-accessible faction tabs, screenshot dialog and release settings. |
| [city.js](city.js) | Shared town-development clock, building transitions, tooltips, pause and reduced-motion behavior. |
| [game-data.js](game-data.js) | Pantheon display data, current city assets, scene ratios, building placement and construction sequence. |
| `images/current-cities/` | Current city derivatives exported from the game. |
| `images/release-1.0/` | Actual gameplay screenshots used in the current gallery. |
| `fonts/` | Bundled fonts and their license records. |
| `production/` | Preview tools, provenance and historical production scripts. |

## Current content

Refreshed **2026-10-24** against the game's validated catalog: six playable pantheons, nine campaigns / 51 chapters and 130 creature forms. The page includes neutral dragons, painted magic, restoration temples, expanded living-map scenery and current city development art for all six pantheons.

Large story/hero illustrations are promotional artwork. The gallery and release cards use in-game screenshots. City provenance is recorded in [production/current-city-provenance.json](production/current-city-provenance.json).

## Update the download

Edit `site-config.js`. The current link opens a Google Drive file page, where the visitor chooses Download. Do not attach an HTML `download` attribute to an external file viewer. Keep the two fallback links in `index.html` synchronized so downloading still works without JavaScript.

Version **1.0.0**, built **2026-10-23**, installer **849,739,984 bytes**. The configured SHA-256 describes the locally verified release artifact. Check the hosted file's sharing permissions and compare a downloaded file before announcing a release; this repository does not upload or verify the remote installer.

Set `siteUrl` only when the actual public address is known. Relative asset URLs support GitHub Pages repository paths. There is no analytics backend, CDN font requirement or frontend build pipeline.

## Refresh from the game

From a sibling game checkout with its dependencies installed:

```bash
node tools/docs/export-catalog.mjs
node tools/docs/sync-website.mjs ../pantheon_realms_website
node tools/docs/prepare-media.mjs ../pantheon_realms_website
```

The first command validates the current catalog. The second updates city artwork and placements; the third prepares selected screenshots. Read the game's `tools/docs/README.md` before using them. Historical scripts in this repository's `production/` directory may refer to older fixtures or local authoring paths; they are not required to serve the site.

## Verify and publish

Test desktop and mobile widths, keyboard navigation, all six city/faction selectors, pause/reduced-motion behavior, gallery open/close and both download links. Check for missing images and horizontal overflow. Verify `/preview-repo/` as well as `/` if deploying to GitHub Pages.

To host with GitHub Pages, publish the repository's root directory using the desired Pages configuration. Keep `.nojekyll` and the asset folders. Editing this checkout does not publish it automatically.

Project code uses the existing [Apache-2.0 license](LICENSE). Media and fonts retain their own applicable terms; consult the [game's asset credits](https://github.com/teddy4445/pantheon_realms/blob/main/ASSET_CREDITS.md) and bundled provenance records.

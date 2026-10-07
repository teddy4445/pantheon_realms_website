PANTHEON REALMS — STATIC LANDING PAGE

Open index.html directly to preview the website.
No npm, Node.js, React, Vite, framework, dependency installation, or build command is needed.

FILES
index.html      Complete page content; edit text here.
styles.css      Base responsive layout, fonts, colours and effects.
refresh.css     October 7 visual refresh and town animation styles.
game-data.js    Six rosters, patrons, town art, placements and legal construction sequences.
city.js         Shared 30-second town loop, flag switching, tooltips and reduced-motion support.
script.js       Plain JavaScript for menus, pantheon tabs, gallery and release links.
site-config.js  Release/download settings and optional trailer/community links.
images/         Local artwork and actual game screenshots.
fonts/          Local WOFF2 fonts and font licences.
.nojekyll       Tells GitHub Pages to serve these files directly.

UPLOAD TO GITHUB PAGES
1. Create a repository for the website, or use your existing website repository.
2. Upload the CONTENTS of the provided ZIP into the repository root.
   If uploading from landing-html instead, omit production/ (working notes, backups and development tools).
   index.html must be at the repository root, not inside another landing folder.
   Include images/, fonts/, and the hidden .nojekyll file.
   If using the ZIP, extract it first; GitHub Pages does not unpack ZIP files.
3. In the repository, open Settings > Pages.
4. Under Build and deployment, select Deploy from a branch.
5. Choose your branch (usually main) and /(root), then Save.
6. Open the published URL shown in Settings > Pages once deployment completes.
   The same files support both https://USERNAME.github.io/REPOSITORY/ and a custom domain.
   All local CSS, JavaScript, image and font URLs are relative.

No Actions workflow or application build is required. GitHub still performs its normal hosting deployment.
Official instructions:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

ENABLE THE GAME DOWNLOAD
The 290,744,270-byte Windows installer is intentionally outside this website package.
Host it as an asset on a GitHub Release (or another HTTPS download host).
The original installer remains at:
C:\Users\lazeb\Desktop\blannder_models\landing\public\downloads\Pantheon-Realms-Setup-0.11.0-x64.exe

1. Create a Release in the chosen GitHub repository and attach the installer.
2. Copy the real download link from that uploaded release asset.
3. Edit site-config.js: set downloads[0].url to that link and enabled to true.
4. Commit/upload the changed site-config.js. No rebuilding is needed.
Until a real URL is configured, the download button announces that the link is coming soon when activated.
The file name, byte size and SHA-256 are already supplied for the preserved installer.
If you publish another build, update those values, version and buildDate too.
Cross-origin downloads may navigate to the release host rather than honor the HTML download filename.

GitHub Release assets can be up to 2 GiB each:
https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases

OPTIONAL SETTINGS
Set trailerUrl to an approved MP4/WebM URL to show the video. It never autoplays.
Set browserUrl only when a real public playable game exists.
Add real communityLinks objects with label and HTTPS url fields as needed.
Set siteUrl to the final published URL.
For reliable social sharing, also edit index.html's og:image to the full public
HTTPS address of images/new/hero-six-realms.png, and add a canonical link and og:url
for your actual site. Social crawlers may not execute JavaScript.

EDITING CONTENT
Marketing text lives directly in index.html. The six faction templates at the
bottom contain the tab-panel content; the initially visible Greek panel appears
in the main page as well. Update both Greek copies when changing that panel.
The gallery contains game screenshots. Hero, feature, origin and battle paintings are promotional illustrations.
Without JavaScript, the main content and screenshot gallery remain visible;
interactive tabs, enlargement and configurable downloads need JavaScript enabled.

PRESERVED ORIGINAL
This standalone version is delivered in:
C:\Users\lazeb\Desktop\blannder_models\landing-html
The previous React/Vite project remains separately at:
C:\Users\lazeb\Desktop\blannder_models\landing
Do not upload that original project, node_modules, or the installer to the Pages website folder.
This package has no application-server dependencies and no external font requests.

OCTOBER 7 VISUAL UPDATE
Seven new native-resolution paintings: a six-pantheon hero, four gameplay feature
cards, the origin council, and a dedicated battle illustration. All 42 base
creature portraits and six patron portraits use the current game catalog.
Patrons are hidden at widths of 800px and below.

The town showcase supports all six pantheons. Each uses 4 current backgrounds,
18 placed building slots and 33 construction/upgrade steps. Source coordinates,
layering and level artwork match the game's Town screen. The construction order
was checked with the current game's quoteConstruction/GameDriver. This is a
compressed showcase of a legal sequence, not a live economy simulation: fixture
resources were deliberately generous and each construction represents a new day.
The background changes with civic hall level. The six banner buttons share one timeline: 30 seconds of construction, a five-second
completed-capital hold, then a loop. Switching pantheons preserves the exact phase.
A compact pause/play button sits on the image. Offscreen playback pauses. Reduced-motion
visitors start on the completed capital with autoplay disabled. Building tooltips
work on hover, keyboard focus and touch. Escape dismisses a tooltip.

Screenshots were captured from local game version 0.14.0 using isolated showcase
saves imported through the normal game UI. Map and battle captures were retaken
after the renderer and all creature sprites loaded. Screenshots are unretouched.
New origin copy is an editorial mythology introduction, not a claim that a new
campaign or cinematic has been implemented in the game.

The installer configuration still describes the preserved 0.11.0 installer.
Do not relabel that installer as 0.14.0. Replace the release metadata and URL
only when the actual newer installer is available.

SOURCE RECORDS (NOT REQUIRED FOR HOSTING)
production/art-prompts.json: painting generation prompts.
production/asset-provenance.json: source game assets and copied destinations.
production/city-sequences.json: validated construction snapshots.
production/capture-record.json and recapture-record.json: screenshot records.
production/reviews/: browser reports and visual review captures.
The ZIP excludes production/, game fixtures, dependencies and installers.

FEATURE CARD REVISION — 2026-10-07
Explore: Celtic; Build: Egyptian; Choose: Japanese; Conquer: Norse.
Four new illustrations generated with the built-in image generator.
Native PNGs are in images/new/ with the pantheon in each filename.
Exact prompts: production/feature-pantheon-prompts.json.

CITY / DOWNLOAD REVISION — 2026-10-07
The town scene is full-width with six emblem-bearing flags above it. No right
panel, timeline slider or explanatory time-lapse copy is displayed. The three
additional Egyptian, Japanese and Norse gallery screenshots were removed; the
remaining Greek capital was removed in the following revision. The gallery now
contains four non-city screenshots in a 2-by-2 grid at desktop and mobile widths.
The former release information card is now one gold download button with a
shimmer and lift effect. Version/build metadata is no longer displayed there.
The actual release URL must still be supplied in site-config.js.

The HTML/CSS/JS files in the root are the current editable source of truth.
production/rebuild_page.py records the initial refresh only; do not use it to
rebuild later revisions. Production files are excluded from the upload ZIP.

CREATURE / GALLERY / HERO DOWNLOAD REVISION — 2026-10-07
All 42 creature cards show the base portrait and name by default. Hover or
keyboard focus reveals the matching upgraded portrait and name. The upgrade
assets are copied from the game's final UI manifest, with provenance recorded
in production/creature-upgrade-provenance.json.

The four remaining screenshots use an equal 2-by-2 grid. The hero button reads
Download and shares the same URL and download filename as the large bottom
button. Both initiate a download when a valid release URL is configured. Neither
uses an anchor jump as a substitute. No public release URL is configured yet.

The owner requested both download buttons remain unlinked for now. Set an
enabled release URL in site-config.js when ready; both buttons will use it.

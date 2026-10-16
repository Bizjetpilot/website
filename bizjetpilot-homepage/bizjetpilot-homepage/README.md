# BizJet Pilot — complete website

A responsive, multi-page website for business aviation flight simulation. Uses your original logo, live-stream graphic and the Version 2 flight deck background.

## Included

- Home, News, Reviews, Tutorials, Resources, Live Streams, Contact and Privacy pages
- Search on news, reviews and tutorials listings
- Individual article and live-stream pages generated from JSON content
- Draft/published workflow
- Starter Pages CMS configuration (`.pages.yml`) — configuration must be placed in the **repository root**, with its `path` values adjusted if site files live in a subfolder. The CMS integration has not yet been tested against your GitHub account.
- No paid dependencies, no fake published reviews or events

## Build

Requires Node.js (available in Cloudflare's build environment). Run `npm run build` or `node build.js`. The finished site is generated into `dist/`.

## IMPORTANT: Cloudflare Pages changes

Your existing site is currently in `bizjetpilot-homepage/bizjetpilot-homepage` within the GitHub repository. Upload the **contents of this ZIP** into that same folder, replacing files with matching names.

Then in Cloudflare Pages > Settings > Builds & deployments, change:

- Build command: `cd bizjetpilot-homepage/bizjetpilot-homepage && node build.js`
- Build output directory: `bizjetpilot-homepage/bizjetpilot-homepage/dist`
- Root directory: blank

**Do not keep the old blank build command / output directory** — this new site uses a build step to create article pages.

## Publishing content

In `content/news`, `content/reviews`, `content/tutorials`, and `content/streams`, duplicate a JSON file and edit the fields. Set `status` to `published` to make the entry appear on the site. Cloudflare rebuilds after a GitHub commit. Keep drafts marked `draft`.

For a CMS dashboard, `.pages.yml` is a starting configuration for Pages CMS, but because the site currently lives in nested folders, CMS paths must be updated and its integration tested. It is not a fully configured admin login yet.

## Contact

Contact page is informational until you provide a business email address and configure a spam-protected contact form.

## External links

Resource links go to third-party services. YouTube and Twitch links can be added per scheduled stream, but automatic simultaneous publishing is not implemented.

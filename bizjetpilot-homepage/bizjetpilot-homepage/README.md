# BizJet Pilot — Homepage prototype

A responsive, static homepage for **Bizjetpilot.me**, built using the supplied official logo and live-stream thumbnail.

## What's included

- `index.html` — homepage with navigation, hero, content sections and live-stream area.
- `styles.css` — responsive teal, lime and white visual design.
- `script.js` — mobile navigation and automatic copyright year.
- `assets/bizjetpilot-logo.png` — supplied logo.
- `assets/livestream-template.png` — supplied stream thumbnail template.

## Preview

Open `index.html` in a browser. Google Fonts requires an internet connection; fallback fonts are provided.

## Publish with GitHub and Cloudflare Pages

1. Extract this ZIP on your computer.
2. In your GitHub repository `Bizjetpilot/website`, select **Add file → Upload files**.
3. Upload `index.html`, `styles.css`, `script.js` and the **assets** folder, keeping the folder structure intact. Commit the changes.
4. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git**. Select `Bizjetpilot/website` and the `main` branch.
5. Choose a static/no-framework project. Set the build command to blank and the output directory to `/` (repository root), if prompted.
6. Deploy and test the `*.pages.dev` preview before attaching your domain.

**Important:** Do not alter your 123 Reg DNS yet. Check existing DNS and email records before connecting the domain.

## Prototype limitations

- This is the **homepage only**. Navigation for News, Reviews, Live Streams and Contact currently scrolls to homepage sections. Separate pages and the publishing CMS are future steps.
- No news articles, review scores, streaming dates, YouTube URLs or Twitch URLs have been invented.
- The supplied live-stream thumbnail is a blank reusable announcement template; flight details are intentionally marked as forthcoming.
- The stream updates button currently jumps to the contact section. It does not sign anyone up or send emails.
- External Google Fonts are optional and can be self-hosted later.

## Next steps

Add separate News, Reviews, Contact and Streams pages; integrate a GitHub-backed content management system; add verified social links and real scheduled YouTube broadcasts; implement a working contact form and privacy policy.


## Version 2: flight deck hero

The homepage now features the headline **Business Aviation in the Virtual World** and a flight-deck background with route-data overlays. The original logo and stream template remain unchanged. The cockpit image is an AI-generated illustrative visual, not a screenshot of a particular simulator or aircraft.

### Cloudflare Pages

If you upload the **contents** of this folder to the repository root, set the Pages build output directory to `/` (or leave it as the root). If you upload this entire folder to the repository root, set the build output directory to `bizjetpilot-homepage`. Your existing deployment currently uses `bizjetpilot-homepage/bizjetpilot-homepage`; to preserve that configuration, replace the files within that nested directory.

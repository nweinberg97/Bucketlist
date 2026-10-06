# Bucketlist

> 🚧 **Status: actively in development.** This is a working prototype with some bugs and unfinished UI/features — not yet a polished, finished product.

**Your bucket list doesn't have to be something you do alone.**

Bucketlist is a product prototype for a social network built around a simple idea: what if your bucket list wasn't a private to-do list, but a way for other people to help you make things happen?

Goals become discoverable, local, social objects. Someone in Kitsilano wants to learn to surf; someone two streets over surfs, has a spare board, or knows an instructor. A filmmaker needs a camera package; a rental house nearby has one sitting on a shelf.

> Instagram shows what a creator has already done. Bucketlist shows what they're trying to do next — and gives people a way to help.

This is a portfolio prototype: a polished, fully interactive front end with realistic state, not a production system. Payments, auth, messaging and social posting are simulated.

---

## The core idea: four ways to help

Every public goal can be helped in four ways. They're one behaviour — *I believe you should do this, and here's how I can help* — expressed differently:

| | Who | What it looks like |
|---|---|---|
| **Help** | Anyone | Skills, gear, time, or an introduction to someone who has them |
| **Fund** | Individuals | Chip in toward a goal that needs resources (opt-in by the owner) |
| **Sponsor** | Businesses | Products, services, space or money that remove the biggest obstacle |
| **Promote** | Anyone | Share the goal beyond the app — always with the owner's approval |

The primary action adapts to the goal and the viewer: funded goals lead with **Fund**, a business viewing a goal open to sponsors sees **Sponsor** first, everything else leads with **I can help**. Funding and sponsorship UI only appears where the owner has turned it on.

## The 4-minute demo

Run it locally, then click **Demo tour** (bottom-left). Each step jumps to the right screen *and* the right perspective, and ticks itself off as you complete it.

1. **Discover** — local goals as editorial stories, filtered by category and neighbourhood
2. **Search "surfing"** — synonym + stem matching (surf, waves, Tofino…)
3. **Open Sarah's "Learn to surf"**
4. **I can help** — edit a pre-written intro and send it
5. **My bucketlist** — Want to do / In progress / Done
6. **Add a goal** — a title is enough; category, emoji and artwork are inferred
7. **Fund** Maya's short film — progress updates instantly, you join the backers
8. **Sponsor** as Westside Paint Co. — offer paint for Sarah's mural
9. **Promote** as Alex — write a caption, request approval
10. **Approve** as Sarah — accept the sponsor, approve (or edit) the caption
11. **Share card** — a generated 1080×1350 image with caption, QR and branding, downloadable as PNG

Use the **Viewing as** switcher (top-right) to hop between people and businesses at any time. State persists in `localStorage`; **Reset demo** lives in the tour panel.

## Product decisions worth noting

- **Aspirations are the object, not profiles.** Search returns goals. Cards lead with the story in the owner's own words, not metadata.
- **Location without addresses.** Goals show `Kitsilano · 1.4 km` — neighbourhood-level distance only.
- **Privacy per goal, at creation time.** Public / Network / Private is a three-way control in the composer and on every list card, with a plain-language explanation of each.
- **Promotion requires consent.** It's the owner's ambition, so nothing travels beyond the app without their OK — and they can edit the caption before approving.
- **Sponsorship is framed around obstacles, not dollars.** Owners describe *what's standing in the way*; businesses see that before they offer anything. Offer types (products, services, space, other) are first-class, not an afterthought to cash.
- **Matching is explainable.** "You surf · 1.4 km", "Lucía · Photographer". Overlaps between a person's skills and a goal's tags, plus a "You might know someone" path that turns your network into introductions.
- **The loop is visible.** Completing a goal notifies everyone who helped. Share cards carry a CTA and link back. Businesses get their own home that surfaces nearby goals matched to what they do.
- **Emotional moments, not gamification.** Completing a goal triggers a golden "You did it." state with a prompt for a one-line reflection. Hitting 100% funding turns the panel to golden hour. A first accepted sponsorship says "Someone believes in your goal."

## Visual system

*Golden-hour sunlight hitting a deep blue ocean.*

- **Palette** — Ocean `#0B5CFF`, Sun `#FFC83D`, Cloud `#FFFDF8`, Night `#111318`, with Mist, Sand and a rare Sunset Coral. One signature gradient (ocean → sky → golden hour), used sparingly.
- **Action colours map to the four ways to help** — Help is ocean blue, Fund is sun yellow, Sponsor is deep ocean ink, Promote is a quiet button with a golden accent.
- **Type** — Bricolage Grotesque for display, Hanken Grotesk for UI, Instrument Serif italic for people's own words.
- **Generative horizon artwork.** Rather than stock photography that makes a prototype feel fake, every goal gets a deterministic landscape — ocean, ridges, rolling hills, a waterfront skyline, dunes, a field, or aurora — across six times of day, with tiny people in big places and the occasional hot-air balloon. It's chosen from the goal's words and category, renders anywhere, and nests inside the share card so it exports to PNG. Owners can still upload their own photo.

## Stack

- React 19 + TypeScript, Vite, Tailwind CSS v4
- No runtime dependencies beyond React — icons, artwork, QR placeholder and PNG export are hand-built
- State: a single reducer in `src/store/store.tsx` with `localStorage` persistence; a tiny hash router + modal/toast context in `src/store/ui.tsx`
- Seed data in `src/data/` — 21 people and businesses, ~40 goals, with a realistic network graph

```
src/
  components/   GoalArt (generative scenes), GoalCard, Shell, Icon, shared UI
  pages/        Home, Discover, GoalPage, MyList, Profile, Activity
  modals/       Help, Fund, Sponsor, Promote + ShareCard, Composer, Celebrate, persona + demo tour
  lib/          search & matching, geography, formatting
  store/        app state reducer, router + UI state
  data/         people, goals, seed notifications
```

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL. `npm run build` produces a static build in `dist/`.

### Live demo

Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site then lives at `https://nweinberg97.github.io/Bucketlist/`.

## What's simulated

Sign-in (identity via Instagram / LinkedIn / TikTok is shown, not wired), payments, messaging, notifications delivery, and posting to social platforms. Everything else — creating, editing, privacy, completion, funding progress, sponsorship offers and responses, promotion requests and approvals, search, filtering, matching — is real client-side state.

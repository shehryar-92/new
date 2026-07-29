# Quick Poll

A tiny poll app you can run by just opening `index.html`. Make a question with a couple options, vote, and watch a donut chart update live.

## What it does

- Create a poll with a question and 2–6 options
- Vote once (it remembers you've voted, so you can't double-vote by refreshing)
- See a live donut chart with percentages as votes come in
- Light/dark theme toggle up in the corner
- Start a new poll whenever you want, which wipes the old one

## What it's *not*

This is a single-browser demo, not a real multi-person polling tool. Everything lives in `localStorage` on your machine, so if you open this on your phone and your laptop, they won't share votes — there's no server involved. If I ever want the "share a link, people vote from their own devices" version, that's a separate project with an actual backend.

## Files

- `poll.js` — the actual poll logic (creating polls, validating input, counting votes). No DOM stuff in here at all, so it's easy to test.
- `poll.test.js` — tests for the above, run with `node --test poll.test.js`
- `chart.js` — draws the donut chart on a canvas, given a set of results
- `app.js` — wires everything to the page: handles the form, localStorage, clicks
- `index.html` / `style.css` — structure and styling

## Running it

Just open `index.html` in a browser. No build step, no server, nothing to install.

To run the tests:

```
node --test poll.test.js
```

## Notes to self

- Options are trimmed and deduped (case-insensitive) before a poll is created — typing "Red" and "red" as two options isn't allowed.
- Vote counts and the "have I voted" flag are stored separately in localStorage so a poll can exist before anyone's voted on it.
- Colors come from CSS variables (`--accent`, `--highlight`, `--warn`, etc.) so the theme toggle doesn't need duplicate hardcoded palettes anywhere in the JS — except the chart's slice colors, which are just a fixed array since canvas can't read CSS custom properties directly for arbitrary values.


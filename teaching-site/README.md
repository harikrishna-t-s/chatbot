# Field Guide — "How Your Chatbot Works"

A single-page, interactive learning site built to accompany the beginner
Flask + Hugging Face chatbot workshop project. It's meant to be handed to
first-semester students immediately after the workshop, so they can
understand — calmly, from zero — everything that happened when they built
their chatbot.

No frameworks, no build tools, no dependencies. Just HTML, CSS, and vanilla
JavaScript. Open `index.html` and it works.

---

## Folder structure

```
learning-site/
├── index.html     # All page content and structure (17 sections)
├── style.css       # Design system, layout, animations, responsiveness
├── script.js        # Scrollspy nav, quizzes, accordion, diagram animations
└── README.md        # This file
```

---

## How to run it

There is no build step and no server required.

1. Download/copy the `learning-site` folder anywhere on your computer.
2. Double-click `index.html`, or right-click → "Open with" → your browser.

That's it. Everything — fonts aside — runs locally in the browser.

> Note: the page links to Google Fonts (Fraunces, Source Sans 3, IBM Plex
> Mono) over the internet for nicer typography. If there's no internet
> connection, the page still works perfectly — it just falls back to your
> system fonts.

---

## What's on the page

The site walks through 17 sections in a deliberate order, each building on
the last:

1. **Welcome** — framing and encouragement
2. **What we built** — the chatbot, explained conceptually
3. **How a chatbot thinks** — the "autocomplete" mental model
4. **CS fundamentals** — hardware, software, code, memory, files, folders
5. **How websites work** — HTML / CSS / JavaScript, the house analogy
6. **Frontend** — DOM, events, rendering, user interaction
7. **Backend** — server, Flask, routes, requests, responses, JSON
8. **Frontend ↔ backend** — an animated `fetch()` walkthrough
9. **What is an API?** — the restaurant-waiter analogy
10. **Hugging Face** — models, hosting, inference, API keys
11. **The AI model** — LLMs, tokens, prompts, temperature, context
12. **Our project, file by file** — every file in the chatbot project explained
13. **A message's journey** — the full animated 8-step signature diagram
14. **Vibe coding** — using AI assistants responsibly
15. **How developers actually build software** — the real, messy process
16. **Mini glossary** — every term used on the page, in one place
17. **What's next?** — a roadmap for continued learning

---

## Interactive features

- Scroll progress bar (top of page)
- Sticky, scroll-spy table of contents (desktop) / slide-out contents panel (mobile)
- Animated SVG diagrams: an ambient "message journey" in the hero, a replayable
  `fetch()` request animation, and a full step-by-step animated journey diagram
- Accordion for AI vocabulary
- Copy-to-clipboard buttons on every code sample
- Two knowledge-check mini quizzes with instant feedback
- Fully responsive, down to small phone screens
- Respects `prefers-reduced-motion` for students sensitive to animation

---

## Customizing

All design tokens (colors, fonts, spacing) live at the top of `style.css`
inside the `:root { ... }` block, so the whole visual identity can be
retuned from one place without hunting through the rest of the file.

All written content lives directly in `index.html` as plain text inside
each `<section>` — safe to edit without touching any CSS or JavaScript.

---

## License

Provided for educational use alongside the accompanying chatbot workshop
project.

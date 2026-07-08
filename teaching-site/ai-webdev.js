/* ==========================================================================
   ai-webdev.js — Interactivity for the "AI for Web Development" page
   --------------------------------------------------------------------------
   Every interactive section is a self-contained, commented function.
   Initialised at the bottom via DOMContentLoaded.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------------
     PROGRESS BAR + SCROLLSPY + MOBILE TOC
  ------------------------------------------------------------------ */
  const progressFill = document.getElementById("progressFill");
  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressFill.style.width = pct + "%";
  }, { passive: true });

  const tocToggle = document.getElementById("tocToggle");
  const tocPanel = document.getElementById("tocPanel");
  tocToggle.addEventListener("click", function () {
    const isOpen = tocPanel.classList.toggle("open");
    tocToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.querySelectorAll("#tocPanel a").forEach(function (link) {
    link.addEventListener("click", function () {
      tocPanel.classList.remove("open");
      tocToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Scrollspy
  const sections = document.querySelectorAll(".section[id]");
  const tocLinks = document.querySelectorAll("[data-toc]");
  const spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        tocLinks.forEach(function (link) {
          const isActive = link.getAttribute("href") === "#" + id;
          link.classList.toggle("active", isActive);
          if (isActive) link.classList.add("visited");
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
  sections.forEach(function (s) { spyObserver.observe(s); });

  // Scroll-triggered entrance animations (sections start hidden via style.css)
  const entranceObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.08 });
  sections.forEach(function (s) { entranceObserver.observe(s); });


  /* ------------------------------------------------------------------
     M0 — AUDIENCE POLL
  ------------------------------------------------------------------ */
  const pollAnswers = {};
  // Simulated "room" numbers for each answer
  const pollSimulated = {
    "1-yes": 14, "1-no": 23,
    "2-yes": 18, "2-tried": 12, "2-no": 5
  };

  document.querySelectorAll(".poll-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const qid = btn.getAttribute("data-qid");
      const val = btn.getAttribute("data-val");
      const key = qid + "-" + val;

      // Prevent re-voting the same question
      if (pollAnswers[qid]) return;
      pollAnswers[qid] = val;

      // Highlight selected
      document.querySelectorAll(".poll-btn[data-qid='" + qid + "']").forEach(function (b) {
        b.classList.toggle("selected", b === btn);
      });

      // Show result bar
      const resultEl = document.getElementById("pr" + qid);
      const total = (pollSimulated[qid + "-yes"] || 0) +
                    (pollSimulated[qid + "-no"] || 0) +
                    (pollSimulated[qid + "-tried"] || 0);
      const myCount = (pollSimulated[key] || 0) + 1;
      const myPct = Math.round((myCount / (total + 1)) * 100);

      // Build bar HTML
      let barHtml = "<strong>Results:</strong><br>";
      const opts = { "yes": "Yes", "no": "No", "tried": "Tried it" };
      for (const v in opts) {
        const k = qid + "-" + v;
        if (pollSimulated[k] !== undefined) {
          const cnt = pollSimulated[k] + (v === val ? 1 : 0);
          const pct = Math.round((cnt / (total + 1)) * 100);
          barHtml += `<div style="margin-bottom:6px;">
            <span style="font-size:0.82rem; color:var(--ink-soft);">${opts[v]}: ${pct}%</span>
            <div style="height:8px; background:var(--panel); border-radius:4px; margin-top:2px; overflow:hidden;">
              <div style="height:100%; width:${pct}%; background:var(--cardinal); border-radius:4px; transition:width 0.6s ease;"></div>
            </div>
          </div>`;
        }
      }
      resultEl.innerHTML = barHtml;
      resultEl.style.display = "block";
    });
  });


  /* ------------------------------------------------------------------
     M1 — FRONTEND / BACKEND SORTER
  ------------------------------------------------------------------ */
  const sorterItems = [
    { term: "The login button on a sign-up form", answer: "frontend", explanation: "Buttons are HTML elements — they live in the browser. Frontend! ✓" },
    { term: "Checking if a password matches the stored hash", answer: "backend", explanation: "Password verification happens on the server, never in the browser. Backend! ✓" },
    { term: "The animated loading spinner while a page fetches data", answer: "frontend", explanation: "Spinners are CSS/JS animations running in your browser. Frontend! ✓" },
    { term: "Storing a new user's email in the database", answer: "backend", explanation: "Writing to a database is server-side work. Backend! ✓" },
    { term: "The color of a button changing on hover", answer: "frontend", explanation: "CSS :hover styles run entirely in the browser. Frontend! ✓" },
  ];

  let sorterIndex = 0;
  let sorterScore = 0;
  const termDisplay = document.getElementById("sorterTermDisplay");
  const sorterFeedback = document.getElementById("sorterFeedback");
  const sorterProgress = document.getElementById("sorterProgress");
  const sorterResetBtn = document.getElementById("sorterResetBtn");
  const sorterFrontBtn = document.getElementById("sorterFrontBtn");
  const sorterBackBtn = document.getElementById("sorterBackBtn");

  function loadSorterItem() {
    if (!termDisplay) return;
    if (sorterIndex >= sorterItems.length) {
      termDisplay.textContent = "🎉 Done! You scored " + sorterScore + "/" + sorterItems.length;
      sorterFrontBtn.style.display = "none";
      sorterBackBtn.style.display = "none";
      sorterFeedback.style.display = "none";
      sorterResetBtn.style.display = "inline-block";
      sorterProgress.textContent = "Complete!";
      return;
    }
    termDisplay.textContent = '"' + sorterItems[sorterIndex].term + '"';
    sorterProgress.textContent = "Round " + (sorterIndex + 1) + " of " + sorterItems.length;
    sorterFeedback.style.display = "none";
    sorterFrontBtn.style.display = "inline-block";
    sorterBackBtn.style.display = "inline-block";
  }

  function sorterAnswer(choice) {
    const item = sorterItems[sorterIndex];
    const correct = choice === item.answer;
    if (correct) sorterScore++;
    sorterFeedback.className = "sorter-feedback " + (correct ? "correct" : "wrong");
    sorterFeedback.innerHTML = (correct ? "✅ Correct! " : "❌ Not quite! ") + item.explanation;
    sorterFeedback.style.display = "block";
    sorterFrontBtn.style.display = "none";
    sorterBackBtn.style.display = "none";
    sorterIndex++;
    setTimeout(loadSorterItem, 2000);
  }

  if (sorterFrontBtn) sorterFrontBtn.addEventListener("click", function () { sorterAnswer("frontend"); });
  if (sorterBackBtn) sorterBackBtn.addEventListener("click", function () { sorterAnswer("backend"); });
  if (sorterResetBtn) sorterResetBtn.addEventListener("click", function () {
    sorterIndex = 0; sorterScore = 0;
    sorterResetBtn.style.display = "none";
    sorterFrontBtn.style.display = "inline-block";
    sorterBackBtn.style.display = "inline-block";
    loadSorterItem();
  });

  loadSorterItem();


  /* ------------------------------------------------------------------
     M2 — TOOL CATEGORY TABS
  ------------------------------------------------------------------ */
  document.querySelectorAll(".tool-cat-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      const target = tab.getAttribute("data-cattab");
      document.querySelectorAll(".tool-cat-tab").forEach(function (t) {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      document.querySelectorAll(".tool-cat-pane").forEach(function (pane) {
        pane.classList.toggle("active", pane.id === "pane-" + target);
      });
    });
  });


  /* ------------------------------------------------------------------
     M2 — TOOL PICKER QUIZ
  ------------------------------------------------------------------ */
  const toolPickerQuestions = [
    {
      q: "What's your main goal right now?",
      opts: [
        { label: "See a working app appear ASAP with no setup", next: "c" },
        { label: "Write and understand my own code with AI help", next: "b" },
        { label: "Think through an idea / explain a concept", next: "a" },
      ]
    }
  ];
  const toolResults = {
    a: {
      title: "🤖 Start with a Chat Assistant",
      tools: "Claude (claude.ai) or ChatGPT (chatgpt.com)",
      why: "You're in thinking/planning mode. Chat assistants are best for reasoning through ideas, explaining concepts, and writing individual pieces of code. No setup needed — just open a tab and start a conversation.",
    },
    b: {
      title: "🖊️ Try a Coding Agent",
      tools: "Cursor (cursor.com) or Claude Code",
      why: "You're ready to work inside a real project. Coding agents live inside your editor and can write, edit, and explain code across many files. Best once you've seen some code and want to go deeper.",
    },
    c: {
      title: "⚡ Start with a Prompt-to-App Builder",
      tools: "Lovable (lovable.dev) or Bolt.new (bolt.new)",
      why: "You want the 'wow moment' first. Type a description of your app and watch a working site appear in seconds. No coding required to start. You can read the generated code afterward with Claude's help.",
    }
  };

  const flowEl = document.getElementById("toolPickerFlow");
  const resultEl = document.getElementById("toolPickerResult");
  const resetBtn = document.getElementById("toolPickerReset");

  function renderToolPickerStep(qIndex) {
    if (!flowEl) return;
    if (qIndex >= toolPickerQuestions.length) return;
    const q = toolPickerQuestions[qIndex];
    let html = `<div class="tool-picker-question">
      <p>${q.q}</p>
      <div class="tool-picker-options">`;
    q.opts.forEach(function (opt) {
      html += `<button class="tool-picker-opt" data-next="${opt.next}">${opt.label}</button>`;
    });
    html += `</div></div>`;
    flowEl.innerHTML = html;
    flowEl.querySelectorAll(".tool-picker-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const resultKey = btn.getAttribute("data-next");
        const res = toolResults[resultKey];
        if (res) {
          flowEl.innerHTML = "";
          resultEl.innerHTML = `<h4>${res.title}</h4>
            <p><strong>Recommended:</strong> ${res.tools}</p>
            <p style="margin-top:8px;">${res.why}</p>`;
          resultEl.style.display = "block";
          resetBtn.style.display = "inline-block";
        }
      });
    });
  }

  renderToolPickerStep(0);
  if (resetBtn) resetBtn.addEventListener("click", function () {
    resultEl.style.display = "none";
    resetBtn.style.display = "none";
    renderToolPickerStep(0);
  });


  /* ------------------------------------------------------------------
     M3 — FILE TREE GUESSER
  ------------------------------------------------------------------ */
  const fileGuessItems = [
    {
      file: "📄 index.html — what does this file do?",
      options: ["Contains all the backend logic", "Defines the page structure and content", "Stores the project's styling"],
      correct: 1,
      explain: "✅ Correct! index.html is the skeleton of the page — headings, paragraphs, buttons. The browser reads this first.",
    },
    {
      file: "📂 components/ — what's inside this folder?",
      options: ["Database connection files", "Reusable UI pieces like Navbar, Button, Card", "Images and fonts"],
      correct: 1,
      explain: "✅ Correct! The components/ folder holds reusable pieces of UI — think of each one as a LEGO brick you can snap in anywhere.",
    },
    {
      file: "📄 package.json — what is this?",
      options: ["A list of all tools and libraries the project needs", "A shipping label file for postal packages", "The main app code entry point"],
      correct: 0,
      explain: "✅ Correct! package.json lists all external libraries (like React or Tailwind) and scripts like 'npm run dev'. It's the project's recipe card.",
    },
  ];

  const fgContainer = document.getElementById("fileGuesserContent");
  if (fgContainer) {
    let html = "";
    fileGuessItems.forEach(function (item, i) {
      html += `<div class="file-guesser-item" id="fg-${i}">
        <p><code>${item.file}</code></p>
        <div class="file-guesser-opts">`;
      item.options.forEach(function (opt, j) {
        html += `<button class="file-guesser-opt" data-item="${i}" data-optidx="${j}">${opt}</button>`;
      });
      html += `</div>
        <div class="file-guesser-reveal" id="fg-reveal-${i}" style="display:none; background:var(--sage-tint); border:1px solid var(--sage); color:var(--sage);"></div>
      </div>`;
    });
    fgContainer.innerHTML = html;

    fgContainer.querySelectorAll(".file-guesser-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const i = parseInt(btn.getAttribute("data-item"));
        const j = parseInt(btn.getAttribute("data-optidx"));
        const item = fileGuessItems[i];

        // Disable all options for this item
        fgContainer.querySelectorAll('.file-guesser-opt[data-item="' + i + '"]').forEach(function (b) {
          b.disabled = true;
          if (parseInt(b.getAttribute("data-optidx")) === item.correct) {
            b.classList.add("correct");
          } else if (b === btn && j !== item.correct) {
            b.classList.add("wrong");
          }
        });

        const reveal = document.getElementById("fg-reveal-" + i);
        reveal.textContent = j === item.correct ? item.explain : "❌ Not quite. " + item.explain;
        if (j !== item.correct) {
          reveal.style.background = "var(--cardinal-tint)";
          reveal.style.borderColor = "var(--cardinal)";
          reveal.style.color = "var(--cardinal-deep)";
        }
        reveal.style.display = "block";
      });
    });
  }


  /* ------------------------------------------------------------------
     M4 — BACKEND RECOMMENDER
  ------------------------------------------------------------------ */
  const backendQs = [
    {
      q: "Do you need users to log in or sign up?",
      opts: [
        { label: "Yes — email/password or social login", next: "q2a" },
        { label: "No — no user accounts needed", next: "q2b" },
      ]
    },
    {
      id: "q2a",
      q: "Do you need to store custom data (posts, orders, messages…)?",
      opts: [
        { label: "Yes, in a structured database", next: "supabase" },
        { label: "No, just auth is fine", next: "supabase" },
      ]
    },
    {
      id: "q2b",
      q: "Do you need to store any data at all?",
      opts: [
        { label: "Yes — form submissions, lists, etc.", next: "supabase" },
        { label: "No — it's a purely static site", next: "static" },
      ]
    }
  ];
  const backendResults = {
    supabase: {
      title: "🗄️ Use Supabase",
      desc: "Supabase gives you a full Postgres database, user authentication, and file storage — all via a visual dashboard. It's the simplest way to add 'backend' to a beginner project. Lovable and Bolt.new both have Supabase built in.",
    },
    static: {
      title: "📄 No backend needed!",
      desc: "A static site with no user data or logins needs no backend at all. Just build with HTML/CSS/JS or a Prompt-to-App builder, and deploy directly to Vercel or Netlify. One less thing to worry about!",
    }
  };

  const brFlow = document.getElementById("backendRecFlow");
  const brResult = document.getElementById("backendRecResult");
  const brReset = document.getElementById("backendRecReset");
  let brHistory = ["q0"];

  function renderBackendStep(qId) {
    if (!brFlow) return;
    const q = qId === "q0" ? backendQs[0] : backendQs.find(function (x) { return x.id === qId; });
    if (!q) { return showBackendResult(qId); }
    let html = `<div class="tool-picker-question"><p>${q.q}</p><div class="tool-picker-options">`;
    q.opts.forEach(function (opt) {
      html += `<button class="tool-picker-opt" data-nextstep="${opt.next}">${opt.label}</button>`;
    });
    html += `</div></div>`;
    brFlow.innerHTML = html;
    brFlow.querySelectorAll(".tool-picker-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const next = btn.getAttribute("data-nextstep");
        if (backendResults[next]) {
          showBackendResult(next);
        } else {
          renderBackendStep(next);
        }
      });
    });
  }

  function showBackendResult(key) {
    if (!brResult) return;
    const res = backendResults[key];
    brFlow.innerHTML = "";
    brResult.innerHTML = `<h4>${res.title}</h4><p>${res.desc}</p>`;
    brResult.style.display = "block";
    brReset.style.display = "inline-block";
  }

  renderBackendStep("q0");
  if (brReset) brReset.addEventListener("click", function () {
    brResult.style.display = "none";
    brReset.style.display = "none";
    renderBackendStep("q0");
  });


  /* ------------------------------------------------------------------
     M4 — SUPABASE IDEA COLLECTOR
  ------------------------------------------------------------------ */
  const tableIdeaInput = document.getElementById("tableIdeaInput");
  const tableIdeaBtn = document.getElementById("tableIdeaBtn");
  const tableIdeasList = document.getElementById("tableIdeasList");

  if (tableIdeaBtn) tableIdeaBtn.addEventListener("click", function () {
    const val = tableIdeaInput.value.trim();
    if (!val) return;
    const chip = document.createElement("span");
    chip.style.cssText = "display:inline-block; padding:5px 12px; background:var(--sage-tint); border:1px solid var(--sage); border-radius:999px; font-size:0.85rem; color:var(--sage); font-weight:600;";
    chip.textContent = val;
    tableIdeasList.appendChild(chip);
    tableIdeaInput.value = "";
    tableIdeaInput.focus();
  });

  if (tableIdeaInput) tableIdeaInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tableIdeaBtn.click();
  });


  /* ------------------------------------------------------------------
     M5 — LIVE CLEAR SCORER
  ------------------------------------------------------------------ */
  const clearPromptInput = document.getElementById("clearPromptInput");
  const clearTotalScore = document.getElementById("clearTotalScore");
  const clearIndicators = document.getElementById("clearIndicators");
  const clearTips = document.getElementById("clearTips");

  const clearDimensions = [
    {
      letter: "C",
      label: "Context",
      check: function (t) { return /project|app|site|stack|using|built|next\.?js|react|flask|python/i.test(t); },
      tip: "Add context: what project is this? What tech stack?"
    },
    {
      letter: "L",
      label: "Level",
      check: function (t) { return /beginner|explain|i'm new|don't know|simple|basic|help me understand/i.test(t); },
      tip: "Mention your level: 'I'm a beginner' or 'please explain your reasoning.'"
    },
    {
      letter: "E",
      label: "Exact Ask",
      check: function (t) { return t.split(" ").length > 8 && /\b(only|just|specifically|exact|fix|add|change|create|generate|write|make|build)\b/i.test(t); },
      tip: "Be specific: ask for ONE thing and name the exact outcome."
    },
    {
      letter: "A",
      label: "Alternatives",
      check: function (t) { return /\b(2|two|3|three|option|alternative|way|approach|or)\b/i.test(t); },
      tip: "Ask for alternatives: 'give me 2 approaches' so you can compare."
    },
    {
      letter: "R",
      label: "Review",
      check: function (t) { return /\b(explain|why|how|reasoning|what did|understand|review|check|verify)\b/i.test(t); },
      tip: "Ask for a review: 'explain what you changed and why.'"
    }
  ];

  function renderClearIndicators() {
    if (!clearIndicators) return;
    clearIndicators.innerHTML = clearDimensions.map(function (d) {
      return `<div class="clear-ind">
        <div class="clear-ind-dot" id="cind-${d.letter}">${d.letter}</div>
        <div class="clear-ind-label">${d.label}</div>
      </div>`;
    }).join("");
  }

  function updateClearScorer() {
    if (!clearPromptInput) return;
    const text = clearPromptInput.value;
    let score = 0;
    const tips = [];
    clearDimensions.forEach(function (d) {
      const passes = d.check(text);
      if (passes) score++;
      const dot = document.getElementById("cind-" + d.letter);
      if (dot) dot.className = "clear-ind-dot " + (passes ? "active" : "inactive");
      if (!passes) tips.push("💡 " + d.tip);
    });
    if (clearTotalScore) clearTotalScore.textContent = score;
    if (clearTips) {
      clearTips.innerHTML = tips.length ? "<ul style='margin:0; padding-left:18px; font-size:0.88rem; color:var(--ink-soft);'>" + tips.map(function (t) { return "<li style='margin-bottom:4px;'>" + t + "</li>"; }).join("") + "</ul>" : "<p style='color:var(--sage); font-weight:600; font-size:0.9rem;'>🎯 Excellent prompt! All 5 CLEAR dimensions covered.</p>";
    }
  }

  renderClearIndicators();
  if (clearPromptInput) {
    clearPromptInput.addEventListener("input", updateClearScorer);
    updateClearScorer();
  }


  /* ------------------------------------------------------------------
     M6 — ERROR DECODER
  ------------------------------------------------------------------ */
  const errorData = {
    "404": {
      name: "404 Not Found",
      means: "The URL or file you requested does not exist on the server. The path is wrong — either a typo in the URL, a file was renamed, or a link is broken.",
      look: "Check the URL in your browser or the file path in your link. Make sure the file actually exists and the name matches exactly (including uppercase/lowercase).",
      prompt: `I got a "404 Not Found" error when visiting [URL]. Here is my route setup:

[paste your route code here]

What could cause this 404 and what's the simplest fix?`
    },
    "undefined": {
      name: "undefined is not a function",
      means: "You called something as if it were a function, but JavaScript says it doesn't exist or isn't a function. Almost always a typo, a wrong variable name, or a missing import/require.",
      look: "Check the exact variable or function name you used. Look for typos. Make sure the thing you're calling is imported at the top of the file.",
      prompt: `I got "TypeError: undefined is not a function" in my browser console. Here's the line that caused it:

[paste the line here]

And here's the surrounding code:

[paste context here]

What's causing this and what's the simplest fix?`
    },
    "cors": {
      name: "CORS Error",
      means: "Cross-Origin Resource Sharing. Your browser blocked a request because the frontend (running on one domain/port) tried to call a backend on a different domain/port without permission.",
      look: "Look for a message like 'Access-Control-Allow-Origin'. Your backend needs to send CORS headers in its response allowing the frontend's origin.",
      prompt: `I'm getting a CORS error. My frontend is at [frontend URL] and my backend is at [backend URL]. I'm using [Flask / Node / FastAPI — choose one].

How do I fix CORS for my setup? Show me exactly which code to add to the backend.`
    },
    "fetch": {
      name: "Failed to fetch",
      means: "The fetch() call couldn't reach the server at all. Either the backend isn't running, the URL is wrong, or a network issue is blocking the connection.",
      look: "First check: is your backend server actually running? Second: is the URL in your fetch() call exactly correct (including port number)?",
      prompt: `My fetch() call is failing with "Failed to fetch". Here's the fetch code:

[paste your fetch code]

My backend URL is [URL]. What are the most common causes of this and how do I diagnose which one it is?`
    },
    "syntax": {
      name: "SyntaxError: Unexpected token",
      means: "A typo broke the structure of your code. The JavaScript parser hit something it didn't expect — usually a missing bracket, comma, quote, or semicolon.",
      look: "Look at the file and line number in the error message. Look immediately before that line too — the real mistake is often one line above where JS reports the error.",
      prompt: `I'm getting "SyntaxError: Unexpected token" on line [N] of [filename]. Here's the code around that area:

[paste 5-10 lines of code]

What's the syntax error and how do I fix it?`
    },
    "401": {
      name: "401 Unauthorized",
      means: "Your request didn't include valid authentication. The API key is missing, wrong, or expired. Or your auth token wasn't sent in the request headers.",
      look: "Check your .env file — is the API key correct? Check how you're sending the key in the request (usually in an Authorization header). Make sure python-dotenv or equivalent is loading the .env.",
      prompt: `I'm getting a 401 Unauthorized error when calling [API name]. Here's how I'm making the request:

[paste your request code, with the API key redacted as 'hf_XXXX']

How do I correctly authenticate this request?`
    }
  };

  const errorSelect = document.getElementById("errorSelect");
  const errorDecoderResult = document.getElementById("errorDecoderResult");

  if (errorSelect) {
    errorSelect.addEventListener("change", function () {
      const key = errorSelect.value;
      if (!key) { errorDecoderResult.style.display = "none"; return; }
      const data = errorData[key];
      errorDecoderResult.innerHTML = `
        <h4>🔴 ${data.name}</h4>
        <div class="err-field">
          <strong>What it means</strong>
          <p>${data.means}</p>
        </div>
        <div class="err-field">
          <strong>Where to look</strong>
          <p>${data.look}</p>
        </div>
        <div class="err-field">
          <strong>Copy-paste AI prompt</strong>
          <div class="err-prompt-box" id="errPromptBox-${key}">${escapeHtml(data.prompt)}</div>
          <button class="err-copy-btn" id="errCopyBtn-${key}">📋 Copy prompt</button>
        </div>`;
      errorDecoderResult.style.display = "block";

      const copyBtn = document.getElementById("errCopyBtn-" + key);
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          navigator.clipboard.writeText(data.prompt).then(function () {
            copyBtn.textContent = "✅ Copied!";
            setTimeout(function () { copyBtn.textContent = "📋 Copy prompt"; }, 2000);
          });
        });
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }


  /* ------------------------------------------------------------------
     M7 — FORM QUALITY VOTE
  ------------------------------------------------------------------ */
  const voteFormA = document.getElementById("voteFormA");
  const voteFormB = document.getElementById("voteFormB");
  const formVoteResult = document.getElementById("formVoteResult");

  function handleFormVote(winner) {
    document.querySelectorAll(".form-vote-btn").forEach(function (btn) {
      btn.disabled = true;
      btn.classList.add("voted");
    });
    document.getElementById("formVote" + (winner === "A" ? "A" : "B")).classList.add("voted-yes");

    const isB = winner === "B";
    formVoteResult.innerHTML = `<h4>${isB ? "✅ Great instinct — Form B is much better!" : "🤔 Most people pick Form B — here's why:"}</h4>
      <p><strong>Form A</strong> has 8 fields, no grouping, unclear labels, a generic grey button, and no trust signal. Users feel overwhelmed and suspicious.</p>
      <p><strong>Form B</strong> has just 2 fields (email + password), clear labels, a clear action button, and a reassuring note. That's <em>clarity</em>, <em>whitespace</em>, and <em>feedback</em> from the M7 principles at work.</p>
      <p>Fewer fields = more completions. A clear CTA = more confidence. This is why UX matters.</p>`;
    formVoteResult.style.display = "block";
  }

  if (voteFormA) voteFormA.addEventListener("click", function () { handleFormVote("A"); });
  if (voteFormB) voteFormB.addEventListener("click", function () { handleFormVote("B"); });


  /* ------------------------------------------------------------------
     M8 — DEPLOYMENT CHECKLIST + CONFETTI
  ------------------------------------------------------------------ */
  const checklistItems = document.querySelectorAll(".checklist-item input[type='checkbox']");
  const checklistProgressFill = document.getElementById("checklistProgressFill");
  const checklistCount = document.getElementById("checklistCount");
  const deployCompleteMsg = document.getElementById("deployCompleteMsg");
  const confettiContainer = document.getElementById("confettiContainer");

  function updateChecklist() {
    const total = checklistItems.length;
    let checked = 0;
    checklistItems.forEach(function (cb) {
      const label = cb.closest(".checklist-item");
      if (cb.checked) {
        checked++;
        label.classList.add("checked");
      } else {
        label.classList.remove("checked");
      }
    });
    const pct = Math.round((checked / total) * 100);
    if (checklistProgressFill) checklistProgressFill.style.width = pct + "%";
    if (checklistCount) checklistCount.textContent = checked;

    if (checked === total && deployCompleteMsg) {
      deployCompleteMsg.style.display = "block";
      fireConfetti();
    } else if (deployCompleteMsg) {
      deployCompleteMsg.style.display = "none";
    }
  }

  checklistItems.forEach(function (cb) {
    cb.addEventListener("change", updateChecklist);
  });

  function fireConfetti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = "";
    const colors = ["#8C1515", "#3F6152", "#9C7418", "#2563EB", "#DB2777", "#D97706"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.5 + Math.random() * 2) + "s";
      piece.style.animationDelay = (Math.random() * 0.8) + "s";
      piece.style.width = (6 + Math.random() * 8) + "px";
      piece.style.height = (6 + Math.random() * 8) + "px";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confettiContainer.appendChild(piece);
    }
    setTimeout(function () { confettiContainer.innerHTML = ""; }, 4000);
  }


  /* ------------------------------------------------------------------
     CLOSING — IDEA BOARD
  ------------------------------------------------------------------ */
  const ideaInput = document.getElementById("ideaInput");
  const ideaAddBtn = document.getElementById("ideaAddBtn");
  const ideaBoard = document.getElementById("ideaBoard");
  const ideaBoardEmpty = document.getElementById("ideaBoardEmpty");

  const rotations = [-2, 1, -1, 2, -3, 0, 1.5, -1.5];
  let ideaCount = 0;

  function addIdea() {
    if (!ideaInput) return;
    const val = ideaInput.value.trim();
    if (!val) return;
    if (ideaBoardEmpty) ideaBoardEmpty.style.display = "none";

    const sticky = document.createElement("div");
    sticky.className = "idea-sticky";
    sticky.textContent = val;
    sticky.style.transform = "rotate(" + (rotations[ideaCount % rotations.length]) + "deg)";
    ideaBoard.appendChild(sticky);
    ideaCount++;
    ideaInput.value = "";
    ideaInput.focus();
  }

  if (ideaAddBtn) ideaAddBtn.addEventListener("click", addIdea);
  if (ideaInput) ideaInput.addEventListener("keydown", function (e) { if (e.key === "Enter") addIdea(); });

});

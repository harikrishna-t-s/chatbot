/* ==========================================================================
   script.js — interactivity for the "Field Guide" learning site
   --------------------------------------------------------------------------
   Everything here is small, self-contained, and commented so a curious
   student could read this file too and understand every part of it.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------------
     1. SCROLL PROGRESS BAR
     Fills the thin bar at the top of the page based on how far down
     the document the student has scrolled.
  ------------------------------------------------------------------ */
  const progressFill = document.getElementById("progressFill");

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressFill.style.width = percent + "%";
  }

  window.addEventListener("scroll", updateProgressBar, { passive: true });
  updateProgressBar();


  /* ------------------------------------------------------------------
     2. MOBILE "CONTENTS" TOGGLE
     On small screens the table of contents is hidden off-screen.
     This button slides it into view and back out again.
  ------------------------------------------------------------------ */
  const tocToggle = document.getElementById("tocToggle");
  const tocPanel = document.getElementById("tocPanel");

  tocToggle.addEventListener("click", function () {
    const isOpen = tocPanel.classList.toggle("open");
    tocToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the mobile menu automatically once a link is tapped.
  document.querySelectorAll("#tocPanel a").forEach(function (link) {
    link.addEventListener("click", function () {
      tocPanel.classList.remove("open");
      tocToggle.setAttribute("aria-expanded", "false");
    });
  });


  /* ------------------------------------------------------------------
     3. SCROLLSPY NAVIGATION & SIDEBAR VISITED CHECKLIST
     Highlights the active link and adds a green checkmark check "✓"
     as the student scrolls past sections to gamify progress.
  ------------------------------------------------------------------ */
  const sections = document.querySelectorAll(".section[id]");
  const tocLinks = document.querySelectorAll("[data-toc]");

  const spyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          tocLinks.forEach(function (link) {
            const isActive = link.getAttribute("href") === "#" + id;
            link.classList.toggle("active", isActive);
            if (isActive) {
              link.classList.add("visited"); // Mark this section as completed
            }
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach(function (section) { spyObserver.observe(section); });


  /* ------------------------------------------------------------------
     4. ACCORDION (used in "The AI model" section)
     Clicking a question expands or collapses its answer.
  ------------------------------------------------------------------ */
  document.querySelectorAll(".accordion-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const panel = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");

      if (isOpen) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });


  /* ------------------------------------------------------------------
     5. COPY-TO-CLIPBOARD BUTTONS ON CODE BLOCKS
  ------------------------------------------------------------------ */
  document.querySelectorAll(".copy-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-copy-target");
      const codeEl = document.getElementById(targetId);
      const text = codeEl.innerText;

      navigator.clipboard.writeText(text).then(function () {
        const originalLabel = button.textContent;
        button.textContent = "Copied!";
        button.classList.add("copied");
        setTimeout(function () {
          button.textContent = originalLabel;
          button.classList.remove("copied");
        }, 1600);
      }).catch(function () {
        button.textContent = "Select & copy";
      });
    });
  });


  /* ------------------------------------------------------------------
     6. ACTIVE-LEARNING CHECKPOINT QUIZZES (Retry Mechanics)
     Allows students to try again when they make mistakes.
  ------------------------------------------------------------------ */
  document.querySelectorAll(".checkpoint").forEach(function (checkpoint) {
    const options = checkpoint.querySelectorAll(".quiz-option");
    const feedback = checkpoint.querySelector(".quiz-feedback");

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        const isCorrect = option.getAttribute("data-correct") === "true";

        if (isCorrect) {
          // Highlight correct, disable all options, display celebration
          options.forEach(function (opt) {
            opt.disabled = true;
            if (opt.getAttribute("data-correct") === "true") {
              opt.classList.add("correct");
            }
          });
          feedback.textContent = "Exactly right! 🎉";
          feedback.className = "quiz-feedback correct";
        } else {
          // Highlight only this option as incorrect, disable it, let them retry others
          option.classList.add("incorrect");
          option.disabled = true;
          feedback.textContent = "Not quite — try another option!";
          feedback.className = "quiz-feedback incorrect";
        }
      });
    });
  });


  /* ------------------------------------------------------------------
     7. FETCH DIAGRAM REPLAY (section 08)
     Re-triggers the CSS animation that moves the "POST /chat" packet
     across the wire from Browser to Flask server.
  ------------------------------------------------------------------ */
  const fetchPacket = document.getElementById("fetchPacket");
  const replayFetchBtn = document.getElementById("replayFetch");

  function playFetchAnimation() {
    fetchPacket.classList.remove("animate");
    // Force a reflow so the animation can be restarted from scratch.
    void fetchPacket.offsetWidth;
    fetchPacket.classList.add("animate");
  }

  if (replayFetchBtn) {
    replayFetchBtn.addEventListener("click", playFetchAnimation);
  }

  // Play it once automatically the first time it scrolls into view.
  const fetchObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        playFetchAnimation();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const fetchDiagram = document.querySelector(".fetch-diagram");
  if (fetchDiagram) fetchObserver.observe(fetchDiagram);


  /* ------------------------------------------------------------------
     8. FULL MESSAGE-JOURNEY ANIMATION (section 13, signature diagram)
     Draws the connecting line and moves a dot through all 8 stops,
     highlighting each stop's circle in turn and updating a caption.
  ------------------------------------------------------------------ */
  const journeyPath = document.getElementById("journeyPathAnim");
  const journeyDot = document.getElementById("journeyDot");
  const journeyStops = document.querySelectorAll(".journey-stop");
  const journeyCaption = document.getElementById("journeyCaption");
  const playJourneyBtn = document.getElementById("playJourney");

  const captions = [
    "01 — You type a message and press Send.",
    "02 — The HTML input box holds your text.",
    "03 — JavaScript reads it and calls fetch() to talk to the server.",
    "04 — Flask's /chat route receives your message.",
    "05 — Flask forwards it to the Hugging Face API.",
    "06 — The AI model predicts a reply, one token at a time.",
    "07 — Flask packages the reply as JSON and sends it back.",
    "08 — JavaScript displays the reply. Total time: usually under 2 seconds."
  ];

  let journeyRunning = false;

  function playJourney() {
    if (journeyRunning) return;
    journeyRunning = true;

    // Reset visuals.
    journeyStops.forEach(function (stop) { stop.classList.remove("active"); });
    journeyCaption.textContent = captions[0];

    const pathLength = journeyPath.getTotalLength();
    journeyPath.style.strokeDasharray = pathLength;
    journeyPath.style.strokeDashoffset = pathLength;
    journeyDot.setAttribute("opacity", "1");

    const totalDuration = 4800; // milliseconds for the whole trip
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Draw the line progressively.
      journeyPath.style.strokeDashoffset = pathLength * (1 - progress);

      // Move the dot along the path.
      const point = journeyPath.getPointAtLength(pathLength * progress);
      journeyDot.setAttribute("cx", point.x);
      journeyDot.setAttribute("cy", point.y);

      // Highlight the nearest stop and update the caption.
      const stopIndex = Math.min(
        Math.floor(progress * journeyStops.length),
        journeyStops.length - 1
      );
      journeyStops.forEach(function (stop, i) {
        stop.classList.toggle("active", i === stopIndex);
      });
      journeyCaption.textContent = captions[stopIndex];

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        journeyRunning = false;
        journeyDot.setAttribute("opacity", "0");
      }
    }

    requestAnimationFrame(step);
  }

  if (playJourneyBtn) {
    playJourneyBtn.addEventListener("click", playJourney);
  }

  // Auto-play once, gently, the first time the diagram scrolls into view.
  const journeySection = document.getElementById("message-journey");
  if (journeySection) {
    const journeyObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          playJourney();
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    journeyObserver.observe(journeySection);
  }


  /* ------------------------------------------------------------------
     9. LIGHTWEIGHT SYNTAX HIGHLIGHTING (dependency-free)
     Uses placeholder swaps to highlight code blocks safely without Prism.js.
  ------------------------------------------------------------------ */
  function applySyntaxHighlighting() {
    document.querySelectorAll("pre code").forEach(function (codeBlock) {
      let text = codeBlock.innerHTML;
      
      let comments = [];
      let strings = [];
      
      // Extract strings first (so we don't treat keywords inside strings as tokens)
      text = text.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, function (match) {
        strings.push(match);
        return `___STRING_${strings.length - 1}___`;
      });
      
      // Extract comments (Python # and JS //)
      text = text.replace(/(\/\/[^\n]*|\#[^\n]*)/g, function (match) {
        comments.push(match);
        return `___COMMENT_${comments.length - 1}___`;
      });
      
      // Highlight keywords on clean structural code
      text = text.replace(/\b(const|let|async|await|function|return|import|from|def|if|elif|else|try|except|raise|class|with|as)\b/g, '<span class="code-keyword">$1</span>');
      
      // Highlight numbers
      text = text.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="code-number">$1</span>');
      
      // Restore strings, wrapping in class
      text = text.replace(/___STRING_(\d+)___/g, function (match, index) {
        let str = strings[parseInt(index)];
        return `<span class="code-string">${str}</span>`;
      });
      
      // Restore comments, wrapping in class
      text = text.replace(/___COMMENT_(\d+)___/g, function (match, index) {
        let comment = comments[parseInt(index)];
        return `<span class="code-comment">${comment}</span>`;
      });
      
      codeBlock.innerHTML = text;
    });
  }
  
  applySyntaxHighlighting();


  /* ------------------------------------------------------------------
     10. INTERACTIVE PROMPT & TOKEN PLAYGROUND SANDBOX
     Tokenizes text in real-time, displays temperature helpers,
     and updates raw JSON request payloads dynamically.
  ------------------------------------------------------------------ */
  const sandboxPrompt = document.getElementById("sandboxPrompt");
  const sandboxTemp = document.getElementById("sandboxTemp");
  const tempValue = document.getElementById("tempValue");
  const tempHelper = document.getElementById("tempHelper");
  const sandboxMaxTokens = document.getElementById("sandboxMaxTokens");
  const maxTokensValue = document.getElementById("maxTokensValue");
  const sandboxTokens = document.getElementById("sandboxTokens");
  const tokenCount = document.getElementById("tokenCount");
  const sandboxPayload = document.getElementById("sandboxPayload");

  if (sandboxPrompt) {
    function updateSandbox() {
      const prompt = sandboxPrompt.value;
      const temp = parseFloat(sandboxTemp.value);
      const maxTokens = parseInt(sandboxMaxTokens.value);
      
      tempValue.textContent = temp.toFixed(1);
      maxTokensValue.textContent = maxTokens;
      
      // Temperature description helper
      if (temp === 0.0) tempHelper.textContent = "Strict & identical every run";
      else if (temp <= 0.3) tempHelper.textContent = "Highly predictable & repetitive";
      else if (temp <= 0.7) tempHelper.textContent = "Balanced & natural (project default)";
      else tempHelper.textContent = "Creative & occasionally unfocused";
      
      // Token visualization (words & spaces alternate background highlights)
      sandboxTokens.innerHTML = "";
      if (prompt.trim() === "") {
        sandboxTokens.innerHTML = `<span style="color: var(--ink-soft); font-style: italic;">Start typing above to see tokens...</span>`;
        tokenCount.textContent = "0";
      } else {
        const tokens = prompt.match(/\s+|\w+|[^\w\s]+/g) || [];
        tokenCount.textContent = tokens.length;
        
        tokens.forEach(function (token, index) {
          const span = document.createElement("span");
          span.textContent = token;
          span.style.padding = "2px 4.5px";
          span.style.borderRadius = "3.5px";
          span.style.fontSize = "0.85rem";
          span.style.margin = "1px";
          
          if (index % 2 === 0) {
            span.style.backgroundColor = "var(--cardinal-tint)";
            span.style.color = "var(--cardinal-deep)";
          } else {
            span.style.backgroundColor = "var(--panel)";
            span.style.color = "var(--ink)";
          }
          sandboxTokens.appendChild(span);
        });
      }
      
      // Live JSON payload preview matching OpenAI specs
      const payload = {
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          { role: "user", content: prompt || "Your prompt goes here" }
        ],
        max_tokens: maxTokens,
        temperature: temp
      };
      
      sandboxPayload.textContent = JSON.stringify(payload, null, 2);
    }
    
    sandboxPrompt.addEventListener("input", updateSandbox);
    sandboxTemp.addEventListener("input", updateSandbox);
    sandboxMaxTokens.addEventListener("input", updateSandbox);
    updateSandbox();
  }


  /* ------------------------------------------------------------------
     11. INTERACTIVE BINARY BIT-FLIPPER
     Converts typed text to 8-bit binary and updates values live as
     students click buttons to toggle electrical charges (0/1).
  ------------------------------------------------------------------ */
  const bitLetterInput = document.getElementById("bitLetterInput");
  const bitDecimal = document.getElementById("bitDecimal");
  const bitButtons = document.querySelectorAll(".bit-btn");

  if (bitLetterInput && bitDecimal) {
    function updateBitsFromInput() {
      const char = bitLetterInput.value;
      if (char.length === 0) return;
      
      const decimal = char.charCodeAt(0);
      bitDecimal.textContent = decimal;
      
      const binary = decimal.toString(2).padStart(8, '0');
      
      bitButtons.forEach(function (btn) {
        const index = parseInt(btn.getAttribute("data-index"));
        btn.textContent = binary[7 - index];
        
        // Highlight active bits (1s) to make them stand out
        if (binary[7 - index] === "1") {
          btn.style.backgroundColor = "var(--cardinal)";
          btn.style.color = "#ffffff";
          btn.style.borderColor = "var(--cardinal-deep)";
        } else {
          btn.style.backgroundColor = "var(--panel)";
          btn.style.color = "var(--ink)";
          btn.style.borderColor = "var(--line)";
        }
      });
    }

    function updateInputFromBits() {
      let decimal = 0;
      bitButtons.forEach(function (btn) {
        const index = parseInt(btn.getAttribute("data-index"));
        const bitVal = parseInt(btn.textContent);
        decimal += bitVal * Math.pow(2, index);
      });

      bitDecimal.textContent = decimal;
      const char = String.fromCharCode(decimal);
      bitLetterInput.value = char;
    }

    bitButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const val = btn.textContent === "0" ? "1" : "0";
        btn.textContent = val;
        
        if (val === "1") {
          btn.style.backgroundColor = "var(--cardinal)";
          btn.style.color = "#ffffff";
          btn.style.borderColor = "var(--cardinal-deep)";
        } else {
          btn.style.backgroundColor = "var(--panel)";
          btn.style.color = "var(--ink)";
          btn.style.borderColor = "var(--line)";
        }
        updateInputFromBits();
      });
    });

    bitLetterInput.addEventListener("input", updateBitsFromInput);
    updateBitsFromInput(); // Initialize
  }


  /* ------------------------------------------------------------------
     12. INTERACTIVE HOUSE CARD BUILDER (HTML/CSS/JS analogy)
     Simulates raw browser unstyled layouts vs painted CSS and JavaScript
     behaviors dynamically based on checkbox states.
  ------------------------------------------------------------------ */
  const houseHtml = document.getElementById("houseHtml");
  const houseCss = document.getElementById("houseCss");
  const houseJs = document.getElementById("houseJs");
  const houseCardContainer = document.getElementById("houseCardContainer");

  const rawHtmlTemplate = `
    <div id="houseTargetCard">
      <h4 id="houseCardTitle">RoboBuddy v1</h4>
      <p id="houseCardText">An assistant ready to chat.</p>
      <button id="houseCardBtn" style="cursor: pointer;">Ring Bell</button>
    </div>
  `;

  if (houseHtml && houseCardContainer) {
    function updateHouseCard() {
      // 1. HTML Rule (Structure)
      if (!houseHtml.checked) {
        houseCardContainer.innerHTML = `<div style="color: var(--ink-soft); font-style: italic; font-size: 0.9rem; text-align: center; width: 100%;">No HTML (No structure exists!)</div>`;
        return;
      }
      
      houseCardContainer.innerHTML = rawHtmlTemplate;
      
      const card = document.getElementById("houseTargetCard");
      const title = document.getElementById("houseCardTitle");
      const text = document.getElementById("houseCardText");
      const btn = document.getElementById("houseCardBtn");

      // 2. CSS Rule (Style & Paint)
      if (houseCss.checked) {
        card.style.background = "#FFFFFF";
        card.style.border = "1px solid var(--line)";
        card.style.borderRadius = "12px";
        card.style.padding = "20px";
        card.style.boxShadow = "var(--shadow)";
        card.style.fontFamily = "var(--font-body)";
        card.style.transition = "all 0.3s ease";
        
        title.style.margin = "0 0 6px 0";
        title.style.color = "var(--cardinal-deep)";
        title.style.fontFamily = "var(--font-display)";
        title.style.fontSize = "1.2rem";
        title.style.fontWeight = "600";
        
        text.style.margin = "0 0 14px 0";
        text.style.color = "var(--ink-soft)";
        text.style.fontSize = "0.9rem";
        
        btn.style.backgroundColor = "var(--cardinal)";
        btn.style.color = "#ffffff";
        btn.style.border = "none";
        btn.style.padding = "8px 16px";
        btn.style.borderRadius = "6px";
        btn.style.fontWeight = "600";
        btn.style.fontSize = "0.85rem";
        btn.style.transition = "all 0.2s ease";
      } else {
        card.style.background = "none";
        card.style.border = "none";
        card.style.borderRadius = "0";
        card.style.padding = "0";
        card.style.boxShadow = "none";
        card.style.fontFamily = "Times New Roman, serif";
        
        title.style.margin = "1em 0";
        title.style.color = "black";
        title.style.fontFamily = "Times New Roman, serif";
        title.style.fontSize = "1.17em";
        title.style.fontWeight = "bold";
        
        text.style.margin = "1em 0";
        text.style.color = "black";
        text.style.fontSize = "1rem";
        
        btn.style.backgroundColor = "initial";
        btn.style.color = "initial";
        btn.style.border = "2px solid rgb(118, 118, 118)";
        btn.style.padding = "1px 6px";
        btn.style.borderRadius = "initial";
        btn.style.fontWeight = "initial";
        btn.style.fontSize = "initial";
      }

      // 3. JS Rule (Behavior & Action)
      if (btn) {
        btn.addEventListener("click", function () {
          if (!houseJs.checked) {
            return;
          }
          
          if (houseCss.checked) {
            card.style.backgroundColor = "var(--gold-tint)";
            const origTitle = title.textContent;
            title.textContent = "🔔 Ding Dong!";
            
            setTimeout(function () {
              card.style.backgroundColor = "#FFFFFF";
              title.textContent = origTitle;
            }, 800);
          } else {
            alert("Ding Dong! (JS trigger succeeded, but unstyled alerts are the browser default!)");
          }
        });
      }
    }

    houseHtml.addEventListener("change", updateHouseCard);
    houseCss.addEventListener("change", updateHouseCard);
    houseJs.addEventListener("change", updateHouseCard);
    updateHouseCard(); // Initialize
  }


  /* ------------------------------------------------------------------
     13. INTERACTIVE API RESTAURANT WAITER GAME
     Simulates client HTTP orders traveling over the wire to
     kitchen servers via the waiter API, returning JSON plates.
  ------------------------------------------------------------------ */
  const apiMenuBtns = document.querySelectorAll(".api-menu-btn");
  const apiWaiter = document.getElementById("apiWaiter");
  const waiterBubble = document.getElementById("waiterOrderBubble");
  const clientPlate = document.getElementById("clientPlate");
  const kitchenStatus = document.getElementById("kitchenStatus");

  if (apiMenuBtns.length > 0 && apiWaiter) {
    apiMenuBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const food = btn.getAttribute("data-food");
        const itemText = food.split(" ")[1];
        
        apiMenuBtns.forEach(b => b.disabled = true);
        clientPlate.textContent = "🍽️ Waiting...";
        
        apiWaiter.style.display = "block";
        apiWaiter.style.left = "0%";
        apiWaiter.style.transform = "scaleX(1)";
        apiWaiter.textContent = "🏃‍♂️";
        
        waiterBubble.style.display = "block";
        waiterBubble.style.left = "0%";
        waiterBubble.textContent = `GET /request?item=${itemText}`;

        // 1. Waiter travels (Client -> Server)
        setTimeout(function () {
          apiWaiter.style.left = "calc(100% - 36px)";
          waiterBubble.style.left = "calc(100% - 80px)";
        }, 50);

        // 2. Waiter arrives at kitchen
        setTimeout(function () {
          kitchenStatus.textContent = "Cooking... ⏳";
          waiterBubble.textContent = "Cooking request...";
        }, 1250);

        // 3. Kitchen completes cooking (Server reply)
        setTimeout(function () {
          kitchenStatus.textContent = "Done! 🍳";
          waiterBubble.textContent = `200 OK: ${food}`;
          apiWaiter.style.transform = "scaleX(-1)"; // face left
        }, 2250);

        // 4. Waiter travels back (Server -> Client)
        setTimeout(function () {
          apiWaiter.style.left = "0%";
          waiterBubble.style.left = "0%";
        }, 2550);

        // 5. Waiter arrives back, delivers response
        setTimeout(function () {
          clientPlate.textContent = food; // Food served!
          apiWaiter.style.display = "none";
          waiterBubble.style.display = "none";
          kitchenStatus.textContent = "Idle";
          
          apiMenuBtns.forEach(b => b.disabled = false);
        }, 3800);
      });
    });
  }

});

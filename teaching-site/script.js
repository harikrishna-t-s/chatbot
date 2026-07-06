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


  /* ------------------------------------------------------------------
     14. SCROLL-TRIGGERED ENTRANCE ANIMATIONS
     Sections fade/slide in when they scroll into view.
  ------------------------------------------------------------------ */
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".section").forEach(function (s) {
    sectionObserver.observe(s);
  });


  /* ------------------------------------------------------------------
     15. BUILD THE STACK GAME (Section 02)
     Drag-reorder or use arrows to arrange layers correctly.
  ------------------------------------------------------------------ */
  const stackGame = document.getElementById("stackGame");
  const checkStackBtn = document.getElementById("checkStackBtn");
  const stackFeedback = document.getElementById("stackFeedback");
  const stackFlowAnim = document.getElementById("stackFlowAnim");

  if (stackGame && checkStackBtn) {
    let draggedItem = null;

    // Drag & Drop
    stackGame.addEventListener("dragstart", function (e) {
      draggedItem = e.target.closest(".stack-item");
      if (draggedItem) draggedItem.classList.add("dragging");
    });

    stackGame.addEventListener("dragend", function () {
      if (draggedItem) draggedItem.classList.remove("dragging");
      document.querySelectorAll(".stack-item").forEach(function (item) {
        item.classList.remove("drag-over");
      });
      draggedItem = null;
    });

    stackGame.addEventListener("dragover", function (e) {
      e.preventDefault();
      const target = e.target.closest(".stack-item");
      if (target && target !== draggedItem) {
        document.querySelectorAll(".stack-item").forEach(function (item) {
          item.classList.remove("drag-over");
        });
        target.classList.add("drag-over");
      }
    });

    stackGame.addEventListener("drop", function (e) {
      e.preventDefault();
      const target = e.target.closest(".stack-item");
      if (target && draggedItem && target !== draggedItem) {
        const items = Array.from(stackGame.children);
        const draggedIdx = items.indexOf(draggedItem);
        const targetIdx = items.indexOf(target);
        if (draggedIdx < targetIdx) {
          stackGame.insertBefore(draggedItem, target.nextSibling);
        } else {
          stackGame.insertBefore(draggedItem, target);
        }
      }
    });

    // Arrow buttons
    stackGame.addEventListener("click", function (e) {
      const btn = e.target.closest(".stack-arrow-btn");
      if (!btn) return;
      const item = btn.closest(".stack-item");
      if (btn.classList.contains("stack-up") && item.previousElementSibling) {
        stackGame.insertBefore(item, item.previousElementSibling);
      } else if (btn.classList.contains("stack-down") && item.nextElementSibling) {
        stackGame.insertBefore(item.nextElementSibling, item);
      }
    });

    checkStackBtn.addEventListener("click", function () {
      const items = Array.from(stackGame.querySelectorAll(".stack-item"));
      let allCorrect = true;
      items.forEach(function (item, index) {
        const correct = parseInt(item.getAttribute("data-correct"));
        item.classList.remove("correct-pos", "wrong-pos");
        if (index === correct) {
          item.classList.add("correct-pos");
        } else {
          item.classList.add("wrong-pos");
          allCorrect = false;
        }
      });

      if (allCorrect) {
        stackFeedback.textContent = "Perfect! 🎉 That's the correct stack order!";
        stackFeedback.style.color = "var(--sage)";
        stackFlowAnim.style.display = "flex";
      } else {
        stackFeedback.textContent = "Not quite — try rearranging. Hint: what does the user interact with first?";
        stackFeedback.style.color = "var(--cardinal-deep)";
        stackFlowAnim.style.display = "none";
      }
    });
  }


  /* ------------------------------------------------------------------
     16. AUTOCOMPLETE SIMULATOR (Section 03)
     Token-by-token text generation game.
  ------------------------------------------------------------------ */
  const acSimOutput = document.getElementById("acSimOutput");
  const acSimChoices = document.getElementById("acSimChoices");
  const acSimReset = document.getElementById("acSimReset");
  const acSimTokenCount = document.getElementById("acSimTokenCount");

  if (acSimOutput && acSimChoices) {
    const acTree = {
      _start: { text: "The best way to learn programming is", choices: [
        { word: "by", prob: "42%", next: "by" },
        { word: "to", prob: "35%", next: "to" },
        { word: "through", prob: "23%", next: "through" }
      ]},
      by: { choices: [
        { word: "building", prob: "55%", next: "by_building" },
        { word: "practicing", prob: "30%", next: "by_practicing" },
        { word: "reading", prob: "15%", next: "by_reading" }
      ]},
      to: { choices: [
        { word: "start", prob: "48%", next: "to_start" },
        { word: "write", prob: "32%", next: "to_write" },
        { word: "practice", prob: "20%", next: "to_practice" }
      ]},
      through: { choices: [
        { word: "hands-on", prob: "50%", next: "through_handson" },
        { word: "real", prob: "30%", next: "through_real" },
        { word: "consistent", prob: "20%", next: "through_consistent" }
      ]},
      by_building: { choices: [{ word: "real projects.", prob: "65%", next: "_end" }, { word: "small apps.", prob: "35%", next: "_end" }] },
      by_practicing: { choices: [{ word: "every day.", prob: "60%", next: "_end" }, { word: "with purpose.", prob: "40%", next: "_end" }] },
      by_reading: { choices: [{ word: "code examples.", prob: "55%", next: "_end" }, { word: "documentation.", prob: "45%", next: "_end" }] },
      to_start: { choices: [{ word: "small and iterate.", prob: "60%", next: "_end" }, { word: "with basics.", prob: "40%", next: "_end" }] },
      to_write: { choices: [{ word: "code daily.", prob: "55%", next: "_end" }, { word: "real programs.", prob: "45%", next: "_end" }] },
      to_practice: { choices: [{ word: "consistently.", prob: "60%", next: "_end" }, { word: "with projects.", prob: "40%", next: "_end" }] },
      through_handson: { choices: [{ word: "experience.", prob: "70%", next: "_end" }, { word: "projects.", prob: "30%", next: "_end" }] },
      through_real: { choices: [{ word: "world projects.", prob: "55%", next: "_end" }, { word: "challenges.", prob: "45%", next: "_end" }] },
      through_consistent: { choices: [{ word: "practice.", prob: "65%", next: "_end" }, { word: "effort.", prob: "35%", next: "_end" }] }
    };

    let acState = "_start";
    let acTokens = 0;

    function renderAcChoices() {
      acSimChoices.innerHTML = "";
      const node = acTree[acState];
      if (!node || !node.choices || acState === "_end") {
        acSimChoices.innerHTML = '<span style="color: var(--sage); font-weight: 600; font-family: var(--font-mono); font-size: 0.88rem;">✓ Generation complete! The AI reached the end of its prediction.</span>';
        return;
      }
      node.choices.forEach(function (choice) {
        const btn = document.createElement("button");
        btn.className = "ac-sim-choice";
        btn.innerHTML = choice.word + '<span class="ac-sim-prob">' + choice.prob + '</span>';
        btn.addEventListener("click", function () {
          // Add word to output
          const span = document.createElement("span");
          span.className = "ac-sim-generated";
          span.textContent = " " + choice.word;
          // Remove old cursor
          const cursor = acSimOutput.querySelector(".ac-sim-cursor-blink");
          if (cursor) acSimOutput.removeChild(cursor);
          acSimOutput.appendChild(span);
          // Re-add cursor
          const newCursor = document.createElement("span");
          newCursor.className = "ac-sim-cursor-blink";
          acSimOutput.appendChild(newCursor);

          acTokens++;
          acSimTokenCount.textContent = "Tokens generated: " + acTokens;
          acState = choice.next;
          renderAcChoices();
        });
        acSimChoices.appendChild(btn);
      });
    }

    function resetAcSim() {
      acState = "_start";
      acTokens = 0;
      acSimTokenCount.textContent = "Tokens generated: 0";
      acSimOutput.innerHTML = '<span class="ac-sim-base">' + acTree._start.text + '</span><span class="ac-sim-cursor-blink"></span>';
      renderAcChoices();
    }

    acSimReset.addEventListener("click", resetAcSim);
    renderAcChoices();
  }


  /* ------------------------------------------------------------------
     17. DOM TREE EXPLORER (Section 06)
     Click elements to highlight in DOM tree.
  ------------------------------------------------------------------ */
  const domPreview = document.getElementById("domPreview");
  const domTree = document.getElementById("domTree");
  const domInfo = document.getElementById("domExplorerInfo");

  if (domPreview && domTree) {
    domPreview.addEventListener("click", function (e) {
      const el = e.target.closest("[data-node]");
      if (!el) return;
      e.stopPropagation();
      const nodeName = el.getAttribute("data-node");

      // Highlight in preview
      domPreview.querySelectorAll(".dom-active").forEach(function (d) { d.classList.remove("dom-active"); });
      el.classList.add("dom-active");

      // Highlight in tree
      domTree.querySelectorAll(".dom-tree-active").forEach(function (d) { d.classList.remove("dom-tree-active"); });
      const treeNode = domTree.querySelector('[data-for="' + nodeName + '"]');
      if (treeNode) {
        treeNode.classList.add("dom-tree-active");
        treeNode.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      domInfo.textContent = "Selected: <" + nodeName + "> — This element is node #" + el.getAttribute("data-depth") + " deep in the tree.";
    });
  }


  /* ------------------------------------------------------------------
     18. ROUTE TESTER SIMULATOR (Section 07)
     Simulates Flask route responses.
  ------------------------------------------------------------------ */
  const routeMethod = document.getElementById("routeMethod");
  const routeInput = document.getElementById("routeInput");
  const routeSendBtn = document.getElementById("routeSendBtn");
  const routeResponse = document.getElementById("routeResponse");

  if (routeSendBtn && routeInput) {
    routeSendBtn.addEventListener("click", function () {
      const method = routeMethod ? routeMethod.value : "GET";
      const route = routeInput.value.trim() || "/";
      routeResponse.style.display = "block";

      let output = "";
      if (route === "/" && method === "GET") {
        output = '<span class="route-status-ok">HTTP/1.1 200 OK</span>\nContent-Type: text/html\n\n→ Flask calls: render_template("index.html")\n→ Returns: Your complete chat page HTML\n\n<span class="route-status-info">💡 This is what happens when you open the chatbot in your browser!</span>';
      } else if (route === "/chat" && method === "POST") {
        output = '<span class="route-status-ok">HTTP/1.1 200 OK</span>\nContent-Type: application/json\n\n→ Flask reads: request.get_json()["message"]\n→ Calls: ask_huggingface(user_message)\n→ Returns: {"reply": "Hello! How can I help?"}\n\n<span class="route-status-info">💡 This runs every time you click "Send" in the chatbot!</span>';
      } else if (route === "/chat" && method === "GET") {
        output = '<span class="route-status-err">HTTP/1.1 405 METHOD NOT ALLOWED</span>\n\n→ The /chat route only accepts POST requests.\n→ GET is for reading data, POST is for sending data.\n\n<span class="route-status-info">💡 That\'s why script.js uses method: "POST" in fetch()!</span>';
      } else if (route === "/clear" && method === "POST") {
        output = '<span class="route-status-ok">HTTP/1.1 200 OK</span>\nContent-Type: application/json\n\n→ Flask clears: session["history"] = []\n→ Returns: {"status": "cleared"}\n\n<span class="route-status-info">💡 This resets the AI\'s memory of your conversation!</span>';
      } else {
        output = '<span class="route-status-err">HTTP/1.1 404 NOT FOUND</span>\n\n→ Flask has no route for "' + method + ' ' + route + '"\n→ Available routes: / (GET), /chat (POST), /clear (POST)\n\n<span class="route-status-info">💡 Flask only responds to routes you\'ve defined in app.py!</span>';
      }
      routeResponse.innerHTML = output;
    });
  }


  /* ------------------------------------------------------------------
     19. API KEY VALIDATOR (Section 10)
     Simulates API key format validation.
  ------------------------------------------------------------------ */
  const apiKeyInput = document.getElementById("apiKeyInput");
  const apiKeyValidateBtn = document.getElementById("apiKeyValidateBtn");
  const apiKeyResult = document.getElementById("apiKeyResult");

  if (apiKeyValidateBtn && apiKeyInput) {
    function validateApiKey(key) {
      apiKeyResult.style.display = "block";
      if (!key || key.trim() === "") {
        apiKeyResult.innerHTML = '<div style="color: var(--cardinal-deep);"><strong>❌ Empty key!</strong><br>No API key provided. Hugging Face would return: <code>401 Unauthorized</code><br><small>Your .env file needs: HF_API_KEY=hf_your_key_here</small></div>';
        apiKeyResult.style.borderColor = "var(--cardinal)";
      } else if (key.startsWith("hf_") && key.length >= 20) {
        apiKeyResult.innerHTML = '<div style="color: var(--sage);"><strong>✅ Valid format!</strong><br>This looks like a real Hugging Face API key.<br>The server would respond: <code>200 OK</code> — "Hello! I\'m your AI assistant."<br><small>Keys start with "hf_" and are 30+ characters long.</small></div>';
        apiKeyResult.style.borderColor = "var(--sage)";
      } else if (key.startsWith("sk-")) {
        apiKeyResult.innerHTML = '<div style="color: var(--gold);"><strong>⚠️ Wrong provider!</strong><br>This looks like an OpenAI key (starts with "sk-"), not a Hugging Face key.<br>Hugging Face keys start with "hf_".<br><small>Different AI platforms have different key formats.</small></div>';
        apiKeyResult.style.borderColor = "var(--gold)";
      } else {
        apiKeyResult.innerHTML = '<div style="color: var(--cardinal-deep);"><strong>❌ Invalid format!</strong><br>Hugging Face would return: <code>401 Unauthorized</code><br>Expected format: starts with "hf_" + at least 20 characters.<br><small>Example: hf_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456</small></div>';
        apiKeyResult.style.borderColor = "var(--cardinal)";
      }
    }

    apiKeyValidateBtn.addEventListener("click", function () { validateApiKey(apiKeyInput.value); });

    var apiKeyTryValid = document.getElementById("apiKeyTryValid");
    var apiKeyTryInvalid = document.getElementById("apiKeyTryInvalid");
    var apiKeyTryExposed = document.getElementById("apiKeyTryExposed");

    if (apiKeyTryValid) apiKeyTryValid.addEventListener("click", function () {
      apiKeyInput.value = "hf_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456";
      validateApiKey(apiKeyInput.value);
    });

    if (apiKeyTryInvalid) apiKeyTryInvalid.addEventListener("click", function () {
      apiKeyInput.value = "my-secret-key-123";
      validateApiKey(apiKeyInput.value);
    });

    if (apiKeyTryExposed) apiKeyTryExposed.addEventListener("click", function () {
      apiKeyInput.value = "hf_LEAKED_KEY_aBcDeFgHiJk_oops";
      apiKeyResult.style.display = "block";
      apiKeyResult.style.borderColor = "var(--cardinal)";
      apiKeyResult.innerHTML = '<div style="color: var(--cardinal-deep);"><strong>🚨 DANGER: Key Exposure Simulation!</strong><br><br>If this key was pushed to GitHub, anyone could:<br>• Use your Hugging Face account for free<br>• Run up charges on your API billing<br>• Access any private models on your account<br><br><strong>This is why .env is in .gitignore!</strong><br><small>Real leaked keys get auto-detected and revoked by services like GitHub.</small></div>';
    });
  }


  /* ------------------------------------------------------------------
     20. INTERACTIVE FILE EXPLORER (Section 12)
     VS Code-style file tree with previews.
  ------------------------------------------------------------------ */
  const fileExplorerTree = document.getElementById("fileExplorerTree");
  const fePreviewHeader = document.getElementById("fePreviewHeader");
  const fePreviewCode = document.getElementById("fePreviewCode");
  const fePreviewDesc = document.getElementById("fePreviewDesc");

  if (fileExplorerTree) {
    const fileData = {
      "app.py": {
        code: '@app.route("/chat", methods=["POST"])\ndef chat():\n    data = request.get_json()\n    user_message = data["message"]\n    reply = ask_huggingface(user_message)\n    return jsonify({"reply": reply})',
        desc: "The entire backend — receives messages, talks to AI, sends replies back."
      },
      "index.html": {
        code: '<div class="chat-container">\n  <div id="chat-messages"></div>\n  <div class="input-area">\n    <input id="user-input" />\n    <button id="send-btn">Send</button>\n  </div>\n</div>',
        desc: "The HTML structure — chat window, message area, input box, and send button."
      },
      "style.css": {
        code: '.chat-container {\n  background: #000;\n  border-radius: 16px;\n  max-width: 600px;\n  margin: 0 auto;\n}\n.message { padding: 12px 16px; }',
        desc: "All visual styling — dark background, rounded corners, message bubbles."
      },
      "script.js": {
        code: 'async function sendMessage() {\n  const message = input.value;\n  const res = await fetch("/chat", {\n    method: "POST",\n    body: JSON.stringify({ message })\n  });\n  const data = await res.json();\n  displayReply(data.reply);\n}',
        desc: "Frontend brain — reads input, calls fetch(), displays the AI's reply."
      },
      "requirements.txt": {
        code: 'flask\npython-dotenv\nrequests',
        desc: "Lists Python packages the project needs — install with pip install -r requirements.txt"
      },
      ".env": {
        code: 'HF_API_KEY=hf_your_secret_key_here\nMODEL_NAME=HuggingFaceH4/zephyr-7b-beta',
        desc: "🔒 Secret config — your API key and model name. Never commit this file!"
      },
      ".gitignore": {
        code: '.env\nvenv/\n__pycache__/\n*.pyc',
        desc: "Tells Git which files to ignore — protects secrets and junk files."
      }
    };

    fileExplorerTree.addEventListener("click", function (e) {
      const item = e.target.closest(".fe-file");
      if (!item) return;
      const fileName = item.getAttribute("data-file");
      const data = fileData[fileName];
      if (!data) return;

      fileExplorerTree.querySelectorAll(".fe-active").forEach(function (i) { i.classList.remove("fe-active"); });
      item.classList.add("fe-active");

      fePreviewHeader.textContent = fileName;
      fePreviewCode.querySelector("code").textContent = data.code;
      fePreviewDesc.textContent = data.desc;
    });
  }


  /* ------------------------------------------------------------------
     21. PROMPT IMPROVER CHALLENGE (Section 14)
     Live prompt scoring based on specificity criteria.
  ------------------------------------------------------------------ */
  const promptInput = document.getElementById("promptImproverInput");
  const promptScore = document.getElementById("promptScore");
  const promptScoreBar = document.getElementById("promptScoreBar");
  const promptChecklist = document.getElementById("promptChecklist");
  const promptHintBtn = document.getElementById("promptImproverHint");

  if (promptInput && promptChecklist) {
    const criteria = [
      { label: "Mentions a framework", keywords: ["flask", "django", "express", "react", "next"], hint: "Try mentioning Flask or another framework." },
      { label: "Specifies a route/endpoint", keywords: ["/chat", "/api", "route", "endpoint", "post", "get"], hint: 'Mention a specific route like "/chat".' },
      { label: "Mentions data format", keywords: ["json", "data", "request", "response", "payload"], hint: "Specify JSON or data format." },
      { label: "Includes error handling", keywords: ["error", "handling", "missing", "invalid", "check", "validate"], hint: "Add error handling for edge cases." },
      { label: "Names the AI service", keywords: ["hugging face", "huggingface", "openai", "api", "inference"], hint: "Name the AI service (e.g., Hugging Face)." },
      { label: "Describes behavior", keywords: ["forward", "return", "send", "receive", "reply", "respond", "generate"], hint: 'Describe what the code should do, like "forward messages and return replies".' }
    ];

    let hintIndex = 0;

    function scorePrompt() {
      const text = promptInput.value.toLowerCase();
      let score = 0;
      promptChecklist.innerHTML = "";

      criteria.forEach(function (c) {
        const matched = c.keywords.some(function (kw) { return text.includes(kw); });
        if (matched) score++;
        const div = document.createElement("div");
        div.className = "prompt-checklist-item" + (matched ? " checked" : "");
        div.innerHTML = '<span class="check-icon">' + (matched ? "✓" : "") + '</span>' + c.label;
        promptChecklist.appendChild(div);
      });

      promptScore.textContent = score + "/6";
      const pct = (score / 6) * 100;
      promptScoreBar.style.width = pct + "%";
      if (score >= 5) {
        promptScoreBar.style.background = "var(--sage)";
      } else if (score >= 3) {
        promptScoreBar.style.background = "var(--gold)";
      } else {
        promptScoreBar.style.background = "var(--cardinal)";
      }
    }

    promptInput.addEventListener("input", scorePrompt);
    scorePrompt();

    if (promptHintBtn) {
      promptHintBtn.addEventListener("click", function () {
        const text = promptInput.value.toLowerCase();
        // Find first unmatched criterion
        for (var i = 0; i < criteria.length; i++) {
          var idx = (hintIndex + i) % criteria.length;
          var matched = criteria[idx].keywords.some(function (kw) { return text.includes(kw); });
          if (!matched) {
            promptHintBtn.textContent = "💡 " + criteria[idx].hint;
            hintIndex = idx + 1;
            setTimeout(function () { promptHintBtn.textContent = "💡 Give me a hint"; }, 3000);
            return;
          }
        }
        promptHintBtn.textContent = "🎉 All criteria met!";
        setTimeout(function () { promptHintBtn.textContent = "💡 Give me a hint"; }, 2000);
      });
    }
  }


  /* ------------------------------------------------------------------
     22. DEBUG CHALLENGE (Section 15)
     Find the buggy line in a code snippet.
  ------------------------------------------------------------------ */
  const debugCode = document.getElementById("debugCode");
  const debugAttempts = document.getElementById("debugAttempts");
  const debugFeedback = document.getElementById("debugFeedback");
  const debugHintBtn = document.getElementById("debugHintBtn");
  const debugResetBtn = document.getElementById("debugResetBtn");

  if (debugCode) {
    let attemptsLeft = 3;
    let debugSolved = false;

    debugCode.addEventListener("click", function (e) {
      if (debugSolved) return;
      const line = e.target.closest(".debug-line");
      if (!line || line.classList.contains("not-bug") || line.classList.contains("bug-correct")) return;

      const isBuggy = line.getAttribute("data-buggy") === "true";

      if (isBuggy) {
        line.classList.add("bug-correct");
        debugFeedback.textContent = '🎉 Found it! "mesage" should be "message" — a classic typo that causes a KeyError crash!';
        debugFeedback.style.color = "var(--sage)";
        debugSolved = true;
      } else {
        line.classList.add("not-bug");
        attemptsLeft--;
        debugAttempts.textContent = "Attempts left: " + attemptsLeft;
        debugFeedback.textContent = "Not that line — look more carefully at the spelling!";
        debugFeedback.style.color = "var(--cardinal-deep)";
        if (attemptsLeft <= 0) {
          debugFeedback.textContent = 'Out of attempts! The bug is on line 4: "mesage" should be "message".';
          debugCode.querySelector('[data-buggy="true"]').classList.add("bug-found");
          debugResetBtn.style.display = "inline-flex";
        }
      }
    });

    if (debugHintBtn) {
      debugHintBtn.addEventListener("click", function () {
        debugFeedback.textContent = "🔍 Hint: Look very carefully at the dictionary key string on line 4...";
        debugFeedback.style.color = "var(--gold)";
      });
    }

    if (debugResetBtn) {
      debugResetBtn.addEventListener("click", function () {
        attemptsLeft = 3;
        debugSolved = false;
        debugAttempts.textContent = "Attempts left: 3";
        debugFeedback.textContent = "";
        debugResetBtn.style.display = "none";
        debugCode.querySelectorAll(".debug-line").forEach(function (l) {
          l.classList.remove("not-bug", "bug-found", "bug-correct");
        });
      });
    }
  }


  /* ------------------------------------------------------------------
     23. GLOSSARY SEARCH + FLASHCARD MODE (Section 16)
     Live filter and card-flipping study mode.
  ------------------------------------------------------------------ */
  const glossarySearch = document.getElementById("glossarySearch");
  const glossaryGrid = document.getElementById("glossaryGrid");
  const flashcardToggle = document.getElementById("glossaryFlashcardToggle");
  const flashcardSection = document.getElementById("glossaryFlashcard");
  const flashcard = document.getElementById("flashcard");
  const flashcardFront = document.getElementById("flashcardFront");
  const flashcardBack = document.getElementById("flashcardBack");
  const flashcardCounter = document.getElementById("flashcardCounter");
  const flashcardPrev = document.getElementById("flashcardPrev");
  const flashcardNext = document.getElementById("flashcardNext");

  if (glossarySearch && glossaryGrid) {
    glossarySearch.addEventListener("input", function () {
      const query = glossarySearch.value.toLowerCase();
      glossaryGrid.querySelectorAll(".gloss-item").forEach(function (item) {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? "" : "none";
      });
    });
  }

  if (flashcardToggle && flashcardSection && glossaryGrid) {
    let flashcardMode = false;
    let cardIndex = 0;
    let glossaryItems = [];

    function collectGlossaryItems() {
      glossaryItems = [];
      glossaryGrid.querySelectorAll(".gloss-item").forEach(function (item) {
        var dt = item.querySelector("dt");
        var dd = item.querySelector("dd");
        if (dt && dd) {
          glossaryItems.push({ term: dt.textContent, def: dd.textContent });
        }
      });
    }

    function showCard() {
      if (glossaryItems.length === 0) return;
      flashcard.classList.remove("flipped");
      flashcardFront.textContent = glossaryItems[cardIndex].term;
      flashcardBack.textContent = glossaryItems[cardIndex].def;
      flashcardCounter.textContent = (cardIndex + 1) + " / " + glossaryItems.length;
    }

    flashcardToggle.addEventListener("click", function () {
      flashcardMode = !flashcardMode;
      if (flashcardMode) {
        collectGlossaryItems();
        flashcardSection.style.display = "block";
        glossaryGrid.style.display = "none";
        flashcardToggle.textContent = "📋 Grid Mode";
        cardIndex = 0;
        showCard();
      } else {
        flashcardSection.style.display = "none";
        glossaryGrid.style.display = "";
        flashcardToggle.textContent = "🃏 Flashcard Mode";
      }
    });

    if (flashcard) {
      flashcard.addEventListener("click", function () {
        flashcard.classList.toggle("flipped");
      });
    }

    if (flashcardPrev) {
      flashcardPrev.addEventListener("click", function () {
        if (glossaryItems.length === 0) return;
        cardIndex = (cardIndex - 1 + glossaryItems.length) % glossaryItems.length;
        showCard();
      });
    }

    if (flashcardNext) {
      flashcardNext.addEventListener("click", function () {
        if (glossaryItems.length === 0) return;
        cardIndex = (cardIndex + 1) % glossaryItems.length;
        showCard();
      });
    }
  }


  /* ------------------------------------------------------------------
     24. INTERACTIVE SKILL MAP (Section 17)
     Clickable topics with expandable details.
  ------------------------------------------------------------------ */
  const skillMap = document.getElementById("skillMap");
  const skillPathSummary = document.getElementById("skillPathSummary");
  const skillPathList = document.getElementById("skillPathList");

  if (skillMap) {
    const skills = [
      { id: "python", emoji: "🐍", name: "Python", desc: "Variables, loops, functions, data structures", time: "4-6 weeks" },
      { id: "git", emoji: "📦", name: "Git & GitHub", desc: "Version control, branches, collaboration", time: "1-2 weeks" },
      { id: "js", emoji: "⚡", name: "JavaScript", desc: "DOM manipulation, async/await, ES6+", time: "4-6 weeks" },
      { id: "db", emoji: "🗄️", name: "Databases", desc: "SQLite, PostgreSQL, queries, schemas", time: "3-4 weeks" },
      { id: "react", emoji: "⚛️", name: "React", desc: "Components, state, hooks, routing", time: "4-6 weeks" },
      { id: "ml", emoji: "🤖", name: "Machine Learning", desc: "Training models, neural networks, datasets", time: "8-12 weeks" },
      { id: "security", emoji: "🔐", name: "Cybersecurity", desc: "Auth, encryption, OWASP, threat modeling", time: "3-4 weeks" },
      { id: "cloud", emoji: "☁️", name: "Cloud Deploy", desc: "Docker, Heroku, AWS, CI/CD", time: "2-3 weeks" }
    ];

    const selectedSkills = new Set();

    skills.forEach(function (skill) {
      const card = document.createElement("div");
      card.className = "skill-card";
      card.setAttribute("data-skill", skill.id);
      card.innerHTML = '<div class="skill-card-check"></div><div class="skill-card-emoji">' + skill.emoji + '</div><h5>' + skill.name + '</h5><p>' + skill.desc + '</p><p style="margin-top: 6px; font-size: 0.75rem; color: var(--ink-faint);">⏱ ' + skill.time + '</p>';
      
      card.addEventListener("click", function () {
        if (selectedSkills.has(skill.id)) {
          selectedSkills.delete(skill.id);
          card.classList.remove("selected");
          card.querySelector(".skill-card-check").textContent = "";
        } else {
          selectedSkills.add(skill.id);
          card.classList.add("selected");
          card.querySelector(".skill-card-check").textContent = "✓";
        }
        updateSkillPath();
      });

      skillMap.appendChild(card);
    });

    function updateSkillPath() {
      if (selectedSkills.size === 0) {
        skillPathSummary.style.display = "none";
        return;
      }
      skillPathSummary.style.display = "block";
      skillPathList.innerHTML = "";
      let totalWeeks = 0;
      skills.forEach(function (skill) {
        if (selectedSkills.has(skill.id)) {
          const weeks = parseInt(skill.time);
          totalWeeks += weeks;
          const item = document.createElement("div");
          item.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--sage-tint); border: 1px solid var(--sage); border-radius: var(--radius-sm); font-size: 0.9rem;";
          item.innerHTML = '<span style="font-size: 1.2rem;">' + skill.emoji + '</span><strong>' + skill.name + '</strong><span style="margin-left: auto; font-size: 0.8rem; color: var(--ink-soft);">~' + skill.time + '</span>';
          skillPathList.appendChild(item);
        }
      });
      const summary = document.createElement("div");
      summary.style.cssText = "padding: 10px 14px; background: var(--cardinal-tint); border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; color: var(--cardinal-deep); text-align: center;";
      summary.textContent = "📚 " + selectedSkills.size + " topics selected • Estimated time: ~" + totalWeeks + "+ weeks";
      skillPathList.appendChild(summary);
    }
  }

  /* ------------------------------------------------------------------
     25. CLIENT-SERVER REQUEST-RESPONSE SIMULATOR (Section 05)
  ------------------------------------------------------------------ */
  const csBtnMenu = document.getElementById("csBtnMenu");
  const csBtnSubmit = document.getElementById("csBtnSubmit");
  const csPacket = document.getElementById("csPacket");
  const csVisualizerStatus = document.getElementById("csVisualizerStatus");

  let csAnimating = false;

  function runCsSimulation(method, path, responseText, processText) {
    if (csAnimating) return;
    csAnimating = true;

    csBtnMenu.disabled = true;
    csBtnSubmit.disabled = true;

    // Reset packet state
    csPacket.classList.remove("sending", "returning");
    csPacket.textContent = `${method} ${path}`;
    csPacket.style.opacity = "0";

    // Start sending
    csVisualizerStatus.textContent = `Status: Sending Request (${method} ${path}) to Server...`;
    void csPacket.offsetWidth; // force reflow
    csPacket.classList.add("sending");
    csPacket.style.opacity = "1";

    // Arrives at server (1.5s)
    setTimeout(function() {
      csVisualizerStatus.textContent = `Status: Server processing request... [${processText}]`;
      csPacket.classList.remove("sending");
      csPacket.style.opacity = "0";
      
      // Wait for server processing, then prepare response packet (1.2s)
      setTimeout(function() {
        csPacket.textContent = responseText;
        csPacket.classList.add("returning");
        csPacket.style.opacity = "1";
        csVisualizerStatus.textContent = `Status: Server returning Response (${responseText})...`;

        // Arrives back at client (1.5s)
        setTimeout(function() {
          csPacket.classList.remove("returning");
          csPacket.style.opacity = "0";
          csVisualizerStatus.textContent = `Status: Client rendered response data successfully! (Completed conversation loop)`;
          csBtnMenu.disabled = false;
          csBtnSubmit.disabled = false;
          csAnimating = false;
        }, 1500);

      }, 1200);

    }, 1500);
  }

  if (csBtnMenu && csBtnSubmit) {
    csBtnMenu.addEventListener("click", function() {
      runCsSimulation("GET", "/menu", "200 OK (Burger, Pizza, Ice Cream)", "Kitchen looking up items in pantry");
    });
    csBtnSubmit.addEventListener("click", function() {
      runCsSimulation("POST", "/order", "201 Created (Order #41)", "Kitchen cooking Pizza! 🍕");
    });
  }

  /* ------------------------------------------------------------------
     26. UI/UX QUALITY OPTIMIZER SANDBOX (Section 06)
  ------------------------------------------------------------------ */
  const uxContrast = document.getElementById("uxContrast");
  const uxSpacing = document.getElementById("uxSpacing");
  const uxFeedback = document.getElementById("uxFeedback");
  const uxTypography = document.getElementById("uxTypography");

  const uiuxMockCard = document.getElementById("uiuxMockCard");
  const uiuxMockTitle = document.getElementById("uiuxMockTitle");
  const uiuxMockDesc = document.getElementById("uiuxMockDesc");
  const uiuxMockInput = document.getElementById("uiuxMockInput");
  const uiuxMockButton = document.getElementById("uiuxMockButton");
  const uiuxMockFeedback = document.getElementById("uiuxMockFeedback");

  function updateUiuxOptimizer() {
    if (!uiuxMockCard) return;

    // Contrast
    if (uxContrast.checked) {
      uiuxMockCard.style.backgroundColor = "#FFFFFF";
      uiuxMockCard.style.color = "var(--ink)";
      uiuxMockTitle.style.color = "var(--cardinal-deep)";
      uiuxMockDesc.style.color = "var(--ink-soft)";
      uiuxMockInput.style.borderColor = "var(--line)";
      uiuxMockInput.style.backgroundColor = "var(--paper)";
      uiuxMockInput.style.color = "var(--ink)";
      uiuxMockButton.style.backgroundColor = "var(--cardinal)";
      uiuxMockButton.style.color = "#FFFFFF";
    } else {
      uiuxMockCard.style.backgroundColor = "#e0e0e0";
      uiuxMockCard.style.color = "#a0a0a0"; // poor contrast
      uiuxMockTitle.style.color = "#a0a0a0";
      uiuxMockDesc.style.color = "#c0c0c0";
      uiuxMockInput.style.borderColor = "#c0c0c0";
      uiuxMockInput.style.backgroundColor = "#d8d8d8";
      uiuxMockInput.style.color = "#a0a0a0";
      uiuxMockButton.style.backgroundColor = "#cccccc";
      uiuxMockButton.style.color = "#e8e8e8";
    }

    // Spacing & Corners
    if (uxSpacing.checked) {
      uiuxMockCard.style.padding = "24px";
      uiuxMockCard.style.borderRadius = "var(--radius)";
      uiuxMockCard.style.boxShadow = "var(--shadow)";
      uiuxMockInput.style.padding = "10px 14px";
      uiuxMockInput.style.borderRadius = "var(--radius-sm)";
      uiuxMockButton.style.padding = "10px 20px";
      uiuxMockButton.style.borderRadius = "var(--radius-sm)";
    } else {
      uiuxMockCard.style.padding = "8px";
      uiuxMockCard.style.borderRadius = "0";
      uiuxMockCard.style.boxShadow = "none";
      uiuxMockInput.style.padding = "2px";
      uiuxMockInput.style.borderRadius = "0";
      uiuxMockButton.style.padding = "2px 4px";
      uiuxMockButton.style.borderRadius = "0";
    }

    // Typography
    if (uxTypography.checked) {
      uiuxMockCard.style.fontFamily = "var(--font-body)";
      uiuxMockTitle.style.fontFamily = "var(--font-display)";
      uiuxMockTitle.style.fontSize = "1.3rem";
      uiuxMockTitle.style.fontWeight = "600";
      uiuxMockDesc.style.fontSize = "0.95rem";
      uiuxMockInput.style.fontFamily = "var(--font-body)";
      uiuxMockButton.style.fontFamily = "var(--font-body)";
      uiuxMockButton.style.fontWeight = "600";
    } else {
      uiuxMockCard.style.fontFamily = '"Times New Roman", Times, serif';
      uiuxMockTitle.style.fontFamily = '"Times New Roman", Times, serif';
      uiuxMockTitle.style.fontSize = "1.1rem";
      uiuxMockTitle.style.fontWeight = "bold";
      uiuxMockDesc.style.fontSize = "0.8rem";
      uiuxMockInput.style.fontFamily = '"Times New Roman", Times, serif';
      uiuxMockButton.style.fontFamily = '"Times New Roman", Times, serif';
      uiuxMockButton.style.fontWeight = "normal";
    }

    // Hover & Transitions
    if (uxFeedback.checked) {
      uiuxMockButton.style.transition = "all 0.2s ease";
      uiuxMockCard.style.transition = "all 0.3s ease";
    } else {
      uiuxMockButton.style.transition = "none";
      uiuxMockCard.style.transition = "none";
    }
  }

  if (uxContrast) {
    [uxContrast, uxSpacing, uxFeedback, uxTypography].forEach(cb => {
      cb.addEventListener("change", updateUiuxOptimizer);
    });
    updateUiuxOptimizer(); // Initialize
  }

  if (uiuxMockButton) {
    uiuxMockButton.addEventListener("click", function() {
      if (uxFeedback.checked) {
        uiuxMockButton.disabled = true;
        const oldText = uiuxMockButton.textContent;
        uiuxMockButton.textContent = "Loading...";
        uiuxMockFeedback.textContent = "";
        
        setTimeout(function() {
          uiuxMockButton.disabled = false;
          uiuxMockButton.textContent = oldText;
          uiuxMockFeedback.textContent = "✓ Successfully subscribed! (Clear, immediate visual feedback)";
          uiuxMockFeedback.style.color = "var(--sage)";
        }, 1000);
      } else {
        uiuxMockFeedback.textContent = "Subscribed.";
        uiuxMockFeedback.style.color = "initial";
      }
    });
  }

  /* ------------------------------------------------------------------
     27. INTERACTIVE DATABASE SIMULATOR (Section 07)
  ------------------------------------------------------------------ */
  const dbInputName = document.getElementById("dbInputName");
  const dbBtnInsert = document.getElementById("dbBtnInsert");
  const dbConsole = document.getElementById("dbConsole");
  const dbTable = document.getElementById("dbTable");

  let mockDbIdCounter = 2; // admin (1), instructor (2)

  if (dbBtnInsert && dbInputName && dbConsole && dbTable) {
    dbBtnInsert.addEventListener("click", function() {
      const name = dbInputName.value.trim().toLowerCase();
      if (!name) {
        dbConsole.textContent = "ERROR: Cannot insert empty name.\nType a name and try again.";
        return;
      }

      mockDbIdCounter++;
      const currentId = mockDbIdCounter;

      // 1. Log query construction
      dbConsole.textContent = `
-- Constructing SQL Query...
INSERT INTO users (username, role)
VALUES ('${name}', 'student');

-- Executing Query on Database...
-- ID ${currentId} assigned automatically (AUTOINCREMENT)
QUERY OK, 1 row affected (0.04 sec)
      `.trim();

      // 2. Append row to Table
      const tbody = dbTable.querySelector("tbody");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${currentId}</td>
        <td>${name}</td>
        <td>student</td>
      `;
      tr.style.backgroundColor = "var(--sage-tint)";
      tr.style.transition = "background-color 0.8s";
      tbody.appendChild(tr);

      setTimeout(function() {
        tr.style.backgroundColor = "transparent";
      }, 800);

      dbInputName.value = ""; // clear input
    });
  }

  /* ------------------------------------------------------------------
     28. FRAMEWORKS EXPLORER TABS & SIMULATION RUNNER (Section 08)
  ------------------------------------------------------------------ */
  const frameworkTabBtns = document.querySelectorAll(".framework-tab-btn");
  const frameworkPanes = document.querySelectorAll(".framework-pane");

  frameworkTabBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const tabName = btn.getAttribute("data-tab");
      
      // Toggle tab header active class
      frameworkTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Toggle tab panes active class
      frameworkPanes.forEach(pane => {
        if (pane.id === `pane-${tabName}`) {
          pane.classList.add("active");
        } else {
          pane.classList.remove("active");
        }
      });
    });
  });

  // Interactive Code view mapping inside folders
  const frameworkCodes = {
    "react-app": {
      header: "src/App.js",
      code: `import React, { useState } from 'react';\n\nfunction ChatBot() {\n  const [messages, setMessages] = useState([]);\n  \n  return (\n    <div className="chat">\n      <h4>RoboBuddy UI</h4>\n      <button onClick={() => setMessages([...messages, 'Hello'])}>\n        Add Message\n      </button>\n      <ul>\n        {messages.map((m, i) => <li key={i}>{m}</li>)}\n      </ul>\n    </div>\n  );\n}\n\nexport default ChatBot;`
    },
    "react-index": {
      header: "src/index.js",
      code: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`
    },
    "next-page": {
      header: "app/page.js",
      code: `// Next.js Page Component (Server Component by default)\nexport default function HomePage() {\n  return (\n    <main style={{ padding: 24 }}>\n      <h1>Welcome to my Next.js App</h1>\n      <p>Built with React + SSR!</p>\n    </main>\n  );\n}`
    },
    "next-layout": {
      header: "app/layout.js",
      code: `export const metadata = {\n  title: 'Next.js App',\n  description: 'Full stack React application',\n};\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}`
    },
    "fastapi-main": {
      header: "main.py",
      code: `from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass Msg(BaseModel):\n    text: str\n\n@app.post("/chat")\ndef get_reply(message: Msg):\n    return {"reply": f"Received: {message.text}"}`
    },
    "fastapi-schemas": {
      header: "schemas.py",
      code: `from pydantic import BaseModel\n\nclass User(BaseModel):\n    id: int\n    username: str\n    role: str\n\nclass UserCreate(BaseModel):\n    username: str\n    password: str`
    },
    "django-views": {
      header: "chat_app/views.py",
      code: `from django.http import JsonResponse\nfrom django.views.decorators.csrf import csrf_exempt\nimport json\n\n@csrf_exempt\ndef reply_view(request):\n    if request.method == "POST":\n        data = json.loads(request.body)\n        return JsonResponse({"reply": f"Django received: {data.get('message')}"})`
    },
    "django-models": {
      header: "chat_app/models.py",
      code: `from django.db import models\n\nclass ChatMessage(models.Model):\n    user = models.CharField(max_value=100)\n    content = models.TextField()\n    timestamp = models.DateTimeField(auto_now_add=True)\n\n    def __str__(self):\n        return f"{self.user}: {self.content[:20]}"`
    }
  };

  // Bind clicks for files in each framework folder tree
  const folderBoxes = document.querySelectorAll(".framework-folder-box");
  folderBoxes.forEach(box => {
    box.addEventListener("click", function(e) {
      const fileEl = e.target.closest(".file");
      if (!fileEl) return;

      const codeKey = fileEl.getAttribute("data-code");
      if (!codeKey || !frameworkCodes[codeKey]) return;

      // Deactivate other files in the same folder box
      box.querySelectorAll(".file").forEach(f => f.classList.remove("active"));
      fileEl.classList.add("active");

      // Find the code block elements in the parent tab panel
      const tabPane = box.closest(".framework-pane");
      const codeHeader = tabPane.querySelector(".code-box-header");
      const codeBlock = tabPane.querySelector("pre code");

      codeHeader.textContent = frameworkCodes[codeKey].header;
      codeBlock.textContent = frameworkCodes[codeKey].code;
      
      // Re-trigger syntax highlighting manually on the updated code block
      let text = codeBlock.innerHTML;
      
      let comments = [];
      let strings = [];
      
      text = text.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, function (match) {
        strings.push(match);
        return `___STRING_${strings.length - 1}___`;
      });
      
      text = text.replace(/(\/\/[^\n]*|\#[^\n]*)/g, function (match) {
        comments.push(match);
        return `___COMMENT_${comments.length - 1}___`;
      });
      
      text = text.replace(/\b(const|let|async|await|function|return|import|from|def|if|elif|else|try|except|raise|class|with|as)\b/g, '<span class="code-keyword">$1</span>');
      text = text.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="code-number">$1</span>');
      
      text = text.replace(/___STRING_(\d+)___/g, function (match, index) {
        let str = strings[parseInt(index)];
        return `<span class="code-string">${str}</span>`;
      });
      
      text = text.replace(/___COMMENT_(\d+)___/g, function (match, index) {
        let comment = comments[parseInt(index)];
        return `<span class="code-comment">${comment}</span>`;
      });
      
      codeBlock.innerHTML = text;
    });
  });

  // Simulated run button events
  const runBtns = document.querySelectorAll(".run-framework-btn");
  runBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const frameworkName = btn.getAttribute("data-framework");
      const terminalId = `terminal-${frameworkName}`;
      const terminalEl = document.getElementById(terminalId);
      if (!terminalEl) return;

      btn.disabled = true;
      btn.textContent = "Booting...";
      
      let logs = "";
      if (frameworkName === "react") {
        logs = `
$ npm run start --verbose
[react-scripts] Compiled successfully!
[react-scripts] You can view my-react-app in browser.
[react-scripts] Local:            http://localhost:3000
[react-scripts] 
[browser-simulator] Rendered Component: <ChatBot />
[browser-simulator] Output: [ RoboBuddy UI ] [Add Message] (0 messages rendered)
        `.trim();
      } else if (frameworkName === "nextjs") {
        logs = `
$ npm run dev
▶ Next.js 14.2.0
▲ Ready in 950ms (http://localhost:3000)
▲ Compiling /page ...
▲ Compiled /page in 450ms (382 modules)
▲ [server-rendering] Rendered HomePage server component!
        `.trim();
      } else if (frameworkName === "fastapi") {
        logs = `
$ uvicorn main:app --reload
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started parent process [28491]
INFO:     Started server process [28492]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
        `.trim();
      } else if (frameworkName === "django") {
        logs = `
$ python manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
July 06, 2026 - 21:19:00
Django version 5.0, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
        `.trim();
      }

      terminalEl.textContent = logs;

      setTimeout(function() {
        btn.disabled = false;
        btn.textContent = `Run ${frameworkName.charAt(0).toUpperCase() + frameworkName.slice(1)} Simulator`;
      }, 1500);
    });
  });

});

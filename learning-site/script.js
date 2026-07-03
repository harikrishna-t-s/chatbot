/* ==========================================================================
   STATE MANAGEMENT & LOCAL STORAGE ENGINE
   ========================================================================== */
const TOTAL_WORLDS = 13;

let gameState = {
    level: 0,
    xp: 0,
    unlockedWorlds: [1], // World 1 always accessible initially
    completedQuizzes: [],
    unlockedSkills: [],
    earnedBadges: []
};

// Core Badges Metadata Matrix mapping out requirements
const BADGE_MATRIX = {
    1: { name: "Explorer Initialized", skill: "System Mechanics" },
    2: { name: "Hardware Core Architect", skill: "System Architecture" },
    3: { name: "Logic Compiler Champion", skill: "Syntax Foundations" },
    4: { name: "Holy Trinity Web Developer", skill: "Client Layouts" },
    5: { name: "DOM Tree Master", skill: "Browser Event Loops" },
    6: { name: "Backend Fortress Guardian", skill: "Server Routing" },
    7: { name: "API Gate Navigator", skill: "JSON Networking" },
    8: { name: "Cloud Inference Wrangler", skill: "Model Tokens" },
    9: { name: "AI Brain Whisperer", skill: "Predictive Engines" },
    10: { name: "Full Stack Assembly Architect", skill: "App Blueprints" },
    11: { name: "Full Pipeline System Engineer", skill: "Flow Diagnostics" },
    12: { name: "Responsible AI Vibe Director", skill: "Modern Paradigm" }
};

const WORLD_TITLES = [
    "Welcome Explorer",
    "Understanding Computers",
    "Learning to Speak to Computers",
    "Building Websites",
    "Frontend Adventure",
    "Backend Fortress",
    "Crossing the API Bridge",
    "Meet Hugging Face",
    "The AI Brain",
    "Build the Chatbot",
    "How Everything Connects",
    "Vibe Coding Academy",
    "Your Journey Continues"
];

/* Initialize application context hook */
document.addEventListener("DOMContentLoaded", () => {
    loadProgressFromStorage();
    buildSidebarNavigationMap();
    refreshInterfaceValues();
    initializeInteractiveElements();
    setupSearchFilters();
    setupScrollIndicator();
});

function loadProgressFromStorage() {
    const rawData = localStorage.getItem("cs_chatbot_adventure_save");
    if (rawData) {
        try {
            gameState = JSON.parse(rawData);
        } catch (e) {
            console.error("Corruption detected in local state storage records, initializing fresh state map.", e);
        }
    }
}

function saveProgressToStorage() {
    localStorage.setItem("cs_chatbot_adventure_save", JSON.stringify(gameState));
}

/* ==========================================================================
   UI RENDERING & ANIMATION DRIVERS
   ========================================================================== */
function buildSidebarNavigationMap() {
    const listContainer = document.getElementById("sidebar-world-list");
    listContainer.innerHTML = "";

    WORLD_TITLES.forEach((title, index) => {
        const worldNum = index + 1;
        const isUnlocked = gameState.unlockedWorlds.includes(worldNum);
        
        const li = document.createElement("li");
        li.className = `world-nav-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        if (worldNum === 1 || gameState.unlockedWorlds.includes(worldNum)) {
            li.classList.add("unlocked");
        }
        
        li.innerHTML = `
            <span>W${worldNum}: ${title.substring(0, 22)}${title.length > 22 ? '...' : ''}</span>
            <span class="lock-icon">${isUnlocked ? '🔓' : '🔒'}</span>
        `;
        
        if (isUnlocked) {
            li.addEventListener("click", () => {
                document.querySelectorAll(".world-nav-item").forEach(item => item.classList.remove("active-target"));
                li.classList.add("active-target");
                const targetCard = document.getElementById(`world-13`);
                document.getElementById(`world-${worldNum}`).scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
        listContainer.appendChild(li);
    });
}

function refreshInterfaceValues() {
    // Basic counter calculations
    document.getElementById("user-level").innerText = gameState.level;
    document.getElementById("user-xp").innerText = gameState.xp;
    document.getElementById("badge-count").innerText = `${gameState.earnedBadges.length} / 12`;
    
    // Assign Rank Titles based on computed level index blocks
    let title = "Level 0 Explorer";
    if (gameState.level >= 3) title = "Frontend Apprentice";
    if (gameState.level >= 6) title = "Backend Sentinel";
    if (gameState.level >= 9) title = "API Tactician";
    if (gameState.level >= 12) title = "AI Engineering Grandmaster";
    document.getElementById("user-title").innerText = title;

    // Evaluate experience progress percentage limits
    const xpRemainder = gameState.xp % 100;
    document.getElementById("xp-progress").style.width = `${xpRemainder}%`;

    // Radial Progress Sidebar calculator
    const progressPercentage = Math.round((gameState.unlockedWorlds.length / TOTAL_WORLDS) * 100);
    document.getElementById("radial-percentage").innerText = `${progressPercentage}%`;
    const radialElement = document.querySelector(".progress-circle-radial");
    radialElement.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#8C1515 ${progressPercentage}%, #f3f0ec 0%)`;
    document.getElementById("progress-text-summary").innerText = `${gameState.unlockedWorlds.length} of ${TOTAL_WORLDS} Worlds Unlocked`;

    // Unlock card element view structures live
    for (let w = 1; w <= TOTAL_WORLDS; w++) {
        const targetElement = document.getElementById(`world-${w}`);
        if (targetElement) {
            if (gameState.unlockedWorlds.includes(w)) {
                targetElement.classList.remove("locked");
                targetElement.classList.add("activated");
            } else {
                targetElement.classList.add("locked");
                targetElement.classList.remove("activated");
            }
        }
    }

    // Refresh structural skill badge tree indicators
    const treeDisplay = document.getElementById("skill-tree-display");
    treeDisplay.innerHTML = "";
    Object.keys(BADGE_MATRIX).forEach(key => {
        const skillName = BADGE_MATRIX[key].skill;
        const isEarned = gameState.unlockedSkills.includes(skillName);
        const node = document.createElement("span");
        node.className = `skill-node ${isEarned ? 'active' : ''}`;
        node.innerText = `${isEarned ? '✓ ' : '• '}${skillName}`;
        treeDisplay.appendChild(node);
    });

    // Check certificate eligibility criteria
    if (gameState.unlockedWorlds.includes(13)) {
        const certBox = document.getElementById("certificate-box");
        certBox.classList.remove("locked-cert");
        document.getElementById("btn-print-cert").removeAttribute("disabled");
    }
}

function rewardExperiencePoints(amount) {
    gameState.xp += amount;
    const computedLevel = Math.floor(gameState.xp / 100);
    if (computedLevel > gameState.level) {
        gameState.level = computedLevel;
        triggerGlobalCelebrationExplosion();
    }
    saveProgressToStorage();
    refreshInterfaceValues();
}

function unlockNextSequentialWorld(currentWorldIndex) {
    const nextWorld = currentWorldIndex + 1;
    if (nextWorld <= TOTAL_WORLDS && !gameState.unlockedWorlds.includes(nextWorld)) {
        gameState.unlockedWorlds.push(nextWorld);
        
        // Award badge based on completion map matrix metadata
        if (BADGE_MATRIX[currentWorldIndex]) {
            const badgeData = BADGE_MATRIX[currentWorldIndex];
            if (!gameState.earnedBadges.includes(badgeData.name)) {
                gameState.earnedBadges.push(badgeData.name);
                gameState.unlockedSkills.push(badgeData.skill);
                displayFloatingAchievementToast(badgeData.name);
            }
        }
        
        saveProgressToStorage();
        buildSidebarNavigationMap();
        refreshInterfaceValues();
    }
}

function displayFloatingAchievementToast(badgeName) {
    const toast = document.getElementById("achievement-toast");
    document.getElementById("toast-badge-name").innerText = badgeName;
    toast.classList.remove("hidden");
    
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4500);
}

/* ==========================================================================
   INTERACTIVE LAB ACTIVITY LOGIC (DND, Sliders, Timelines)
   ========================================================================== */
function initializeInteractiveElements() {
    
    // World 1: Passport Signing Activation Mechanism
    const passportBtn = document.getElementById("btn-claim-passport");
    if (passportBtn) {
        passportBtn.addEventListener("click", () => {
            rewardExperiencePoints(50);
            passportBtn.disabled = true;
            passportBtn.innerText = "Passport Active (50 XP Claimed)";
        });
    }

    // World 2: Drag and Drop Hardware/Software Assemblies Tracker
    const matchCards = document.querySelectorAll(".match-card");
    const dropZones = document.querySelectorAll(".drop-zone");
    let activeDraggedCard = null;

    matchCards.forEach(card => {
        card.addEventListener("dragstart", () => { activeDraggedCard = card; });
    });

    dropZones.forEach(zone => {
        zone.addEventListener("dragover", (e) => e.preventDefault());
        zone.addEventListener("dragenter", () => zone.classList.add("hovered"));
        zone.addEventListener("dragleave", () => zone.classList.remove("hovered"));
        zone.addEventListener("drop", () => {
            zone.classList.remove("hovered");
            if (activeDraggedCard) {
                zone.appendChild(activeDraggedCard);
            }
        });
    });

    document.getElementById("btn-check-matching").addEventListener("click", () => {
        let accurateCount = 0;
        dropZones.forEach(zone => {
            const targetType = zone.getAttribute("data-target");
            const children = zone.querySelectorAll(".match-card");
            children.forEach(child => {
                if (child.getAttribute("data-type") === targetType) {
                    accurateCount++;
                }
            });
        });
        if (accurateCount === 4) {
            alert("Perfect Configuration Match! Components organized flawlessly. Run internal processes.");
            rewardExperiencePoints(40);
        } else {
            alert(`Classification complete. ${accurateCount} out of 4 matching items are allocated to their native system environments correctly.`);
        }
    });

    // World 3: Sorting Sequence Reorder Engine
    const sortableList = document.getElementById("sortable-w3");
    let draggingItem = null;

    if (sortableList) {
        sortableList.querySelectorAll("li").forEach(item => {
            item.addEventListener("dragstart", () => { draggingItem = item; });
            item.addEventListener("dragover", (e) => e.preventDefault());
            item.addEventListener("drop", () => {
                if (draggingItem && draggingItem !== item) {
                    let children = Array.from(sortableList.children);
                    let dragIdx = children.indexOf(draggingItem);
                    let targetIdx = children.indexOf(item);
                    if (dragIdx < targetIdx) {
                        sortableList.insertBefore(draggingItem, item.nextSibling);
                    } else {
                        sortableList.insertBefore(draggingItem, item);
                    }
                }
            });
        });
    }

    document.getElementById("btn-verify-sort").addEventListener("click", () => {
        const elements = document.querySelectorAll("#sortable-w3 li");
        let validFlag = true;
        elements.forEach((el, index) => {
            if (parseInt(el.getAttribute("data-order")) !== index + 1) {
                validFlag = false;
            }
        });
        if (validFlag) {
            alert("Sequence aligned successfully. Logical execution order verified.");
            rewardExperiencePoints(40);
        } else {
            alert("Sequence collision error. Remember, structural text processing must listen and capture frames before running calculations.");
        }
    });

    // World 4: Visual Sandbox Toggler Module
    const cssToggle = document.getElementById("chk-css");
    const jsToggle = document.getElementById("chk-js");
    const previewBox = document.getElementById("sandbox-preview");
    const interactBtn = document.getElementById("sandbox-interact-btn");

    function evaluateSandboxVisualState() {
        if (cssToggle.checked) {
            previewBox.className = "sandbox-preview-box styled";
        } else {
            previewBox.className = "sandbox-preview-box unstyled";
        }
    }

    if (cssToggle && jsToggle) {
        cssToggle.addEventListener("change", evaluateSandboxVisualState);
        interactBtn.addEventListener("click", () => {
            if (jsToggle.checked) {
                alert("JavaScript Event Handlers evaluated successfully! Box logic live.");
            } else {
                alert("Static layout. Nothing fires because the JavaScript muscle execution engine is turned off.");
            }
        });
    }

    // World 5: Flashcard Flip Binding
    const flashcard = document.getElementById("fc-dom");
    if (flashcard) {
        flashcard.addEventListener("click", () => {
            flashcard.classList.toggle("flipped");
        });
    }

    // World 6: True / False Evaluator Toggle
    const tfButtons = document.querySelectorAll(".tf-btn");
    tfButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const isCorrectAnswer = btn.getAttribute("data-answer") === "true";
            const feedbackEl = document.getElementById("tf-feedback");
            feedbackEl.classList.remove("hidden");
            
            if (isCorrectAnswer) {
                feedbackEl.innerText = "Correct! The browser renders visual HTML/CSS layout frames; the server handles background routing data processes out of sight.";
                feedbackEl.className = "tf-feedback correct";
                rewardExperiencePoints(30);
            } else {
                feedbackEl.innerText = "Incorrect evaluation. Review the relationship between server files and browser display frames.";
                feedbackEl.className = "tf-feedback incorrect";
            }
        });
    });

    // World 7: API Flow Node Sequencer validation
    document.getElementById("btn-verify-flow").addEventListener("click", () => {
        const nodes = document.querySelectorAll("#flow-builder-w7 .flow-node");
        let aligned = true;
        nodes.forEach((node, index) => {
            if (parseInt(node.getAttribute("data-step")) !== index + 1) {
                aligned = false;
            }
        });
        if (aligned) {
            alert("API Data Pipeline verified. Requests transition cleanly to operational responses.");
            rewardExperiencePoints(40);
        } else {
            alert("Pipeline breakdown. Request frames must traverse outbound across the wire before responses can be calculated.");
        }
    });

    // World 9: AI Predictor Slider Controls Simulator
    const slider = document.getElementById("temp-slider");
    const outputText = document.getElementById("prediction-output");
    const labelDisplay = document.getElementById("temp-val-display");

    if (slider) {
        slider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value) / 10;
            if (val <= 0.3) {
                labelDisplay.innerText = `${val} (Predictable & Focused)`;
                outputText.innerText = '"The student went to the library to study computer science books."';
            } else if (val <= 0.7) {
                labelDisplay.innerText = `${val} (Balanced & Creative)`;
                outputText.innerText = '"The student went to the library to discover lost manuscript documents and write code templates."';
            } else {
                labelDisplay.innerText = `${val} (High Randomness / Wild Vibe)`;
                outputText.innerText = '"The student went to the library to eat neon sandwiches and compose cybernetic jazz poetry manually."';
            }
        });
    }

    // World 10: Code Accordion Panel Open and Close Loops
    const accordionTriggers = document.querySelectorAll(".accordion-trigger");
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const panel = trigger.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });

    // World 11: End-To-End Network Pipeline Simulation Flow
    const runPipeBtn = document.getElementById("btn-run-pipeline");
    if (runPipeBtn) {
        runPipeBtn.addEventListener("click", () => {
            runPipeBtn.disabled = true;
            document.getElementById("pipeline-visualizer").classList.remove("hidden");
            const steps = ["ps1", "ps2", "ps3", "ps4", "ps5"];
            
            steps.forEach((stepId, index) => {
                setTimeout(() => {
                    document.querySelectorAll(".pipe-step").forEach(s => s.classList.remove("active-node"));
                    document.getElementById(stepId).classList.add("active-node");
                    if (index === steps.length - 1) {
                        runPipeBtn.removeAttribute("disabled");
                        rewardExperiencePoints(40);
                    }
                }, index * 1000);
            });
        });
    }

    // World 13: Certificate Trigger System
    const certBtn = document.getElementById("btn-print-cert");
    if (certBtn) {
        certBtn.addEventListener("click", () => {
            window.print();
        });
    }

    // Generalized Question Validation Node Matrix Listener Event Hooks
    const quizButtons = document.querySelectorAll(".submit-quiz-btn");
    quizButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const worldIndex = parseInt(btn.getAttribute("data-world"));
            const chosenOption = document.querySelector(`input[name="q${worldIndex}"]:checked`);
            const feedbackContainer = btn.nextElementSibling;

            if (!chosenOption) {
                alert("Please select a solution choice before verifying compliance matrices.");
                return;
            }

            // Universal mock answer sheet verification strategy mapping index arrays
            // Correct options assigned consistently for ease of algorithmic tracking.
            const correctAnswers = { 1: "b", 2: "b", 3: "b", 4: "b", 5: "b", 6: "b", 7: "b", 8: "a", 9: "b", 10: "b", 11: "b", 12: "a" };
            
            feedbackContainer.classList.remove("hidden");
            if (chosenOption.value === correctAnswers[worldIndex]) {
                feedbackContainer.innerText = "Verification Complete: Solution is contextually valid. +50 XP Unlocked.";
                feedbackContainer.className = "quiz-feedback correct";
                rewardExperiencePoints(50);
                unlockNextSequentialWorld(worldIndex);
            } else {
                feedbackContainer.innerText = "Verification Exception: Logic mismatch detected. Review world objectives above and refine choices.";
                feedbackContainer.className = "quiz-feedback incorrect";
            }
        });
    });
}

/* ==========================================================================
   CONCEPTS SEARCH ENGINE ELEMENT COUPLING
   ========================================================================== */
function setupSearchFilters() {
    const searchField = document.getElementById("global-search");
    if (!searchField) return;

    searchField.addEventListener("input", (e) => {
        const queryText = e.target.value.toLowerCase().trim();
        const worldCards = document.querySelectorAll(".world-card");

        worldCards.forEach(card => {
            const bodyContent = card.innerText.toLowerCase();
            if (bodyContent.includes(queryText)) {
                card.classList.remove("hidden-search-node");
            } else {
                card.classList.add("hidden-search-node");
            }
        });
    });
}

/* ==========================================================================
   SCROLL POSITION TRACKER LAYOUT EFFECT
   ========================================================================== */
function setupScrollIndicator() {
    window.addEventListener("scroll", () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight === 0) return;
        const currentPercentage = (window.scrollY / totalHeight) * 100;
        document.getElementById("scroll-indicator").style.width = `${currentPercentage}%`;
    });
}

/* Academic Success Level Celebration Notification Effect Engine Trigger */
function triggerGlobalCelebrationExplosion() {
    console.log("🌟 System Event: Level Up achieved successfully. System performance maximum initialized.");
}

// ============================================================
//  salve.js  –  Lektion „Salve" · Pontes 1
// ============================================================

// ── Navigation ──────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll(".section").forEach(function (s) {
    s.classList.remove("active");
  });
  document.querySelectorAll(".nav-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
  document.getElementById("nav-" + id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Attempt / Feedback helpers ───────────────────────────────
var MAX = 3;
var tries = {};

function attempt(key) {
  if (!tries[key]) tries[key] = 0;
  tries[key]++;
  var el = document.getElementById("att-" + key);
  if (el) el.textContent = "Versuche: " + tries[key] + " / " + MAX;
  return tries[key];
}

function isLocked(key) {
  return (tries[key] || 0) >= MAX;
}

function lockBtn(key) {
  var b = document.getElementById("btn-" + key);
  if (b) b.disabled = true;
}

function showHint(key) {
  var h = document.getElementById("hint-" + key);
  if (h) h.style.display = "block";
}

function fbMsg(key, correct, total, navId) {
  var el = document.getElementById("fb-" + key);
  if (!el) return;
  var t = tries[key] || 0;
  if (correct === total) {
    el.className = "feedback show ok";
    el.textContent = "Richtig! Alle " + total + " Antworten korrekt.";
    lockBtn(key);
    if (navId) markNav(navId, true);
  } else if (t < MAX) {
    el.className = "feedback show warn";
    el.textContent = "Das ist noch nicht richtig.";
  } else {
    el.className = "feedback show err";
    el.textContent =
      "Leider nicht geschafft. Klicke auf ein gelbes Feld um die richtige Antwort einzublenden.";
    showHint(key);
    lockBtn(key);
    if (navId) markNav(navId, false);
  }
}

// ── Nav badges ───────────────────────────────────────────────
function markNav(id, ok) {
  var btn = document.getElementById("nav-" + id);
  if (!btn) return;
  var old = btn.querySelector(".badge");
  if (old) old.remove();
  var badge = document.createElement("span");
  badge.className = "badge";
  if (ok) {
    btn.classList.remove("done-fail");
    btn.classList.add("done-ok");
    badge.textContent = "✓";
  } else {
    btn.classList.remove("done-ok");
    btn.classList.add("done-fail");
    badge.textContent = "!";
  }
  btn.appendChild(badge);
}

function markNavPending(id) {
  var btn = document.getElementById("nav-" + id);
  if (!btn) return;
  var old = btn.querySelector(".badge");
  if (old) old.remove();
  btn.classList.add("done-pending");
  var badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = "…";
  btn.appendChild(badge);
}

// ── S1 Custom Audio Player ───────────────────────────────────────────
function fmtTime(s) {
  if (isNaN(s)) return "0:00";
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

function toggleAudioS1(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  var audio = document.getElementById("audio-s1");
  var centerWrap = document.getElementById("s1-center-btn-wrap");
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    s1SetPlayIcons(false);
    if (centerWrap) centerWrap.classList.add("hidden");
  } else {
    audio.pause();
    s1SetPlayIcons(true);
    if (centerWrap) centerWrap.classList.remove("hidden");
  }
}

function s1SetPlayIcons(paused) {
  var ids = [
    ["icon-play-s1", "icon-pause-s1"],
    ["icon-play-bar", "icon-pause-bar"],
  ];
  ids.forEach(function (pair) {
    var play = document.getElementById(pair[0]);
    var pause = document.getElementById(pair[1]);
    if (play) play.style.display = paused ? "" : "none";
    if (pause) pause.style.display = paused ? "none" : "";
  });
}

function s1ToggleMute(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  var audio = document.getElementById("audio-s1");
  var volBtn = document.getElementById("icon-vol");
  var muteIc = document.getElementById("icon-mute");
  var slider = document.getElementById("s1-vol-slider");
  if (!audio) return;
  audio.muted = !audio.muted;
  if (volBtn) volBtn.style.display = audio.muted ? "none" : "";
  if (muteIc) muteIc.style.display = audio.muted ? "" : "none";
  if (slider) slider.value = audio.muted ? 0 : audio.volume;
}

function s1SetVolume(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  var audio = document.getElementById("audio-s1");
  var volBtn = document.getElementById("icon-vol");
  var muteIc = document.getElementById("icon-mute");
  if (!audio) return;
  audio.volume = parseFloat(e.target.value);
  audio.muted = audio.volume === 0;
  if (volBtn) volBtn.style.display = audio.muted ? "none" : "";
  if (muteIc) muteIc.style.display = audio.muted ? "" : "none";
}

function seekAudioS1(e) {
  e.stopPropagation();
  var audio = document.getElementById("audio-s1");
  var wrap = document.getElementById("audio-progress-wrap-s1");
  if (!audio || !audio.duration) return;
  var rect = wrap.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
}

// Wire up audio events after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  var audio = document.getElementById("audio-s1");
  if (!audio) return;

  audio.addEventListener("timeupdate", function () {
    var bar = document.getElementById("audio-progress-s1");
    var timeEl = document.getElementById("audio-time-s1");
    if (audio.duration) {
      if (bar)
        bar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
      if (timeEl)
        timeEl.textContent =
          fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
      if (audio.duration - audio.currentTime <= 2) s2UnlockWeiterS1();
    }
  });

  audio.addEventListener("loadedmetadata", function () {
    var timeEl = document.getElementById("audio-time-s1");
    if (timeEl) timeEl.textContent = "0:00 / " + fmtTime(audio.duration);
  });
  // Also try immediately in case metadata already loaded
  if (audio.readyState >= 1) {
    var timeEl = document.getElementById("audio-time-s1");
    if (timeEl && audio.duration)
      timeEl.textContent = "0:00 / " + fmtTime(audio.duration);
  }

  audio.addEventListener("ended", function () {
    var centerWrap = document.getElementById("s1-center-btn-wrap");
    s1SetPlayIcons(true);
    if (centerWrap) centerWrap.classList.remove("hidden");
    s2UnlockWeiterS1();
  });
});

function s2UnlockWeiterS1() {
  var btn = document.getElementById("btn-s1-weiter");
  if (!btn || !btn.classList.contains("btn-weiter-inactive")) return;
  btn.classList.remove("btn-weiter-inactive");
  btn.disabled = false;
}

function markS1Weiter() {
  markNav("s1", true);
  var btn = document.getElementById("btn-s1-weiter");
  if (btn) btn.disabled = true;
  showSection("s2");
}

// ── Weiter-Button helper ─────────────────────────────────────
function weiterTo(nextId) {
  showSection(nextId);
}

// ── Nav button click wiring ───────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.id.replace("nav-", "");
      if (id === "s15") {
        showS15Overview();
      } else {
        showSection(id);
      }
    });
  });

  // Initialize S15 overview immediately (task list only, no medal card)
  initS15Overview();
});

// ═══════════════════════════════════════════════════
//  S2 – Willkommen im alten Rom  (Drag & Drop)
//  Feedback-System: Popover wie Lektion 12
// ═══════════════════════════════════════════════════

var s2SelectedChip = null;
var s2DragChipId = null;
var s2Tries = 0;
var s2Locked = false;
var s2Wrong = {}; // slotId → { el, correct, chipText }

// Correct answer map: slot number → chip number (1:1)
var s2CorrectMap = {
  "s2-slot-1": "s2-chip-1",
  "s2-slot-2": "s2-chip-2",
  "s2-slot-3": "s2-chip-3",
  "s2-slot-4": "s2-chip-4",
  "s2-slot-5": "s2-chip-5",
  "s2-slot-6": "s2-chip-6",
  "s2-slot-7": "s2-chip-7",
  "s2-slot-8": "s2-chip-8",
  "s2-slot-9": "s2-chip-9",
  "s2-slot-10": "s2-chip-10",
};

// ── init nach DOMContentLoaded ────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  initS2();
});

function initS2() {
  // Chips
  document.querySelectorAll("#s2-pool .s15-chip").forEach(function (chip) {
    chip.addEventListener("dragstart", function (e) {
      if (s2Locked) {
        e.preventDefault();
        return;
      }
      s2DragChipId = chip.id;
      e.dataTransfer.setData("text/plain", chip.id);
      chip.style.opacity = "0.5";
    });
    chip.addEventListener("dragend", function () {
      chip.style.opacity = "";
    });
    chip.addEventListener("click", function () {
      if (s2Locked) return;
      if (chip.classList.contains("used")) return;
      if (s2SelectedChip === chip) {
        chip.classList.remove("s2-selected");
        s2SelectedChip = null;
      } else {
        if (s2SelectedChip) s2SelectedChip.classList.remove("s2-selected");
        s2SelectedChip = chip;
        chip.classList.add("s2-selected");
      }
    });
  });

  // Slots
  document.querySelectorAll(".s2-slot").forEach(function (slot) {
    // Drag FROM filled slot
    slot.addEventListener("dragstart", function (e) {
      if (s2Locked || !slot.classList.contains("filled")) {
        e.preventDefault();
        return;
      }
      s2DragChipId = slot.dataset.chipId;
      e.dataTransfer.setData("text/plain", slot.dataset.chipId);
      slot.style.opacity = "0.5";
    });
    slot.addEventListener("dragend", function () {
      slot.style.opacity = "";
    });

    slot.addEventListener("dragover", function (e) {
      if (s2Locked) return;
      e.preventDefault();
      slot.classList.add("over");
    });
    slot.addEventListener("dragleave", function () {
      slot.classList.remove("over");
    });
    slot.addEventListener("drop", function (e) {
      if (s2Locked) return;
      e.preventDefault();
      slot.classList.remove("over");
      var chipId = e.dataTransfer.getData("text/plain") || s2DragChipId;
      s2PlaceChip(slot, chipId);
    });
    slot.addEventListener("click", function () {
      // Nach Lock: Popover für falsche Slots
      if (s2Locked) {
        if (slot.classList.contains("wrong")) {
          var w = s2Wrong[slot.id];
          if (w) {
            slot.dataset.solutionTrigger = "1";
            showSolutionPopover(slot, w.correct);
          }
        }
        return;
      }
      // Vor Lock: Klick-Modus
      if (s2SelectedChip) {
        s2PlaceChip(slot, s2SelectedChip.id);
        s2SelectedChip.classList.remove("s2-selected");
        s2SelectedChip = null;
      } else if (slot.classList.contains("filled")) {
        // Chip im Slot auswählen (wie aus dem Pool klicken)
        var chipId = slot.dataset.chipId;
        var chip = document.getElementById(chipId);
        if (chip) {
          if (s2SelectedChip) s2SelectedChip.classList.remove("s2-selected");
          // Slot leeren, Chip wieder verfügbar machen
          slot.textContent = "";
          slot.classList.remove("filled", "ok", "wrong");
          slot.setAttribute("draggable", "false");
          delete slot.dataset.chipId;
          chip.classList.remove("used");
          delete chip.dataset.slotId;
          // Chip als ausgewählt markieren
          s2SelectedChip = chip;
          chip.classList.add("s2-selected");
        }
      }
    });

    // Slot wird draggable wenn gefüllt (via MutationObserver)
    slot.setAttribute("draggable", "false");
    var observer = new MutationObserver(function () {
      slot.setAttribute(
        "draggable",
        slot.classList.contains("filled") ? "true" : "false",
      );
    });
    observer.observe(slot, { attributes: true, attributeFilter: ["class"] });
  });
}

function s2PlaceChip(slot, chipId) {
  if (s2Locked || !chipId) return;
  var chip = document.getElementById(chipId);
  if (!chip) return;

  // Alten Slot-Inhalt zurückgeben
  if (slot.dataset.chipId) s2ReturnChip(slot);

  // Chip von altem Slot lösen
  var prevSlotId = chip.dataset.slotId;
  if (prevSlotId) {
    var prevSlot = document.getElementById(prevSlotId);
    if (prevSlot) {
      prevSlot.textContent = "";
      prevSlot.classList.remove("filled", "ok", "wrong");
      delete prevSlot.dataset.chipId;
    }
    delete chip.dataset.slotId;
  }

  chip.classList.add("used");
  chip.dataset.slotId = slot.id;
  slot.textContent = chip.textContent;
  slot.classList.add("filled");
  slot.classList.remove("ok", "wrong");
  slot.dataset.chipId = chipId;
}

function s2ReturnChip(slot) {
  if (s2Locked) return;
  var chipId = slot.dataset.chipId;
  if (!chipId) return;
  var chip = document.getElementById(chipId);
  if (chip) {
    chip.classList.remove("used");
    delete chip.dataset.slotId;
  }
  slot.textContent = "";
  slot.classList.remove("filled", "ok", "wrong");
  delete slot.dataset.chipId;
}

function checkS2() {
  if (s2Tries >= 3) return;
  // Scroll zum Pool
  var pool = document.getElementById("s2-pool");
  if (pool) pool.scrollIntoView({ behavior: "smooth", block: "start" });
  s2Tries++;
  var locked = s2Tries >= 3;
  var attEl = document.getElementById("att-s2");
  if (attEl) attEl.textContent = "Versuche: " + s2Tries + " / 3";

  s2Wrong = {};
  var correct = 0;
  var total = 10;

  document.querySelectorAll(".s2-slot").forEach(function (slot) {
    var chipId = slot.dataset.chipId || "";
    var expected = s2CorrectMap[slot.id];
    var isOk = chipId === expected;

    slot.classList.remove("ok", "wrong");
    if (isOk) {
      slot.classList.add("ok");
      correct++;
    } else {
      slot.classList.add("wrong");
      if (locked) {
        var correctChip = document.getElementById(expected);
        s2Wrong[slot.id] = {
          el: slot,
          correct: correctChip ? correctChip.textContent : "?",
        };
        slot.dataset.solutionTrigger = "1";
      }
    }
  });

  var fb = document.getElementById("fb-s2");
  var btn = document.getElementById("btn-s2");
  var next = document.getElementById("weiter-s2");

  if (correct === total) {
    fb.className = "feedback show ok";
    fb.textContent = "Richtig! Alle " + total + " Zuordnungen korrekt.";
    btn.disabled = true;
    if (next) next.style.display = "inline-block";
    markNav("s2", true);
    // Alles sperren – nichts darf mehr bewegt werden
    s2Locked = true;
    document.querySelectorAll("#s2-pool .s15-chip").forEach(function (c) {
      c.style.pointerEvents = "none";
      c.style.cursor = "default";
    });
  } else if (s2Tries < 3) {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    // Gesperrt
    s2Locked = true;
    fb.className = "feedback show err";
    fb.textContent =
      "Leider nicht geschafft. Klicke auf ein gelbes Feld um die richtige Antwort einzublenden.";
    btn.disabled = true;
    if (next) next.style.display = "inline-block";
    markNav("s2", false);
    // Alle Chips im Pool und in falschen Slots sperren
    document.querySelectorAll("#s2-pool .s15-chip").forEach(function (c) {
      c.style.pointerEvents = "none";
      c.style.cursor = "default";
    });
  }
}

// ── Popover-System (identisch zu Lektion 12) ──────────────────
var _popoverAnchor = null;
var _popoverBelow = false;
var _popoverLeft = false;

function showSolutionPopover(el, correctText, placement) {
  var pop = document.getElementById("solution-popover");

  // Toggle: same slot clicked again → hide
  if (_popoverAnchor === el && pop.classList.contains("popover-visible")) {
    hideSolutionPopover();
    return;
  }

  _popoverAnchor = el;
  _popoverBelow = placement === true || placement === "below";
  _popoverLeft = placement === "left";
  document.getElementById("solution-popover-text").textContent = correctText;
  _repositionPopover();
}

function _repositionPopover() {
  if (!_popoverAnchor) return;
  var pop = document.getElementById("solution-popover");

  pop.classList.remove("popover-visible", "popover-below", "popover-left");
  pop.style.display = "block";

  requestAnimationFrame(function () {
    var rect = _popoverAnchor.getBoundingClientRect();
    var popW = pop.offsetWidth;
    var popH = pop.offsetHeight;
    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;

    if (_popoverLeft) {
      pop.classList.add("popover-left");
      pop.style.left = rect.left + scrollX - popW - 12 + "px";
      pop.style.top = rect.top + scrollY + rect.height / 2 - popH / 2 + "px";
    } else if (_popoverBelow) {
      pop.classList.add("popover-below");
      var left = rect.left + scrollX + rect.width / 2 - popW / 2;
      left = Math.max(
        8,
        Math.min(left, scrollX + window.innerWidth - popW - 8),
      );
      pop.style.left = left + "px";
      pop.style.top = rect.bottom + scrollY + 10 + "px";
    } else {
      var left = rect.left + scrollX + rect.width / 2 - popW / 2;
      left = Math.max(
        8,
        Math.min(left, scrollX + window.innerWidth - popW - 8),
      );
      pop.style.left = left + "px";
      pop.style.top = rect.top + scrollY - popH - 10 + "px";
    }

    requestAnimationFrame(function () {
      pop.classList.add("popover-visible");
    });
  });
}

function hideSolutionPopover() {
  var pop = document.getElementById("solution-popover");
  pop.classList.remove("popover-visible");
  // Listen for the transition to finish, then fully hide
  pop.addEventListener("transitionend", function handler() {
    pop.removeEventListener("transitionend", handler);
    if (!pop.classList.contains("popover-visible")) {
      pop.style.display = "none";
    }
  });
  _popoverAnchor = null;
}

window.addEventListener("scroll", _repositionPopover, true);
window.addEventListener("resize", _repositionPopover);

document.addEventListener("click", function (e) {
  var pop = document.getElementById("solution-popover");
  if (
    pop &&
    pop.style.display !== "none" &&
    !e.target.dataset.solutionTrigger
  ) {
    hideSolutionPopover();
  }
});

// ── S3: Eine römische Familie stellt sich vor ────────────────
function markS3Weiter() {
  markNav("s3", true);
  document.getElementById("btn-s3-weiter").disabled = true;
  showSection("s4");
}

// ═══════════════════════════════════════════════════
//  S4 – Die Cornelier  (Bild-Inputs)
// ═══════════════════════════════════════════════════

var s4Tries = 0;
var s4Locked = false;

var s4Inputs = [
  "pater",
  "avus",
  "mater",
  "servus",
  "serva",
  "filius",
  "catella",
  "filia",
];

function checkS4() {
  if (s4Locked) return;
  s4Tries++;
  var attEl = document.getElementById("att-s4");
  if (attEl) attEl.textContent = "Versuche: " + s4Tries + " / 3";

  var correct = 0;
  var total = s4Inputs.length;

  s4Inputs.forEach(function (key) {
    var inp = document.getElementById("s4-in-" + key);
    if (!inp) return;
    var val = inp.value.trim();
    var answers = inp.dataset.answers.split(",").map(function (a) {
      return a.trim();
    });
    var isOk = answers.indexOf(val) !== -1;

    inp.classList.remove("ok", "wrong");
    if (isOk) {
      inp.classList.add("ok");
      inp.readOnly = true;
      correct++;
    } else {
      inp.classList.add("wrong");
    }
  });

  var fb = document.getElementById("fb-s4");
  var btn = document.getElementById("btn-s4");
  var next = document.getElementById("weiter-s4");

  if (correct === total) {
    fb.className = "feedback show ok";
    fb.textContent = "Richtig! Alle " + total + " Bedeutungen korrekt.";
    btn.disabled = true;
    s4Locked = true;
    if (next) next.style.display = "inline-block";
    markNav("s4", true);
  } else if (s4Tries < 3) {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    // Nach 3 Versuchen: sperren + Popover auf falschen Feldern
    s4Locked = true;
    btn.disabled = true;
    fb.className = "feedback show err";
    fb.textContent =
      "Leider nicht geschafft. Klicke auf ein gelbes Feld um die richtige Antwort einzublenden.";
    if (next) next.style.display = "inline-block";
    markNav("s4", false);

    // Falsche Inputs: Popover on click, Eingabe sperren
    s4Inputs.forEach(function (key) {
      var inp = document.getElementById("s4-in-" + key);
      if (!inp || inp.classList.contains("ok")) return;
      inp.readOnly = true;
      var answers = inp.dataset.answers.split(",").map(function (a) {
        return a.trim();
      });
      inp.dataset.solutionTrigger = "1";
      inp.addEventListener("click", function () {
        showSolutionPopover(inp, answers[0], true);
      });
    });
  }
}

// ── S5: G1 Satzglied, Wortart, Form ─────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("video-s5");
  if (!video) return;

  video.addEventListener("timeupdate", function () {
    if (video.duration && video.duration - video.currentTime <= 5) {
      unlockS5Weiter();
    }
  });
  video.addEventListener("ended", function () {
    unlockS5Weiter();
  });
});

function unlockS5Weiter() {
  var btn = document.getElementById("btn-s5-weiter");
  if (!btn || !btn.classList.contains("btn-weiter-inactive")) return;
  btn.classList.remove("btn-weiter-inactive");
  btn.disabled = false;
}

function markS5Weiter() {
  markNav("s5", true);
  document.getElementById("btn-s5-weiter").disabled = true;
  showSection("s6");
}

// ═══════════════════════════════════════════════════
//  S6 – Der Besuch des Großvaters
// ═══════════════════════════════════════════════════

var s8Tries = 0;
var s8Locked = false;
var s8Keys = ["1", "2", "3", "4", "5", "6"];

function s8Normalize(str) {
  // Strip all quotation mark variants for comparison
  return str.trim().replace(/[«»„“‚‘’‛‟´‘”"']/g, "");
}

function checkS8() {
  if (s8Locked) return;
  var firstRow = document.querySelector("#s8 .s6-row");
  if (firstRow) firstRow.scrollIntoView({ behavior: "smooth", block: "start" });
  s8Tries++;
  var attEl = document.getElementById("att-s8");
  if (attEl) attEl.textContent = "Versuche: " + s8Tries + " / 3";

  var correct = 0;
  var total = s8Keys.length;

  s8Keys.forEach(function (k) {
    var inp = document.getElementById("s6-in-" + k);
    if (!inp || inp.readOnly) {
      correct++;
      return;
    }
    var val = s8Normalize(inp.value);
    var answers = inp.dataset.answers.split(",").map(function (a) {
      return s8Normalize(a);
    });
    var isOk = answers.indexOf(val) !== -1;

    inp.classList.remove("ok", "wrong");
    if (isOk) {
      inp.classList.add("ok");
      inp.readOnly = true;
      correct++;
    } else {
      inp.classList.add("wrong");
    }
  });

  var fb = document.getElementById("fb-s8");
  var btn = document.getElementById("btn-s8");
  var next = document.getElementById("weiter-s8");

  if (correct === total) {
    fb.className = "feedback show ok";
    fb.textContent = "Richtig! Alle " + total + " Übersetzungen korrekt.";
    btn.disabled = true;
    s8Locked = true;
    if (next) next.style.display = "inline-block";
    markNav("s8", true);
  } else if (s8Tries < 3) {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    s8Locked = true;
    btn.disabled = true;
    fb.className = "feedback show err";
    fb.textContent =
      "Leider nicht geschafft. Klicke auf ein gelbes Feld um die richtige Antwort einzublenden.";
    if (next) next.style.display = "inline-block";
    markNav("s8", false);

    s8Keys.forEach(function (k) {
      var inp = document.getElementById("s6-in-" + k);
      if (!inp || inp.classList.contains("ok")) return;
      inp.readOnly = true;
      var answers = inp.dataset.answers.split(",").map(function (a) {
        return a.trim();
      });
      inp.dataset.solutionTrigger = "1";
      inp.addEventListener("click", function () {
        showSolutionPopover(inp, answers[0], true);
      });
    });
  }
}

// ── S6: Eine Sprache ohne Artikel ────────────────────────────
function markS6Weiter() {
  markNav("s6", true);
  document.getElementById("btn-s6-weiter").disabled = true;
  showSection("s7");
}

// ── S7: G3 Verstecktes Subjekt ───────────────────────────────
function markS7Weiter() {
  markNav("s7", true);
  document.getElementById("btn-s7-weiter").disabled = true;
  showSection("s8");
}

// ── S9: G4 Prädikatsnomen ────────────────────────────────────
function markS9Weiter() {
  markNav("s9", true);
  document.getElementById("btn-s9-weiter").disabled = true;
  showSection("s10");
}

// ═══════════════════════════════════════════════════
//  S10 – Übung zum Prädikatsnomen (Token-Markierung)
// ═══════════════════════════════════════════════════

// ── Data ─────────────────────────────────────────
var s10Data = {
  tokens: [
    { id: 1, text: "Publius", correct: false },
    { id: 2, text: "avus", correct: true },
    { id: 3, text: "est.", correct: false },
    { id: 4, text: "Ludit.", correct: false },
    { id: 5, text: "Delia", correct: false },
    { id: 6, text: "serva", correct: true },
    { id: 7, text: "est.", correct: false },
    { id: 8, text: "Laborat.", correct: false },
    { id: 9, text: "Issa", correct: false },
    { id: 10, text: "catella", correct: true },
    { id: 11, text: "est.", correct: false },
    { id: 12, text: "Currit.", correct: false },
    { id: 13, text: "Aulus", correct: false },
    { id: 14, text: "filius", correct: true },
    { id: 15, text: "est.", correct: false },
    { id: 16, text: "Ludit.", correct: false },
    { id: 17, text: "Quintus", correct: false },
    { id: 18, text: "pater", correct: true },
    { id: 19, text: "est.", correct: false },
  ],
};

// ── State ─────────────────────────────────────────
var s10State = { marked: [] }; // array of marked ids
var s10Tries = 0;
var s10Locked = false;

// ── Init ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("#mk-s10 .mk-token").forEach(function (el) {
    el.addEventListener("click", function () {
      if (s10Locked) return;
      var id = parseInt(el.dataset.id);
      var idx = s10State.marked.indexOf(id);
      if (idx === -1) {
        s10State.marked.push(id);
        el.classList.add("mk--marked");
      } else {
        s10State.marked.splice(idx, 1);
        el.classList.remove("mk--marked");
      }
    });
  });
});

// ── Reset ─────────────────────────────────────────
function resetS10() {
  if (s10Locked) return;
  s10State.marked = [];
  document.querySelectorAll("#mk-s10 .mk-token").forEach(function (el) {
    el.className = "mk-token";
  });
  var fb = document.getElementById("fb-s10");
  fb.className = "feedback";
  fb.textContent = "";
  s10Tries = 0;
  var attEl = document.getElementById("att-s10");
  if (attEl) attEl.textContent = "Versuche: 0 / 3";
}

// ── Check ─────────────────────────────────────────
function checkS10() {
  if (s10Locked) return;
  s10Tries++;
  var attEl = document.getElementById("att-s10");
  if (attEl) attEl.textContent = "Versuche: " + s10Tries + " / 3";

  // Evaluate each token
  var results = s10Data.tokens.map(function (tok) {
    var isMarked = s10State.marked.indexOf(tok.id) !== -1;
    var state;
    if (isMarked && tok.correct) state = "correct";
    else if (isMarked && !tok.correct) state = "incorrect";
    else if (!isMarked && tok.correct) state = "missed";
    else state = "neutral";
    return { id: tok.id, state: state };
  });

  var correctHits = results.filter(function (r) {
    return r.state === "correct";
  }).length;
  var totalCorrect = s10Data.tokens.filter(function (t) {
    return t.correct;
  }).length;
  var incorrectHits = results.filter(function (r) {
    return r.state === "incorrect";
  }).length;
  var allPerfect = correctHits === totalCorrect && incorrectHits === 0;

  var fb = document.getElementById("fb-s10");
  var btn = document.getElementById("btn-s10");
  var rst = document.getElementById("reset-s10");
  var next = document.getElementById("weiter-s10");

  if (allPerfect) {
    // Apply correct states and lock
    _applyTokenStates(results);
    fb.className = "feedback show ok";
    fb.textContent =
      "Richtig! Alle " + totalCorrect + " Prädikatsnomen korrekt markiert.";
    btn.disabled = true;
    if (rst) rst.disabled = true;
    s10Locked = true;
    if (next) next.style.display = "inline-block";
    markNav("s10", true);
  } else if (s10Tries < 3) {
    // No visual hints yet — just a simple warning message
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    // Final attempt — reveal with yellow for wrong/missed, popover on click
    s10Locked = true;
    btn.disabled = true;
    if (rst) rst.disabled = true;

    results.forEach(function (r) {
      var el = document.querySelector(
        "#mk-s10 .mk-token[data-id='" + r.id + "']",
      );
      if (!el) return;
      el.classList.remove(
        "mk--marked",
        "mk--correct",
        "mk--incorrect",
        "mk--missed",
        "mk--neutral",
      );

      if (r.state === "correct") {
        el.classList.add("mk--correct");
      } else if (r.state === "incorrect") {
        // Falsch markiert → blauer Hintergrund + gelber Rand + Popover "Löschen"
        el.classList.add("mk--incorrect-marked");
        el.dataset.solutionTrigger = "1";
        el.addEventListener("click", function () {
          showSolutionPopover(el, "Löschen", true);
        });
      } else if (r.state === "missed") {
        // Vergessen → gelb + Popover "Prädikatsnomen"
        el.classList.add("mk--missed");
        el.dataset.solutionTrigger = "1";
        el.addEventListener("click", function () {
          showSolutionPopover(el, "Prädikatsnomen", true);
        });
      }
    });

    fb.className = "feedback show err";
    fb.textContent =
      correctHits +
      " von " +
      totalCorrect +
      " Prädikatsnomen gefunden." +
      (incorrectHits > 0 ? " " + incorrectHits + " falsch markiert." : "") +
      " Klicke auf ein gelbes Wort für einen Hinweis.";
    if (next) next.style.display = "inline-block";
    markNav("s10", false);
  }
}

// ── Apply CSS states to tokens ────────────────────
function _applyTokenStates(results) {
  results.forEach(function (r) {
    var el = document.querySelector(
      "#mk-s10 .mk-token[data-id='" + r.id + "']",
    );
    if (!el) return;
    el.classList.remove(
      "mk--marked",
      "mk--correct",
      "mk--incorrect",
      "mk--missed",
      "mk--neutral",
    );
    if (r.state !== "neutral") el.classList.add("mk--" + r.state);
  });
}

// ═══════════════════════════════════════════════════
//  S11 – Satzglieder bestimmen (Multi-Marker)
// ═══════════════════════════════════════════════════

var s11ActiveMarker = "subjekt"; // 'subjekt' | 'praedikat' | 'versteckt'
var s11TokenState = {}; // id → marker string or null
var s11Tries = 0;
var s11Locked = false;

var s11Labels = {
  subjekt: "Subjekt",
  praedikat: "Prädikat",
  versteckt: "Prädikat mit verstecktem Subjekt",
};

function s11SelectMarker(type) {
  if (s11Locked) return;
  s11ActiveMarker = type;
  // Update circle active state
  ["subjekt", "praedikat", "versteckt"].forEach(function (t) {
    var btn = document.getElementById("s11-m-" + t);
    if (!btn) return;
    btn.classList.toggle("active", t === type);
  });
  // Update label
  var lbl = document.getElementById("s11-picker-label");
  if (lbl) lbl.textContent = s11Labels[type];
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("#mk-s11 .s11-token").forEach(function (el) {
    el.addEventListener("click", function () {
      if (s11Locked) return;
      if (!s11ActiveMarker) return;
      var id = el.dataset.id;
      var current = s11TokenState[id] || null;

      // Toggle off if same marker clicked again
      if (current === s11ActiveMarker) {
        s11TokenState[id] = null;
        el.classList.remove(
          "marked-subjekt",
          "marked-praedikat",
          "marked-versteckt",
        );
      } else {
        // Switch to new marker
        s11TokenState[id] = s11ActiveMarker;
        el.classList.remove(
          "marked-subjekt",
          "marked-praedikat",
          "marked-versteckt",
        );
        el.classList.add("marked-" + s11ActiveMarker);
      }
    });
  });
});

function checkS11() {
  if (s11Locked) return;
  s11Tries++;
  var attEl = document.getElementById("att-s11");
  if (attEl) attEl.textContent = "Versuche: " + s11Tries + " / 3";

  var tokens = document.querySelectorAll("#mk-s11 .s11-token");
  var correct = 0;
  var total = tokens.length;

  // Check each token
  var allCorrect = true;
  tokens.forEach(function (el) {
    var id = el.dataset.id;
    var expected = el.dataset.correct;
    var given = s11TokenState[id] || null;
    if (given !== expected) allCorrect = false;
    else correct++;
  });

  var fb = document.getElementById("fb-s11");
  var btn = document.getElementById("btn-s11");
  var next = document.getElementById("weiter-s11");

  if (allCorrect) {
    // All correct — green borders, lock
    tokens.forEach(function (el) {
      el.classList.add("s11-correct");
    });
    fb.className = "feedback show ok";
    fb.textContent = "Richtig! Alle Satzglieder korrekt bestimmt.";
    btn.disabled = true;
    s11Locked = true;
    if (next) next.style.display = "inline-block";
    markNav("s11", true);
  } else if (s11Tries < 3) {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    // Final — reveal with yellow + popover hints
    s11Locked = true;
    btn.disabled = true;

    var markerLabels = {
      subjekt: "Subjekt",
      praedikat: "Prädikat",
      versteckt: "Prädikat mit verstecktem Subjekt",
    };

    tokens.forEach(function (el) {
      var id = el.dataset.id;
      var expected = el.dataset.correct;
      var given = s11TokenState[id] || null;

      if (given === expected) {
        el.classList.add("s11-correct");
      } else {
        // Wrong or missing — yellow border, keep background, popover
        el.classList.add("s11-wrong");
        el.dataset.solutionTrigger = "1";
        var hint = markerLabels[expected];
        el.addEventListener("click", function () {
          showSolutionPopover(el, hint, true);
        });
      }
    });

    fb.className = "feedback show err";
    fb.textContent =
      correct +
      " von " +
      total +
      " Satzglieder korrekt. Klicke auf ein gelbes Wort für einen Hinweis.";
    if (next) next.style.display = "inline-block";
    markNav("s11", false);
  }
}

// ═══════════════════════════════════════════════════
//  S13 – Auf der Straße (2/2): Grammatikbegriffe
//  A = Wortart, B = Satzglied
//  (adapted from Lektion 12 Zeitenmix)
// ═══════════════════════════════════════════════════

var s13Data = [
  { id: "s13-artikel", form: "Artikel", ans: "A" },
  { id: "s13-subjekt", form: "Subjekt", ans: "B" },
  { id: "s13-praedikatsnomen", form: "Prädikatsnomen", ans: "B" },
  { id: "s13-pronomen", form: "Pronomen", ans: "A" },
  { id: "s13-praedikat", form: "Prädikat", ans: "B" },
  { id: "s13-adverb", form: "Adverb", ans: "A" },
];

var s13SelItem = null,
  s13SelCircle = null,
  s13Assign = {},
  s13WrongTg = {},
  s13Tries = 0,
  s13Locked = false,
  s13SpotlightItem = null,
  s13PreviewZone = null;

// Build items
document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("items13");
  if (!grid) return;
  s13Data.forEach(function (d) {
    var el = document.createElement("div");
    el.className = "zeit-item";
    el.id = d.id;
    el.textContent = d.form;
    el.onclick = function () {
      s13ClickItem(d.id);
    };
    grid.appendChild(el);
  });
});

function s13ClearCircles() {
  ["A", "B"].forEach(function (z) {
    var btn = document.getElementById("c13-" + z);
    if (btn) btn.classList.remove("active");
  });
}

function s13RestoreLockedState() {
  var allCorrect = s13Data.every(function (d) {
    return s13Assign[d.id] === d.ans;
  });
  s13Data.forEach(function (d) {
    var item = document.getElementById(d.id);
    var assigned = s13Assign[d.id];
    if (assigned === d.ans) {
      item.className = "zeit-item locked-ok-" + d.ans;
      item.style.pointerEvents = allCorrect ? "none" : "";
    } else {
      item.className = "zeit-item locked-wrong-" + (assigned || "none");
      item.style.pointerEvents = "";
    }
  });
  ["A", "B"].forEach(function (z) {
    var btn = document.getElementById("c13-" + z);
    if (btn) btn.classList.remove("circle-spotlight", "circle-dim");
  });
}

function s13ItemSpotlight(id) {
  var d = s13Data.filter(function (x) {
    return x.id === id;
  })[0];
  if (!d) return;
  s13SpotlightItem = id;
  s13ClearCircles();
  s13PreviewZone = null;
  s13Data.forEach(function (x) {
    var el = document.getElementById(x.id);
    el.className =
      x.id === id
        ? "zeit-item item-spotlight preview-active-" + d.ans
        : "zeit-item item-dim";
  });
  ["A", "B"].forEach(function (z) {
    var btn = document.getElementById("c13-" + z);
    if (!btn) return;
    if (z === d.ans) {
      btn.classList.add("circle-spotlight");
      btn.classList.remove("circle-dim");
    } else {
      btn.classList.add("circle-dim");
      btn.classList.remove("circle-spotlight");
    }
  });
}

function s13EndSpotlight() {
  if (!s13SpotlightItem) return;
  s13SpotlightItem = null;
  s13ClearCircles();
  s13RestoreLockedState();
}

function s13PreviewCircle(zone) {
  if (s13PreviewZone === zone) {
    s13PreviewZone = null;
    s13ClearCircles();
    s13RestoreLockedState();
    return;
  }
  s13PreviewZone = zone;
  s13SpotlightItem = null;
  s13ClearCircles();
  var btn = document.getElementById("c13-" + zone);
  if (btn) btn.classList.add("active");
  s13Data.forEach(function (d) {
    var item = document.getElementById(d.id);
    item.className =
      d.ans === zone
        ? "zeit-item preview-active-" + zone
        : "zeit-item preview-dim";
  });
}

function s13SelectCircle(zone) {
  if (s13Locked) {
    s13PreviewCircle(zone);
    return;
  }
  if (s13SelItem) {
    s13DoAssign(s13SelItem, zone);
    document.getElementById(s13SelItem).classList.remove("selected-item");
    s13SelItem = null;
    s13ClearCircles();
    s13SelCircle = null;
    return;
  }
  if (s13SelCircle === zone) {
    s13SelCircle = null;
    s13ClearCircles();
  } else {
    s13SelCircle = zone;
    s13ClearCircles();
    var btn = document.getElementById("c13-" + zone);
    if (btn) btn.classList.add("active");
  }
}

function s13ClickItem(id) {
  if (s13Locked) {
    if (s13WrongTg[id]) {
      if (s13SpotlightItem === id) s13EndSpotlight();
      else s13ItemSpotlight(id);
    }
    return;
  }
  var el = document.getElementById(id);
  if (s13Assign[id] && !s13SelItem && !s13SelCircle) {
    s13Assign[id] = null;
    el.className = "zeit-item";
    return;
  }
  if (s13SelCircle) {
    s13DoAssign(id, s13SelCircle);
    s13ClearCircles();
    s13SelCircle = null;
    if (s13SelItem) {
      document.getElementById(s13SelItem).classList.remove("selected-item");
      s13SelItem = null;
    }
    return;
  }
  if (s13SelItem === id) {
    s13SelItem = null;
    el.classList.remove("selected-item");
    return;
  }
  if (s13SelItem)
    document.getElementById(s13SelItem).classList.remove("selected-item");
  s13SelItem = id;
  el.classList.add("selected-item");
}

function s13DoAssign(itemId, zone) {
  s13Assign[itemId] = zone;
  document.getElementById(itemId).className = "zeit-item color-" + zone;
}

function checkS13() {
  if (s13Tries >= 3) return;
  s13Tries++;
  var locked = s13Tries >= 3;
  var attEl = document.getElementById("att-s13");
  if (attEl) attEl.textContent = "Versuche: " + s13Tries + " / 3";

  var score = 0;
  s13WrongTg = {};
  s13SelItem = null;
  s13SelCircle = null;
  s13PreviewZone = null;
  s13ClearCircles();

  s13Data.forEach(function (d) {
    if (s13Assign[d.id] === d.ans) score++;
  });
  var allOk = score === s13Data.length;
  var fb = document.getElementById("fb-s13");
  var next = document.getElementById("weiter-s13");

  if (allOk) {
    s13Data.forEach(function (d) {
      var item = document.getElementById(d.id);
      item.className = "zeit-item locked-ok-" + d.ans;
      item.style.pointerEvents = "none";
    });
    s13Locked = true;
    document.getElementById("btn-s13").disabled = true;
    if (next) next.style.display = "inline-block";
    fb.className = "feedback show ok";
    fb.textContent =
      "Richtig! Alle " + s13Data.length + " Begriffe korrekt zugeordnet.";
    markNav("s13", true);
  } else if (locked) {
    s13Data.forEach(function (d) {
      var item = document.getElementById(d.id);
      var assigned = s13Assign[d.id];
      if (assigned === d.ans) {
        item.className = "zeit-item locked-ok-" + d.ans;
        item.onclick = null;
      } else {
        item.className = "zeit-item locked-wrong-" + (assigned || "none");
        s13WrongTg[d.id] = { correct: d.ans };
      }
    });
    s13Locked = true;
    document.getElementById("btn-s13").disabled = true;
    document.getElementById("hint-s13").style.display = "block";
    if (next) next.style.display = "inline-block";
    fb.className = "feedback show err";
    fb.textContent =
      "Leider nicht geschafft. Klicke auf einen Kreis um die zugehörigen Begriffe anzuzeigen.";
    markNav("s13", false);
  } else {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  }
}

// Close spotlight/preview when clicking outside
document.addEventListener("click", function (e) {
  var target = e.target;
  var isZeit =
    target.classList.contains("zeit-item") ||
    (target.closest && target.closest(".zeit-item"));
  var isCircle =
    target.classList.contains("circle-btn") ||
    (target.closest && target.closest(".circle-btn"));
  if (s13SpotlightItem) {
    if (!isZeit && !isCircle) s13EndSpotlight();
  } else if (s13PreviewZone) {
    if (!isCircle) {
      s13PreviewZone = null;
      s13ClearCircles();
      s13RestoreLockedState();
    }
  }
});

// ═══════════════════════════════════════════════════
//  S12 – Auf der Straße (1/2): Pool + Tabelle
//  (same D&D system as S2)
// ═══════════════════════════════════════════════════

var s12SelectedChip = null;
var s12DragChipId = null;
var s12Tries = 0;
var s12Locked = false;

var s12CorrectMap = {
  "s12-slot-0": "s12-chip-1",
  "s12-slot-1": "s12-chip-2",
  "s12-slot-2": "s12-chip-4",
  "s12-slot-3": "s12-chip-5",
  "s12-slot-4": "s12-chip-0",
  "s12-slot-5": "s12-chip-3",
};

document.addEventListener("DOMContentLoaded", function () {
  initS12();
});

function initS12() {
  // Chips
  document.querySelectorAll("#s12-pool .s15-chip").forEach(function (chip) {
    chip.addEventListener("dragstart", function (e) {
      if (s12Locked) {
        e.preventDefault();
        return;
      }
      s12DragChipId = chip.id;
      e.dataTransfer.setData("text/plain", chip.id);
      chip.style.opacity = "0.5";
    });
    chip.addEventListener("dragend", function () {
      chip.style.opacity = "";
    });
    chip.addEventListener("click", function () {
      if (s12Locked) return;
      if (chip.classList.contains("used")) return;
      if (s12SelectedChip === chip) {
        chip.classList.remove("s2-selected");
        s12SelectedChip = null;
      } else {
        if (s12SelectedChip) s12SelectedChip.classList.remove("s2-selected");
        s12SelectedChip = chip;
        chip.classList.add("s2-selected");
      }
    });
  });

  // Slots
  document.querySelectorAll(".s12-slot").forEach(function (slot) {
    // Drag FROM filled slot
    slot.addEventListener("dragstart", function (e) {
      if (s12Locked || !slot.classList.contains("filled")) {
        e.preventDefault();
        return;
      }
      s12DragChipId = slot.dataset.chipId;
      e.dataTransfer.setData("text/plain", slot.dataset.chipId);
      slot.style.opacity = "0.5";
    });
    slot.addEventListener("dragend", function () {
      slot.style.opacity = "";
    });

    slot.addEventListener("dragover", function (e) {
      if (s12Locked) return;
      e.preventDefault();
      slot.classList.add("over");
    });
    slot.addEventListener("dragleave", function () {
      slot.classList.remove("over");
    });
    slot.addEventListener("drop", function (e) {
      if (s12Locked) return;
      e.preventDefault();
      slot.classList.remove("over");
      var chipId = e.dataTransfer.getData("text/plain") || s12DragChipId;
      s12PlaceChip(slot, chipId);
    });
    slot.addEventListener("click", function () {
      // Nach Lock: Popover für falsche Slots
      if (s12Locked) {
        if (slot.classList.contains("wrong") && slot.dataset.solution) {
          showSolutionPopover(slot, slot.dataset.solution, "left");
        }
        return;
      }
      // Vor Lock: Klick-Modus
      if (s12SelectedChip) {
        s12PlaceChip(slot, s12SelectedChip.id);
        s12SelectedChip.classList.remove("s2-selected");
        s12SelectedChip = null;
      } else if (slot.classList.contains("filled")) {
        // Chip im Slot auswählen (wie aus dem Pool klicken)
        var chipId = slot.dataset.chipId;
        var chip = document.getElementById(chipId);
        if (chip) {
          if (s12SelectedChip) s12SelectedChip.classList.remove("s2-selected");
          // Slot leeren, Chip wieder verfügbar machen
          slot.textContent = "";
          slot.classList.remove("filled", "ok", "wrong");
          slot.setAttribute("draggable", "false");
          delete slot.dataset.chipId;
          chip.classList.remove("used");
          delete chip.dataset.slotId;
          // Chip als ausgewählt markieren
          s12SelectedChip = chip;
          chip.classList.add("s2-selected");
        }
      }
    });

    // Slot wird draggable wenn gefüllt (via MutationObserver)
    slot.setAttribute("draggable", "false");
    var observer = new MutationObserver(function () {
      slot.setAttribute(
        "draggable",
        slot.classList.contains("filled") ? "true" : "false",
      );
    });
    observer.observe(slot, { attributes: true, attributeFilter: ["class"] });
  });
}

function s12PlaceChip(slot, chipId) {
  if (s12Locked || !chipId) return;
  var chip = document.getElementById(chipId);
  if (!chip) return;
  if (slot.dataset.chipId) s12ReturnChip(slot);
  var prevSlotId = chip.dataset.slotId;
  if (prevSlotId) {
    var prev = document.getElementById(prevSlotId);
    if (prev) {
      prev.textContent = "";
      prev.classList.remove("filled", "ok", "wrong");
      delete prev.dataset.chipId;
    }
    delete chip.dataset.slotId;
  }
  chip.classList.add("used");
  chip.dataset.slotId = slot.id;
  slot.textContent = chip.textContent;
  slot.classList.add("filled");
  slot.classList.remove("ok", "wrong");
  slot.dataset.chipId = chipId;
}

function s12ReturnChip(slot) {
  if (s12Locked) return;
  var chipId = slot.dataset.chipId;
  if (!chipId) return;
  var chip = document.getElementById(chipId);
  if (chip) {
    chip.classList.remove("used");
    delete chip.dataset.slotId;
  }
  slot.textContent = "";
  slot.classList.remove("filled", "ok", "wrong");
  delete slot.dataset.chipId;
}

function checkS12() {
  if (s12Locked) return;
  // Scroll to pool
  var pool = document.getElementById("s12-pool");
  if (pool) pool.scrollIntoView({ behavior: "smooth", block: "start" });
  s12Tries++;
  var attEl = document.getElementById("att-s12");
  if (attEl) attEl.textContent = "Versuche: " + s12Tries + " / 3";

  var slots = document.querySelectorAll(".s12-slot");
  var correct = 0;
  var total = slots.length;

  slots.forEach(function (slot) {
    var isOk = slot.dataset.chipId === s12CorrectMap[slot.id];
    slot.classList.remove("ok", "wrong");
    if (isOk) {
      slot.classList.add("ok");
      correct++;
    } else slot.classList.add("wrong");
  });

  var fb = document.getElementById("fb-s12");
  var btn = document.getElementById("btn-s12");
  var next = document.getElementById("weiter-s12");

  if (correct === total) {
    fb.className = "feedback show ok";
    fb.textContent = "Richtig! Alle " + total + " Zuordnungen korrekt.";
    btn.disabled = true;
    s12Locked = true;
    document.querySelectorAll("#s12-pool .s15-chip").forEach(function (c) {
      c.style.pointerEvents = "none";
    });
    if (next) next.style.display = "inline-block";
    markNav("s12", true);
  } else if (s12Tries < 3) {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    s12Locked = true;
    btn.disabled = true;
    document.querySelectorAll("#s12-pool .s15-chip").forEach(function (c) {
      c.style.pointerEvents = "none";
      c.style.cursor = "default";
    });
    fb.className = "feedback show err";
    fb.textContent =
      "Leider nicht geschafft. Klicke auf ein gelbes Feld um die richtige Antwort einzublenden.";
    if (next) next.style.display = "inline-block";
    markNav("s12", false);
    // Attach popover to wrong slots
    slots.forEach(function (slot) {
      if (!slot.classList.contains("wrong")) return;
      var correctChip = document.getElementById(s12CorrectMap[slot.id]);
      var solution = correctChip ? correctChip.textContent : "?";
      slot.dataset.solution = solution;
      slot.style.cursor = "pointer";
      slot.dataset.solutionTrigger = "1";
    });
  }
}

// ═══════════════════════════════════════════════════
//  S14 – Hin und her (Tabellen-Zuordnung)
// ═══════════════════════════════════════════════════

// Correct answers: chipId groups (Substantiv/Verb/Subjekt etc are interchangeable within category)
// We use category-matching: slot data-correct stores the chip-id whose TEXT matches the correct answer
// Since duplicate chips exist (sub1/sub2/sub3), we match by TEXT category

var s14CategoryMap = {
  "s14-chip-sub1": "Substantiv",
  "s14-chip-sub2": "Substantiv",
  "s14-chip-sub3": "Substantiv",
  "s14-chip-verb1": "Verb",
  "s14-chip-verb2": "Verb",
  "s14-chip-verb3": "Verb",
  "s14-chip-subj1": "Subjekt",
  "s14-chip-subj2": "Subjekt",
  "s14-chip-pn": "Prädikatsnomen",
  "s14-chip-pred1": "Prädikat",
  "s14-chip-pred2": "Prädikat",
  "s14-chip-pvs": "Prädikat mit verstecktem Subjekt",
};

// Correct category for each slot (derived from data-correct chip's category)
function s14CorrectCategory(slotId) {
  var slot = document.getElementById(slotId);
  if (!slot) return null;
  return s14CategoryMap[slot.dataset.correct] || null;
}

var s14SelectedChip = null;
var s14DragChipId = null;
var s14Tries = 0;
var s14Locked = false;

document.addEventListener("DOMContentLoaded", function () {
  initS14();
});

function initS14() {
  // Chips
  document.querySelectorAll("#s14-pool .s15-chip").forEach(function (chip) {
    chip.addEventListener("dragstart", function (e) {
      if (s14Locked) {
        e.preventDefault();
        return;
      }
      s14DragChipId = chip.id;
      e.dataTransfer.setData("text/plain", chip.id);
      chip.style.opacity = "0.5";
    });
    chip.addEventListener("dragend", function () {
      chip.style.opacity = "";
    });
    chip.addEventListener("click", function () {
      if (s14Locked) return;
      if (chip.classList.contains("used")) return;
      if (s14SelectedChip === chip) {
        chip.classList.remove("s2-selected");
        s14SelectedChip = null;
      } else {
        if (s14SelectedChip) s14SelectedChip.classList.remove("s2-selected");
        s14SelectedChip = chip;
        chip.classList.add("s2-selected");
      }
    });
  });

  // Slots
  document.querySelectorAll(".s14-slot").forEach(function (slot) {
    // Drag FROM filled slot
    slot.addEventListener("dragstart", function (e) {
      if (s14Locked || !slot.classList.contains("filled")) {
        e.preventDefault();
        return;
      }
      s14DragChipId = slot.dataset.chipId;
      e.dataTransfer.setData("text/plain", slot.dataset.chipId);
      slot.style.opacity = "0.5";
    });
    slot.addEventListener("dragend", function () {
      slot.style.opacity = "";
    });

    slot.addEventListener("dragover", function (e) {
      if (s14Locked) return;
      e.preventDefault();
      slot.classList.add("over");
    });
    slot.addEventListener("dragleave", function () {
      slot.classList.remove("over");
    });
    slot.addEventListener("drop", function (e) {
      if (s14Locked) return;
      e.preventDefault();
      slot.classList.remove("over");
      var chipId = e.dataTransfer.getData("text/plain") || s14DragChipId;
      s14PlaceChip(slot, chipId);
    });
    slot.addEventListener("click", function () {
      // Nach Lock: Popover für falsche Slots
      if (s14Locked) {
        if (slot.classList.contains("wrong") && slot.dataset.solutionText) {
          showSolutionPopover(slot, slot.dataset.solutionText, true);
        }
        return;
      }
      // Vor Lock: Klick-Modus
      if (s14SelectedChip) {
        s14PlaceChip(slot, s14SelectedChip.id);
        s14SelectedChip.classList.remove("s2-selected");
        s14SelectedChip = null;
      } else if (slot.classList.contains("filled")) {
        // Chip im Slot auswählen (wie aus dem Pool klicken)
        var chipId = slot.dataset.chipId;
        var chip = document.getElementById(chipId);
        if (chip) {
          if (s14SelectedChip) s14SelectedChip.classList.remove("s2-selected");
          // Slot leeren, Chip wieder verfügbar machen
          slot.textContent = "";
          slot.classList.remove("filled", "ok", "wrong");
          slot.setAttribute("draggable", "false");
          delete slot.dataset.chipId;
          chip.classList.remove("used");
          delete chip.dataset.slotId;
          // Chip als ausgewählt markieren
          s14SelectedChip = chip;
          chip.classList.add("s2-selected");
        }
      }
    });

    // Slot wird draggable wenn gefüllt (via MutationObserver)
    slot.setAttribute("draggable", "false");
    var observer = new MutationObserver(function () {
      slot.setAttribute(
        "draggable",
        slot.classList.contains("filled") ? "true" : "false",
      );
    });
    observer.observe(slot, { attributes: true, attributeFilter: ["class"] });
  });
}

function s14PlaceChip(slot, chipId) {
  if (s14Locked || !chipId) return;
  var chip = document.getElementById(chipId);
  if (!chip) return;
  if (slot.dataset.chipId) s14ReturnChip(slot);
  var prevSlotId = chip.dataset.slotId;
  if (prevSlotId) {
    var prev = document.getElementById(prevSlotId);
    if (prev) {
      prev.textContent = "";
      prev.classList.remove("filled", "ok", "wrong");
      delete prev.dataset.chipId;
    }
    delete chip.dataset.slotId;
  }
  chip.classList.add("used");
  chip.dataset.slotId = slot.id;
  slot.textContent = chip.textContent;
  slot.classList.add("filled");
  slot.classList.remove("ok", "wrong");
  slot.dataset.chipId = chipId;
}

function s14ReturnChip(slot) {
  if (s14Locked) return;
  var chipId = slot.dataset.chipId;
  if (!chipId) return;
  var chip = document.getElementById(chipId);
  if (chip) {
    chip.classList.remove("used");
    delete chip.dataset.slotId;
  }
  slot.textContent = "";
  slot.classList.remove("filled", "ok", "wrong");
  delete slot.dataset.chipId;
}

function checkS14() {
  if (s14Locked) return;
  // Scroll to pool
  var pool = document.getElementById("s14-pool");
  if (pool) pool.scrollIntoView({ behavior: "smooth", block: "start" });
  s14Tries++;
  var attEl = document.getElementById("att-s14");
  if (attEl) attEl.textContent = "Versuche: " + s14Tries + " / 3";

  var slots = document.querySelectorAll(".s14-slot");
  var correct = 0;
  var total = slots.length;

  slots.forEach(function (slot) {
    var placed = slot.dataset.chipId || null;
    var placedCat = placed ? s14CategoryMap[placed] || null : null;
    var correctCat = s14CorrectCategory(slot.id);
    var isOk = placedCat && placedCat === correctCat;
    slot.classList.remove("ok", "wrong");
    if (isOk) {
      slot.classList.add("ok");
      correct++;
    } else slot.classList.add("wrong");
  });

  var fb = document.getElementById("fb-s14");
  var btn = document.getElementById("btn-s14");
  var next = document.getElementById("weiter-s14");

  if (correct === total) {
    fb.className = "feedback show ok";
    fb.textContent = "Richtig! Alle " + total + " Felder korrekt ausgefüllt.";
    btn.disabled = true;
    s14Locked = true;
    document.querySelectorAll("#s14-pool .s15-chip").forEach(function (c) {
      c.style.pointerEvents = "none";
    });
    if (next) next.style.display = "inline-block";
    markNav("s14", true);
  } else if (s14Tries < 3) {
    fb.className = "feedback show warn";
    fb.textContent = "Das ist noch nicht richtig.";
  } else {
    s14Locked = true;
    btn.disabled = true;
    document.querySelectorAll("#s14-pool .s15-chip").forEach(function (c) {
      c.style.pointerEvents = "none";
      c.style.cursor = "default";
    });
    fb.className = "feedback show err";
    fb.textContent =
      "Leider nicht geschafft. Klicke auf ein gelbes Feld um die richtige Antwort einzublenden.";
    if (next) next.style.display = "inline-block";
    markNav("s14", false);

    slots.forEach(function (slot) {
      if (!slot.classList.contains("wrong")) return;
      slot.style.cursor = "pointer";
      slot.dataset.solutionTrigger = "1";
      var solution = s14CorrectCategory(slot.id) || "?";
      slot.dataset.solutionText = solution;
    });
  }
}

// ═══════════════════════════════════════════════════
//  S15 – Übersicht (Zusammenfassung aller Aufgaben)
// ═══════════════════════════════════════════════════

// Station metadata
// type: 'exercise' = bewertet | 'media' = Audio/Video/Text (immer Verstanden, 1 Versuch)
// points: Punkte bei korrekter Lösung (S8 hat 5 pro Satz = 30)
var s15Stations = [
  { id: "s1",  label: "Zeitreise ins alte Rom",              type: "media",    points: 1  },
  { id: "s2",  label: "Willkommen im alten Rom!",            type: "exercise", points: 5  },
  { id: "s3",  label: "Eine römische Familie stellt sich vor", type: "media",  points: 1  },
  { id: "s4",  label: "Die Cornelier",                       type: "exercise", points: 4  },
  { id: "s5",  label: "G1 Satzglied, Wortart, Form",         type: "media",   points: 1  },
  { id: "s6",  label: "G2 Eine Sprache ohne Artikel",        type: "media",   points: 1  },
  { id: "s7",  label: "G3 Verstecktes Subjekt",              type: "media",   points: 1  },
  { id: "s8",  label: "Der Besuch des Großvaters",           type: "exercise", points: 30 },
  { id: "s9",  label: "G4 Prädikatsnomen",                   type: "media",   points: 1  },
  { id: "s10", label: "Übung zum Prädikatsnomen",            type: "exercise", points: 5  },
  { id: "s11", label: "Satzglieder bestimmen",               type: "exercise", points: 5  },
  { id: "s12", label: "Auf der Straße (1/2)",                type: "exercise", points: 2.5},
  { id: "s13", label: "Auf der Straße (2/2)",                type: "exercise", points: 3  },
  { id: "s14", label: "Hin und her",                         type: "exercise", points: 6  },
];

// Read result from nav button state
function s15GetStationResult(id) {
  var btn = document.getElementById("nav-" + id);
  if (!btn) return "pending";
  if (btn.classList.contains("done-ok")) return "ok";
  if (btn.classList.contains("done-fail")) return "fail";
  if (btn.classList.contains("done-pending")) return "pending";
  // media stations are always 'verstanden' if the weiter button was used
  return "pending";
}

// Get attempts used for a station
function s15GetAttempts(id) {
  var st = s15Stations.find(function(s){ return s.id === id; });
  if (!st) return 0;
  if (st.type === "media") return 1;
  // Use tries variables
  var map = {
    s2: function(){ return s2Tries; },
    s4: function(){ return s4Tries; },
    s8: function(){ return s8Tries; },
    s10: function(){ return s10Tries; },
    s11: function(){ return s11Tries; },
    s12: function(){ return typeof s12Tries !== "undefined" ? s12Tries : 0; },
    s13: function(){ return s13Tries; },
    s14: function(){ return s14Tries; },
  };
  return map[id] ? map[id]() : 0;
}

// Get actually earned points for a station (partial credit for partially correct answers)
function s15GetEarnedPoints(id, st) {
  var res = s15GetStationResult(id);
  if (st.type === "media") return st.points;
  if (res === "ok") return st.points;
  if (res === "pending") return null; // not attempted

  // res === "fail" – count correctly answered sub-items
  if (id === "s8") {
    // 5 pts per sentence (6 sentences). Correct inputs have class "ok" or readOnly+ok
    var correct = 0;
    s8Keys.forEach(function(k) {
      var inp = document.getElementById("s6-in-" + k);
      if (inp && inp.classList.contains("ok")) correct++;
    });
    return correct * 5;
  }
  if (id === "s2") {
    var correct = document.querySelectorAll(".s2-slot.ok").length;
    return correct * 0.5; // 0.5 pt per slot, 5 total
  }
  if (id === "s4") {
    var correct = 0;
    s4Inputs.forEach(function(key) {
      var inp = document.getElementById("s4-in-" + key);
      if (inp && inp.classList.contains("ok")) correct++;
    });
    return correct * 0.5; // 0.5 pt per input, 4 total
  }
  if (id === "s10") {
    // 1 pt per correctly solved sentence (5 total):
    // sentence correct = right token marked AND no wrong token in same sentence marked
    var sentences = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19],
    ];
    var correctSentences = 0;
    sentences.forEach(function(ids) {
      var sentenceTokens = s10Data.tokens.filter(function(t) { return ids.indexOf(t.id) !== -1; });
      var correctId = sentenceTokens.find(function(t) { return t.correct; });
      if (!correctId) return;
      var correctMarked = s10State.marked.indexOf(correctId.id) !== -1;
      var anyWrongMarked = sentenceTokens.some(function(t) { return !t.correct && s10State.marked.indexOf(t.id) !== -1; });
      // Also check via CSS if locked (state.marked may be cleared on reset)
      var correctEl = document.querySelector("#mk-s10 .mk-token[data-id='" + correctId.id + "']");
      var lockedCorrect = correctEl && correctEl.classList.contains("mk--correct");
      if (lockedCorrect || (correctMarked && !anyWrongMarked)) correctSentences++;
    });
    return correctSentences;
  }
  if (id === "s11") {
    return 0; // token multi-marker: no partial credit
  }
  if (id === "s12") {
    var correct = document.querySelectorAll("#s12 .s2-slot.ok, #s12 .ok").length;
    return Math.min(correct * 0.5, st.points); // 0.5 pt per slot, 2.5 total
  }
  if (id === "s13") {
    var correct = 0;
    s13Data.forEach(function(d) {
      if (s13Assign[d.id] === d.ans) correct++;
    });
    return correct * 0.5; // 0.5 pt per item, 3 total
  }
  if (id === "s14") {
    var correct = document.querySelectorAll(".s14-slot.ok").length;
    return correct * 0.5; // 0.5 pt per slot, 6 total
  }
  return 0;
}

// Called on page load – builds the task list immediately, medal card stays hidden
function initS15Overview() {
  // Build task list with pending state
  var list = document.getElementById("s15-task-list");
  if (list) {
    list.innerHTML = "";
    s15Stations.forEach(function(st, idx) {
      var row = document.createElement("div");
      row.className = "s15-task-row";
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", "Zur Aufgabe " + st.label);

      var icon, iconClass, statusText;
      if (st.type === "media") {
        icon = "👁"; iconClass = "s15-row-icon-info"; statusText = "Verstanden";
      } else {
        icon = "–"; iconClass = "s15-row-icon-pending"; statusText = "Ausstehend";
      }

      var ptsStr = st.type !== "media"
        ? '<span class="s15-row-pts s15-row-pts-pending">– / ' + st.points + ' Pkt.</span>'
        : '<span class="s15-row-pts"></span>';

      row.innerHTML =
        '<span class="s15-row-num">' + (idx + 1) + '</span>' +
        '<span class="s15-row-label">' + st.label + '</span>' +
        '<span class="s15-row-tries"></span>' +
        ptsStr +
        '<span class="s15-row-icon ' + iconClass + '">' + icon + '</span>';

      (function(stId){
        row.addEventListener("click", function(){ showSection(stId); });
        row.addEventListener("keydown", function(e){
          if (e.key === "Enter" || e.key === " ") showSection(stId);
        });
      })(st.id);

      list.appendChild(row);
    });
  }
}

function showS15Overview() {
  // Check if all tasks are done (ok or fail, media always counts)
  var allDone = s15Stations.every(function(st) {
    if (st.type === "media") return true;
    var res = s15GetStationResult(st.id);
    return res === "ok" || res === "fail";
  });

  // Always update the task list with current state
  var list = document.getElementById("s15-task-list");
  if (list) {
    list.innerHTML = "";
    s15Stations.forEach(function(st, idx) {
      var res = s15GetStationResult(st.id);
      var att = s15GetAttempts(st.id);
      var earnedPts = s15GetEarnedPoints(st.id, st);

      var row = document.createElement("div");
      row.className = "s15-task-row";
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", "Zur Aufgabe " + st.label);

      var icon, iconClass;
      if (st.type === "media") {
        icon = "👁"; iconClass = "s15-row-icon-info";
      } else if (res === "ok") {
        icon = "✓"; iconClass = "s15-row-icon-ok";
      } else if (res === "fail") {
        icon = "!"; iconClass = "s15-row-icon-fail";
      } else {
        icon = "–"; iconClass = "s15-row-icon-pending";
      }

      var triesStr = (st.type !== "media" && att > 0) ? att + (att === 1 ? " Versuch" : " Versuche") : "";
      var ptsClass = res === "ok"           ? "s15-row-pts-ok"
                   : earnedPts !== null && earnedPts > 0 ? "s15-row-pts-partial"
                   : res === "fail"         ? "s15-row-pts-fail"
                   : "s15-row-pts-pending";
      var ptsStr = st.type !== "media"
        ? (earnedPts !== null
            ? '<span class="s15-row-pts ' + ptsClass + '">' + earnedPts + '&thinsp;/&thinsp;' + st.points + ' Pkt.</span>'
            : '<span class="s15-row-pts s15-row-pts-pending">– / ' + st.points + ' Pkt.</span>')
        : '<span class="s15-row-pts"></span>';

      row.innerHTML =
        '<span class="s15-row-num">' + (idx + 1) + '</span>' +
        '<span class="s15-row-label">' + st.label + '</span>' +
        '<span class="s15-row-tries">' + triesStr + '</span>' +
        ptsStr +
        '<span class="s15-row-icon ' + iconClass + '">' + icon + '</span>';

      (function(stId){
        row.addEventListener("click", function(){ showSection(stId); });
        row.addEventListener("keydown", function(e){
          if (e.key === "Enter" || e.key === " ") showSection(stId);
        });
      })(st.id);

      list.appendChild(row);
    });
  }

  // Navigate to S15
  showSection("s15");

  // If not all tasks done: show pending state and stop here
  if (!allDone) {
    var medalCard = document.getElementById("s15-medal-card");
    if (medalCard) medalCard.className = "s15-medal-card s15-medal-pending";
    var emojiEl = document.getElementById("s15-medal-emoji");
    if (emojiEl) emojiEl.textContent = "✏️";
    var labelEl = document.getElementById("s15-score-label");
    if (labelEl) labelEl.textContent = "Löse erst alle Aufgaben.";
    var subEl = document.getElementById("s15-score-sublabel");
    if (subEl) subEl.textContent = "Dein Ergebnis erscheint, wenn du alle Aufgaben erledigt hast.";
    var track = document.getElementById("s15-progress-track");
    if (track) track.style.display = "none";
    return;
  }

  // Compute scores
  var totalPossible = 0;
  var totalEarned = 0;

  s15Stations.forEach(function(st) {
    var res = s15GetStationResult(st.id);
    if (st.type === "media") {
      totalEarned += st.points;
      totalPossible += st.points;
    } else {
      totalPossible += st.points;
      var earned = s15GetEarnedPoints(st.id, st);
      if (earned === null) earned = 0;
      totalEarned += earned;
    }
  });

  var pct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  // Medal
  var medal, medalClass, barColor, scoreText, gradeNum, gradeText, gradeChipClass;
  if (pct >= 85) {
    medal = "🥇"; medalClass = "s15-gold";   barColor = "#f59e0b"; scoreText = "Hervorragend!";
    gradeNum = 1; gradeText = "sehr gut";     gradeChipClass = "s15-chip-grade-1";
  } else if (pct >= 70) {
    medal = "🥈"; medalClass = "s15-silver";  barColor = "#94a3b8"; scoreText = "Gut gemacht!";
    gradeNum = 2; gradeText = "gut";           gradeChipClass = "s15-chip-grade-2";
  } else if (pct >= 55) {
    medal = "🥉"; medalClass = "s15-bronze";  barColor = "#cd7f32"; scoreText = "Befriedigend!";
    gradeNum = 3; gradeText = "befriedigend";  gradeChipClass = "s15-chip-grade-3";
  } else if (pct >= 45) {
    medal = "😐"; medalClass = "s15-passed";  barColor = "#6b7280"; scoreText = "Bestanden.";
    gradeNum = 4; gradeText = "ausreichend";   gradeChipClass = "s15-chip-grade-4";
  } else {
    medal = "😭"; medalClass = "s15-failed";  barColor = "#ef4444"; scoreText = "Nicht bestanden.";
    gradeNum = 5; gradeText = "mangelhaft";    gradeChipClass = "s15-chip-grade-5";
  }

  var medalCard = document.getElementById("s15-medal-card");
  if (medalCard) {
    medalCard.className = "s15-medal-card " + medalClass;
  }
  var emojiEl = document.getElementById("s15-medal-emoji");
  if (emojiEl) emojiEl.textContent = medal;

  var labelEl = document.getElementById("s15-score-label");
  if (labelEl) labelEl.textContent = pct + " %";

  var subEl = document.getElementById("s15-score-sublabel");
  if (subEl) subEl.textContent = scoreText + " (" + totalEarned + " / " + totalPossible + " Punkte)";

  // Show and animate progress bar
  var track = document.getElementById("s15-progress-track");
  if (track) track.style.display = "";
  var fill = document.getElementById("s15-progress-fill");
  if (fill) {
    fill.style.background = barColor;
    fill.style.width = "0%";
    setTimeout(function(){
      fill.style.width = pct + "%";
    }, 300);
  }


  // Confetti for Gold/Silver
  if (pct >= 70) {
    setTimeout(function(){ s15LaunchConfetti(); }, 400);
  }
}

// ── Confetti ─────────────────────────────────────────────────
function s15LaunchConfetti() {
  var canvas = document.getElementById("s15-confetti-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.offsetWidth;
  var H = canvas.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  var colors = ["#f59e0b","#fbbf24","#34d399","#60a5fa","#f472b6","#a78bfa","#fb7185","#4ade80"];
  var pieces = [];
  for (var i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * W,
      y: -Math.random() * H * 0.5 - 10,
      r: Math.random() * 7 + 3,
      d: Math.random() * 80 + 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      vy: Math.random() * 2 + 2,
      vx: Math.random() * 2 - 1,
    });
  }

  var frame = 0;
  var maxFrames = 200;

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(function(p) {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.tiltAngle, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = frame < maxFrames ? Math.min(1, 1 - (frame - 140) / 60) : 0;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    pieces.forEach(function(p) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(frame * 0.02 + p.d) * 0.5;
      p.tiltAngle += p.tiltSpeed;
    });
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(drawFrame);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }
  requestAnimationFrame(drawFrame);
}

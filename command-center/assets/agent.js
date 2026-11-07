// Agent: a chat with your own AI, the way the Claude desktop app looks. DESIGN ONLY for now: nothing here runs
// a command or calls an AI. Until it's switched on, members use their AI of choice in the terminal, in this repo.
const AGENT_SUGGESTIONS = [
  ["pencil", "Write this week's Threads post"],
  ["globe", "How did my website do this week?"],
  ["checkCircle", "Save my work"],
  ["calendarDays", "What's on my content calendar?"],
];

function renderAgent() {
  const name = firstName();
  return h("div", { class: "agent-page" }, [
    // the middle: what this is and that it isn't on yet
    h("div", { class: "agent-hero" }, [
      h("div", { class: "agent-soon" }, [h("span", { class: "agent-soon-dot" }), "Coming soon"]),
      h("h1", { class: "agent-h1" }, [
        h("span", { class: "agent-mark", html: lineIcon("sparkles") }),
        name ? `What should we work on, ${name}?` : "What should we work on?",
      ]),
      h(
        "p",
        { class: "tiny-sub agent-note" },
        "Not switched on yet. Until it is, open your AI (Claude Code, Codex or Gemini) in this folder and ask it there: it reads the same repo.",
      ),
    ]),
    // the bottom, like every chat app: suggestions, then the message bar
    h("div", { class: "agent-dock" }, [
      h(
        "div",
        { class: "agent-chips" },
        AGENT_SUGGESTIONS.map(([ic, text]) =>
          h("button", { type: "button", class: "agent-chip", disabled: "" }, [h("span", { class: "child-ic", html: lineIcon(ic) }), text]),
        ),
      ),
      h("div", { class: "glass agent-composer", "aria-disabled": "true" }, [
        h("textarea", {
          class: "agent-input",
          rows: "2",
          disabled: "",
          placeholder: "Ask your department anything. Quick, short tasks work best.",
        }),
        h("div", { class: "agent-bar" }, [
          h("button", { type: "button", class: "agent-icon-btn", disabled: "", "aria-label": "Attach a file", html: lineIcon("paperclip") }),
          h("span", { class: "agent-model" }, [h("span", { class: "agent-dot" }), "Your AI · set in Settings → AI Agents"]),
          h("button", { type: "button", class: "agent-send", disabled: "", "aria-label": "Send", html: lineIcon("arrowUp") }),
        ]),
      ]),
    ]),
  ]);
}

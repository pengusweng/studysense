/** Task 4 v2: student-selected, predefined academic support. No emotion inference. */
export type AcademicNeed = "understand" | "apply" | "remember" | "organize" | "energy" | "workload" | "unsure" | "other";
export type SupportChoice = { id: string; label: string; text: string };
export type Clarifier = { heading: string; options: { id: string; label: string }[] };

export const ACADEMIC_NEEDS: { id: AcademicNeed; label: string }[] = [
  { id: "understand", label: "Understanding a topic" },
  { id: "apply", label: "Applying what I've learned" },
  { id: "remember", label: "Remembering information" },
  { id: "organize", label: "Getting started or organizing tasks" },
  { id: "energy", label: "Managing my energy or concentration" },
  { id: "workload", label: "Handling a heavy workload" },
  { id: "unsure", label: "I'm not sure what I need" },
  { id: "other", label: "Something else" },
];

export const CLARIFIERS: Partial<Record<AcademicNeed, Clarifier>> = {
  understand: {
    heading: "Let's find an approach you'd like to try. Which part would you like help with?",
    options: [
      { id: "concept", label: "The explanation or concept isn't clear" },
      { id: "apply", label: "I understand it, but using it is difficult" },
      { id: "remember", label: "It's hard to remember" },
      { id: "organize", label: "I don't know where to begin" },
      { id: "unsure", label: "I'm not sure" },
    ],
  },
  apply: {
    heading: "Which part of applying it is difficult?",
    options: [
      { id: "approach", label: "Choosing an approach" },
      { id: "steps", label: "Following the steps" },
      { id: "check", label: "Checking my answer" },
      { id: "unsure", label: "I'm not sure" },
      { id: "now", label: "See strategies now" },
    ],
  },
  unsure: {
    heading: "Would one quick question help you choose?",
    options: [
      { id: "concept", label: "I'm unsure what part is difficult" },
      { id: "organize", label: "I'm having trouble getting started" },
      { id: "energy", label: "I'm tired or distracted" },
      { id: "general", label: "Show support options instead" },
    ],
  },
  organize: {
    heading: "What would make starting easier?",
    options: [
      { id: "first", label: "Pick one first task" },
      { id: "smaller", label: "Break a task into smaller steps" },
      { id: "priority", label: "Work out what needs attention soon" },
      { id: "general", label: "See options without planning" },
    ],
  },
  energy: {
    heading: "What would help you most right now?",
    options: [
      { id: "pause", label: "Take a short pause" },
      { id: "lighter", label: "Make my study plan lighter" },
      { id: "both", label: "Both, and I'll choose where to start" },
      { id: "continue", label: "Continue studying without suggestions" },
      { id: "general", label: "See other support options" },
    ],
  },
  workload: {
    heading: "Which kind of support would be most useful?",
    options: [
      { id: "pause", label: "Some breathing room" },
      { id: "organize", label: "Help organizing tasks" },
      { id: "both", label: "Both" },
      { id: "unsure", label: "I'm not sure" },
      { id: "continue", label: "Continue without assistance" },
    ],
  },
};

/** Optional second question only where the approved branch requires it. */
export const FOLLOWUPS: Partial<Record<AcademicNeed, Partial<Record<string, Clarifier>>>> = {
  organize: {
    priority: {
      heading: "What matters most for choosing your first step?",
      options: [
        { id: "deadline", label: "Closest deadline" },
        { id: "importance", label: "Most important task" },
        { id: "smallest", label: "Smallest manageable step" },
        { id: "unsure", label: "I'm not sure" },
      ],
    },
  },
  energy: {
    lighter: {
      heading: "Would you prefer shorter study intervals, smaller tasks, or both?",
      options: [
        { id: "shorter", label: "Shorter intervals" },
        { id: "smaller", label: "Smaller tasks" },
        { id: "both", label: "Both" },
        { id: "continue", label: "Keep studying" },
      ],
    },
  },
  workload: {
    both: {
      heading: "Which would you like to start with?",
      options: [
        { id: "pause", label: "Pause first" },
        { id: "organize", label: "Organize tasks first" },
        { id: "both", label: "See both options" },
        { id: "continue", label: "Continue studying" },
      ],
    },
  },
};

export const STRATEGIES: Record<AcademicNeed | "concept", SupportChoice[]> = {
  understand: [
    { id: "example", label: "Simpler example", text: "Look for one simpler example in your notes or course materials. Compare it with the current problem." },
    { id: "parts", label: "Smaller parts", text: "Choose one small part of the topic to understand first, then move to the next." },
    { id: "prerequisite", label: "Prerequisite", text: "Review one earlier idea this topic depends on, then return to the new material." },
    { id: "starting", label: "Find a starting point", text: "Start with the term or step that feels least clear. Focus on just that part first." },
  ],
  concept: [
    { id: "example", label: "Simpler example", text: "Look for one simpler example in your notes or course materials. Compare it with the current problem." },
    { id: "parts", label: "Smaller parts", text: "Choose one small part of the topic to understand first, then move to the next." },
    { id: "prerequisite", label: "Prerequisite", text: "Review one earlier idea this topic depends on, then return to the new material." },
    { id: "starting", label: "Find a starting point", text: "Start with the term or step that feels least clear. Focus on just that part first." },
  ],
  apply: [
    { id: "worked", label: "Worked example", text: "Review a worked example from your materials. Notice why each step was chosen before trying a similar problem." },
    { id: "guided", label: "Guided practice", text: "Try the first step of a similar problem, check your notes, then continue one step at a time." },
    { id: "independent", label: "Independent practice", text: "Try one practice question without looking at the solution, then compare your steps with the available explanation." },
  ],
  remember: [
    { id: "recall", label: "Recall practice", text: "Try recalling the main points without looking. Then check your notes to see what you missed." },
    { id: "spread", label: "Spread reviews out", text: "Return to this material in a later study session rather than doing all your reviewing at once." },
    { id: "both", label: "Both", text: "Test what you remember now, then plan another review later." },
  ],
  organize: [
    { id: "first", label: "Pick one first task", text: "Choose one realistic first step you can take now." },
    { id: "smaller", label: "Break a task into smaller steps", text: "Try identifying the next action you can take—not the entire assignment." },
    { id: "priority", label: "Work out what needs attention soon", text: "Choose what matters most: the closest deadline, the most important task, or the smallest manageable step." },
  ],
  energy: [
    { id: "pause", label: "Take a short pause", text: "If you'd like, take a short pause and return when you're ready." },
    { id: "lighter", label: "Make my study plan lighter", text: "Choose one smaller next step or a shorter study interval that feels manageable." },
    { id: "both", label: "Both", text: "Choose whether to pause first or start with a smaller study step." },
  ],
  workload: [
    { id: "pause", label: "Some breathing room", text: "If you'd like, take a short pause and return when you're ready." },
    { id: "organize", label: "Help organizing tasks", text: "Try identifying the next action you can take—not the entire assignment." },
    { id: "both", label: "Both", text: "Choose whether you'd prefer to pause first or organize tasks first." },
    { id: "unsure", label: "I'm not sure", text: "You can choose one small step now, explore support options, or return to studying." },
  ],
  unsure: [
    { id: "options", label: "See all support options", text: "Choose any available approach, or return to studying." },
  ],
  other: [
    { id: "steps", label: "Break my work into smaller steps", text: "Try identifying the next action you can take—not the entire assignment." },
    { id: "pause", label: "Take a short pause", text: "If you'd like, take a short pause and return when you're ready." },
    { id: "lighter", label: "Use a lighter study approach", text: "Choose one smaller next step or a shorter study interval that feels manageable." },
  ],
};

export function resolveNeed(need: AcademicNeed, clarification: string | null): AcademicNeed | "concept" {
  if (need === "understand" && clarification) {
    if (clarification === "concept") return "concept";
    if (clarification === "apply" || clarification === "remember" || clarification === "organize" || clarification === "unsure") return clarification;
  }
  if (need === "unsure" && clarification) {
    if (clarification === "concept") return "concept";
    if (clarification === "organize" || clarification === "energy") return clarification;
  }
  return need;
}


/** Keep a volunteered follow-up choice meaningful; never invent task times. */
export function strategiesFor(
  need: AcademicNeed,
  clarification: string | null,
  followupChoice: string | null,
): SupportChoice[] {
  const base = STRATEGIES[resolveNeed(need, clarification)];
  if (!followupChoice) return base;
  if (need === "workload" && clarification === "both") {
    const first = followupChoice === "pause" ? "pause" : followupChoice === "organize" ? "organize" : "both";
    return [...base].sort((a, b) => Number(b.id === first) - Number(a.id === first));
  }
  if (need === "energy" && clarification === "lighter") {
    const message = followupChoice === "shorter"
      ? "Choose a shorter study interval that feels manageable."
      : followupChoice === "smaller"
      ? "Choose one smaller next step that feels manageable."
      : "Choose a shorter study interval and one smaller next step that feel manageable.";
    return [{ id: "lighter", label: "Make my study plan lighter", text: message }, ...base.filter((item) => item.id !== "lighter")];
  }
  if (need === "organize" && clarification === "priority") {
    const focus = followupChoice === "deadline"
      ? "Choose the task with the closest deadline as your first step, if realistic."
      : followupChoice === "importance"
      ? "Choose the most important task as your first step."
      : followupChoice === "smallest"
      ? "Choose the smallest manageable step to get started."
      : "Choose one realistic first step. You can change priorities later.";
    return [{ id: "priority", label: "Start with my chosen priority", text: focus }, ...base.filter((item) => item.id !== "priority")];
  }
  return base;
}

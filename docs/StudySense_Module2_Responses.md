# Answer the following questions

## 1. What inference from Module 2 will actually affect system behavior?

StudySense will estimate four stress-anxiety categories using wearable-derived physiological features: Low Stress-Low Anxiety (LSLA), Low Stress-High Anxiety (LSHA), High Stress - Low Anxiety (HSLA), and High Stress - High Anxiety (HSHA). These categories follow our professor’s recommended operational definition using 50 as the midpoint of the SSAQS self-reported scores. This would provide a transparent, consistent and reproducible boundary for distinguishing relatively lower and higher levels of the construct of the SSAQS dataset on a continuous 0-100 scale. Scores below 50 are classified as lower stress or anxiety, while scores of 50 or above are classified as higher. This midpoint is a predefined operational threshold rather than a clinically validated boundary.

The predicted category, together with the academic context, model uncertainty, and student confirmation, will determine whether the system offers assistance, suggests recovery, requests clarification, or avoids interrupting the student. These predictions represent daily stress-anxiety estimates rather than direct recognition of momentary academic emotions.

## 2. What decisions should be available to the system?

StudySense should be able to offer academic assistance, ask clarification questions, adapt study recommendations, provide encouragement, suggest recovery breaks, adjust interaction pacing or remain silent.

For example, when elevated stress and anxiety are predicted, the system may offer an optional check-in. If the student confirms feeling overwhelmed, it can suggest breaking tasks into smaller steps or taking a short break. If the student reports being comfortable and focused, it should preserve their study flow.

## 3. What should the system never do automatically?

StudySense should never diagnose psychological conditions, assume that physiological measurements directly reveal emotions, or force students to stop studying based solely on model predictions.

It should not modify academic tasks, disclose sensitive information, or initiate intrusive interventions without appropriate consent. Students must retain control over their information, study activities and decisions to accept or decline assistance.

## 4. Should the response be verbal, nonverbal, or both? Why?

StudySense should combine both verbal and nonverbal responses through a minimally intrusive interface. Verbal communication can consist of brief written messages, clarification questions, and supportive recommendations, while nonverbal responses may include subtle visual indicators, dashboard updates and optional notifications.

This combination allows StudySense to communicate relevant information while minimizing unnecessary interruptions. Response presentation should depend on the student’s preferences and academic context.

## 5. What interface or embodiment is appropriate?

A web-based adaptive academic support interface with an optional text-based conversational assistant is the most appropriate approach for StudySense.

The interface can display physiological summaries, predicted stress-anxiety categories, study-session information, and available support options. Students can provide brief self-reports to clarify their condition and preferences. This approach is accessible, minimally intrusive, and practical for the project’s development scope without requiring a physical robot, animated avatar, or voice-based agent.

## 6. How will the response be selected?

StudySense will use a hybrid approach that combines machine learning predictions with rule-based response selection.

A machine learning model will estimate the stress-anxiety category from available physiological and behavioral features. A separate rule-based decision mechanism will consider the prediction, uncertainty, academic context, and student preferences before selecting an appropriate response.

Predefined response templates will provide consistent and explainable recommendations. This approach is computationally feasible and reduces the risks associated with unpredictable generative responses.

## 7. What contextual information should influence the response besides affect?

StudySense should consider academic workload, upcoming deadlines or examinations, study-session duration, task difficulty, time of day, and the student’s current activity.

Additional context may include sleep duration, recent physical activity, physiological baselines, and voluntary self-reports of focus, fatigue or overwhelm. Academic information not available in the SSAQS dataset can be collected through optional student inputs.

These factors help determine whether a recommendation is appropriate rather than interpreting physiological measurements in isolation.

## 8. Should the system personalize its response?

Yes. StudySense should personalize its responses based on voluntarily provided preferences, relevant physiological baselines, and previous interactions.

The system may learn the student's preferred study duration, break frequency, notification settings, academic priorities, and preferred assistance methods. Feedback about previously accepted or dismissed recommendations can inform future response selection.

Personalization should remain transparent and optional, allowing students to review and control the information used by the system.

## 9. When should the response happen?

StudySense should respond when there is sufficient evidence that assistance may be useful, preferably during a natural pause in the student's activity or when help is explicitly requested.

For unsolicited recommendations, the system should consider prediction uncertainty, contextual relevance, previous interactions, and the student's notification preferences. It should avoid repeatedly interrupting students based on isolated or unreliable measurements.

Because SSAQS provides daily stress–anxiety labels, the resulting model should not be treated as a validated real-time distress detector. Real-time intervention thresholds would require additional experimental validation.

## 10. What should happen when the system is uncertain?

When predictions are uncertain, physiological measurements are incomplete, or contextual information conflicts, StudySense should avoid definitive conclusions about the student's emotional condition.

The system may request a brief voluntary self-report, present its interpretation as tentative, or withhold recommendations until additional information becomes available. Students should be able to confirm, reject, or correct interpretations. When uncertainty remains unresolved, StudySense should prioritize minimally intrusive behavior.

## 11. Could doing nothing sometimes be the best response?

Yes. Choosing not to intervene is an essential part of empathic decision-making.

Elevated physiological arousal does not necessarily indicate negative psychological stress. A student may be excited, motivated, or deeply engaged in an academic task.

If the student reports being comfortable, declines assistance, or prefers uninterrupted study time, StudySense should respect that preference and remain silent. Appropriate empathy involves responding when support is needed, not reacting to every physiological change.

## 12. What could go wrong if the response is technically correct but socially inappropriate?

Even when StudySense accurately predicts a stress–anxiety category, its recommendation may still be inappropriate for the student's immediate situation.

For example, suggesting a break during an important examination review could disrupt concentration, while repeated stress warnings could increase unnecessary concern or frustration. Inappropriate timing or wording may also reduce user trust and discourage future interaction.

Therefore, StudySense must consider context, timing, uncertainty, consent, and individual preferences to ensure that its responses are socially appropriate rather than merely technically informed.

---

## Revised StudySense Empathic Interaction Pipeline

**User:** A student engages in an academic activity or study session.

↓

**Perception:** StudySense receives available physiological measurements, academic context, and voluntary student self-reports. It checks data quality, synchronizes relevant observations, and extracts appropriate features.

↓

**Affective / Contextual Interpretation:** The machine learning model estimates one of four stress–anxiety categories (LSLA, LSHA, HSLA, or HSHA). The system considers prediction uncertainty, academic context, and student-provided information.

↓

**Decision:** StudySense determines whether assistance is appropriate or whether the student's current activity should remain uninterrupted.

↓

**Response Selection:** A rule-based mechanism selects an appropriate action based on the estimated category, uncertainty, context, and student preferences.

↓

**Expression:** StudySense displays an optional clarification question, academic assistance, recovery suggestion, subtle visual indicator, or no interruption.

↓

**User Reaction:** The student may accept, dismiss, correct, or ignore the recommendation and provide additional feedback.

↓

**Feedback Loop:** User Reaction → New Perception. StudySense incorporates the student's feedback and available updated information into subsequent decisions, creating a continuous, context-sensitive empathic interaction loop.

# StudySense: An Empathic Academic Support System Using Wearable Physiological Data and Student Self-Reports

## Who is your intended user?

University students who experience changing levels of academic workload, fatigue, physiological arousal, and perceived stress while studying, completing academic requirements, or preparing for examinations. The project is also particularly relevant to students who already use consumer wearable devices, such as Garmin smartwatches or Apple Watch, although the underlying concept is not intended to depend permanently on a single wearable brand. The proposed system is intended as a non-clinical academic support tool, not as a medical or psychological diagnostic system.

## What is the user trying to accomplish?

The user is trying to effectively, maintain concentration, complete academic responsibilities, and manage demanding periods such as examinations and deadlines while balancing productive effort with adequate recovery. Beyond simply completing more tasks, the student needs to make appropriate decisions about when to continue studying, adjust the difficulty or duration of the current task, or temporarily recover when their present condition may be affecting their ability to study effectively.

## What human need, difficulty, or interaction problem have you identified?

The machine learning model needs constant active human input.

Most conventional study and productivity tools respond primarily to schedules, deadlines, timers, and manually entered tasks, but they don’t consider meaningful changes in the student’s current physiological and subjective condition. As a result, a well-rested and focused student may receive the same type of reminder or recommendation as a student who is fatigued, physiologically strained, or feeling overwhelmed.

At the same time, wearable physiological information alone is insufficient for determining how a student actually feels. Research involving university students found that the Garmin Stress Score was related more strongly to non-relaxation and positive arousal than to negative psychological stress, showing that elevated physiological arousal should not automatically be interpreted as emotional distress. (van der Mee et al., 2025)

Therefore, the identified problem is the lack of context-sensitive academic support that can consider changes in the student's physiological state while still respecting the student's own interpretation of what those changes mean.

## What affective or contextual information might help the system understand this need?

Potentially useful information includes wearable-derived physiological and behavioral indicators, such as heart rate or heart-rate-variability-related information, physiological arousal or stress measurements, sleep and recovery information, and recent physical activity.

These signals should be considered together with academic and personal context, such as the duration of the current study session, upcoming examinations or deadlines, perceived task difficulty, time of day, recent physical exertion, and a brief self-report of the student's current condition, such as whether they feel focused, tired, overwhelmed, calm, or motivated.

The purpose of combining these forms of information is not to assume that the wearable can directly identify an emotion. Instead, the information can provide multiple pieces of evidence about the student's present condition, which the student can help interpret.

This direction is practically supported by existing research data. For example, the public SSAQS dataset contains semester-long university-student self-reports together with HRV, sleep, activity, steps, wearable stress information, and other physiological measurements.

## Why does the system need this information?

The system needs this information because the same physiological response can have different meanings depending on the person and the situation. Increased physiological arousal may occur because a student is negatively stressed, highly focused, excited, physically active, sleep-deprived, or experiencing another condition.

Wearable measurements can therefore indicate that something about the student's current state may have changed, but physiological information alone cannot reliably explain why it changed. Contextual information and brief user confirmation help the system avoid treating a sensor measurement as absolute emotional truth. (van der Mee et al., 2025)

By considering the student's physiological state, academic situation, and subjective experience together, the system can form a more cautious and personally meaningful understanding of whether support may be appropriate.

## What could the system do differently because it knows this information?

Instead of providing the same fixed reminders or study recommendations regardless of the student's condition, the system could adjust whether, when, and what kind of support it offers.

For example, when physiological and contextual information suggests a meaningful change from the student's usual state, the system could first ask for a brief confirmation rather than immediately assuming that the student is stressed. If the student reports feeling focused and comfortable, the system could avoid interrupting them. If the student confirms fatigue, difficulty, or feeling overwhelmed, the system could provide an appropriate form of support, such as suggesting a short recovery period, reducing the length of the next study interval, breaking a difficult task into smaller steps, or temporarily switching to a less demanding activity.

The important difference is that the affective and contextual information changes the response of the system, rather than merely being displayed to the user.

## How might this improve the user's experience or outcome?

The proposed approach could make academic support more timely, personalized, and sensitive to the student's current condition. Rather than interrupting students simply because a fixed timer has expired, or waiting until they already feel overwhelmed, the system could encourage reflection when several indicators suggest that an adjustment may be useful.

It may also improve the student's self-awareness by helping them recognize relationships among their study habits, physiological arousal, sleep or recovery, academic demands, and subjective experience. Most importantly, the student remains involved in interpreting their own condition and deciding whether to follow the system's recommendation.

The expected benefit should therefore be described as a more context-sensitive and personally appropriate study experience, rather than claiming that the system will automatically increase grades, eliminate stress, prevent burnout, or improve mental health. Those stronger outcomes would require separate empirical validation.

## What might happen if the system interprets the user incorrectly?

An incorrect interpretation could result in unnecessary interruptions, inappropriate recommendations, frustration, reduced trust, or unnecessary concern about the student's own condition.

For example, a high physiological arousal measurement could occur because the student is excited, intensely focused, or recently physically active rather than psychologically stressed. If the system automatically labels this as distress, it may interrupt an effective study session unnecessarily. Conversely, a student may genuinely feel overwhelmed even when the wearable measurements appear relatively normal.

For this reason, wearable information should be treated as evidence rather than emotional ground truth. When the interpretation is uncertain, the student should be able to confirm, reject, or correct it before the system provides a more substantial response. The system should also avoid presenting its interpretations as medical or psychological diagnoses. (van der Mee et al., 2025)

## Could the problem be solved just as well without affective or empathic computing?

Parts of the problem could be solved without empathic computing, but not the specific problem identified in this project.

A conventional planner, Pomodoro timer, or reminder application can organize deadlines, schedule study sessions, and recommend predetermined breaks. If those functions were all the project intended to provide, then affective or empathic computing would not be necessary.

However, the problem identified here concerns the fact that the appropriate type and timing of academic support may differ according to the student's current physiological, contextual, and self-reported condition. Two students may be completing the same academic task, but one may be well-rested and focused while another may be fatigued or struggling. Likewise, the same student's needs may differ from one day or study session to another.

Empathic computing is therefore justified only when understanding the student's current state meaningfully changes the system's response. If the physiological and contextual information does not influence what the system does, then a conventional non-empathic productivity tool would be sufficient.

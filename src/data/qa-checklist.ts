/**
 * Trust Tai Studio — Production Readiness QA
 *
 * Canonical checklist: 23 sections, ~200+ questions.
 * Every question has: section, priority (P0/P1/P2), and an answer slot.
 *
 * Answer states: "yes" | "no" | "unknown" | "not-checked"
 * A production CANNOT advance when a P0 question is no/unknown/not-checked.
 */

export type Priority = "P0" | "P1" | "P2"
export type AnswerState = "yes" | "no" | "unknown" | "not-checked"

export interface QAQuestion {
  id: string
  section: number
  sectionTitle: string
  priority: Priority
  question: string
  answer: AnswerState
  evidence?: string
  fixNeeded?: string
}

export interface QASection {
  number: number
  title: string
  description: string
  questions: QAQuestion[]
}

// Helper to build questions concisely
let qId = 0
function q(section: number, sectionTitle: string, priority: Priority, question: string): QAQuestion {
  qId++
  return {
    id: `qa-${String(section).padStart(2, "0")}-${String(qId).padStart(3, "0")}`,
    section,
    sectionTitle,
    priority,
    question,
    answer: "not-checked",
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALL 23 SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const QA_SECTIONS: QASection[] = [
  {
    number: 1,
    title: "Production Source and Truth Lock",
    description: "The approved LinkedIn post is the foundation. Everything traces back to it.",
    questions: [
      q(1, "Production Source and Truth Lock", "P0", "Is this production connected to one clearly identified LinkedIn post?"),
      q(1, "Production Source and Truth Lock", "P0", "Is the approved post version locked as the source of truth?"),
      q(1, "Production Source and Truth Lock", "P0", "Can the Studio distinguish the original post, Studio revision, and approved version?"),
      q(1, "Production Source and Truth Lock", "P0", "Is the central argument explicitly stated?"),
      q(1, "Production Source and Truth Lock", "P0", "Is the intended reader shift defined?"),
      q(1, "Production Source and Truth Lock", "P0", "Are the claims the film must protect documented?"),
      q(1, "Production Source and Truth Lock", "P0", "Does the film support the post without changing its meaning?"),
      q(1, "Production Source and Truth Lock", "P1", "Does the film add an experience the written post cannot create alone?"),
      q(1, "Production Source and Truth Lock", "P1", "Has the Studio avoided simply illustrating every sentence literally?"),
      q(1, "Production Source and Truth Lock", "P1", "Can every major film decision be traced back to the approved post?"),
      q(1, "Production Source and Truth Lock", "P0", "If the approved post changes, does the system identify every affected script, frame, scene, and export?"),
      q(1, "Production Source and Truth Lock", "P0", "Does changing the post require an explicit decision to update or preserve downstream assets?"),
    ],
  },
  {
    number: 2,
    title: "Production Definition",
    description: "Every production has a unique identity, clear scope, and resumable state.",
    questions: [
      q(2, "Production Definition", "P0", "Does the production have a unique ID and version?"),
      q(2, "Production Definition", "P0", "Does it have a clear working title?"),
      q(2, "Production Definition", "P0", "Is the target video duration defined?"),
      q(2, "Production Definition", "P0", "Are the required aspect ratios defined?"),
      q(2, "Production Definition", "P0", "Is the intended platform identified as LinkedIn?"),
      q(2, "Production Definition", "P1", "Is the desired audience emotion defined?"),
      q(2, "Production Definition", "P1", "Is the final image or feeling the audience should retain documented?"),
      q(2, "Production Definition", "P0", "Is the production stage accurately represented?"),
      q(2, "Production Definition", "P0", "Is the next required decision clear?"),
      q(2, "Production Definition", "P0", "Is ownership assigned for every unresolved decision?"),
      q(2, "Production Definition", "P1", "Is the estimated generation budget visible?"),
      q(2, "Production Definition", "P0", "Can the production be paused and safely resumed without losing context?"),
    ],
  },
  {
    number: 3,
    title: "Concept Integrity",
    description: "The film concept is derived from the post, not imposed on it.",
    questions: [
      q(3, "Concept Integrity", "P0", "Was the film concept derived from the approved post?"),
      q(3, "Concept Integrity", "P0", "Is one concept direction explicitly approved?"),
      q(3, "Concept Integrity", "P1", "Does the approved concept have a clear visual metaphor?"),
      q(3, "Concept Integrity", "P1", "Is the metaphor understandable without being obvious too early?"),
      q(3, "Concept Integrity", "P1", "Does the concept fit the emotional truth of the post?"),
      q(3, "Concept Integrity", "P1", "Is the opening image strong enough to create immediate curiosity?"),
      q(3, "Concept Integrity", "P1", "Is the closing image meaningfully different from the opening state?"),
      q(3, "Concept Integrity", "P1", "Does the concept contain a visible transformation?"),
      q(3, "Concept Integrity", "P1", "Has the Studio checked whether the metaphor has been overused in previous productions?"),
      q(3, "Concept Integrity", "P1", "Does the concept feel native to the Trust Tai world?"),
      q(3, "Concept Integrity", "P0", "Are the approved concept, treatment, and production complexity saved together?"),
      q(3, "Concept Integrity", "P0", "If the concept changes, does the Studio invalidate dependent script and frame approvals?"),
    ],
  },
  {
    number: 4,
    title: "World Bible Alignment",
    description: "Every visual choice carries meaning. The World Bible governs all generation.",
    questions: [
      q(4, "World Bible Alignment", "P0", "Has the production loaded the correct World Bible version?"),
      q(4, "World Bible Alignment", "P0", "Are all locked brand truths active?"),
      q(4, "World Bible Alignment", "P0", "Are the relevant visual-language rules attached to the production?"),
      q(4, "World Bible Alignment", "P0", "Are prohibited visual patterns visible to every generation step?"),
      q(4, "World Bible Alignment", "P1", "Does the production follow Trust Tai's approved color language?"),
      q(4, "World Bible Alignment", "P1", "Does it follow the approved lighting language?"),
      q(4, "World Bible Alignment", "P1", "Does it follow the approved camera language?"),
      q(4, "World Bible Alignment", "P1", "Does it follow the approved realism and texture standard?"),
      q(4, "World Bible Alignment", "P1", "Does it avoid unnecessary spectacle?"),
      q(4, "World Bible Alignment", "P1", "Does every visual choice carry meaning?"),
      q(4, "World Bible Alignment", "P0", "Are production-specific exceptions separated from permanent World rules?"),
      q(4, "World Bible Alignment", "P0", "Can Tai see which World memories influenced each generated asset?"),
      q(4, "World Bible Alignment", "P0", "Can a World rule be excluded without deleting it globally?"),
      q(4, "World Bible Alignment", "P0", "Does changing a locked World rule show every affected active production?"),
    ],
  },
  {
    number: 5,
    title: "Character Identity Lock",
    description: "Every recurring character has one approved master reference. Identity is non-negotiable.",
    questions: [
      q(5, "Character Identity Lock", "P0", "Does every recurring character have a unique character ID?"),
      q(5, "Character Identity Lock", "P0", "Is there one approved master reference for each character?"),
      q(5, "Character Identity Lock", "P0", "Is the character's face clearly visible in the master reference?"),
      q(5, "Character Identity Lock", "P0", "Are ethnicity, age range, skin tone, facial structure, hair, and build documented?"),
      q(5, "Character Identity Lock", "P0", "Are beard, hairline, scars, glasses, and other identifying features documented?"),
      q(5, "Character Identity Lock", "P0", "Is the approved wardrobe defined?"),
      q(5, "Character Identity Lock", "P0", "Are posture and movement tendencies defined?"),
      q(5, "Character Identity Lock", "P1", "Are the character's emotional behaviors defined?"),
      q(5, "Character Identity Lock", "P1", "Is the character's narrative role documented?"),
      q(5, "Character Identity Lock", "P0", "Are forbidden appearance changes documented?"),
      q(5, "Character Identity Lock", "P0", "Is the correct master reference injected into every scene containing the character?"),
      q(5, "Character Identity Lock", "P0", "Does the system prevent a text prompt from silently overriding locked identity traits?"),
      q(5, "Character Identity Lock", "P0", "Are temporary wardrobe changes saved as production variations rather than new characters?"),
      q(5, "Character Identity Lock", "P0", "Can the system distinguish between the master character and approved variations?"),
      q(5, "Character Identity Lock", "P0", "Does every variation preserve the character's identity?"),
      q(5, "Character Identity Lock", "P0", "Is explicit approval required before a variation becomes part of the World Bible?"),
    ],
  },
  {
    number: 6,
    title: "Character Continuity Across Frames",
    description: "The same person must be recognizable in every approved frame.",
    questions: [
      q(6, "Character Continuity Across Frames", "P0", "Is the same person recognizable across every approved frame?"),
      q(6, "Character Continuity Across Frames", "P0", "Does facial structure remain consistent across angles?"),
      q(6, "Character Continuity Across Frames", "P0", "Does skin tone remain consistent across lighting conditions?"),
      q(6, "Character Continuity Across Frames", "P0", "Does hair remain consistent in shape, length, texture, and color?"),
      q(6, "Character Continuity Across Frames", "P0", "Does facial hair remain consistent?"),
      q(6, "Character Continuity Across Frames", "P0", "Does body build remain consistent?"),
      q(6, "Character Continuity Across Frames", "P0", "Does apparent age remain consistent?"),
      q(6, "Character Continuity Across Frames", "P0", "Does wardrobe remain consistent unless the script requires a change?"),
      q(6, "Character Continuity Across Frames", "P0", "Are wardrobe changes narratively justified and recorded?"),
      q(6, "Character Continuity Across Frames", "P1", "Does posture remain consistent with the character definition?"),
      q(6, "Character Continuity Across Frames", "P1", "Do expressions match the emotional state of each scene?"),
      q(6, "Character Continuity Across Frames", "P0", "Are left-right orientation and physical positioning tracked between connected shots?"),
      q(6, "Character Continuity Across Frames", "P0", "Are character scale and height consistent relative to objects and other people?"),
      q(6, "Character Continuity Across Frames", "P0", "Can the Studio flag when a generated frame looks like a different person?"),
      q(6, "Character Continuity Across Frames", "P0", "Can Tai compare a frame directly against the master character reference?"),
      q(6, "Character Continuity Across Frames", "P0", "Does character continuity require approval before scene generation begins?"),
    ],
  },
  {
    number: 7,
    title: "Environment and Place Lock",
    description: "Every recurring location has a unique identity and master reference.",
    questions: [
      q(7, "Environment and Place Lock", "P0", "Does every recurring location have a unique place ID?"),
      q(7, "Environment and Place Lock", "P0", "Is there an approved master reference for each location?"),
      q(7, "Environment and Place Lock", "P0", "Are architecture, layout, materials, and scale documented?"),
      q(7, "Environment and Place Lock", "P0", "Are time of day and weather defined for each scene?"),
      q(7, "Environment and Place Lock", "P0", "Are lighting sources and directions documented?"),
      q(7, "Environment and Place Lock", "P0", "Are entrances, windows, stairs, furniture, and major landmarks spatially consistent?"),
      q(7, "Environment and Place Lock", "P0", "Does the same room remain recognizably the same room across frames?"),
      q(7, "Environment and Place Lock", "P0", "Are camera positions logically possible inside the established environment?"),
      q(7, "Environment and Place Lock", "P1", "Does the environment support the emotional purpose of the scene?"),
      q(7, "Environment and Place Lock", "P0", "Are production-only changes separated from the master location?"),
      q(7, "Environment and Place Lock", "P0", "Is an unexplained architectural change automatically flagged?"),
      q(7, "Environment and Place Lock", "P0", "Can the system compare new frames against prior approved location references?"),
    ],
  },
  {
    number: 8,
    title: "Props and Symbol Continuity",
    description: "Props and symbols carry meaning. They must remain consistent and intentional.",
    questions: [
      q(8, "Props and Symbol Continuity", "P0", "Does every important prop have an approved visual reference?"),
      q(8, "Props and Symbol Continuity", "P0", "Are prop size, material, color, and condition documented?"),
      q(8, "Props and Symbol Continuity", "P0", "Does the prop remain consistent across connected scenes?"),
      q(8, "Props and Symbol Continuity", "P0", "Is the prop held in the correct hand when continuity requires it?"),
      q(8, "Props and Symbol Continuity", "P0", "Is its physical position tracked between shots?"),
      q(8, "Props and Symbol Continuity", "P1", "Is every recurring symbol being used according to its approved meaning?"),
      q(8, "Props and Symbol Continuity", "P1", "Has the Studio checked for symbol overuse?"),
      q(8, "Props and Symbol Continuity", "P1", "Does the symbol deepen the story rather than decorate the frame?"),
      q(8, "Props and Symbol Continuity", "P0", "Are accidental or contradictory symbols detected?"),
      q(8, "Props and Symbol Continuity", "P0", "Can Tai see every prior use of a recurring symbol?"),
    ],
  },
  {
    number: 9,
    title: "Script Readiness",
    description: "The script is the bridge between the post and the screen.",
    questions: [
      q(9, "Script Readiness", "P0", "Is the complete script approved?"),
      q(9, "Script Readiness", "P0", "Is every scene connected to a purpose?"),
      q(9, "Script Readiness", "P0", "Is every scene connected to the approved post or central argument?"),
      q(9, "Script Readiness", "P0", "Does each scene contain visual action?"),
      q(9, "Script Readiness", "P1", "Can the film be understood without depending entirely on narration?"),
      q(9, "Script Readiness", "P1", "Is narration used only where the image cannot carry the meaning?"),
      q(9, "Script Readiness", "P1", "Are intentional moments of silence documented?"),
      q(9, "Script Readiness", "P0", "Is the duration of every scene defined?"),
      q(9, "Script Readiness", "P0", "Does the sum of scene durations match the target film duration?"),
      q(9, "Script Readiness", "P1", "Does the emotional progression build rather than remain flat?"),
      q(9, "Script Readiness", "P1", "Is there a clear opening, turn, and resolution?"),
      q(9, "Script Readiness", "P1", "Does the closing scene complete the emotional promise?"),
      q(9, "Script Readiness", "P0", "Are all characters, places, props, and symbols resolved to World Bible assets?"),
      q(9, "Script Readiness", "P0", "Does changing an approved script scene identify affected frames and clips?"),
    ],
  },
  {
    number: 10,
    title: "Keyframe Generation Readiness",
    description: "Every frame is deterministic, traceable, and reproducible.",
    questions: [
      q(10, "Keyframe Generation Readiness", "P0", "Does every scene have a defined keyframe requirement?"),
      q(10, "Keyframe Generation Readiness", "P0", "Does every keyframe prompt reference the approved script scene?"),
      q(10, "Keyframe Generation Readiness", "P0", "Does every keyframe use the correct character reference?"),
      q(10, "Keyframe Generation Readiness", "P0", "Does every keyframe use the correct location reference?"),
      q(10, "Keyframe Generation Readiness", "P0", "Are wardrobe and prop references included where required?"),
      q(10, "Keyframe Generation Readiness", "P0", "Are camera angle, shot size, lens intention, and composition defined?"),
      q(10, "Keyframe Generation Readiness", "P0", "Are lighting, time of day, and atmosphere defined?"),
      q(10, "Keyframe Generation Readiness", "P0", "Is the intended emotional expression defined?"),
      q(10, "Keyframe Generation Readiness", "P0", "Are negative constraints included to protect character and world consistency?"),
      q(10, "Keyframe Generation Readiness", "P0", "Is the model selected capable of using the required reference inputs?"),
      q(10, "Keyframe Generation Readiness", "P0", "Does the system reject a generation route that cannot preserve the character reference?"),
      q(10, "Keyframe Generation Readiness", "P0", "Is each generated frame linked to its prompt, model, references, seed, cost, and version?"),
      q(10, "Keyframe Generation Readiness", "P0", "Can an approved frame be recreated or closely reproduced?"),
      q(10, "Keyframe Generation Readiness", "P0", "Are rejected frames retained as learning evidence without entering production?"),
    ],
  },
  {
    number: 11,
    title: "Frame Quality and Congruence",
    description: "Every frame must belong to the same film.",
    questions: [
      q(11, "Frame Quality and Congruence", "P0", "Is every frame visually consistent with the approved treatment?"),
      q(11, "Frame Quality and Congruence", "P0", "Is the recurring character consistent across the entire frame sequence?"),
      q(11, "Frame Quality and Congruence", "P0", "Are environments consistent across connected frames?"),
      q(11, "Frame Quality and Congruence", "P0", "Are wardrobe and props consistent?"),
      q(11, "Frame Quality and Congruence", "P0", "Is lighting progression logical from scene to scene?"),
      q(11, "Frame Quality and Congruence", "P0", "Is time-of-day progression logical?"),
      q(11, "Frame Quality and Congruence", "P0", "Is color grading direction consistent?"),
      q(11, "Frame Quality and Congruence", "P0", "Is camera language consistent?"),
      q(11, "Frame Quality and Congruence", "P1", "Does the sequence feel like one film rather than unrelated AI images?"),
      q(11, "Frame Quality and Congruence", "P1", "Is visual complexity consistent across scenes?"),
      q(11, "Frame Quality and Congruence", "P1", "Is the degree of realism consistent?"),
      q(11, "Frame Quality and Congruence", "P1", "Are grain, depth of field, and texture consistent?"),
      q(11, "Frame Quality and Congruence", "P0", "Are malformed hands, faces, objects, text, and architecture detected?"),
      q(11, "Frame Quality and Congruence", "P0", "Are unexplained new people or objects detected?"),
      q(11, "Frame Quality and Congruence", "P0", "Are duplicate or near-identical frames detected?"),
      q(11, "Frame Quality and Congruence", "P0", "Is every keyframe individually approved?"),
      q(11, "Frame Quality and Congruence", "P0", "Has the full storyboard been reviewed as one continuous visual sequence?"),
      q(11, "Frame Quality and Congruence", "P0", "Is scene generation blocked until all required frames pass continuity?"),
    ],
  },
  {
    number: 12,
    title: "Scene-Generation Readiness",
    description: "Motion is choreographed, not random.",
    questions: [
      q(12, "Scene-Generation Readiness", "P0", "Does every scene begin from an approved frame?"),
      q(12, "Scene-Generation Readiness", "P0", "Is the selected video model capable of preserving the approved character?"),
      q(12, "Scene-Generation Readiness", "P0", "Is the correct reference frame attached to the generation?"),
      q(12, "Scene-Generation Readiness", "P0", "Are character references included when the model supports them?"),
      q(12, "Scene-Generation Readiness", "P0", "Is the required camera movement defined?"),
      q(12, "Scene-Generation Readiness", "P0", "Is character movement defined?"),
      q(12, "Scene-Generation Readiness", "P0", "Is environmental movement defined?"),
      q(12, "Scene-Generation Readiness", "P0", "Are the opening and closing visual states defined?"),
      q(12, "Scene-Generation Readiness", "P0", "Is the clip duration defined?"),
      q(12, "Scene-Generation Readiness", "P0", "Is motion speed defined?"),
      q(12, "Scene-Generation Readiness", "P1", "Is the motion physically believable?"),
      q(12, "Scene-Generation Readiness", "P1", "Does the motion support the emotional purpose?"),
      q(12, "Scene-Generation Readiness", "P0", "Are movement restrictions included to prevent unwanted action?"),
      q(12, "Scene-Generation Readiness", "P0", "Are face, hands, clothing, and object stability requirements included?"),
      q(12, "Scene-Generation Readiness", "P0", "Does the Studio preserve approved framing unless a camera move requires change?"),
      q(12, "Scene-Generation Readiness", "P0", "Can a failed motion generation be retried without losing its lineage?"),
    ],
  },
  {
    number: 13,
    title: "Generated-Scene QA",
    description: "What the model produces must be verified, not assumed.",
    questions: [
      q(13, "Generated-Scene QA", "P0", "Does the character remain the same person throughout the clip?"),
      q(13, "Generated-Scene QA", "P0", "Does the face remain stable during movement?"),
      q(13, "Generated-Scene QA", "P0", "Do hair and facial hair remain stable?"),
      q(13, "Generated-Scene QA", "P0", "Does wardrobe remain stable?"),
      q(13, "Generated-Scene QA", "P0", "Do hands and limbs remain anatomically believable?"),
      q(13, "Generated-Scene QA", "P0", "Does the environment remain structurally stable?"),
      q(13, "Generated-Scene QA", "P0", "Do props retain their form and location?"),
      q(13, "Generated-Scene QA", "P0", "Is the intended camera movement followed?"),
      q(13, "Generated-Scene QA", "P0", "Does the shot begin close enough to the approved opening frame?"),
      q(13, "Generated-Scene QA", "P0", "Does the shot end in the required visual state?"),
      q(13, "Generated-Scene QA", "P0", "Are unexpected morphs, jumps, warping, or object substitutions absent?"),
      q(13, "Generated-Scene QA", "P0", "Is movement direction continuous with the previous and next scene?"),
      q(13, "Generated-Scene QA", "P0", "Is screen direction preserved?"),
      q(13, "Generated-Scene QA", "P0", "Does lighting remain stable unless change is intentional?"),
      q(13, "Generated-Scene QA", "P0", "Is the clip free from accidental text, logos, or watermarks?"),
      q(13, "Generated-Scene QA", "P1", "Does the clip feel cinematic rather than like a moving still image?"),
      q(13, "Generated-Scene QA", "P1", "Does the scene make its intended story contribution?"),
      q(13, "Generated-Scene QA", "P0", "Is one take explicitly selected and locked?"),
      q(13, "Generated-Scene QA", "P0", "Are rejected takes labeled with the reason they failed?"),
      q(13, "Generated-Scene QA", "P0", "Is every selected scene approved before editing?"),
    ],
  },
  {
    number: 14,
    title: "Cross-Scene Continuity",
    description: "The film must feel like one continuous story.",
    questions: [
      q(14, "Cross-Scene Continuity", "P0", "Does Scene 2 logically begin where Scene 1 ends?"),
      q(14, "Cross-Scene Continuity", "P0", "Are character position and direction coherent between cuts?"),
      q(14, "Cross-Scene Continuity", "P0", "Are wardrobe, props, damage, and environmental changes carried forward?"),
      q(14, "Cross-Scene Continuity", "P0", "Is the passage of time understandable?"),
      q(14, "Cross-Scene Continuity", "P0", "Are lighting changes narratively justified?"),
      q(14, "Cross-Scene Continuity", "P0", "Does the character's emotional state progress logically?"),
      q(14, "Cross-Scene Continuity", "P0", "Are location transitions clear?"),
      q(14, "Cross-Scene Continuity", "P0", "Are repeated actions intentional rather than generation artifacts?"),
      q(14, "Cross-Scene Continuity", "P1", "Does the pacing feel like one continuous story?"),
      q(14, "Cross-Scene Continuity", "P1", "Does each scene increase understanding, tension, or emotional movement?"),
      q(14, "Cross-Scene Continuity", "P0", "Is the full sequence reviewed without stopping between clips?"),
      q(14, "Cross-Scene Continuity", "P0", "Does the Studio provide a sequence-level continuity score and evidence?"),
    ],
  },
  {
    number: 15,
    title: "Edit Readiness",
    description: "The timeline is the final expression of the film.",
    questions: [
      q(15, "Edit Readiness", "P0", "Are all timeline clips approved takes?"),
      q(15, "Edit Readiness", "P0", "Are no draft or rejected assets present in the final timeline?"),
      q(15, "Edit Readiness", "P0", "Does the timeline match the approved scene order?"),
      q(15, "Edit Readiness", "P0", "Does the final duration match the target?"),
      q(15, "Edit Readiness", "P1", "Are cuts motivated by story rather than convenience?"),
      q(15, "Edit Readiness", "P1", "Is the opening strong within the first few seconds?"),
      q(15, "Edit Readiness", "P1", "Does the pacing allow important moments to breathe?"),
      q(15, "Edit Readiness", "P1", "Are transitions restrained and consistent with the visual language?"),
      q(15, "Edit Readiness", "P0", "Is narration synchronized with the intended images?"),
      q(15, "Edit Readiness", "P0", "Are music and sound effects synchronized correctly?"),
      q(15, "Edit Readiness", "P0", "Are dialogue, narration, music, and effects mixed clearly?"),
      q(15, "Edit Readiness", "P0", "Are captions accurate and timed correctly?"),
      q(15, "Edit Readiness", "P0", "Are caption line lengths readable on mobile?"),
      q(15, "Edit Readiness", "P0", "Does the muted version remain understandable?"),
      q(15, "Edit Readiness", "P0", "Is the film reviewed in the LinkedIn feed preview?"),
      q(15, "Edit Readiness", "P0", "Is the film reviewed at full screen and mobile size?"),
      q(15, "Edit Readiness", "P0", "Is the approved master edit version locked?"),
    ],
  },
  {
    number: 16,
    title: "Post-and-Film Congruence",
    description: "The film and the post must arrive at the same truth.",
    questions: [
      q(16, "Post-and-Film Congruence", "P0", "Does the final film still serve the approved LinkedIn post?"),
      q(16, "Post-and-Film Congruence", "P0", "Does the film avoid introducing a contradictory lesson?"),
      q(16, "Post-and-Film Congruence", "P1", "Does the film deepen the post rather than summarize it?"),
      q(16, "Post-and-Film Congruence", "P1", "Does the post provide context the film intentionally leaves unstated?"),
      q(16, "Post-and-Film Congruence", "P1", "Does the film create an emotional experience the post cannot create alone?"),
      q(16, "Post-and-Film Congruence", "P0", "Do the post and film arrive at the same central truth?"),
      q(16, "Post-and-Film Congruence", "P1", "Does the combination feel complete without feeling repetitive?"),
      q(16, "Post-and-Film Congruence", "P0", "Has the final post been reviewed alongside the final film?"),
      q(16, "Post-and-Film Congruence", "P0", "Is the package title consistent across the post, film, thumbnail, and archive?"),
    ],
  },
  {
    number: 17,
    title: "Final Package Readiness",
    description: "The package must be complete, correct, and archival.",
    questions: [
      q(17, "Final Package Readiness", "P0", "Does the package contain the approved LinkedIn post?"),
      q(17, "Final Package Readiness", "P0", "Does it contain the approved final film?"),
      q(17, "Final Package Readiness", "P0", "Does it contain the required LinkedIn video format?"),
      q(17, "Final Package Readiness", "P0", "Does it contain a correctly sized thumbnail?"),
      q(17, "Final Package Readiness", "P0", "Does it contain accurate captions?"),
      q(17, "Final Package Readiness", "P0", "Does it contain accessibility text?"),
      q(17, "Final Package Readiness", "P0", "Does it contain the first comment when required?"),
      q(17, "Final Package Readiness", "P0", "Are file names consistent and meaningful?"),
      q(17, "Final Package Readiness", "P0", "Are resolution, frame rate, codec, and audio settings valid?"),
      q(17, "Final Package Readiness", "P0", "Is there no accidental watermark?"),
      q(17, "Final Package Readiness", "P0", "Has the exported file been played from beginning to end?"),
      q(17, "Final Package Readiness", "P0", "Does the exported file match the approved master edit?"),
      q(17, "Final Package Readiness", "P0", "Is package completeness verified automatically?"),
      q(17, "Final Package Readiness", "P0", "Is the final package approved by Tai?"),
      q(17, "Final Package Readiness", "P0", "Can the complete package be reopened later with all lineage preserved?"),
    ],
  },
  {
    number: 18,
    title: "Versioning, Approvals, and Rollback",
    description: "Every decision is traceable, reversible, and auditable.",
    questions: [
      q(18, "Versioning, Approvals, and Rollback", "P0", "Does every post, script, frame, scene, and edit have a version history?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Is every approval tied to a person and timestamp?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Is the approved version clearly distinguished from the latest draft?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Can the Studio restore an earlier approved version?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Does regenerating an asset create a new version instead of overwriting the approved one?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Are dependent approvals invalidated when their source changes?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Can Tai compare two versions side by side?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Can a production be duplicated without sharing accidental mutable references?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Are exceptions and overrides documented?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Can the Studio identify who approved an exception and why?"),
      q(18, "Versioning, Approvals, and Rollback", "P0", "Is there a complete production audit trail?"),
    ],
  },
  {
    number: 19,
    title: "Production Memory and Learning",
    description: "Every rejection teaches. Every correction is reusable.",
    questions: [
      q(19, "Production Memory and Learning", "P0", "Does every rejection capture a reason?"),
      q(19, "Production Memory and Learning", "P0", "Does every manual correction remain attached to the affected asset?"),
      q(19, "Production Memory and Learning", "P0", "Can the Studio distinguish a one-time correction from a reusable lesson?"),
      q(19, "Production Memory and Learning", "P0", "Does the Studio suggest possible learnings rather than silently creating permanent rules?"),
      q(19, "Production Memory and Learning", "P0", "Does Tai approve memories before they become locked preferences?"),
      q(19, "Production Memory and Learning", "P0", "Are character identity corrections attached to the character record?"),
      q(19, "Production Memory and Learning", "P0", "Are environment corrections attached to the place record?"),
      q(19, "Production Memory and Learning", "P0", "Are successful prompts linked to the conditions under which they worked?"),
      q(19, "Production Memory and Learning", "P0", "Are failed prompts retained to prevent repeated mistakes?"),
      q(19, "Production Memory and Learning", "P1", "Does the Studio know which models perform best for each character and scene type?"),
      q(19, "Production Memory and Learning", "P1", "Does it learn preferred camera movement, pacing, and realism?"),
      q(19, "Production Memory and Learning", "P0", "Can a learned preference be edited, retired, or demoted?"),
      q(19, "Production Memory and Learning", "P0", "Can Tai see the evidence behind every learned preference?"),
      q(19, "Production Memory and Learning", "P0", "Does the next production automatically retrieve relevant approved memories?"),
    ],
  },
  {
    number: 20,
    title: "Model Routing and Generation Reliability",
    description: "The right model for each task. Fallbacks that don't cut corners.",
    questions: [
      q(20, "Model Routing and Generation Reliability", "P0", "Is each production task routed to a model capable of completing it?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Does the system verify reference-image support before generation?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Does it verify aspect-ratio and duration support?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Is there a fallback model for each critical generation step?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Does fallback preserve character and World Bible requirements?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Is the user warned before a fallback may reduce consistency?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Are generation parameters stored?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Are model, prompt, references, seed, cost, and output connected?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Are failed jobs automatically detected?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Can failed jobs be safely retried?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Does retrying avoid duplicate charges where the provider supports it?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Are partial generations prevented from appearing as approved assets?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Does the system detect expired or inaccessible reference files?"),
      q(20, "Model Routing and Generation Reliability", "P0", "Does it prevent generation when required references are missing?"),
    ],
  },
  {
    number: 21,
    title: "Operational Resilience",
    description: "The system fails honestly. No false 'complete' states.",
    questions: [
      q(21, "Operational Resilience", "P0", "Can the production recover after a browser refresh?"),
      q(21, "Operational Resilience", "P0", "Can it recover after a generation provider outage?"),
      q(21, "Operational Resilience", "P0", "Are long-running jobs processed independently of the open browser session?"),
      q(21, "Operational Resilience", "P0", "Is job status accurate after reconnection?"),
      q(21, "Operational Resilience", "P0", "Are duplicate generation requests prevented?"),
      q(21, "Operational Resilience", "P0", "Are concurrent edits detected?"),
      q(21, "Operational Resilience", "P0", "Are autosaves version-safe?"),
      q(21, "Operational Resilience", "P0", "Can corrupted or missing assets be identified?"),
      q(21, "Operational Resilience", "P0", "Are uploaded and generated assets backed up?"),
      q(21, "Operational Resilience", "P0", "Can the production be restored from its audit trail?"),
      q(21, "Operational Resilience", "P0", "Are errors shown in clear language with a recovery action?"),
      q(21, "Operational Resilience", "P0", "Does no error leave the production in a false 'complete' state?"),
    ],
  },
  {
    number: 22,
    title: "Cost and Time Control",
    description: "Budget is visible. Stalled tasks are detected. No surprise costs.",
    questions: [
      q(22, "Cost and Time Control", "P0", "Is the production budget visible before generation begins?"),
      q(22, "Cost and Time Control", "P0", "Is the estimated cost shown before each expensive action?"),
      q(22, "Cost and Time Control", "P0", "Does the system require approval before exceeding budget?"),
      q(22, "Cost and Time Control", "P0", "Are generation costs recorded by scene, model, and take?"),
      q(22, "Cost and Time Control", "P1", "Can the Studio recommend the lowest-cost route that still meets the quality threshold?"),
      q(22, "Cost and Time Control", "P0", "Does it prevent unnecessary regeneration of already approved assets?"),
      q(22, "Cost and Time Control", "P1", "Does it reuse approved characters, places, and references where appropriate?"),
      q(22, "Cost and Time Control", "P0", "Is the estimated completion time visible?"),
      q(22, "Cost and Time Control", "P0", "Are stalled tasks detected?"),
      q(22, "Cost and Time Control", "P0", "Can Tai see which production decisions are delaying completion?"),
    ],
  },
  {
    number: 23,
    title: "Final Production Gate",
    description: "The platform should not label a film Production Ready unless it can answer YES to all.",
    questions: [
      q(23, "Final Production Gate", "P0", "Is the LinkedIn post approved and locked?"),
      q(23, "Final Production Gate", "P0", "Is the central truth protected?"),
      q(23, "Final Production Gate", "P0", "Is the concept approved?"),
      q(23, "Final Production Gate", "P0", "Is the script approved?"),
      q(23, "Final Production Gate", "P0", "Are all recurring characters resolved to locked World Bible references?"),
      q(23, "Final Production Gate", "P0", "Are all places, props, and symbols resolved?"),
      q(23, "Final Production Gate", "P0", "Are all keyframes approved?"),
      q(23, "Final Production Gate", "P0", "Do all frames pass character continuity?"),
      q(23, "Final Production Gate", "P0", "Do all frames pass world and environment continuity?"),
      q(23, "Final Production Gate", "P0", "Are all selected scenes approved?"),
      q(23, "Final Production Gate", "P0", "Does every scene preserve the locked character identity?"),
      q(23, "Final Production Gate", "P0", "Does the complete sequence feel visually congruent?"),
      q(23, "Final Production Gate", "P0", "Does the edit match the approved script and scene order?"),
      q(23, "Final Production Gate", "P0", "Does the final film serve the LinkedIn post?"),
      q(23, "Final Production Gate", "P0", "Has the final export passed technical QA?"),
      q(23, "Final Production Gate", "P0", "Has the final package passed completeness QA?"),
      q(23, "Final Production Gate", "P0", "Is the audit trail complete?"),
      q(23, "Final Production Gate", "P0", "Are all new memories awaiting governance clearly identified?"),
      q(23, "Final Production Gate", "P0", "Can the entire production be reproduced, traced, and restored?"),
      q(23, "Final Production Gate", "P0", "Has Tai given final approval?"),
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER READINESS INDICATORS (4 scores)
// ═══════════════════════════════════════════════════════════════════════════════

export const MASTER_INDICATORS = [
  { key: "character-lock",      label: "Character Lock",          description: "All characters locked, referenced, and consistent" },
  { key: "world-continuity",    label: "World Continuity",        description: "World Bible alignment across all frames" },
  { key: "production-complete", label: "Production Completeness", description: "All stages complete, package verified" },
  { key: "final-approval",      label: "Final Approval",          description: "Tai has approved the final package" },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllQuestions(): QAQuestion[] {
  return QA_SECTIONS.flatMap((s) => s.questions)
}

export function getSectionStats(section: QASection) {
  const total = section.questions.length
  const yes = section.questions.filter((q) => q.answer === "yes").length
  const p0 = section.questions.filter((q) => q.priority === "P0")
  const p0Blocked = p0.filter((q) => q.answer !== "yes").length
  return { total, yes, p0: p0.length, p0Blocked, pct: Math.round((yes / total) * 100) }
}

export function getOverallStats() {
  const all = getAllQuestions()
  const total = all.length
  const yes = all.filter((q) => q.answer === "yes").length
  const no = all.filter((q) => q.answer === "no").length
  const unknown = all.filter((q) => q.answer === "unknown").length
  const notChecked = all.filter((q) => q.answer === "not-checked").length
  const p0 = all.filter((q) => q.priority === "P0")
  const p0Blocked = p0.filter((q) => q.answer !== "yes").length
  return {
    total,
    yes,
    no,
    unknown,
    notChecked,
    p0Total: p0.length,
    p0Blocked,
    pct: Math.round((yes / total) * 100),
  }
}

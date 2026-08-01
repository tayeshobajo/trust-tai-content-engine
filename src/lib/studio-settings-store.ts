// Studio voice settings — persisted to localStorage.
// These are read by the engine at generation time, not just displayed in Settings.

export interface StudioVoiceSettings {
  primaryVoice: string
  ctaPosture: "Invitation only when earned" | "Never include a CTA" | "Soft close on every post"
  defaultAudience: string
  bannedWords: string[]
  sentenceLengthWarning: number     // word count threshold
  exclamationMarkWarning: boolean
  hashtagWarning: boolean
  pressureCTAWarning: boolean
  emDashWarning: boolean
  consultingClicheWarning: boolean
}

const SETTINGS_KEY = "tts_voice_settings"
const SETTINGS_CHANGED_EVENT_NAME = "tts-settings-changed"

export const SETTINGS_CHANGED_EVENT = SETTINGS_CHANGED_EVENT_NAME

export const DEFAULT_VOICE_SETTINGS: StudioVoiceSettings = {
  primaryVoice:
    "Smart, direct, everyday language. Consultancy first.\nStory-led, practical, and clear.",
  ctaPosture: "Invitation only when earned",
  defaultAudience:
    "Founder-led businesses carrying too much through one person",
  bannedWords: [
    "leverage",
    "synergy",
    "unlock",
    "game-changer",
    "seamless",
    "empower",
    "delve",
  ],
  sentenceLengthWarning: 32,
  exclamationMarkWarning: true,
  hashtagWarning: true,
  pressureCTAWarning: true,
  emDashWarning: true,
  consultingClicheWarning: true,
}

function isClient(): boolean {
  return typeof window !== "undefined"
}

export function getVoiceSettings(): StudioVoiceSettings {
  if (!isClient()) return DEFAULT_VOICE_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_VOICE_SETTINGS
    const parsed = JSON.parse(raw) as Partial<StudioVoiceSettings>
    return { ...DEFAULT_VOICE_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_VOICE_SETTINGS
  }
}

export function saveVoiceSettings(settings: Partial<StudioVoiceSettings>): void {
  if (!isClient()) return
  const current = getVoiceSettings()
  const merged = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT))
}

export function getSettingsSummary(): string {
  const s = getVoiceSettings()
  return [
    `Voice: ${s.primaryVoice.slice(0, 80)}`,
    `CTA posture: ${s.ctaPosture}`,
    `Audience: ${s.defaultAudience}`,
    `Sentence warning at: ${s.sentenceLengthWarning} words`,
    `Banned words: ${s.bannedWords.join(", ")}`,
  ].join("\n")
}

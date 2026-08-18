// Plain-language, on-brand interpretations for the three core placements.
// Each entry is a self-contained sentence a user can read and recognize themselves in.

const SUN: Record<string, string> = {
  Aries: "Your Sun is the spark of who you are — bold, initiating, and happiest when you're moving first.",
  Taurus: "Your Sun is steady and sensual — you shine through patience, loyalty, and a love of beauty and comfort.",
  Gemini: "Your Sun is curious and quick — you shine through connection, words, and a restless, brilliant mind.",
  Cancer: "Your Sun is tender and protective — you shine through care, intuition, and deep loyalty to those you love.",
  Leo: "Your Sun is radiant and generous — you shine by being seen, creating, and warming everyone around you.",
  Virgo: "Your Sun is precise and devoted — you shine through service, discernment, and quiet, dependable care.",
  Libra: "Your Sun is harmonizing and graceful — you shine through relationships, beauty, and a search for balance.",
  Scorpio: "Your Sun is intense and penetrating — you shine through depth, loyalty, and emotional courage.",
  Sagittarius: "Your Sun is expansive and free — you shine through meaning, motion, and a hunger to know more.",
  Capricorn: "Your Sun is grounded and ambitious — you shine through discipline, responsibility, and building what lasts.",
  Aquarius: "Your Sun is original and humane — you shine through vision, independence, and care for the collective.",
  Pisces: "Your Sun is dreamy and compassionate — you shine through imagination, empathy, and surrender.",
};

const MOON: Record<string, string> = {
  Aries: "Your Moon is fiery and immediate — you feel safest when you can act, and your emotions move fast and honestly.",
  Taurus: "Your Moon is calm and embodied — you feel safest through routine, touch, and the simple comforts of life.",
  Gemini: "Your Moon is restless and social — you feel safest when you can talk it out and keep your mind engaged.",
  Cancer: "Your Moon is nurturing and protective — you feel safest when you're caring for others and held in turn.",
  Leo: "Your Moon is warm and proud — you feel safest when your feelings are witnessed and appreciated.",
  Virgo: "Your Moon is attentive and helpful — you feel safest when you can be useful and bring order to chaos.",
  Libra: "Your Moon is relational and peace-seeking — you feel safest in harmony, partnership, and being understood.",
  Scorpio: "Your Moon is private and deep — you feel safest when your emotions are kept close and trusted slowly.",
  Sagittarius: "Your Moon is optimistic and free — you feel safest with room to roam, learn, and believe in something bigger.",
  Capricorn: "Your Moon is contained and capable — you feel safest when you're competent, reliable, and in control.",
  Aquarius: "Your Moon is detached and loyal — you feel safest with independence and a circle that shares your ideals.",
  Pisces: "Your Moon is porous and empathic — you feel safest when you can dissolve into something gentle and unifying.",
};

const RISING: Record<string, string> = {
  Aries: "Your Rising is direct and charged — people meet a confident, take-charge presence that moves before it doubts.",
  Taurus: "Your Rising is grounded and warm — people meet a calm, pleasing presence that feels safe to be near.",
  Gemini: "Your Rising is bright and curious — people meet a quick, talkative presence that puts others at ease.",
  Cancer: "Your Rising is gentle and guarded — people meet a tender presence that warms slowly and protects first.",
  Leo: "Your Rising is luminous and expressive — people meet a magnetic presence that's hard to ignore.",
  Virgo: "Your Rising is neat and observant — people meet a composed, precise presence that notices everything.",
  Libra: "Your Rising is gracious and polished — people meet a charming, harmonious presence that seeks connection.",
  Scorpio: "Your Rising is penetrating and reserved — people meet a quiet intensity that reveals little at first.",
  Sagittarius: "Your Rising is open and buoyant — people meet a forthright, adventurous presence that invites them along.",
  Capricorn: "Your Rising is composed and capable — people meet a serious, dependable presence that earns trust.",
  Aquarius: "Your Rising is unconventional and cool — people meet an original presence that keeps a step of distance.",
  Pisces: "Your Rising is soft and impressionable — people meet a dreamy, empathic presence that seems to feel them.",
};

const MAPS = { sun: SUN, moon: MOON, rising: RISING } as const;

export type PlacementType = "sun" | "moon" | "rising";

export function placementMeaning(type: PlacementType, sign: string | undefined): string {
  if (!sign) return "";
  return MAPS[type][sign] ?? "";
}

export const PLACEMENT_LABEL: Record<PlacementType, string> = {
  sun: "Sun",
  moon: "Moon",
  rising: "Rising",
};

export const PLACEMENT_INTRO: Record<PlacementType, string> = {
  sun: "Your Sun is the core of your identity — how you're wired to shine and be known.",
  moon: "Your Moon is your inner emotional weather — what helps you feel safe and held.",
  rising: "Your Rising is the face you show the world — the first impression you leave.",
};

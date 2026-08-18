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

// Per-planet interpretations, keyed by sign (used for the full chart readout).
const PLANET_MEANINGS: Record<string, Record<string, string>> = {
  Mercury: {
    Aries: "Mercury in Aries — your mind is quick, bold, and speaks before it second-guesses.",
    Taurus: "Mercury in Taurus — you think slowly and sure, and your words carry weight.",
    Gemini: "Mercury in Gemini — your mind is electric, curious, and endlessly collecting.",
    Cancer: "Mercury in Cancer — you think in feeling and remember everything said to you.",
    Leo: "Mercury in Leo — you communicate with warmth, drama, and a need to be heard.",
    Virgo: "Mercury in Virgo — your mind is precise, analytical, and beautifully organized.",
    Libra: "Mercury in Libra — you think diplomatically and weigh every side before speaking.",
    Scorpio: "Mercury in Scorpio — your mind is penetrating; you read between every line.",
    Sagittarius: "Mercury in Sagittarius — you think in big ideas and a hunger for the truth.",
    Capricorn: "Mercury in Capricorn — you communicate with structure, caution, and authority.",
    Aquarius: "Mercury in Aquarius — your thoughts are original, future-facing, and independent.",
    Pisces: "Mercury in Pisces — you think in images and intuition more than logic.",
  },
  Venus: {
    Aries: "Venus in Aries — you love directly and want what you want, now.",
    Taurus: "Venus in Taurus — you love through the senses, loyalty, and steady devotion.",
    Gemini: "Venus in Gemini — you're charmed by conversation and a playful, changeable heart.",
    Cancer: "Venus in Cancer — you love by nurturing and protecting what's yours.",
    Leo: "Venus in Leo — you love generously and need to feel adored in return.",
    Virgo: "Venus in Virgo — you show love through quiet service and careful attention.",
    Libra: "Venus in Libra — you love in partnership and seek harmony above all.",
    Scorpio: "Venus in Scorpio — you love deeply, privately, and all-or-nothing.",
    Sagittarius: "Venus in Sagittarius — you love freedom, adventure, and big-hearted honesty.",
    Capricorn: "Venus in Capricorn — you love with commitment and a long-term view.",
    Aquarius: "Venus in Aquarius — you love unconventionally and value friendship at the core.",
    Pisces: "Venus in Pisces — you love romantically, selflessly, and a little lost in dream.",
  },
  Mars: {
    Aries: "Mars in Aries — your drive is pure fire: immediate, courageous, first to act.",
    Taurus: "Mars in Taurus — your drive is steady and physical; you move when it matters.",
    Gemini: "Mars in Gemini — your energy scatters into a dozen interests at once.",
    Cancer: "Mars in Cancer — you act to protect, often from behind a defensive shell.",
    Leo: "Mars in Leo — your drive wants the stage and a cause worth burning for.",
    Virgo: "Mars in Virgo — your energy goes into fixing, refining, and being useful.",
    Libra: "Mars in Libra — you act through others and hate to move alone.",
    Scorpio: "Mars in Scorpio — your drive is intense, strategic, and impossible to shake.",
    Sagittarius: "Mars in Sagittarius — your energy needs horizon, motion, and a belief to chase.",
    Capricorn: "Mars in Capricorn — your drive is disciplined and built for the long game.",
    Aquarius: "Mars in Aquarius — you act for the collective and on your own clock.",
    Pisces: "Mars in Pisces — your energy dissolves into whatever you care about.",
  },
  Jupiter: {
    Aries: "Jupiter in Aries — your growth comes through brave beginnings and self-trust.",
    Taurus: "Jupiter in Taurus — you expand through stability, resources, and the body.",
    Gemini: "Jupiter in Gemini — you grow through learning, teaching, and connection.",
    Cancer: "Jupiter in Cancer — you're enlarged by home, family, and emotional roots.",
    Leo: "Jupiter in Leo — you thrive when you're seen and celebrated for who you are.",
    Virgo: "Jupiter in Virgo — you grow through craft, service, and getting the details right.",
    Libra: "Jupiter in Libra — your luck lives in partnership and fair-mindedness.",
    Scorpio: "Jupiter in Scorpio — you expand through depth, transformation, and truth.",
    Sagittarius: "Jupiter in Sagittarius — you grow by moving, studying, and trusting the unknown.",
    Capricorn: "Jupiter in Capricorn — you rise through structure, ambition, and responsibility.",
    Aquarius: "Jupiter in Aquarius — you expand by imagining what could be, for everyone.",
    Pisces: "Jupiter in Pisces — you're enlarged by faith, art, and surrender.",
  },
  Saturn: {
    Aries: "Saturn in Aries — your lessons are about self-discipline and learning to begin.",
    Taurus: "Saturn in Taurus — your structure is built slowly, through the tangible and lasting.",
    Gemini: "Saturn in Gemini — you're asked to focus a restless mind into real mastery.",
    Cancer: "Saturn in Cancer — your boundaries form around home, family, and feeling safe.",
    Leo: "Saturn in Leo — you learn to earn visibility without performing for approval.",
    Virgo: "Saturn in Virgo — your mastery comes through refinement and quiet competence.",
    Libra: "Saturn in Libra — you're disciplined in relationship and the art of balance.",
    Scorpio: "Saturn in Scorpio — your work is to face the deep and transform what's stuck.",
    Sagittarius: "Saturn in Sagittarius — you're asked to ground your beliefs into practice.",
    Capricorn: "Saturn in Capricorn — you're built for responsibility and the long climb.",
    Aquarius: "Saturn in Aquarius — your structure serves the collective and the future.",
    Pisces: "Saturn in Pisces — you're learning to give form to the formless with compassion.",
  },
};

export function planetMeaning(planet: string, sign: string | undefined): string {
  if (!sign) return "";
  return PLANET_MEANINGS[planet]?.[sign] ?? "";
}

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

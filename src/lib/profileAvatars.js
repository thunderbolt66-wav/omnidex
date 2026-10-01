/**
 * Profile Avatar Presets & Vector Illustrations for Omnidex
 * High-definition, zero-dependency SVG data URIs that work offline seamlessly.
 */

// Helper to encode SVG into safe data URI
function svgToUri(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const PRESET_AVATARS = [
  {
    id: 'avatar-guest',
    name: 'Explorer Guest',
    character: 'Guest',
    color: '#38bdf8',
    bg: '#0f172a',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#0b132b"/>
        <!-- Soft background aura -->
        <circle cx="50" cy="50" r="42" fill="#1c2541"/>
        <!-- Shoulders / Jacket -->
        <path d="M 20 96 C 20 72 34 65 50 65 C 66 65 80 72 80 96 Z" fill="#3a86ff"/>
        <!-- Collar detail -->
        <polygon points="50,74 42,66 58,66" fill="#f8fafc"/>
        <!-- Head -->
        <circle cx="50" cy="42" r="21" fill="#fcd34d"/>
        <!-- Friendly Hair Swoop -->
        <path d="M 30 38 C 30 22 45 18 64 22 C 72 24 74 34 72 40 C 65 28 50 26 38 34 Z" fill="#475569"/>
        <!-- Eyes & Friendly Glasses -->
        <circle cx="42" cy="42" r="6.5" stroke="#1e293b" stroke-width="2" fill="none"/>
        <circle cx="58" cy="42" r="6.5" stroke="#1e293b" stroke-width="2" fill="none"/>
        <line x1="48.5" y1="42" x2="51.5" y2="42" stroke="#1e293b" stroke-width="2"/>
        <circle cx="42" cy="42" r="2.2" fill="#0f172a"/>
        <circle cx="58" cy="42" r="2.2" fill="#0f172a"/>
        <circle cx="43.5" cy="40.5" r="0.8" fill="#ffffff"/>
        <circle cx="59.5" cy="40.5" r="0.8" fill="#ffffff"/>
        <!-- Warm smile -->
        <path d="M 44 51 Q 50 56 56 51" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'avatar-mickey',
    name: 'Classic Animation',
    character: 'Dave',
    color: '#ef4444',
    bg: '#18181b',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#27272a"/>
        <!-- Big Round Ears -->
        <circle cx="24" cy="24" r="19" fill="#18181b"/>
        <circle cx="76" cy="24" r="19" fill="#18181b"/>
        <!-- Face base -->
        <circle cx="50" cy="58" r="30" fill="#18181b"/>
        <!-- Cream Face Mask -->
        <ellipse cx="43" cy="54" rx="10" ry="15" fill="#fef3c7"/>
        <ellipse cx="57" cy="54" rx="10" ry="15" fill="#fef3c7"/>
        <ellipse cx="50" cy="67" rx="17" ry="12" fill="#fef3c7"/>
        <!-- Oval Eyes -->
        <ellipse cx="45" cy="52" rx="3.5" ry="7" fill="#18181b"/>
        <ellipse cx="55" cy="52" rx="3.5" ry="7" fill="#18181b"/>
        <circle cx="46" cy="50" r="1" fill="#ffffff"/>
        <circle cx="56" cy="50" r="1" fill="#ffffff"/>
        <!-- Button Nose -->
        <ellipse cx="50" cy="62" rx="4.5" ry="3" fill="#18181b"/>
        <!-- Happy Smile -->
        <path d="M 40 68 Q 50 78 60 68" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Tongue -->
        <path d="M 46 72 Q 50 76 54 72 Z" fill="#ef4444"/>
      </svg>
    `),
  },
  {
    id: 'avatar-mando',
    name: 'Bounty Hunter',
    character: 'Chris',
    color: '#38bdf8',
    bg: '#0f172a',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#090d16"/>
        <!-- Cape/Armor shoulders -->
        <path d="M 15 95 L 30 75 L 70 75 L 85 95 Z" fill="#334155"/>
        <!-- Helmet Dome -->
        <path d="M 28 48 C 28 25 72 25 72 48 L 70 76 L 30 76 Z" fill="#94a3b8"/>
        <!-- Helmet Brow Ridge -->
        <rect x="27" y="44" width="46" height="5" rx="2" fill="#64748b"/>
        <!-- Iconic T-Visor -->
        <path d="M 33 50 L 67 50 L 67 56 L 53 56 L 53 74 L 47 74 L 47 56 L 33 56 Z" fill="#020617"/>
        <!-- Beskar highlight sheen -->
        <path d="M 32 35 C 36 28 48 27 50 27" stroke="#e2e8f0" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8"/>
        <circle cx="50" cy="53" r="1.5" fill="#38bdf8" opacity="0.9"/>
        <!-- Cheek bevels -->
        <path d="M 30 60 L 42 74 L 32 75 Z" fill="#475569"/>
        <path d="M 70 60 L 58 74 L 68 75 Z" fill="#475569"/>
      </svg>
    `),
  },
  {
    id: 'avatar-simba',
    name: 'Lion Cub',
    character: 'Ronnie',
    color: '#f59e0b',
    bg: '#451a03',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#291305"/>
        <!-- Big Fluffy Ears -->
        <circle cx="25" cy="30" r="15" fill="#b45309"/>
        <circle cx="25" cy="30" r="10" fill="#fde68a"/>
        <circle cx="75" cy="30" r="15" fill="#b45309"/>
        <circle cx="75" cy="30" r="10" fill="#fde68a"/>
        <!-- Face Base -->
        <ellipse cx="50" cy="58" rx="30" ry="26" fill="#d97706"/>
        <!-- Hair Tuft -->
        <path d="M 45 32 Q 50 20 54 28 Q 56 22 60 30" fill="#b45309"/>
        <!-- Light Muzzle & Cheeks -->
        <ellipse cx="50" cy="67" rx="18" ry="13" fill="#fef3c7"/>
        <!-- Amber Cat Eyes -->
        <ellipse cx="38" cy="52" rx="7" ry="6" fill="#fef08a"/>
        <ellipse cx="62" cy="52" rx="7" ry="6" fill="#fef08a"/>
        <circle cx="39" cy="52" r="4" fill="#78350f"/>
        <circle cx="61" cy="52" r="4" fill="#78350f"/>
        <circle cx="37" cy="50" r="1.5" fill="#ffffff"/>
        <circle cx="59" cy="50" r="1.5" fill="#ffffff"/>
        <!-- Pink/Brown Nose -->
        <path d="M 46 62 L 54 62 L 50 67 Z" fill="#db2777"/>
        <!-- Cheerful Smile -->
        <path d="M 42 70 Q 50 78 58 70" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'avatar-cyber',
    name: 'Cyberpunk Rebel',
    character: 'Nova',
    color: '#00f2fe',
    bg: '#050515',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#08081c"/>
        <!-- Neon Glow Hair -->
        <path d="M 22 55 C 20 25 35 15 65 18 C 82 22 84 45 78 60 L 72 35 L 50 25 L 30 35 Z" fill="#ff007f"/>
        <!-- Face base -->
        <ellipse cx="50" cy="58" rx="24" ry="26" fill="#fcd34d"/>
        <!-- Cyber Visor Glasses -->
        <polygon points="26,48 74,48 70,62 30,62" fill="#00f2fe"/>
        <line x1="28" y1="55" x2="72" y2="55" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
        <!-- Face Cyber Tattoos -->
        <polyline points="35,66 38,72 34,76" stroke="#ff007f" stroke-width="1.5" fill="none"/>
        <!-- Smirk -->
        <path d="M 46 75 Q 52 77 56 74" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'avatar-wizard',
    name: 'Grand Scholar',
    character: 'Gandalf',
    color: '#a855f7',
    bg: '#1e1035',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#140a28"/>
        <!-- Wizard Hat Cone -->
        <polygon points="50,10 75,44 25,44" fill="#6b21a8"/>
        <!-- Hat Brim -->
        <ellipse cx="50" cy="44" rx="34" ry="6" fill="#7e22ce"/>
        <!-- Glowing Hat Rune -->
        <polygon points="50,26 53,32 47,32" fill="#facc15"/>
        <!-- Face -->
        <circle cx="50" cy="56" r="18" fill="#fde68a"/>
        <!-- Long White Beard -->
        <path d="M 32 58 C 30 85 45 96 50 96 C 55 96 70 85 68 58 Z" fill="#e2e8f0"/>
        <!-- Kind Eyes & Spectacles -->
        <circle cx="43" cy="54" r="5" stroke="#9333ea" stroke-width="1.5" fill="none"/>
        <circle cx="57" cy="54" r="5" stroke="#9333ea" stroke-width="1.5" fill="none"/>
        <line x1="48" y1="54" x2="52" y2="54" stroke="#9333ea" stroke-width="1.5"/>
        <circle cx="43" cy="54" r="2" fill="#1e1b4b"/>
        <circle cx="57" cy="54" r="2" fill="#1e1b4b"/>
      </svg>
    `),
  },
  {
    id: 'avatar-astronaut',
    name: 'Cosmic Voyager',
    character: 'Astro',
    color: '#38bdf8',
    bg: '#020617',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#020617"/>
        <!-- Space Stars -->
        <circle cx="20" cy="20" r="1" fill="#ffffff" opacity="0.6"/>
        <circle cx="80" cy="25" r="1.5" fill="#ffffff" opacity="0.8"/>
        <circle cx="85" cy="75" r="1" fill="#ffffff" opacity="0.5"/>
        <!-- Helmet Neck Collar -->
        <rect x="35" y="74" width="30" height="12" rx="4" fill="#cbd5e1"/>
        <!-- Helmet Outer Shell -->
        <circle cx="50" cy="52" r="28" fill="#f8fafc"/>
        <!-- Golden Solar Visor -->
        <ellipse cx="50" cy="52" rx="21" ry="16" fill="url(#goldVisor)"/>
        <!-- Earth reflection highlight in visor -->
        <ellipse cx="43" cy="46" rx="6" ry="3" fill="#ffffff" opacity="0.7"/>
        <defs>
          <linearGradient id="goldVisor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
        </defs>
      </svg>
    `),
  },
  {
    id: 'avatar-cat',
    name: 'Bookish Feline',
    character: 'Luna',
    color: '#ec4899',
    bg: '#1f1325',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#1e1124"/>
        <!-- Pointy Cat Ears -->
        <polygon points="26,18 42,38 20,44" fill="#3f3f46"/>
        <polygon points="26,22 38,36 22,40" fill="#f472b6"/>
        <polygon points="74,18 58,38 80,44" fill="#3f3f46"/>
        <polygon points="74,22 62,36 78,40" fill="#f472b6"/>
        <!-- Cat Head -->
        <circle cx="50" cy="56" r="26" fill="#27272a"/>
        <!-- Round Reading Glasses -->
        <circle cx="40" cy="54" r="8" stroke="#f472b6" stroke-width="2" fill="rgba(255,255,255,0.1)"/>
        <circle cx="60" cy="54" r="8" stroke="#f472b6" stroke-width="2" fill="rgba(255,255,255,0.1)"/>
        <line x1="48" y1="54" x2="52" y2="54" stroke="#f472b6" stroke-width="2"/>
        <!-- Emerald Eyes -->
        <ellipse cx="40" cy="54" rx="4" ry="5" fill="#10b981"/>
        <ellipse cx="60" cy="54" rx="4" ry="5" fill="#10b981"/>
        <ellipse cx="40" cy="54" rx="1.5" ry="4" fill="#064e3b"/>
        <ellipse cx="60" cy="54" rx="1.5" ry="4" fill="#064e3b"/>
        <!-- Pink Nose -->
        <polygon points="50,65 47,62 53,62" fill="#f472b6"/>
        <!-- Whiskers -->
        <line x1="22" y1="64" x2="35" y2="65" stroke="#a1a1aa" stroke-width="1.5"/>
        <line x1="24" y1="69" x2="36" y2="68" stroke="#a1a1aa" stroke-width="1.5"/>
        <line x1="78" y1="64" x2="65" y2="65" stroke="#a1a1aa" stroke-width="1.5"/>
        <line x1="76" y1="69" x2="64" y2="68" stroke="#a1a1aa" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: 'avatar-monogram',
    name: 'Minimalist Seal',
    character: 'Atlas',
    color: '#10b981',
    bg: '#042f2e',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#064e3b"/>
        <circle cx="50" cy="50" r="42" stroke="#34d399" stroke-width="2" stroke-dasharray="4 2" fill="none"/>
        <circle cx="50" cy="50" r="36" stroke="#34d399" stroke-width="1" fill="none"/>
        <!-- Open Book Glyph -->
        <path d="M 50 42 C 43 37 32 38 27 41 L 27 65 C 32 62 43 61 50 66 C 57 61 68 62 73 65 L 73 41 C 68 38 57 37 50 42 Z" fill="#6ee7b7"/>
        <line x1="50" y1="42" x2="50" y2="66" stroke="#064e3b" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: 'avatar-fox',
    name: 'Clever Fox',
    character: 'Felix',
    color: '#ea580c',
    bg: '#064e3b',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#064e3b"/>
        <!-- Fox Ears -->
        <polygon points="20,44 14,14 42,32" fill="#c2410c"/>
        <polygon points="22,38 18,18 38,30" fill="#fef3c7"/>
        <polygon points="80,44 86,14 58,32" fill="#c2410c"/>
        <polygon points="78,38 82,18 62,30" fill="#fef3c7"/>
        <!-- Head base -->
        <polygon points="18,48 82,48 50,88" fill="#ea580c"/>
        <!-- White cheeks / muzzle -->
        <polygon points="24,54 50,88 50,68" fill="#f8fafc"/>
        <polygon points="76,54 50,88 50,68" fill="#f8fafc"/>
        <!-- Black button nose -->
        <polygon points="46,84 54,84 50,88" fill="#18181b"/>
        <!-- Sleek amber eyes -->
        <ellipse cx="38" cy="52" rx="4" ry="2.5" fill="#fef08a"/>
        <circle cx="38" cy="52" r="1.8" fill="#1c1917"/>
        <ellipse cx="62" cy="52" rx="4" ry="2.5" fill="#fef08a"/>
        <circle cx="62" cy="52" r="1.8" fill="#1c1917"/>
        <!-- Golden Monocle on right eye -->
        <circle cx="62" cy="52" r="6.5" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
        <path d="M 68 54 Q 74 65 72 75" stroke="#f59e0b" stroke-width="1.2" fill="none"/>
      </svg>
    `),
  },
  {
    id: 'avatar-owl',
    name: 'Wise Owl',
    character: 'Athena',
    color: '#6366f1',
    bg: '#090d16',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#0f172a"/>
        <!-- Feather tufts -->
        <polygon points="32,24 20,38 38,36" fill="#312e81"/>
        <polygon points="68,24 80,38 62,36" fill="#312e81"/>
        <!-- Body / Head -->
        <ellipse cx="50" cy="58" rx="30" ry="28" fill="#1e1b4b"/>
        <!-- Eye plumage circles -->
        <circle cx="39" cy="50" r="15" fill="#4338ca"/>
        <circle cx="61" cy="50" r="15" fill="#4338ca"/>
        <!-- Glowing gold eyes -->
        <circle cx="39" cy="50" r="9" fill="#fef08a"/>
        <circle cx="61" cy="50" r="9" fill="#fef08a"/>
        <circle cx="39" cy="50" r="5" fill="#0f172a"/>
        <circle cx="61" cy="50" r="5" fill="#0f172a"/>
        <circle cx="37" cy="48" r="1.5" fill="#ffffff"/>
        <circle cx="59" cy="48" r="1.5" fill="#ffffff"/>
        <!-- Golden spectacles -->
        <circle cx="39" cy="50" r="11" stroke="#f59e0b" stroke-width="1.8" fill="none"/>
        <circle cx="61" cy="50" r="11" stroke="#f59e0b" stroke-width="1.8" fill="none"/>
        <line x1="50" y1="50" x2="50" y2="50" stroke="#f59e0b" stroke-width="2"/>
        <!-- Amber beak -->
        <polygon points="46,58 54,58 50,68" fill="#f59e0b"/>
        <!-- Chest feather markings -->
        <path d="M 44 74 Q 50 78 56 74 M 42 80 Q 50 84 58 80" stroke="#6366f1" stroke-width="1.5" fill="none"/>
      </svg>
    `),
  },
  {
    id: 'avatar-ninja',
    name: 'Shadow Shinobi',
    character: 'Kage',
    color: '#ef4444',
    bg: '#09090b',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#09090b"/>
        <!-- Dark Cowl -->
        <circle cx="50" cy="52" r="32" fill="#18181b"/>
        <!-- Crimson Headband -->
        <rect x="20" y="32" width="60" height="9" rx="2" fill="#dc2626"/>
        <rect x="36" y="33" width="28" height="7" rx="1.5" fill="#94a3b8"/>
        <!-- Eye slit opening -->
        <rect x="28" y="44" width="44" height="13" rx="2" fill="#fcd34d"/>
        <!-- Focused sharp eyes -->
        <polygon points="34,48 45,51 45,49" fill="#18181b"/>
        <polygon points="66,48 55,51 55,49" fill="#18181b"/>
        <circle cx="40" cy="50" r="2" fill="#18181b"/>
        <circle cx="60" cy="50" r="2" fill="#18181b"/>
        <!-- Mask lower wrap -->
        <path d="M 22 56 C 22 78 78 78 78 56 Z" fill="#27272a"/>
        <!-- Fabric folds -->
        <path d="M 32 64 L 68 64" stroke="#18181b" stroke-width="1.5"/>
        <path d="M 38 72 L 62 72" stroke="#18181b" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: 'avatar-viking',
    name: 'Norse Explorer',
    character: 'Ragnar',
    color: '#f59e0b',
    bg: '#0c4a6e',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#082f49"/>
        <!-- Curved Horns -->
        <path d="M 26 34 C 15 28 10 12 18 12 C 24 16 28 26 30 36" fill="#fef3c7"/>
        <path d="M 74 34 C 85 28 90 12 82 12 C 76 16 72 26 70 36" fill="#fef3c7"/>
        <!-- Iron Spangenhelm -->
        <path d="M 28 42 C 28 22 72 22 72 42 Z" fill="#64748b"/>
        <rect x="26" y="38" width="48" height="6" fill="#475569"/>
        <polygon points="47,40 53,40 50,56" fill="#475569"/>
        <!-- Face -->
        <circle cx="50" cy="52" r="16" fill="#fed7aa"/>
        <!-- Fierce Eyes -->
        <circle cx="43" cy="48" r="2" fill="#0284c7"/>
        <circle cx="57" cy="48" r="2" fill="#0284c7"/>
        <!-- Flowing Braided Golden Beard -->
        <path d="M 30 54 C 28 85 45 96 50 96 C 55 96 72 85 70 54 Z" fill="#b45309"/>
        <!-- Braids -->
        <rect x="42" y="78" width="6" height="12" rx="3" fill="#d97706"/>
        <rect x="52" y="78" width="6" height="12" rx="3" fill="#d97706"/>
      </svg>
    `),
  },
  {
    id: 'avatar-robot',
    name: 'Retro Automaton',
    character: 'Volt',
    color: '#10b981',
    bg: '#042f2e',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#06202a"/>
        <!-- Antenna -->
        <line x1="50" y1="26" x2="50" y2="12" stroke="#64748b" stroke-width="3"/>
        <circle cx="50" cy="12" r="5" fill="#facc15"/>
        <!-- Ears / Bolts -->
        <rect x="18" y="44" width="6" height="14" rx="2" fill="#475569"/>
        <rect x="76" y="44" width="6" height="14" rx="2" fill="#475569"/>
        <!-- Head Chassis -->
        <rect x="24" y="26" width="52" height="50" rx="10" fill="#64748b"/>
        <!-- CRT Screen Face -->
        <rect x="30" y="32" width="40" height="34" rx="6" fill="#022c22"/>
        <!-- Phosphor Green Glow Eyes -->
        <circle cx="40" cy="46" r="4.5" fill="#22c55e"/>
        <circle cx="60" cy="46" r="4.5" fill="#22c55e"/>
        <!-- Digital Smile -->
        <path d="M 40 56 Q 50 62 60 56" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Collar -->
        <rect x="40" y="76" width="20" height="10" fill="#334155"/>
      </svg>
    `),
  },
  {
    id: 'avatar-pirate',
    name: 'Captain Corsair',
    character: 'Blackbeard',
    color: '#e11d48',
    bg: '#1c1917',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#18181b"/>
        <!-- White Feather Plume -->
        <path d="M 68 18 C 76 8 86 16 82 28 Z" fill="#f8fafc"/>
        <!-- Captain Tricorne Hat -->
        <path d="M 16 42 Q 50 20 84 42 Q 50 34 16 42 Z" fill="#09090b"/>
        <path d="M 22 40 Q 50 24 78 40" stroke="#f59e0b" stroke-width="2" fill="none"/>
        <!-- Skull insignia -->
        <circle cx="50" cy="32" r="3.5" fill="#ffffff"/>
        <!-- Pirate Face -->
        <circle cx="50" cy="54" r="18" fill="#fed7aa"/>
        <!-- Eye patch on left -->
        <line x1="30" y1="46" x2="52" y2="56" stroke="#18181b" stroke-width="1.8"/>
        <circle cx="42" cy="52" r="5.5" fill="#09090b"/>
        <!-- Piercing right eye -->
        <circle cx="58" cy="52" r="2.5" fill="#1e293b"/>
        <!-- Rugged Goatee -->
        <path d="M 44 65 C 44 76 56 76 56 65 Z" fill="#292524"/>
        <path d="M 46 62 Q 52 64 56 62" stroke="#292524" stroke-width="2" fill="none"/>
      </svg>
    `),
  },
  {
    id: 'avatar-dragon',
    name: 'Mythic Drake',
    character: 'Ignis',
    color: '#10b981',
    bg: '#022c22',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#022c22"/>
        <!-- Sweeping Golden Horns -->
        <path d="M 32 36 C 22 24 16 12 28 10 C 34 14 36 24 38 36" fill="#f59e0b"/>
        <path d="M 68 36 C 78 24 84 12 72 10 C 66 14 64 24 62 36" fill="#f59e0b"/>
        <!-- Dragon Head Base -->
        <path d="M 30 40 L 70 40 L 64 80 L 50 88 L 36 80 Z" fill="#059669"/>
        <!-- Spiky brow ridge -->
        <polygon points="50,26 44,38 56,38" fill="#047857"/>
        <!-- Slit Reptilian Golden Eyes -->
        <polygon points="34,48 46,52 38,55" fill="#fef08a"/>
        <polygon points="66,48 54,52 62,55" fill="#fef08a"/>
        <line x1="40" y1="49" x2="40" y2="54" stroke="#1c1917" stroke-width="1.8"/>
        <line x1="60" y1="49" x2="60" y2="54" stroke="#1c1917" stroke-width="1.8"/>
        <!-- Snout & Nostrils -->
        <circle cx="46" cy="74" r="2" fill="#064e3b"/>
        <circle cx="54" cy="74" r="2" fill="#064e3b"/>
        <!-- Smoke puff curl -->
        <circle cx="50" cy="88" r="3" fill="#f97316" opacity="0.8"/>
      </svg>
    `),
  },
  {
    id: 'avatar-panda',
    name: 'Zen Panda',
    character: 'Bao',
    color: '#22c55e',
    bg: '#064e3b',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#064e3b"/>
        <!-- Black Round Ears -->
        <circle cx="25" cy="28" r="14" fill="#18181b"/>
        <circle cx="75" cy="28" r="14" fill="#18181b"/>
        <!-- Head -->
        <circle cx="50" cy="54" r="30" fill="#f8fafc"/>
        <!-- Red Zen Headband -->
        <path d="M 22 40 Q 50 36 78 40 L 78 46 Q 50 42 22 46 Z" fill="#ef4444"/>
        <circle cx="50" cy="42" r="3" fill="#ffffff"/>
        <!-- Eye Patches -->
        <ellipse cx="38" cy="52" rx="7" ry="8" fill="#18181b" transform="rotate(-15 38 52)"/>
        <ellipse cx="62" cy="52" rx="7" ry="8" fill="#18181b" transform="rotate(15 62 52)"/>
        <circle cx="39" cy="52" r="2" fill="#ffffff"/>
        <circle cx="61" cy="52" r="2" fill="#ffffff"/>
        <!-- Nose -->
        <ellipse cx="50" cy="64" rx="4.5" ry="3" fill="#18181b"/>
        <!-- Peaceful Smile with Bamboo Leaf -->
        <path d="M 44 68 Q 50 72 56 68" stroke="#18181b" stroke-width="2" fill="none"/>
        <path d="M 54 68 Q 66 65 72 70" stroke="#22c55e" stroke-width="2" fill="none"/>
        <ellipse cx="70" cy="70" rx="3.5" ry="2" fill="#22c55e" transform="rotate(20 70 70)"/>
      </svg>
    `),
  },
  {
    id: 'avatar-knight',
    name: 'Paladin Knight',
    character: 'Arthur',
    color: '#3b82f6',
    bg: '#1e3a8a',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#0f172a"/>
        <!-- Royal Blue Plumage Crest -->
        <path d="M 50 8 C 42 12 36 24 50 26 C 64 24 58 12 50 8 Z" fill="#2563eb"/>
        <!-- Medieval Great Helm -->
        <path d="M 28 36 C 28 24 72 24 72 36 L 70 78 L 50 88 L 30 78 Z" fill="#94a3b8"/>
        <!-- Steel Brow Trim -->
        <rect x="27" y="44" width="46" height="4" fill="#cbd5e1"/>
        <!-- Golden Cross Visor -->
        <rect x="47" y="40" width="6" height="34" fill="#f59e0b"/>
        <rect x="33" y="48" width="34" height="6" fill="#f59e0b"/>
        <!-- Dark Eye Slits inside Cross -->
        <line x1="36" y1="51" x2="45" y2="51" stroke="#090d16" stroke-width="2"/>
        <line x1="55" y1="51" x2="64" y2="51" stroke="#090d16" stroke-width="2"/>
        <!-- Breathing Vent Holes -->
        <circle cx="42" cy="66" r="1.5" fill="#475569"/>
        <circle cx="58" cy="66" r="1.5" fill="#475569"/>
        <circle cx="44" cy="72" r="1.5" fill="#475569"/>
        <circle cx="56" cy="72" r="1.5" fill="#475569"/>
      </svg>
    `),
  },
  {
    id: 'avatar-samurai',
    name: 'Ronin Samurai',
    character: 'Jin',
    color: '#e11d48',
    bg: '#450a0a',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#1c0707"/>
        <!-- Golden Crescent Moon Crest (Maedate) -->
        <path d="M 38 18 C 45 8 55 8 62 18 C 55 14 45 14 38 18 Z" fill="#facc15"/>
        <polygon points="48,16 52,16 50,28" fill="#facc15"/>
        <!-- Kabuto Helmet Dome -->
        <path d="M 24 38 C 24 22 76 22 76 38 L 74 46 L 26 46 Z" fill="#1c1917"/>
        <!-- Sweeping Shikoro Neck Guards -->
        <path d="M 18 46 L 28 42 L 30 72 L 18 78 Z" fill="#b91c1c"/>
        <path d="M 82 46 L 72 42 L 70 72 L 82 78 Z" fill="#b91c1c"/>
        <!-- Face & Fierce Eyes -->
        <rect x="34" y="44" width="32" height="14" fill="#fcd34d"/>
        <circle cx="42" cy="50" r="2.2" fill="#18181b"/>
        <circle cx="58" cy="50" r="2.2" fill="#18181b"/>
        <!-- Mengu Armored Lower Mask -->
        <path d="M 30 58 L 70 58 L 65 82 L 50 88 L 35 82 Z" fill="#7f1d1d"/>
        <rect x="42" y="66" width="16" height="3" fill="#facc15"/>
      </svg>
    `),
  },
  {
    id: 'avatar-alien',
    name: 'Cosmic Alien',
    character: 'Zorblax',
    color: '#a855f7',
    bg: '#1e1035',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#150827"/>
        <!-- Antennas with glowing spheres -->
        <path d="M 38 28 Q 30 14 26 18" stroke="#a855f7" stroke-width="2.5" fill="none"/>
        <circle cx="26" cy="18" r="4" fill="#06b6d4"/>
        <path d="M 62 28 Q 70 14 74 18" stroke="#a855f7" stroke-width="2.5" fill="none"/>
        <circle cx="74" cy="18" r="4" fill="#06b6d4"/>
        <!-- Alien Head -->
        <ellipse cx="50" cy="50" rx="30" ry="26" fill="#c084fc"/>
        <polygon points="20,50 80,50 50,86" fill="#c084fc"/>
        <!-- Giant Starlight Obsidian Eyes -->
        <ellipse cx="37" cy="50" rx="8" ry="12" fill="#0f172a" transform="rotate(-15 37 50)"/>
        <ellipse cx="63" cy="50" rx="8" ry="12" fill="#0f172a" transform="rotate(15 63 50)"/>
        <circle cx="36" cy="46" r="3" fill="#ffffff"/>
        <circle cx="62" cy="46" r="3" fill="#ffffff"/>
        <circle cx="39" cy="52" r="1.5" fill="#38bdf8"/>
        <circle cx="65" cy="52" r="1.5" fill="#38bdf8"/>
        <!-- Tiny peaceful mouth -->
        <ellipse cx="50" cy="74" rx="3" ry="1.5" fill="#7e22ce"/>
      </svg>
    `),
  },
  {
    id: 'avatar-superhero',
    name: 'Caped Vigilante',
    character: 'Shadow',
    color: '#38bdf8',
    bg: '#030712',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#030712"/>
        <!-- Pointed Cowl Ears -->
        <polygon points="26,38 22,8 38,28" fill="#111827"/>
        <polygon points="74,38 78,8 62,28" fill="#111827"/>
        <!-- Mask Dome -->
        <circle cx="50" cy="50" r="32" fill="#111827"/>
        <!-- Angled Glowing White Eyes -->
        <polygon points="34,44 46,47 44,43" fill="#ffffff"/>
        <polygon points="66,44 54,47 56,43" fill="#ffffff"/>
        <!-- Chiseled Lower Face -->
        <polygon points="36,58 64,58 50,86" fill="#fcd34d"/>
        <!-- Firm Mouth Line -->
        <line x1="44" y1="72" x2="56" y2="72" stroke="#111827" stroke-width="2"/>
        <path d="M 46 78 L 54 78" stroke="#111827" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: 'avatar-detective',
    name: 'Victorian Sleuth',
    character: 'Holmes',
    color: '#d97706',
    bg: '#1c1917',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#1c1917"/>
        <!-- Deerstalker Cap -->
        <ellipse cx="50" cy="32" rx="30" ry="16" fill="#78716c"/>
        <ellipse cx="50" cy="38" rx="36" ry="6" fill="#57534e"/>
        <circle cx="50" cy="20" r="3" fill="#f59e0b"/>
        <!-- Sleuth Face -->
        <circle cx="50" cy="54" r="18" fill="#fed7aa"/>
        <!-- Monocle on left eye -->
        <circle cx="43" cy="52" r="5" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
        <circle cx="43" cy="52" r="2" fill="#18181b"/>
        <circle cx="57" cy="52" r="2" fill="#18181b"/>
        <!-- Upturned Trenchcoat Collar -->
        <path d="M 28 88 L 36 68 L 50 78 L 64 68 L 72 88 Z" fill="#44403c"/>
        <!-- Calabash Pipe -->
        <path d="M 52 64 C 58 64 66 68 62 76 C 58 84 50 82 50 78" stroke="#78350f" stroke-width="2.5" fill="none"/>
        <ellipse cx="62" cy="74" rx="4" ry="5" fill="#b45309"/>
      </svg>
    `),
  },
  {
    id: 'avatar-bear',
    name: 'Cozy Forest Bear',
    character: 'Barnaby',
    color: '#f59e0b',
    bg: '#451a03',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#291305"/>
        <!-- Bear Ears -->
        <circle cx="26" cy="30" r="12" fill="#78350f"/>
        <circle cx="26" cy="30" r="7" fill="#fde68a"/>
        <circle cx="74" cy="30" r="12" fill="#78350f"/>
        <circle cx="74" cy="30" r="7" fill="#fde68a"/>
        <!-- Bear Head -->
        <circle cx="50" cy="56" r="28" fill="#92400e"/>
        <!-- Mustard Knit Beanie -->
        <path d="M 28 42 C 28 20 72 20 72 42 Z" fill="#eab308"/>
        <rect x="26" y="38" width="48" height="6" rx="2" fill="#ca8a04"/>
        <circle cx="50" cy="18" r="4.5" fill="#fef08a"/>
        <!-- Light Snout -->
        <ellipse cx="50" cy="65" rx="14" ry="10" fill="#fef3c7"/>
        <ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#18181b"/>
        <!-- Kind eyes -->
        <circle cx="40" cy="50" r="2.5" fill="#18181b"/>
        <circle cx="60" cy="50" r="2.5" fill="#18181b"/>
        <!-- Warm Scarf -->
        <path d="M 24 88 Q 50 78 76 88 L 74 96 Q 50 86 26 96 Z" fill="#dc2626"/>
      </svg>
    `),
  },
  {
    id: 'avatar-fairy',
    name: 'Enchanted Sprite',
    character: 'Flora',
    color: '#ec4899',
    bg: '#042f2e',
    svg: svgToUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#042f2e"/>
        <!-- Sparkling Wing Glow -->
        <ellipse cx="28" cy="46" rx="14" ry="24" fill="#a7f3d0" opacity="0.4" transform="rotate(-25 28 46)"/>
        <ellipse cx="72" cy="46" rx="14" ry="24" fill="#a7f3d0" opacity="0.4" transform="rotate(25 72 46)"/>
        <!-- Pointed Pixie Ears -->
        <polygon points="26,50 14,42 28,40" fill="#fed7aa"/>
        <polygon points="74,50 86,42 72,40" fill="#fed7aa"/>
        <!-- Fairy Face -->
        <circle cx="50" cy="54" r="22" fill="#fef08a"/>
        <!-- Flower Crown -->
        <circle cx="36" cy="38" r="4" fill="#ec4899"/>
        <circle cx="50" cy="35" r="4.5" fill="#facc15"/>
        <circle cx="64" cy="38" r="4" fill="#ec4899"/>
        <!-- Gentle Emerald Eyes -->
        <ellipse cx="43" cy="54" rx="2.5" ry="3.5" fill="#059669"/>
        <ellipse cx="57" cy="54" rx="2.5" ry="3.5" fill="#059669"/>
        <circle cx="42.5" cy="53" r="1" fill="#ffffff"/>
        <circle cx="56.5" cy="53" r="1" fill="#ffffff"/>
        <!-- Sweet Smile -->
        <path d="M 46 63 Q 50 67 54 63" stroke="#be185d" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
];

/**
 * Resolves avatar identifier or custom image URL to a valid image source.
 */
export function resolveAvatarUrl(avatarIdOrUrl) {
  if (!avatarIdOrUrl) {
    return PRESET_AVATARS[0].svg;
  }
  const match = PRESET_AVATARS.find((a) => a.id === avatarIdOrUrl);
  if (match) {
    return match.svg;
  }
  return avatarIdOrUrl;
}

/**
 * Safely processes and compresses a user-uploaded image file from local device
 * into an optimized square thumbnail (WebP / JPEG Data URL) to prevent storage bloat.
 */
export async function processCustomAvatarFile(file, maxDimension = 256) {
  if (!file) throw new Error('No file provided');
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WEBP, or GIF).');
  }

  // Reject files exceeding 12MB before parsing
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Image file is too large. Please select a photo under 12MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image.'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Could not parse image data.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Center-crop to square
          const minSide = Math.min(width, height);
          const startX = (width - minSide) / 2;
          const startY = (height - minSide) / 2;

          canvas.width = maxDimension;
          canvas.height = maxDimension;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(e.target.result);
            return;
          }

          // Anti-aliased high quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            maxDimension,
            maxDimension
          );

          // Export as compressed WebP or fallback to JPEG data URL
          try {
            const webpUrl = canvas.toDataURL('image/webp', 0.88);
            if (webpUrl && webpUrl.startsWith('data:image/webp')) {
              resolve(webpUrl);
              return;
            }
          } catch {}

          const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(jpegUrl);
        } catch {
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Theme definitions and utility style maps for Omnidex (36 Unique Aesthetic Themes)

export const THEME_LIST = [
  // 1. Tactile & Authentic Physical Papers (Real Paper Textures, Rules & Inks)
  {
    id: 'sepia',
    name: 'Parchment',
    category: 'Paper',
    subtext: 'Aged calfskin vellum & iron gall ink',
    icon: 'Scroll',
    previewBg: '#F4ECD8',
    previewAccent: '#433422',
  },
  {
    id: 'newsprint',
    name: 'Newsprint',
    category: 'Paper',
    subtext: 'Unbleached daily broadsheet & carbon print ink',
    icon: 'FileText',
    previewBg: '#EFECE6',
    previewAccent: '#18181A',
  },
  {
    id: 'book-cream',
    name: 'Munken Cream',
    category: 'Paper',
    subtext: 'Swedish novel paper with bistre ink & cloth ribbon',
    icon: 'BookOpen',
    previewBg: '#F7F4EB',
    previewAccent: '#991B1B',
  },
  {
    id: 'legal-pad',
    name: 'Canary Legal Pad',
    category: 'Paper',
    subtext: 'Yellow note pad with fountain navy & red rule',
    icon: 'FileText',
    previewBg: '#FEF9C3',
    previewAccent: '#1E3A8A',
  },
  {
    id: 'kraft',
    name: 'Kraft Cardstock',
    category: 'Paper',
    subtext: 'Fibrous unbleached craft paper & charcoal ink',
    icon: 'FileText',
    previewBg: '#D8C7B0',
    previewAccent: '#28211A',
  },
  {
    id: 'washi',
    name: 'Japanese Washi',
    category: 'Paper',
    subtext: 'Handmade mulberry paper & sumi brush ink',
    icon: 'Feather',
    previewBg: '#FAF7F0',
    previewAccent: '#C2410C',
  },
  {
    id: 'engineering-pad',
    name: 'Engineering Grid',
    category: 'Paper',
    subtext: 'Quadrille sage drafting paper & technical graphite',
    icon: 'FileText',
    previewBg: '#EEF5F0',
    previewAccent: '#047857',
  },
  {
    id: 'cotton-rag',
    name: 'Cotton Rag',
    category: 'Paper',
    subtext: 'Deckled archival watercolor paper & bistre ink',
    icon: 'Feather',
    previewBg: '#F5F2ED',
    previewAccent: '#334155',
  },
  {
    id: 'blueprint',
    name: 'Blueprint Paper',
    category: 'Paper',
    subtext: 'Architectural cyanotype paper & chalk white ink',
    icon: 'FileText',
    previewBg: '#133857',
    previewAccent: '#38BDF8',
  },

  // 2. Classic Dark & Night
  {
    id: 'dark',
    name: 'Obsidian',
    category: 'Dark',
    subtext: 'Pitch dark with warm amber gold',
    icon: 'Moon',
    previewBg: '#090a0f',
    previewAccent: '#f59e0b',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    category: 'Dark',
    subtext: 'Gothic violet with vivid neon pink',
    icon: 'Moon',
    previewBg: '#1e1f29',
    previewAccent: '#ff79c6',
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    category: 'Dark',
    subtext: 'Deep midnight indigo with celestial blue',
    icon: 'Compass',
    previewBg: '#13141c',
    previewAccent: '#7aa2f7',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    category: 'Dark',
    subtext: 'Soothing mocha slate & lavender pastel',
    icon: 'Coffee',
    previewBg: '#181825',
    previewAccent: '#cba6f7',
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    category: 'Dark',
    subtext: 'Charcoal carbon with electric sunshine',
    icon: 'Zap',
    previewBg: '#181818',
    previewAccent: '#ffd866',
  },
  {
    id: 'slate',
    name: 'Carbon Slate',
    category: 'Dark',
    subtext: 'Minimalist industrial steel and cool graphite',
    icon: 'Compass',
    previewBg: '#090d16',
    previewAccent: '#94a3b8',
  },

  // 3. Nature & Atmosphere
  {
    id: 'forest',
    name: 'Deep Forest',
    category: 'Nature',
    subtext: 'Calm moss canopy & emerald night',
    icon: 'Trees',
    previewBg: '#0a1310',
    previewAccent: '#10b981',
  },
  {
    id: 'emerald',
    name: 'Velvet Jade',
    category: 'Nature',
    subtext: 'Royal botanical deep jade green',
    icon: 'Trees',
    previewBg: '#030e0b',
    previewAccent: '#34d399',
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    category: 'Nature',
    subtext: 'Arctic glacier slate with frosted ice blue',
    icon: 'Compass',
    previewBg: '#0b1120',
    previewAccent: '#38bdf8',
  },
  {
    id: 'ocean',
    name: 'Abyssal Ocean',
    category: 'Nature',
    subtext: 'Mariana trench navy with luminescent cyan',
    icon: 'Compass',
    previewBg: '#020b17',
    previewAccent: '#06b6d4',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'Nature',
    subtext: 'Boreal night sky with dancing turquoise glow',
    icon: 'Zap',
    previewBg: '#031014',
    previewAccent: '#2dd4bf',
  },

  // 4. Cozy & Warm Atmospheres
  {
    id: 'espresso',
    name: 'Espresso Roast',
    category: 'Warm',
    subtext: 'Rich roasted dark coffee with foam cream',
    icon: 'Coffee',
    previewBg: '#120c08',
    previewAccent: '#ddb892',
  },
  {
    id: 'amber',
    name: 'Dune Amber',
    category: 'Warm',
    subtext: 'Desert sunset twilight with molten gold',
    icon: 'Sun',
    previewBg: '#100c04',
    previewAccent: '#f59e0b',
  },
  {
    id: 'copper',
    name: 'Burnished Copper',
    category: 'Warm',
    subtext: 'Molten bronze & artisan fiery rust',
    icon: 'Flame',
    previewBg: '#120b08',
    previewAccent: '#ea580c',
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox Dark',
    category: 'Warm',
    subtext: 'Retro groovy earth tones with warm caramel',
    icon: 'Coffee',
    previewBg: '#1d2021',
    previewAccent: '#fe8019',
  },

  // 4. Bright & Day Papers
  {
    id: 'light',
    name: 'Editorial',
    category: 'Light',
    subtext: 'Crisp gallery minimalist art paper',
    icon: 'Sun',
    previewBg: '#f8f9fa',
    previewAccent: '#0f172a',
  },
  {
    id: 'sakura',
    name: 'Sakura Blossom',
    category: 'Light',
    subtext: 'Soft cherry blossom cream & petal crimson',
    icon: 'Flame',
    previewBg: '#fff5f7',
    previewAccent: '#e11d48',
  },
  {
    id: 'matcha',
    name: 'Matcha Zen',
    category: 'Light',
    subtext: 'Kyoto green tea paper with bamboo olive',
    icon: 'Trees',
    previewBg: '#f3f6eb',
    previewAccent: '#4d7c0f',
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    category: 'Light',
    subtext: 'Classic academic ivory cream & terracotta',
    icon: 'Sun',
    previewBg: '#fdf6e3',
    previewAccent: '#cb4b16',
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    category: 'Light',
    subtext: 'Warm desert papyrus with earthy rust',
    icon: 'Sun',
    previewBg: '#fbf1c7',
    previewAccent: '#af3a03',
  },

  // 5. Vibrant & Celestial
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'Vibrant',
    subtext: 'Dusk neon shadows with electric blue',
    icon: 'Zap',
    previewBg: '#080c14',
    previewAccent: '#00f2fe',
  },
  {
    id: 'synthwave',
    name: "Synthwave '84",
    category: 'Vibrant',
    subtext: '80s retro grid violet with radiant magenta',
    icon: 'Zap',
    previewBg: '#170c2c',
    previewAccent: '#ff7edb',
  },
  {
    id: 'sunset',
    name: 'Rose Dusk',
    category: 'Vibrant',
    subtext: 'Muted velvet dusk & sunset amber',
    icon: 'Flame',
    previewBg: '#140d1a',
    previewAccent: '#f43f5e',
  },
  {
    id: 'wine',
    name: 'Vintage Bordeaux',
    category: 'Vibrant',
    subtext: 'Deep velvety burgundy vineyard & rose gold',
    icon: 'Flame',
    previewBg: '#12070c',
    previewAccent: '#be123c',
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    category: 'Vibrant',
    subtext: 'Ethereal twilight amethyst with glowing lilac',
    icon: 'Moon',
    previewBg: '#110e1c',
    previewAccent: '#c084fc',
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    category: 'Vibrant',
    subtext: 'Deep cyan ocean slate with solar amber',
    icon: 'Compass',
    previewBg: '#00212b',
    previewAccent: '#b58900',
  },
  {
    id: 'matrix',
    name: 'Phosphor Matrix',
    category: 'Vibrant',
    subtext: 'CRT terminal black with cyber phosphor green',
    icon: 'Zap',
    previewBg: '#030904',
    previewAccent: '#22c55e',
  },
];

export function getThemeClasses(theme) {
  switch (theme) {
    // ---------------- AUTHENTIC PHYSICAL PAPERS ----------------
    case 'sepia':
      return {
        root: 'paper-texture-parchment bg-[#F4ECD8] text-[#433422]',
        header: 'bg-[#F4ECD8]/95 border-[#ded3be] text-[#433422]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#433422] bg-[#EAE0C8] shadow-xl'
            : 'bg-[#EAE0C8] border border-[#d8ccb0] hover:border-[#bdae8f] hover:shadow-xl',
        input:
          'bg-[#F4ECD8] border-[#c8b99d] text-[#433422] placeholder-[#8c755c] focus:border-[#433422] focus:ring-1 focus:ring-[#433422]',
        dropdown: 'bg-[#EAE0C8] border-[#c8b99d] text-[#433422] shadow-2xl',
        dropdownHover: 'hover:bg-[#ded3be]',
        modal: 'bg-[#F4ECD8] text-[#433422] border-[#c8b99d]',
        pageBg: 'bg-[#EAE0C8] text-[#433422] border-r border-[#c8b99d]',
        buttonPrimary: 'bg-[#433422] text-[#F4ECD8] hover:bg-[#34281a]',
        progressColor: 'bg-[#7c562c]',
        accentText: 'text-[#433422]',
        badge: 'bg-[#433422]/10 text-[#433422] border-[#433422]/20',
      };

    case 'newsprint':
      return {
        root: 'paper-texture-newsprint bg-[#EFECE6] text-[#18181A]',
        header: 'bg-[#EFECE6]/95 border-[#CEC8BC] text-[#18181A]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#18181A] bg-[#E3DFD5] shadow-xl'
            : 'bg-[#E3DFD5] border border-[#CEC8BC] hover:border-[#9E9789] hover:shadow-xl',
        input:
          'bg-[#F6F4EE] border-[#CEC8BC] text-[#18181A] placeholder-[#7E7A72] focus:border-[#18181A] focus:ring-1 focus:ring-[#18181A]',
        dropdown: 'bg-[#E3DFD5] border-[#CEC8BC] text-[#18181A] shadow-2xl',
        dropdownHover: 'hover:bg-[#D7D2C7]',
        modal: 'bg-[#EFECE6] text-[#18181A] border-[#CEC8BC]',
        pageBg: 'bg-[#E3DFD5] text-[#18181A] border-r border-[#CEC8BC]',
        buttonPrimary: 'bg-[#18181A] text-[#F6F4EE] hover:bg-[#2A2A2D]',
        progressColor: 'bg-[#3F3F46]',
        accentText: 'text-[#18181A]',
        badge: 'bg-[#18181A]/10 text-[#18181A] border-[#18181A]/20',
      };

    case 'book-cream':
      return {
        root: 'paper-texture-cream bg-[#F7F4EB] text-[#292524]',
        header: 'bg-[#F7F4EB]/95 border-[#DDD5C5] text-[#292524]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#991B1B] bg-[#EEE8DC] shadow-xl'
            : 'bg-[#EEE8DC] border border-[#DDD5C5] hover:border-[#BFAF98] hover:shadow-xl',
        input:
          'bg-[#FAF8F2] border-[#DDD5C5] text-[#292524] placeholder-[#8C8276] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B]',
        dropdown: 'bg-[#EEE8DC] border-[#DDD5C5] text-[#292524] shadow-2xl',
        dropdownHover: 'hover:bg-[#E3DBCE]',
        modal: 'bg-[#F7F4EB] text-[#292524] border-[#DDD5C5]',
        pageBg: 'bg-[#EEE8DC] text-[#292524] border-r border-[#DDD5C5]',
        buttonPrimary: 'bg-[#991B1B] text-[#FAF8F2] hover:bg-[#7F1D1D]',
        progressColor: 'bg-[#991B1B]',
        accentText: 'text-[#991B1B]',
        badge: 'bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/25',
      };

    case 'legal-pad':
      return {
        root: 'paper-texture-legal bg-[#FEF9C3] text-[#1E293B]',
        header: 'bg-[#FEF9C3]/95 border-[#EAB308]/40 text-[#1E293B]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#1E3A8A] bg-[#FEF08A] shadow-xl'
            : 'bg-[#FEF08A] border border-[#EAB308]/40 hover:border-[#CA8A04] hover:shadow-xl',
        input:
          'bg-[#FFFDE7] border-[#CA8A04]/50 text-[#1E293B] placeholder-[#854D0E]/70 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]',
        dropdown: 'bg-[#FEF08A] border-[#EAB308]/50 text-[#1E293B] shadow-2xl',
        dropdownHover: 'hover:bg-[#FDE047]/60',
        modal: 'bg-[#FEF9C3] text-[#1E293B] border-[#EAB308]/40',
        pageBg: 'bg-[#FEF08A] text-[#1E293B] border-r border-[#EAB308]/40',
        buttonPrimary: 'bg-[#1E3A8A] text-[#FEF9C3] font-semibold hover:bg-[#1E40AF]',
        progressColor: 'bg-[#DC2626]',
        accentText: 'text-[#1E3A8A]',
        badge: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
      };

    case 'kraft':
      return {
        root: 'paper-texture-kraft bg-[#D8C7B0] text-[#28211A]',
        header: 'bg-[#D8C7B0]/95 border-[#B8A285] text-[#28211A]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#28211A] bg-[#CBB69B] shadow-xl'
            : 'bg-[#CBB69B] border border-[#B8A285] hover:border-[#967E61] hover:shadow-xl',
        input:
          'bg-[#E2D3BE] border-[#B8A285] text-[#28211A] placeholder-[#786754] focus:border-[#28211A] focus:ring-1 focus:ring-[#28211A]',
        dropdown: 'bg-[#CBB69B] border-[#B8A285] text-[#28211A] shadow-2xl',
        dropdownHover: 'hover:bg-[#BFAB8F]',
        modal: 'bg-[#D8C7B0] text-[#28211A] border-[#B8A285]',
        pageBg: 'bg-[#CBB69B] text-[#28211A] border-r border-[#B8A285]',
        buttonPrimary: 'bg-[#28211A] text-[#E2D3BE] hover:bg-[#3D3328]',
        progressColor: 'bg-[#78350F]',
        accentText: 'text-[#28211A]',
        badge: 'bg-[#28211A]/10 text-[#28211A] border-[#28211A]/20',
      };

    case 'washi':
      return {
        root: 'paper-texture-washi bg-[#FAF7F0] text-[#242220]',
        header: 'bg-[#FAF7F0]/95 border-[#DDD7C8] text-[#242220]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#C2410C] bg-[#EFEBE0] shadow-xl'
            : 'bg-[#EFEBE0] border border-[#DDD7C8] hover:border-[#C4BAA3] hover:shadow-xl',
        input:
          'bg-[#FCFBF7] border-[#DDD7C8] text-[#242220] placeholder-[#878278] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]',
        dropdown: 'bg-[#EFEBE0] border-[#DDD7C8] text-[#242220] shadow-2xl',
        dropdownHover: 'hover:bg-[#E5E0D3]',
        modal: 'bg-[#FAF7F0] text-[#242220] border-[#DDD7C8]',
        pageBg: 'bg-[#EFEBE0] text-[#242220] border-r border-[#DDD7C8]',
        buttonPrimary: 'bg-[#C2410C] text-[#FAF7F0] hover:bg-[#9A3412]',
        progressColor: 'bg-[#C2410C]',
        accentText: 'text-[#C2410C]',
        badge: 'bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/25',
      };

    case 'engineering-pad':
      return {
        root: 'paper-texture-grid bg-[#EEF5F0] text-[#1E293B]',
        header: 'bg-[#EEF5F0]/95 border-[#C4DCCB] text-[#1E293B]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#047857] bg-[#E0EDE4] shadow-xl'
            : 'bg-[#E0EDE4] border border-[#C4DCCB] hover:border-[#86B994] hover:shadow-xl',
        input:
          'bg-[#F5FAF6] border-[#99C7A8] text-[#1E293B] placeholder-[#64748B] focus:border-[#047857] focus:ring-1 focus:ring-[#047857]',
        dropdown: 'bg-[#E0EDE4] border-[#C4DCCB] text-[#1E293B] shadow-2xl',
        dropdownHover: 'hover:bg-[#D3E4D8]',
        modal: 'bg-[#EEF5F0] text-[#1E293B] border-[#C4DCCB]',
        pageBg: 'bg-[#E0EDE4] text-[#1E293B] border-r border-[#C4DCCB]',
        buttonPrimary: 'bg-[#047857] text-[#EEF5F0] hover:bg-[#065F46]',
        progressColor: 'bg-[#059669]',
        accentText: 'text-[#047857]',
        badge: 'bg-[#047857]/10 text-[#047857] border-[#047857]/20',
      };

    case 'cotton-rag':
      return {
        root: 'paper-texture-cotton bg-[#F5F2ED] text-[#1E293B]',
        header: 'bg-[#F5F2ED]/95 border-[#D8CFC3] text-[#1E293B]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#334155] bg-[#EBE5DD] shadow-xl'
            : 'bg-[#EBE5DD] border border-[#D8CFC3] hover:border-[#B5A998] hover:shadow-xl',
        input:
          'bg-[#FAF8F5] border-[#CFC5B7] text-[#1E293B] placeholder-[#79716B] focus:border-[#334155] focus:ring-1 focus:ring-[#334155]',
        dropdown: 'bg-[#EBE5DD] border-[#D8CFC3] text-[#1E293B] shadow-2xl',
        dropdownHover: 'hover:bg-[#DFD8CE]',
        modal: 'bg-[#F5F2ED] text-[#1E293B] border-[#D8CFC3]',
        pageBg: 'bg-[#EBE5DD] text-[#1E293B] border-r border-[#D8CFC3]',
        buttonPrimary: 'bg-[#334155] text-[#F5F2ED] hover:bg-[#1E293B]',
        progressColor: 'bg-[#B45309]',
        accentText: 'text-[#334155]',
        badge: 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/20',
      };

    case 'blueprint':
      return {
        root: 'dark paper-texture-blueprint bg-[#133857] text-[#F0F9FF]',
        header: 'bg-[#133857]/95 border-[#255985] text-[#F0F9FF]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#38BDF8] bg-[#1A466A] shadow-xl'
            : 'bg-[#1A466A] border border-[#255985] hover:border-[#38BDF8]/60 hover:shadow-xl',
        input:
          'bg-[#0F2E47] border-[#255985] text-[#F0F9FF] placeholder-[#7DD3FC]/60 focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]',
        dropdown: 'bg-[#1A466A] border-[#255985] text-[#F0F9FF] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#235784]',
        modal: 'bg-[#133857] text-[#F0F9FF] border-[#255985]',
        pageBg: 'bg-[#1A466A] text-[#F0F9FF] border-r border-[#255985]',
        buttonPrimary: 'bg-[#38BDF8] text-[#0B2133] font-bold hover:bg-[#7DD3FC]',
        progressColor: 'bg-[#38BDF8]',
        accentText: 'text-[#38BDF8]',
        badge: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
      };

    // ---------------- COZY & WARM ATMOSPHERES ----------------

    case 'espresso':
      return {
        root: 'dark bg-[#120c08] text-[#ede0d4]',
        header: 'bg-[#120c08]/90 border-[#382a20]/40 text-[#ede0d4]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#ddb892] bg-[#1d140e] shadow-xl'
            : 'bg-[#1d140e] border border-[#382a20]/60 hover:border-[#ddb892]/40 hover:shadow-xl',
        input:
          'bg-[#0e0906] border-[#382a20] text-[#ede0d4] placeholder-[#7f6955] focus:border-[#ddb892] focus:ring-1 focus:ring-[#ddb892]',
        dropdown: 'bg-[#1a120c] border-[#382a20] text-[#ede0d4] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#281c13]',
        modal: 'bg-[#120c08] text-[#ede0d4] border-[#382a20]',
        pageBg: 'bg-[#1a120c] text-[#ede0d4] border-r border-[#382a20]',
        buttonPrimary: 'bg-[#ddb892] text-[#18110c] font-bold hover:bg-[#e6ccb2]',
        progressColor: 'bg-[#b08968]',
        accentText: 'text-[#ddb892]',
        badge: 'bg-[#ddb892]/15 text-[#ddb892] border-[#ddb892]/30',
      };

    case 'amber':
      return {
        root: 'dark bg-[#100c04] text-amber-100',
        header: 'bg-[#100c04]/90 border-amber-900/40 text-amber-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-amber-400 bg-[#1c1407] shadow-xl'
            : 'bg-[#1c1407] border border-amber-900/50 hover:border-amber-600/60 hover:shadow-xl',
        input:
          'bg-[#0a0702] border-amber-900/60 text-amber-100 placeholder-amber-800/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400',
        dropdown: 'bg-[#181206] border-amber-900/60 text-amber-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-amber-950/60',
        modal: 'bg-[#100c04] text-amber-100 border-amber-900/60',
        pageBg: 'bg-[#191206] text-amber-100 border-r border-amber-900/50',
        buttonPrimary: 'bg-[#f59e0b] text-zinc-950 font-bold hover:bg-[#d97706]',
        progressColor: 'bg-[#fbbf24]',
        accentText: 'text-amber-400',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      };

    case 'copper':
      return {
        root: 'dark bg-[#120b08] text-[#fed7aa]',
        header: 'bg-[#120b08]/90 border-[#422e23]/50 text-[#fed7aa]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#ea580c] bg-[#1e130e] shadow-xl'
            : 'bg-[#1e130e] border border-[#422e23]/60 hover:border-[#ea580c]/50 hover:shadow-xl',
        input:
          'bg-[#0d0705] border-[#422e23] text-[#fed7aa] placeholder-[#8a5d45] focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]',
        dropdown: 'bg-[#1a100c] border-[#422e23] text-[#fed7aa] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#2b1912]',
        modal: 'bg-[#120b08] text-[#fed7aa] border-[#422e23]',
        pageBg: 'bg-[#1a100c] text-[#fed7aa] border-r border-[#422e23]',
        buttonPrimary: 'bg-[#ea580c] text-white font-bold hover:bg-[#c2410c]',
        progressColor: 'bg-[#f97316]',
        accentText: 'text-[#fb923c]',
        badge: 'bg-[#ea580c]/15 text-[#fb923c] border-[#ea580c]/30',
      };

    case 'gruvbox':
      return {
        root: 'dark bg-[#1d2021] text-[#ebdbb2]',
        header: 'bg-[#1d2021]/90 border-[#504945]/40 text-[#ebdbb2]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#fe8019] bg-[#282828] shadow-xl'
            : 'bg-[#282828] border border-[#504945]/50 hover:border-[#fe8019]/40 hover:shadow-xl',
        input:
          'bg-[#141617] border-[#504945] text-[#ebdbb2] placeholder-[#7c6f64] focus:border-[#fe8019] focus:ring-1 focus:ring-[#fe8019]',
        dropdown: 'bg-[#282828] border-[#504945] text-[#ebdbb2] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#3c3836]',
        modal: 'bg-[#1d2021] text-[#ebdbb2] border-[#504945]',
        pageBg: 'bg-[#282828] text-[#ebdbb2] border-r border-[#504945]',
        buttonPrimary: 'bg-[#fe8019] text-[#1d2021] font-bold hover:bg-[#ff953f]',
        progressColor: 'bg-[#fabd2f]',
        accentText: 'text-[#fe8019]',
        badge: 'bg-[#fe8019]/15 text-[#fe8019] border-[#fe8019]/30',
      };

    // ---------------- LIGHT & GALLERY PAPERS ----------------
    case 'light':
      return {
        root: 'bg-[#f8f9fa] text-stone-900',
        header: 'bg-white/80 border-stone-200 text-stone-900',
        card: (selected) =>
          selected
            ? 'ring-2 ring-stone-900 bg-white shadow-xl'
            : 'bg-white border border-stone-200 hover:border-stone-300 hover:shadow-xl',
        input:
          'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-600 focus:ring-1 focus:ring-stone-600',
        dropdown: 'bg-white border-stone-200 text-stone-900 shadow-xl',
        dropdownHover: 'hover:bg-stone-100',
        modal: 'bg-white text-stone-900 border-stone-200',
        pageBg: 'bg-[#fafafa] text-stone-900 border-r border-stone-200',
        buttonPrimary: 'bg-stone-900 text-white hover:bg-stone-800',
        progressColor: 'bg-stone-900',
        accentText: 'text-stone-900',
        badge: 'bg-stone-100 text-stone-800 border-stone-200',
      };

    case 'sakura':
      return {
        root: 'bg-[#fff5f7] text-[#4c0519]',
        header: 'bg-[#fff5f7]/90 border-[#fbcfe8] text-[#4c0519]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#e11d48] bg-[#ffe4eb] shadow-xl'
            : 'bg-[#ffe4eb] border border-[#fbcfe8] hover:border-[#f43f5e] hover:shadow-xl',
        input:
          'bg-[#fff5f7] border-[#fbcfe8] text-[#4c0519] placeholder-[#9f1239]/60 focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]',
        dropdown: 'bg-[#ffe4eb] border-[#fbcfe8] text-[#4c0519] shadow-2xl',
        dropdownHover: 'hover:bg-[#fcdde5]',
        modal: 'bg-[#fff5f7] text-[#4c0519] border-[#fbcfe8]',
        pageBg: 'bg-[#ffe4eb] text-[#4c0519] border-r border-[#fbcfe8]',
        buttonPrimary: 'bg-[#e11d48] text-white font-bold hover:bg-[#be123c]',
        progressColor: 'bg-[#f43f5e]',
        accentText: 'text-[#e11d48]',
        badge: 'bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/20',
      };

    case 'matcha':
      return {
        root: 'bg-[#f3f6eb] text-[#2b3a1a]',
        header: 'bg-[#f3f6eb]/90 border-[#cbd9bd] text-[#2b3a1a]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#4d7c0f] bg-[#e4ecda] shadow-xl'
            : 'bg-[#e4ecda] border border-[#cbd9bd] hover:border-[#a3b893] hover:shadow-xl',
        input:
          'bg-[#f3f6eb] border-[#cbd9bd] text-[#2b3a1a] placeholder-[#5c7344] focus:border-[#4d7c0f] focus:ring-1 focus:ring-[#4d7c0f]',
        dropdown: 'bg-[#e4ecda] border-[#cbd9bd] text-[#2b3a1a] shadow-2xl',
        dropdownHover: 'hover:bg-[#d5e0ca]',
        modal: 'bg-[#f3f6eb] text-[#2b3a1a] border-[#cbd9bd]',
        pageBg: 'bg-[#e4ecda] text-[#2b3a1a] border-r border-[#cbd9bd]',
        buttonPrimary: 'bg-[#4d7c0f] text-[#f3f6eb] font-bold hover:bg-[#3f6212]',
        progressColor: 'bg-[#65a30d]',
        accentText: 'text-[#4d7c0f]',
        badge: 'bg-[#4d7c0f]/10 text-[#4d7c0f] border-[#4d7c0f]/20',
      };

    case 'solarized-light':
      return {
        root: 'bg-[#fdf6e3] text-[#586e75]',
        header: 'bg-[#fdf6e3]/90 border-[#d3cbb7] text-[#586e75]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#cb4b16] bg-[#eee8d5] shadow-xl'
            : 'bg-[#eee8d5] border border-[#d3cbb7] hover:border-[#b58900] hover:shadow-xl',
        input:
          'bg-[#fdf6e3] border-[#d3cbb7] text-[#586e75] placeholder-[#93a1a1] focus:border-[#cb4b16] focus:ring-1 focus:ring-[#cb4b16]',
        dropdown: 'bg-[#eee8d5] border-[#d3cbb7] text-[#586e75] shadow-2xl',
        dropdownHover: 'hover:bg-[#e4dcc7]',
        modal: 'bg-[#fdf6e3] text-[#586e75] border-[#d3cbb7]',
        pageBg: 'bg-[#eee8d5] text-[#586e75] border-r border-[#d3cbb7]',
        buttonPrimary: 'bg-[#cb4b16] text-[#fdf6e3] font-bold hover:bg-[#b03a08]',
        progressColor: 'bg-[#cb4b16]',
        accentText: 'text-[#cb4b16]',
        badge: 'bg-[#cb4b16]/10 text-[#cb4b16] border-[#cb4b16]/20',
      };

    case 'gruvbox-light':
      return {
        root: 'bg-[#fbf1c7] text-[#3c3836]',
        header: 'bg-[#fbf1c7]/90 border-[#d5c4a1] text-[#3c3836]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#af3a03] bg-[#ebdbb2] shadow-xl'
            : 'bg-[#ebdbb2] border border-[#d5c4a1] hover:border-[#bdae93] hover:shadow-xl',
        input:
          'bg-[#fbf1c7] border-[#d5c4a1] text-[#3c3836] placeholder-[#7c6f64] focus:border-[#af3a03] focus:ring-1 focus:ring-[#af3a03]',
        dropdown: 'bg-[#ebdbb2] border-[#d5c4a1] text-[#3c3836] shadow-2xl',
        dropdownHover: 'hover:bg-[#dfcca2]',
        modal: 'bg-[#fbf1c7] text-[#3c3836] border-[#d5c4a1]',
        pageBg: 'bg-[#ebdbb2] text-[#3c3836] border-r border-[#d5c4a1]',
        buttonPrimary: 'bg-[#af3a03] text-[#fbf1c7] font-bold hover:bg-[#8f2f02]',
        progressColor: 'bg-[#d65d0e]',
        accentText: 'text-[#af3a03]',
        badge: 'bg-[#af3a03]/10 text-[#af3a03] border-[#af3a03]/20',
      };

    // ---------------- NATURE & ABYSS ----------------
    case 'forest':
      return {
        root: 'dark bg-[#0a1310] text-emerald-100',
        header: 'bg-[#0a1310]/90 border-emerald-900/30 text-emerald-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-emerald-400 bg-[#101f1a] shadow-xl'
            : 'bg-[#101f1a] border border-emerald-900/40 hover:border-emerald-700/60 hover:shadow-xl',
        input:
          'bg-[#070e0c] border-emerald-900/50 text-emerald-100 placeholder-emerald-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
        dropdown: 'bg-[#0e1c17] border-emerald-900/60 text-emerald-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-emerald-950/50',
        modal: 'bg-[#0a1310] text-emerald-100 border-emerald-900/50',
        pageBg: 'bg-[#0f1d18] text-emerald-100 border-r border-emerald-900/50',
        buttonPrimary:
          'bg-emerald-500 text-emerald-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20',
        progressColor: 'bg-emerald-500',
        accentText: 'text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };

    case 'emerald':
      return {
        root: 'dark bg-[#030e0b] text-emerald-100',
        header: 'bg-[#030e0b]/90 border-emerald-900/40 text-emerald-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-emerald-400 bg-[#09231b] shadow-xl'
            : 'bg-[#09231b] border border-emerald-900/50 hover:border-emerald-600/60 hover:shadow-xl',
        input:
          'bg-[#020907] border-emerald-900/50 text-emerald-100 placeholder-emerald-800/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400',
        dropdown: 'bg-[#071d16] border-emerald-900/60 text-emerald-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-emerald-950/60',
        modal: 'bg-[#030e0b] text-emerald-100 border-emerald-900/50',
        pageBg: 'bg-[#082018] text-emerald-100 border-r border-emerald-900/50',
        buttonPrimary: 'bg-emerald-400 text-zinc-950 font-bold hover:bg-emerald-300',
        progressColor: 'bg-emerald-400',
        accentText: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };

    case 'nordic':
      return {
        root: 'dark bg-[#0b1120] text-sky-100',
        header: 'bg-[#0b1120]/90 border-sky-900/30 text-sky-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-sky-400 bg-[#131f37] shadow-xl'
            : 'bg-[#131f37] border border-sky-900/40 hover:border-sky-700/60 hover:shadow-xl',
        input:
          'bg-[#080d19] border-sky-900/50 text-sky-100 placeholder-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400',
        dropdown: 'bg-[#101a2e] border-sky-900/60 text-sky-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-sky-950/50',
        modal: 'bg-[#0b1120] text-sky-100 border-sky-900/50',
        pageBg: 'bg-[#111c33] text-sky-100 border-r border-sky-900/50',
        buttonPrimary:
          'bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 shadow-md shadow-sky-500/20',
        progressColor: 'bg-sky-400',
        accentText: 'text-sky-400',
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      };

    case 'ocean':
      return {
        root: 'dark bg-[#020b17] text-sky-100',
        header: 'bg-[#020b17]/90 border-cyan-900/30 text-sky-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-cyan-400 bg-[#081a33] shadow-xl'
            : 'bg-[#081a33] border border-cyan-900/40 hover:border-cyan-600/50 hover:shadow-xl',
        input:
          'bg-[#01060e] border-cyan-900/50 text-sky-100 placeholder-cyan-900/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400',
        dropdown: 'bg-[#06152b] border-cyan-900/60 text-sky-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-cyan-950/50',
        modal: 'bg-[#020b17] text-sky-100 border-cyan-900/50',
        pageBg: 'bg-[#071830] text-sky-100 border-r border-cyan-900/50',
        buttonPrimary: 'bg-[#0284c7] text-white font-bold hover:bg-[#0369a1]',
        progressColor: 'bg-[#38bdf8]',
        accentText: 'text-[#38bdf8]',
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      };

    case 'aurora':
      return {
        root: 'dark bg-[#031014] text-teal-100',
        header: 'bg-[#031014]/90 border-teal-900/30 text-teal-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#2dd4bf] bg-[#092229] shadow-xl'
            : 'bg-[#092229] border border-teal-900/40 hover:border-[#2dd4bf]/50 hover:shadow-xl',
        input:
          'bg-[#02080a] border-teal-900/50 text-teal-100 placeholder-teal-900/80 focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf]',
        dropdown: 'bg-[#071c22] border-teal-900/60 text-teal-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-teal-950/50',
        modal: 'bg-[#031014] text-teal-100 border-teal-900/50',
        pageBg: 'bg-[#081f25] text-teal-100 border-r border-teal-900/50',
        buttonPrimary: 'bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-zinc-950 font-bold hover:brightness-110',
        progressColor: 'bg-[#2dd4bf]',
        accentText: 'text-[#2dd4bf]',
        badge: 'bg-[#2dd4bf]/15 text-[#2dd4bf] border-[#2dd4bf]/30',
      };

    // ---------------- DARK & GOTHIC ----------------
    case 'dracula':
      return {
        root: 'dark bg-[#1e1f29] text-[#f8f8f2]',
        header: 'bg-[#1e1f29]/90 border-[#44475a]/40 text-[#f8f8f2]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#ff79c6] bg-[#282a36] shadow-xl'
            : 'bg-[#282a36] border border-[#44475a]/50 hover:border-[#bd93f9]/50 hover:shadow-xl',
        input:
          'bg-[#191a21] border-[#44475a] text-[#f8f8f2] placeholder-[#6272a4] focus:border-[#ff79c6] focus:ring-1 focus:ring-[#ff79c6]',
        dropdown: 'bg-[#282a36] border-[#44475a] text-[#f8f8f2] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#343746]',
        modal: 'bg-[#1e1f29] text-[#f8f8f2] border-[#44475a]',
        pageBg: 'bg-[#282a36] text-[#f8f8f2] border-r border-[#44475a]',
        buttonPrimary: 'bg-[#ff79c6] text-[#282a36] font-bold hover:bg-[#ff92d0]',
        progressColor: 'bg-[#bd93f9]',
        accentText: 'text-[#ff79c6]',
        badge: 'bg-[#ff79c6]/15 text-[#ff79c6] border-[#ff79c6]/30',
      };

    case 'tokyo-night':
      return {
        root: 'dark bg-[#13141c] text-[#c0caf5]',
        header: 'bg-[#13141c]/90 border-[#292e42]/50 text-[#c0caf5]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#7aa2f7] bg-[#1a1b26] shadow-xl'
            : 'bg-[#1a1b26] border border-[#292e42]/60 hover:border-[#7aa2f7]/50 hover:shadow-xl',
        input:
          'bg-[#0f1017] border-[#292e42] text-[#c0caf5] placeholder-[#565f89] focus:border-[#7aa2f7] focus:ring-1 focus:ring-[#7aa2f7]',
        dropdown: 'bg-[#1a1b26] border-[#292e42] text-[#c0caf5] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#24283b]',
        modal: 'bg-[#13141c] text-[#c0caf5] border-[#292e42]',
        pageBg: 'bg-[#1a1b26] text-[#c0caf5] border-r border-[#292e42]',
        buttonPrimary: 'bg-[#7aa2f7] text-[#1a1b26] font-bold hover:bg-[#89b4fa]',
        progressColor: 'bg-[#bb9af7]',
        accentText: 'text-[#7aa2f7]',
        badge: 'bg-[#7aa2f7]/15 text-[#7aa2f7] border-[#7aa2f7]/30',
      };

    case 'catppuccin':
      return {
        root: 'dark bg-[#181825] text-[#cdd6f4]',
        header: 'bg-[#181825]/90 border-[#45475a]/40 text-[#cdd6f4]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#cba6f7] bg-[#1e1e2e] shadow-xl'
            : 'bg-[#1e1e2e] border border-[#45475a]/50 hover:border-[#cba6f7]/50 hover:shadow-xl',
        input:
          'bg-[#11111b] border-[#45475a] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#cba6f7] focus:ring-1 focus:ring-[#cba6f7]',
        dropdown: 'bg-[#1e1e2e] border-[#45475a] text-[#cdd6f4] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#313244]',
        modal: 'bg-[#181825] text-[#cdd6f4] border-[#45475a]',
        pageBg: 'bg-[#1e1e2e] text-[#cdd6f4] border-r border-[#45475a]',
        buttonPrimary: 'bg-[#cba6f7] text-[#11111b] font-bold hover:bg-[#d8bdf9]',
        progressColor: 'bg-[#f38ba8]',
        accentText: 'text-[#cba6f7]',
        badge: 'bg-[#cba6f7]/15 text-[#cba6f7] border-[#cba6f7]/30',
      };

    case 'monokai':
      return {
        root: 'dark bg-[#181818] text-[#fcfcfa]',
        header: 'bg-[#181818]/90 border-[#404040]/40 text-[#fcfcfa]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#ffd866] bg-[#272822] shadow-xl'
            : 'bg-[#272822] border border-[#404040]/50 hover:border-[#ffd866]/50 hover:shadow-xl',
        input:
          'bg-[#121212] border-[#404040] text-[#fcfcfa] placeholder-[#75715e] focus:border-[#ffd866] focus:ring-1 focus:ring-[#ffd866]',
        dropdown: 'bg-[#272822] border-[#404040] text-[#fcfcfa] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#383830]',
        modal: 'bg-[#181818] text-[#fcfcfa] border-[#404040]',
        pageBg: 'bg-[#272822] text-[#fcfcfa] border-r border-[#404040]',
        buttonPrimary: 'bg-[#ffd866] text-[#1e1e1e] font-bold hover:bg-[#ffe28a]',
        progressColor: 'bg-[#a9dc76]',
        accentText: 'text-[#ffd866]',
        badge: 'bg-[#ffd866]/15 text-[#ffd866] border-[#ffd866]/30',
      };

    case 'slate':
      return {
        root: 'dark bg-[#090d16] text-slate-100',
        header: 'bg-[#090d16]/90 border-slate-800 text-slate-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-slate-400 bg-[#141b2d] shadow-xl'
            : 'bg-[#141b2d] border border-slate-800 hover:border-slate-600 hover:shadow-xl',
        input:
          'bg-[#060910] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-slate-400 focus:ring-1 focus:ring-slate-400',
        dropdown: 'bg-[#101726] border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-slate-800/60',
        modal: 'bg-[#090d16] text-slate-100 border-slate-800',
        pageBg: 'bg-[#121929] text-slate-100 border-r border-slate-800',
        buttonPrimary: 'bg-[#475569] text-white font-bold hover:bg-[#334155]',
        progressColor: 'bg-[#94a3b8]',
        accentText: 'text-[#cbd5e1]',
        badge: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
      };

    // ---------------- VIBRANT & CELESTIAL ----------------
    case 'cyberpunk':
      return {
        root: 'dark bg-[#080c14] text-slate-200',
        header: 'bg-[#080c14]/90 border-cyan-500/20 text-slate-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-cyan-400 bg-[#0e1726] shadow-[0_0_20px_rgba(0,242,254,0.25)]'
            : 'bg-[#0e1726] border border-cyan-900/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,242,254,0.15)]',
        input:
          'bg-[#060a10] border-cyan-900/50 text-cyan-50 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400',
        dropdown: 'bg-[#0b1220] border-cyan-900/60 text-slate-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-cyan-950/40',
        modal: 'bg-[#080c14] text-slate-100 border-cyan-900/60',
        pageBg: 'bg-[#0b1220] text-slate-100 border-r border-cyan-900/50',
        buttonPrimary:
          'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
        progressColor: 'bg-cyan-400',
        accentText: 'text-cyan-400',
        badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      };

    case 'synthwave':
      return {
        root: 'dark bg-[#170c2c] text-[#f3e8ff]',
        header: 'bg-[#170c2c]/90 border-[#452b7c]/40 text-[#f3e8ff]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#ff7edb] bg-[#261447] shadow-[0_0_20px_rgba(255,126,219,0.25)]'
            : 'bg-[#261447] border border-[#452b7c]/50 hover:border-[#ff7edb]/50 hover:shadow-xl',
        input:
          'bg-[#100720] border-[#452b7c] text-[#f3e8ff] placeholder-[#805ad5] focus:border-[#ff7edb] focus:ring-1 focus:ring-[#ff7edb]',
        dropdown: 'bg-[#261447] border-[#452b7c] text-[#f3e8ff] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#371d66]',
        modal: 'bg-[#170c2c] text-[#f3e8ff] border-[#452b7c]',
        pageBg: 'bg-[#261447] text-[#f3e8ff] border-r border-[#452b7c]',
        buttonPrimary: 'bg-gradient-to-r from-[#ff7edb] to-[#fe4450] text-[#170c2c] font-bold hover:brightness-110 shadow-lg shadow-pink-500/20',
        progressColor: 'bg-[#ff7edb]',
        accentText: 'text-[#ff7edb]',
        badge: 'bg-[#ff7edb]/15 text-[#ff7edb] border-[#ff7edb]/30',
      };

    case 'sunset':
      return {
        root: 'dark bg-[#140d1a] text-rose-100',
        header: 'bg-[#140d1a]/90 border-rose-900/30 text-rose-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-rose-400 bg-[#201529] shadow-xl'
            : 'bg-[#201529] border border-rose-900/40 hover:border-rose-700/60 hover:shadow-xl',
        input:
          'bg-[#0d0812] border-rose-900/50 text-rose-100 placeholder-rose-900/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400',
        dropdown: 'bg-[#1d1326] border-rose-900/60 text-rose-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-rose-950/50',
        modal: 'bg-[#140d1a] text-rose-100 border-rose-900/50',
        pageBg: 'bg-[#1c1224] text-rose-100 border-r border-rose-900/50',
        buttonPrimary:
          'bg-rose-500 text-zinc-950 font-bold hover:bg-rose-400 shadow-md shadow-rose-500/20',
        progressColor: 'bg-rose-400',
        accentText: 'text-rose-400',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      };

    case 'wine':
      return {
        root: 'dark bg-[#12070c] text-pink-100',
        header: 'bg-[#12070c]/90 border-[#3d1d2c]/40 text-pink-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#e11d48] bg-[#220d17] shadow-xl'
            : 'bg-[#220d17] border border-[#3d1d2c]/50 hover:border-[#e11d48]/50 hover:shadow-xl',
        input:
          'bg-[#0a0307] border-[#3d1d2c] text-pink-100 placeholder-[#703049] focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]',
        dropdown: 'bg-[#200c16] border-[#3d1d2c] text-pink-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#301422]',
        modal: 'bg-[#12070c] text-pink-100 border-[#3d1d2c]',
        pageBg: 'bg-[#1f0b15] text-pink-100 border-r border-[#3d1d2c]',
        buttonPrimary: 'bg-[#be123c] text-white font-bold hover:bg-[#9f1239]',
        progressColor: 'bg-[#fb7185]',
        accentText: 'text-[#fb7185]',
        badge: 'bg-[#e11d48]/15 text-[#fb7185] border-[#e11d48]/30',
      };

    case 'lavender':
      return {
        root: 'dark bg-[#110e1c] text-purple-100',
        header: 'bg-[#110e1c]/90 border-[#3b325c]/40 text-purple-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#c084fc] bg-[#1d1730] shadow-xl'
            : 'bg-[#1d1730] border border-[#3b325c]/50 hover:border-[#c084fc]/50 hover:shadow-xl',
        input:
          'bg-[#0b0813] border-[#3b325c] text-purple-100 placeholder-[#6e5d99] focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc]',
        dropdown: 'bg-[#1a142c] border-[#3b325c] text-purple-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#2a2145]',
        modal: 'bg-[#110e1c] text-purple-100 border-[#3b325c]',
        pageBg: 'bg-[#1b152e] text-purple-100 border-r border-[#3b325c]',
        buttonPrimary: 'bg-[#a855f7] text-white font-bold hover:bg-[#9333ea]',
        progressColor: 'bg-[#c084fc]',
        accentText: 'text-[#c084fc]',
        badge: 'bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30',
      };

    case 'solarized-dark':
      return {
        root: 'dark bg-[#00212b] text-[#93a1a1]',
        header: 'bg-[#00212b]/90 border-[#0d4857]/40 text-[#93a1a1]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#b58900] bg-[#073642] shadow-xl'
            : 'bg-[#073642] border border-[#0d4857]/50 hover:border-[#2aa198]/50 hover:shadow-xl',
        input:
          'bg-[#00171f] border-[#0d4857] text-[#93a1a1] placeholder-[#586e75] focus:border-[#b58900] focus:ring-1 focus:ring-[#b58900]',
        dropdown: 'bg-[#073642] border-[#0d4857] text-[#93a1a1] shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-[#0c4756]',
        modal: 'bg-[#00212b] text-[#93a1a1] border-[#0d4857]',
        pageBg: 'bg-[#073642] text-[#93a1a1] border-r border-[#0d4857]',
        buttonPrimary: 'bg-[#b58900] text-[#002b36] font-bold hover:bg-[#d3a000]',
        progressColor: 'bg-[#2aa198]',
        accentText: 'text-[#b58900]',
        badge: 'bg-[#b58900]/15 text-[#b58900] border-[#b58900]/30',
      };

    case 'matrix':
      return {
        root: 'dark bg-[#030904] text-[#86efac]',
        header: 'bg-[#030904]/90 border-green-900/40 text-[#86efac]',
        card: (selected) =>
          selected
            ? 'ring-2 ring-[#22c55e] bg-[#08170a] shadow-[0_0_20px_rgba(34,197,94,0.25)]'
            : 'bg-[#08170a] border border-green-900/50 hover:border-[#22c55e]/50 hover:shadow-xl',
        input:
          'bg-[#020502] border-green-900 text-[#86efac] placeholder-green-900/80 font-mono focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]',
        dropdown: 'bg-[#08170a] border-green-900 text-[#86efac] shadow-2xl backdrop-blur-xl font-mono',
        dropdownHover: 'hover:bg-green-950/60',
        modal: 'bg-[#030904] text-[#86efac] border-green-900',
        pageBg: 'bg-[#08170a] text-[#86efac] border-r border-green-900 font-mono',
        buttonPrimary: 'bg-[#22c55e] text-zinc-950 font-mono font-bold hover:bg-[#16a34a] shadow-lg shadow-green-500/20',
        progressColor: 'bg-[#22c55e]',
        accentText: 'text-[#22c55e]',
        badge: 'bg-green-500/15 text-[#22c55e] border-green-500/30 font-mono',
      };

    // ---------------- DEFAULT OBSIDIAN ----------------
    default:
      return {
        root: 'dark bg-[#0a0c10] text-zinc-100',
        header: 'bg-[#0a0c10]/90 border-zinc-800/80 text-zinc-100',
        card: (selected) =>
          selected
            ? 'ring-2 ring-amber-400/90 bg-zinc-900 shadow-2xl'
            : 'bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 hover:shadow-2xl',
        input:
          'bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400',
        dropdown: 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-xl',
        dropdownHover: 'hover:bg-zinc-800/80',
        modal: 'bg-zinc-900 text-zinc-100 border-zinc-800',
        pageBg: 'bg-zinc-900 text-zinc-100 border-r border-zinc-800',
        buttonPrimary:
          'bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20',
        progressColor: 'bg-amber-500',
        accentText: 'text-amber-400',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
  }
}

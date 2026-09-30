// Vintage Volkswagen Restoration & Spare Parts Classification Database

export const ADMIN_PRODUCT_TYPES = [
  { id: 'complete-engine', name: 'Complete Engine' },
  { id: 'engine-part', name: 'Engine Part' },
  { id: 'spare-part', name: 'Spare Part' },
  { id: 'performance-part', name: 'Performance Part' },
  { id: 'restoration-part', name: 'Restoration Part' },
  { id: 'accessory', name: 'Accessory' },
  { id: 'complete-kit', name: 'Complete Kit' },
  { id: 'custom-part', name: 'Custom Part' }
];

export const PRODUCT_CONDITIONS = [
  { id: 'new', name: 'New' },
  { id: 'used', name: 'Used' },
  { id: 'refurbished', name: 'Refurbished' },
  { id: 'restored', name: 'Restored' },
  { id: 'rebuilt', name: 'Rebuilt' },
  { id: 'custom', name: 'Custom' }
];

export const LISTING_STATUSES = [
  { id: 'draft', name: 'Draft' },
  { id: 'published', name: 'Published' },
  { id: 'available', name: 'Available' },
  { id: 'reserved', name: 'Reserved' },
  { id: 'sold', name: 'Sold' },
  { id: 'out-of-stock', name: 'Out of Stock' },
  { id: 'discontinued', name: 'Discontinued' },
  { id: 'archived', name: 'Archived' }
];

export const ADMIN_LISTING_TYPES = [
  { id: 'spare-part', name: 'Spare Part' },
  { id: 'engine', name: 'Engine (Complete Engine)' },
  { id: 'vehicle', name: 'Vehicle (Complete Car)' }
];

export const ADMIN_VEHICLE_CATEGORIES = [
  {
    id: 'type-1',
    name: 'Type 1 (Beetle & Super Beetle)',
    models: ['Beetle 1946–1957', 'Beetle 1958–1967', 'Beetle 1968–1979', 'Super Beetle (1302/1303)', 'Convertible Beetle', 'Baja Bug', 'Cal-Look Beetle']
  },
  {
    id: 'type-2',
    name: 'Type 2 (Bus / Transporter / Westfalia)',
    models: ['Bus T1 Split Screen (1950–1967)', 'Bus T2 Bay Window (1967–1979)', 'Single Cab Pickup', 'Double Cab Pickup', 'Westfalia Camper']
  },
  {
    id: 'classic-sports',
    name: 'Classic Sports (Karmann Ghia / 356)',
    models: ['Karmann Ghia Coupé (1955–1974)', 'Karmann Ghia Convertible (1957–1974)', 'Type 34 Ghia (1961–1969)', '356 Speedster / Coupe Platform']
  },
  {
    id: 'type-3-type-4',
    name: 'Type 3 & Type 4 (Squareback / Fastback)',
    models: ['Notchback (1961–1973)', 'Squareback Variant (1962–1973)', 'Fastback (1965–1973)', 'Type 4 (411 / 412 Sedan & Variant)']
  },
  {
    id: 'military-offroad',
    name: 'Military & Off-Road (Thing 181 / Kübelwagen)',
    models: ['VW Thing (Type 181 / Trekker)', 'Kübelwagen (Type 82)', 'Schwimmwagen (Type 166)', 'Sand Rail / Dune Buggy Chassis']
  },
  {
    id: 'custom-kit-cars',
    name: 'Custom & Kit Cars (Meyers Manx)',
    models: ['Meyers Manx Dune Buggy', 'Deserter / Fiberglass Buggy', 'Sterling / Nova Kit Car', 'Bradley GT']
  },
  {
    id: 'type-147-fridolin',
    name: 'Type 147 Fridolin (Postal & Commercial)',
    models: ['Fridolin (Type 147 Kleinlieferwagen)', 'Swiss Postal Edition', 'German Bundespost Van', 'High-Roof Commercial Van']
  },
  {
    id: 'brazilian-aircooled',
    name: 'Brazilian Air-Cooled (SP2 / Brasilia)',
    models: ['VW SP2 Sport Coupé (1972–1976)', 'VW Brasilia (1973–1982)', 'VW Gol Air-Cooled (1980–1986)', 'VW Variant II (1977–1981)']
  },
  {
    id: 'puma-specialty',
    name: 'Puma & Specialty Air-Cooled Sports',
    models: ['Puma GT / GTE Sports Coupé', 'Puma GTS Convertible', 'VW Country Buggy (Type 197 Australia)', 'Volksrod / Custom Chassis']
  }
];

export const ADMIN_MATERIAL_PRESETS = [
  'Aluminum Alloy',
  'Cast Iron',
  'Forged 4140 Chromoly Steel',
  'Magnesium Alloy AS41',
  'Stainless Steel 304',
  'Billet 6061-T6 Aluminum',
  'Urethane / Polyurethane',
  'High-Grade Nitrile Rubber',
  'Brass / Phosphor Bronze',
  'Carbon Steel / Phenolic'
];

export const ADMIN_FINISH_PRESETS = [
  'Bare Aluminum',
  'Black Powdercoat',
  'Chrome Plated (Triple Plate)',
  'Zinc Plated (Gold/Clear)',
  'Polished Mirror Billet',
  'Ceramic Coated (Header Grade)',
  'Vapor Blasted OEM Matte',
  'Anodized Orange',
  'Anodized Black',
  'Cast Natural'
];

export const ADMIN_CONDITION_PRESETS = [
  'NOS (New Old Stock - Rare Vintage)',
  'New (Factory OEM / Reproduction)',
  'Factory Restored / Rebuilt (Bench Tested)',
  'Original Vintage Used (Inspected)',
  'Precision Remanufactured',
  'Core for Rebuilding'
];

export const ADMIN_PERFORMANCE_PRESETS = [
  'Stock OEM Replacement',
  'Street Performance (Mild Road)',
  'Track & Competition Racing',
  'Turbocharged / Forced Induction',
  'Off-Road / Baja Extreme',
  'Vintage Authentic Restoration'
];

export const ADMIN_STORAGE_PRESETS = [
  'Main Warehouse A (Bin 12-B)',
  'Restoration Bay 1 (Houston Garage)',
  'Cleanroom Engine Assembly Lab',
  'Dyno Testing & Tuning Bay',
  'Overflow Distribution Hub (Aisle 4)'
];

export const ADMIN_VEHICLE_CONDITION_PRESETS = [
  'Concours 100-pt Restored (Show Quality)',
  'Turnkey Daily Driver (Running & Registered)',
  'Original Survivor / Patina (Solid Vintage Unrestored)',
  'Rolling Project Car (Solid Body & Chassis)',
  'Barn Find / Restoration Candidate (Rust Repair Needed)'
];

export const ADMIN_ENGINE_CONDITION_PRESETS = [
  'Brand New Turnkey Crate Engine (Zero Miles - Dyno Tested)',
  'Professionally Rebuilt Longblock (New Internals & Balanced)',
  'Good Running Tested Take-Out Engine',
  'Rebuildable Core Engine (Complete Longblock)'
];

export const ADMIN_TRANSMISSION_PRESETS = [
  '4-Speed Manual Swing Axle',
  '4-Speed Manual IRS (Double Joint)',
  'Automatic Stickshift (Saxomat / Semi-Auto)',
  '091 6-Rib Heavy Duty Bus 4-Speed',
  'Freeway Flyer 3.88 Ring & Pinion Manual'
];

export const ADMIN_ENGINE_CASE_PRESETS = [
  'AS41 Magnesium Universal Dual Relief',
  'Aluminum HD Super Case (Autolinea/CB)',
  'Original German VW Case (Line Bored)',
  'Type 4 2.0L Bus Case'
];

export const ADMIN_INDUCTION_PRESETS = [
  'Single Solex 34-PICT-3',
  'Dual Weber 40 IDF Carburetors',
  'Dual Weber 44 IDF Carburetors',
  'Dual Dellorto 36 DRLA Carburetors',
  'Dual EMPI 44 HPMX Carburetors',
  'CB Performance EFI Electronic Fuel Injection'
];

export const ADMIN_COOLING_SHROUD_PRESETS = [
  'Stock Type 1 Doghouse Shroud with Flaps',
  '36hp Style Round Shroud (No Doghouse)',
  'Porsche 911 Style Billet Fan & Shroud',
  'CSP Flattop Race Shroud'
];

export const ADMIN_TITLE_STATUS_PRESETS = [
  'Clean Title (Ready to Transfer)',
  'Historic Registration (Transferable)',
  'Bill of Sale Only (Project Car)',
  'Imported with Customs Clearance (Duties Paid)'
];

export const ADMIN_SYSTEM_SUBCATEGORIES = {
  'engine-system': [
    'Complete Engines', 'Cylinder Heads', 'Pistons & Cylinders', 'Camshafts & Lifters', 'Crankshafts & Rods', 'Engine Cases', 'Oil System & Deep Sumps', 'Cooling Fan Shrouds & Tins'
  ],
  'fuel-system': [
    'Dual Weber IDF / Dellorto Carbs', 'Solex Stock Carburetors', 'Intake Manifolds & Cross-bars', 'Velocity Stacks & Air Cleaners', 'Fuel Pumps & Regulators', 'Fuel Tanks & Senders', 'Fuel Lines & Filters'
  ],
  'electrical-system': [
    'Alternators & 12V Generators', 'High-Torque Starter Motors', 'Complete Wiring Harnesses', '009 Mechanical Distributors', 'Ignition Coils & Spark Plug Leads', 'Switches, Relays & Sensors'
  ],
  'brake-system': [
    'Front Disc Brake Drop Spindle Kits', 'Rear Disc Brake Kits', 'Ceramic & Semi-Metallic Brake Pads', 'Dual Circuit Master Cylinders', 'Calipers, Rotors & Brake Drums', 'Stainless Steel Braided Brake Lines'
  ],
  'suspension-system': [
    'Adjustable Front Beams', 'Gas Shock Absorbers & Coilovers', 'Heavy Duty Sway Bars', 'Drop Spindles & Ball Joints', 'Steering Boxes & Tie Rods', 'Urethane Suspension Bushings'
  ],
  'transmission-system': [
    'Complete Freeway Flyer Transmissions', 'Stage 1/2 Heavy Duty Clutches', 'Lightened 8-Dowel Flywheels', 'Swing Axles & IRS Half Shafts', 'Heavy Duty CV Joints & Boots', 'Quick Shift Kits'
  ],
  'cooling-system': [
    'Doghouse Fan Shrouds', 'External Mesa Oil Coolers', 'High-Flow Maxi Oil Pumps', 'Spin-On Oil Filter Adapters', 'Welded Engine Cooling Fans'
  ],
  'body-system': [
    'European Chrome Bumpers', 'Steel Fenders & Quarter Panels', 'German Rubber Window Seals', 'Door Handles & Latch Mechanisms', 'Glass & Pop-out Windows'
  ],
  'interior-system': [
    'Pro-Street & Vintage Lowback Seats', 'TMI Seat Upholstery Covers', 'German Loop Carpet Kits', 'Padded Dashboard Tops & Vents', 'Custom Door & Quarter Panels'
  ],
  'wheels-system': [
    'EMPI 5-Spoke & 8-Spoke Wheels', 'Fuchs & Porsche Style Alloys', 'Stock Steel Wheels & Chrome Hubcaps', 'BRM & Sprint Star Vintage Wheels', 'Whitewall & Vintage Radial Tires', 'Lug Nuts, Studs & Wheel Adapters', 'Center Caps & Trim Rings'
  ],
  'restoration-system': [
    'Vintage Wolfsburg Crest Badges', 'Billet Engine Dress-Up Accessories', 'Stainless Steel Hardware Kits', 'Vintage Luggage Racks & Visors'
  ]
};

export const POST_TYPES = [
  { id: 'spare-part', name: 'Spare Part' },
  { id: 'engine', name: 'Engine' },
  { id: 'accessory', name: 'Accessory' },
  { id: 'restoration-item', name: 'Restoration Item' },
  { id: 'blog-guide', name: 'Blog / Restoration Guide' }
];

export const USAGE_TYPES = [
  { id: 'ALL', name: 'All Usages' },
  { id: 'stock', name: 'Stock OEM' },
  { id: 'performance', name: 'Performance' },
  { id: 'off-road', name: 'Off-Road / Baja' },
  { id: 'restoration', name: 'Restoration' }
];

export const DETAILED_ENGINES = [
  { size: '1200cc', category: 'Stock OEM' },
  { size: '1300cc', category: 'Stock OEM' },
  { size: '1500cc', category: 'Stock OEM' },
  { size: '1600cc', category: 'Stock OEM' },
  { size: '1776cc', category: 'Performance' },
  { size: '1914cc', category: 'Performance' },
  { size: '2110cc', category: 'Performance' },
  { size: '2276cc', category: 'Performance' },
  { size: '2332cc', category: 'Performance' }
];

export const ENGINE_COMPATIBILITIES = DETAILED_ENGINES.map(e => e.size);
export const ENGINE_SIZES = ENGINE_COMPATIBILITIES;

// Direct Part Categories for Secondary Navigation ("Browse All Parts" Mechanics Mode)
export const DIRECT_PART_CATEGORIES = [
  { id: 'engine-parts', name: 'Engine Parts', icon: 'Cpu', systemId: 'engine-system', count: '1,200+ parts' },
  { id: 'cylinder-heads', name: 'Cylinder Heads & Valvetrain', icon: 'Cpu', systemId: 'engine-system', count: '320+ parts' },
  { id: 'camshafts', name: 'Camshafts & Crankshafts', icon: 'Wrench', systemId: 'engine-system', count: '180+ parts' },
  { id: 'brake-kits', name: 'Disc Brake Kits & Pads', icon: 'Disc', systemId: 'brake-system', count: '510+ parts' },
  { id: 'electrical-components', name: 'Electrical & Starters', icon: 'Zap', systemId: 'electrical-system', count: '620+ parts' },
  { id: 'suspension-shocks', name: 'Suspension & Coilovers', icon: 'Sliders', systemId: 'suspension-system', count: '430+ parts' },
  { id: 'transmission-clutch', name: 'Transmission & Clutches', icon: 'Cog', systemId: 'transmission-system', count: '390+ parts' },
  { id: 'body-panels', name: 'Body Panels & Bumpers', icon: 'Shield', systemId: 'body-system', count: '740+ parts' },
  { id: 'interior-upholstery', name: 'Interior & Upholstery', icon: 'Armchair', systemId: 'interior-system', count: '530+ parts' }
];

// 7 Core Vehicle Systems with Detailed Subcategories
export const VEHICLE_SYSTEMS = [
  {
    id: 'engine-system',
    name: 'Engine System',
    description: 'Complete engines, cylinder heads, pistons & cylinders, camshafts, crankshafts, oil systems',
    icon: 'Cpu',
    emoji: '⚙️',
    subcategories: [
      { id: 'complete-engines', name: 'Complete Engines' },
      { id: 'cylinder-heads', name: 'Cylinder Heads' },
      { id: 'pistons-cylinders', name: 'Pistons & Cylinders' },
      { id: 'camshafts', name: 'Camshafts' },
      { id: 'crankshafts', name: 'Crankshafts' },
      { id: 'oil-systems', name: 'Oil Systems' }
    ]
  },
  {
    id: 'brake-system',
    name: 'Brake System',
    description: 'Disc brake kits, brake pads, brake drums, master cylinders, brake lines',
    icon: 'Disc',
    emoji: '🛑',
    subcategories: [
      { id: 'disc-brake-kits', name: 'Disc Brake Kits' },
      { id: 'brake-pads', name: 'Brake Pads' },
      { id: 'brake-drums', name: 'Brake Drums' },
      { id: 'master-cylinders', name: 'Master Cylinders' },
      { id: 'brake-lines', name: 'Brake Lines' }
    ]
  },
  {
    id: 'electrical-system',
    name: 'Electrical System',
    description: 'Alternators / generators, starters, wiring harnesses, ignition systems, sensors & switches',
    icon: 'Zap',
    emoji: '⚡',
    subcategories: [
      { id: 'alternators-generators', name: 'Alternators / Generators' },
      { id: 'starters', name: 'Starters' },
      { id: 'wiring-harnesses', name: 'Wiring Harnesses' },
      { id: 'ignition-systems', name: 'Ignition Systems' },
      { id: 'sensors-switches', name: 'Sensors & Switches' }
    ]
  },
  {
    id: 'suspension-system',
    name: 'Suspension & Steering',
    description: 'Shock absorbers, coilovers, sway bars, control arms, steering boxes',
    icon: 'Sliders',
    emoji: '🏎️',
    subcategories: [
      { id: 'shock-absorbers', name: 'Shock Absorbers' },
      { id: 'coilovers', name: 'Coilovers' },
      { id: 'sway-bars', name: 'Sway Bars' },
      { id: 'control-arms', name: 'Control Arms' },
      { id: 'steering-boxes', name: 'Steering Boxes' }
    ]
  },
  {
    id: 'transmission-system',
    name: 'Transmission & Drivetrain',
    description: 'Complete transmissions, clutches, flywheels, axles, CV joints',
    icon: 'Cog',
    emoji: '⚙️',
    subcategories: [
      { id: 'complete-transmissions', name: 'Complete Transmissions' },
      { id: 'clutches', name: 'Clutches' },
      { id: 'flywheels', name: 'Flywheels' },
      { id: 'axles', name: 'Axles' },
      { id: 'cv-joints', name: 'CV Joints' }
    ]
  },
  {
    id: 'body-system',
    name: 'Body & Exterior',
    description: 'Bumpers, fenders, doors, rubber seals, windows',
    icon: 'Shield',
    emoji: '🚗',
    subcategories: [
      { id: 'bumpers', name: 'Bumpers' },
      { id: 'fenders', name: 'Fenders' },
      { id: 'doors', name: 'Doors' },
      { id: 'rubber-seals', name: 'Rubber Seals' },
      { id: 'windows', name: 'Windows' }
    ]
  },
  {
    id: 'interior-system',
    name: 'Interior',
    description: 'Seats, seat covers, dash components, carpets, door panels',
    icon: 'Armchair',
    emoji: '🪑',
    subcategories: [
      { id: 'seats', name: 'Seats' },
      { id: 'seat-covers', name: 'Seat Covers' },
      { id: 'dash-components', name: 'Dash Components' },
      { id: 'carpets', name: 'Carpets' },
      { id: 'door-panels', name: 'Door Panels' }
    ]
  },
  {
    id: 'wheels-system',
    name: 'Wheels, Rims & Tires',
    description: 'EMPI alloys, Fuchs, vintage steel rims, whitewall tires, lug nuts, adapters',
    icon: 'Disc',
    emoji: '🛞',
    subcategories: [
      { id: 'empi-wheels', name: 'EMPI 5-Spoke & 8-Spoke Wheels' },
      { id: 'fuchs-alloys', name: 'Fuchs & Porsche Style Alloys' },
      { id: 'stock-steel-wheels', name: 'Stock Steel Wheels & Chrome Hubcaps' },
      { id: 'brm-sprint-star', name: 'BRM & Sprint Star Vintage Wheels' },
      { id: 'vintage-tires', name: 'Whitewall & Vintage Radial Tires' },
      { id: 'wheel-adapters-hardware', name: 'Lug Nuts, Studs & Wheel Adapters' }
    ]
  }
];

export const VW_NAV_CATEGORIES = [
  {
    id: 'beetle-models',
    name: 'Beetle Models',
    subtitle: 'Classic Type 1 Volkswagen Vehicles',
    description: 'Type 1 platforms including Beetle, Super Beetle, Convertible, Baja & Cal-Look.',
    modelsCount: '5+ Models',
    partsCount: '650+ Parts',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    models: [
      { id: 'beetle-type-1', name: 'Volkswagen Beetle Type 1', era: '1946-1977', engines: ['1200cc', '1300cc', '1500cc', '1600cc', '1776cc'], partsCount: '480+ parts', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80' },
      { id: 'super-beetle', name: 'Super Beetle (1302 / 1303)', era: '1971-1979', engines: ['1600cc', '1776cc', '1914cc'], partsCount: '390+ parts', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80' },
      { id: 'convertible-beetle', name: 'Convertible Beetle', era: '1949-1980', engines: ['1300cc', '1500cc', '1600cc'], partsCount: '310+ parts', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80' },
      { id: 'baja-bug', name: 'Baja Bug', era: 'Off-Road Custom', engines: ['1600cc', '1776cc', '1914cc', '2110cc', '2276cc'], partsCount: '350+ parts', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
      { id: 'cal-look-beetle', name: 'Cal-Look Beetle', era: 'Custom Vintage', engines: ['1776cc', '1914cc', '2276cc', '2332cc'], partsCount: '290+ parts', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'bus-vans',
    name: 'Bus & Vans',
    subtitle: 'Transporter Split Screen & Bay Window',
    description: 'VW Transporters T1 Split, T2 Bay, Single/Double Cabs & Westfalia Campers.',
    modelsCount: '5+ Models',
    partsCount: '580+ Parts',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    models: [
      { id: 'bus-t1-split', name: 'Transporter T1 (Split Screen)', era: '1950-1967', engines: ['1200cc', '1500cc', '1600cc'], partsCount: '440+ parts', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80' },
      { id: 'bus-t2-bay', name: 'Transporter T2 (Bay Window)', era: '1967-1979', engines: ['1600cc', '1700cc', '1800cc', '2000cc'], partsCount: '460+ parts', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80' },
      { id: 'single-cab-pickup', name: 'Single Cab Pickup', era: '1950-1979', engines: ['1500cc', '1600cc'], partsCount: '280+ parts', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80' },
      { id: 'double-cab-pickup', name: 'Double Cab Pickup', era: '1953-1979', engines: ['1600cc', '1700cc', '2000cc'], partsCount: '260+ parts', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80' },
      { id: 'westfalia-camper', name: 'Westfalia Camper', era: '1951-1979', engines: ['1600cc', '1800cc', '2000cc'], partsCount: '380+ parts', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'classic-sports',
    name: 'Classic Sports',
    subtitle: 'Karmann Ghia & Sports Coupes',
    description: 'Italian-designed Karmann Ghia Coupés, Convertibles & Type 34 platforms.',
    modelsCount: '4+ Models',
    partsCount: '410+ Parts',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    models: [
      { id: 'karmann-ghia-coupe', name: 'Karmann Ghia Coupé (Type 14)', era: '1955-1974', engines: ['1200cc', '1300cc', '1500cc', '1600cc'], partsCount: '370+ parts', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80' },
      { id: 'karmann-ghia-convertible', name: 'Karmann Ghia Convertible', era: '1957-1974', engines: ['1300cc', '1500cc', '1600cc'], partsCount: '320+ parts', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80' },
      { id: 'type-34-ghia', name: 'Type 34 Karmann Ghia', era: '1961-1969', engines: ['1500cc', '1600cc'], partsCount: '240+ parts', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80' },
      { id: 'porsche-356-replica', name: '356 Speedster / Coupe Platform', era: 'Classic Sports', engines: ['1600cc', '1776cc', '1914cc'], partsCount: '290+ parts', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'type-3-type-4',
    name: 'Type 3 & Type 4',
    subtitle: 'Notchback, Squareback & Fastback',
    description: 'Type 3 Notchback, Squareback, Fastback & Type 4 411/412 pancake platforms.',
    modelsCount: '4+ Models',
    partsCount: '340+ Parts',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    models: [
      { id: 'type-3-notchback', name: 'Type 3 Notchback (1500 / 1600)', era: '1961-1973', engines: ['1500cc', '1600cc'], partsCount: '290+ parts', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80' },
      { id: 'type-3-squareback', name: 'Type 3 Squareback (Variant)', era: '1962-1973', engines: ['1500cc', '1600cc'], partsCount: '310+ parts', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80' },
      { id: 'type-3-fastback', name: 'Type 3 Fastback', era: '1965-1973', engines: ['1600cc'], partsCount: '270+ parts', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80' },
      { id: 'type-4-411-412', name: 'Type 4 (411 / 412 Sedan & Variant)', era: '1968-1974', engines: ['1700cc', '1800cc', '2000cc'], partsCount: '230+ parts', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'military-offroad',
    name: 'Military & Off-Road',
    subtitle: 'VW Thing, Kübelwagen & Sand Rails',
    description: 'VW Thing (Type 181), Kübelwagen, Schwimmwagen & sand rail buggies.',
    modelsCount: '4+ Models',
    partsCount: '310+ Parts',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    models: [
      { id: 'vw-thing-181', name: 'VW Thing (Type 181 / Trekker)', era: '1968-1983', engines: ['1500cc', '1600cc', '1776cc'], partsCount: '310+ parts', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
      { id: 'kubelwagen-type-82', name: 'Kübelwagen (Type 82)', era: 'Vintage Military', engines: ['1100cc', '1200cc'], partsCount: '190+ parts', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
      { id: 'schwimmwagen-type-166', name: 'Schwimmwagen (Type 166)', era: 'Amphibious Military', engines: ['1100cc', '1200cc'], partsCount: '150+ parts', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
      { id: 'offroad-rail-buggy', name: 'Sand Rail / Dune Buggy Chassis', era: 'Custom Off-Road', engines: ['1776cc', '1914cc', '2110cc', '2276cc'], partsCount: '340+ parts', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'custom-kit-cars',
    name: 'Custom & Kit Cars',
    subtitle: 'Meyers Manx Buggies & Kit Builds',
    description: 'Fiberglass Dune Buggies, Meyers Manx, Sterling & Bradley GT builds.',
    modelsCount: '4+ Models',
    partsCount: '280+ Parts',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    models: [
      { id: 'meyers-manx-buggy', name: 'Meyers Manx Dune Buggy', era: '1964-Present', engines: ['1600cc', '1776cc', '1914cc', '2110cc'], partsCount: '320+ parts', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80' },
      { id: 'deserter-buggy', name: 'Deserter / Fiberglass Buggy', era: '1960s-1970s', engines: ['1600cc', '1776cc'], partsCount: '240+ parts', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80' },
      { id: 'sterling-kit-car', name: 'Sterling / Nova Kit Car', era: 'Custom Sports', engines: ['1776cc', '1914cc', '2276cc'], partsCount: '190+ parts', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80' },
      { id: 'bradley-gt', name: 'Bradley GT', era: '1970s Custom', engines: ['1600cc', '1776cc'], partsCount: '180+ parts', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80' }
    ]
  }
];


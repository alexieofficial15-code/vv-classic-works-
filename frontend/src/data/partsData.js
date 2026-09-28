// Vintage Cars & Authentic Air-Cooled Volkswagen Spare Parts Database

export const VINTAGE_CARS = [
  {
    id: 'rogue-super-beetle-1979',
    name: '1979 VW Super Beetle Convertible "ROGUE"',
    era: '1970s',
    make: 'Volkswagen',
    model: 'Super Beetle (1302/1303)',
    yearRange: '1971–1979',
    engineName: '2.0L Performance Air-Cooled Boxer-4',
    engineType: 'Air-Cooled Type 1 Flat-4',
    carImage: '/pictures/WhatsApp Image 2026-08-03 at 7.49.52 PM (1).jpeg',
    engineImage: '/pictures/WhatsApp Image 2026-08-05 at 1.10.06 PM.jpeg',
    horsepower: '165 HP @ 6200 RPM',
    torque: '178 lb-ft @ 4100 RPM',
    description: 'Award-winning custom show convertible build by Metamorphosis Customs. Features dual Weber carburetors, Porsche 911 upright fan shroud, four-wheel Wilwood disc brakes, and custom interior.'
  },
  {
    id: 'vw-bus-t1-patina-1964',
    name: '1964 VW Bus T1 Split-Screen 11-Window Restomod',
    era: '1960s',
    make: 'Volkswagen',
    model: 'Bus T1 Split Screen (1950–1967)',
    yearRange: '1950–1967',
    engineName: '1835cc Dual-Port Air-Cooled Flat-4',
    engineType: 'Air-Cooled Flat-4',
    carImage: '/pictures/WhatsApp Image 2026-08-03 at 7.49.46 PM.jpeg',
    engineImage: '/pictures/WhatsApp Image 2026-08-05 at 1.10.06 PM.jpeg',
    horsepower: '95 HP @ 5200 RPM',
    torque: '115 lb-ft @ 3400 RPM',
    description: 'Iconic authentic patina finish with safari pop-out windshields, dropped straight-axle suspension, Vintage Speed exhaust, and roof-mounted spotlight.'
  },
  {
    id: 'vw-beetle-cal-look-1967',
    name: '1967 VW Beetle Cal-Look Sky Blue Coupe',
    era: '1960s',
    make: 'Volkswagen',
    model: 'Beetle 1958–1967',
    yearRange: '1958–1967',
    engineName: '1776cc Dual Weber 40 IDF Flat-4',
    engineType: 'Air-Cooled Flat-4',
    carImage: '/pictures/WhatsApp Image 2026-08-03 at 7.49.50 PM.jpeg',
    engineImage: '/pictures/WhatsApp Image 2026-08-05 at 1.10.06 PM.jpeg',
    horsepower: '110 HP @ 5800 RPM',
    torque: '124 lb-ft @ 3800 RPM',
    description: 'Pure 1960s California Look restoration with narrow front beam, EMPI 5-spoke polished wheels, vintage wood slat roof rack, and ivory steering wheel.'
  },
  {
    id: 'karmann-ghia-coupe-1969',
    name: '1969 VW Karmann Ghia Sport Coupé',
    era: '1960s',
    make: 'Volkswagen',
    model: 'Karmann Ghia Coupé (1955–1974)',
    yearRange: '1955–1974',
    engineName: '1600cc Dual Port Air-Cooled Boxer',
    engineType: 'Air-Cooled Flat-4',
    carImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    engineImage: '/pictures/WhatsApp Image 2026-08-03 at 7.49.45 PM.jpeg',
    horsepower: '60 HP @ 4400 RPM',
    torque: '82 lb-ft @ 3000 RPM',
    description: 'Italian styling hand-crafted by Ghia and built by Karmann in Osnabrück. Features pristine dual-port induction and IRS rear suspension.'
  }
];

export const CATEGORIES = [
  'ALL',
  'Fuel & Carburetion',
  'Engine Block & Internals',
  'Ignition & Electrical',
  'Transmission & Clutch',
  'Brakes & Exhaust'
];

export const SPARE_PARTS = [
  {
    id: 'part-vw-turbo-engine-2276',
    title: 'Complete 2276cc Turbocharged Air-Cooled VW Type 1 Engine',
    oemNumber: 'ENG-TURBO-2276-CB',
    sku: '043-ENG-2276T',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: '2276cc Turbocharged Boxer-4',
    category: 'Engine Block & Internals',
    subcategory: 'Complete Engines',
    mainSystem: 'engine-system',
    era: 'Custom Build',
    price: 9450,
    rating: 5.0,
    reviewsCount: 18,
    condition: 'Rebuilt / Restored',
    rarityScore: 'Competition Grade (99/100)',
    stock: 2,
    inStock: true,
    image: '/pictures/WhatsApp Image 2026-08-05 at 1.10.06 PM.jpeg',
    castingCode: 'AS41-MAG-DUAL-RELIEF',
    provenance: 'Hand-built competition motor with forged 82mm crankshaft, 94mm Mahle pistons, Porsche 911 upright cooling shroud, Garrett T3 turbo, and dual blow-through Weber carbs.',
    specifications: [
      { key: 'Displacement', value: '2276cc (82mm x 94mm)' },
      { key: 'Output', value: '220+ HP @ 6500 RPM (12 PSI Boost)' },
      { key: 'Cooling System', value: 'Porsche 911 Upright Shroud & 11-Blade Fan' },
      { key: 'Carburetion', value: 'Dual Weber 44 IDF with Polished Hats' },
      { key: 'Crankcase', value: 'New AS41 Dual-Relief Magnesium Alloy' }
    ],
    compatibleVehicles: [
      'Type 1 Beetle (1946–1979)',
      'Super Beetle (1302/1303)',
      'Karmann Ghia (1955–1974)',
      'Bus T1 / T2 (1950–1979)'
    ],
    compatibleModels: ['Beetle 1968–1979', 'Super Beetle (1302/1303)', 'Karmann Ghia Coupé (1955–1974)'],
    compatibleEngineSizes: ['2276cc', '2110cc', '1914cc']
  },
  {
    id: 'part-vw-crossbar-breather',
    title: 'Dual Carburetor Cross-Bar Balance Intake & Velocity Breather Assembly',
    oemNumber: 'CB-XBAR-6701',
    sku: '043-XBAR-CB40',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: '1600cc - 2276cc Dual Carb',
    category: 'Fuel & Carburetion',
    subcategory: 'Dual Weber Carburetors',
    mainSystem: 'fuel-system',
    era: '1970s',
    price: 345,
    rating: 4.9,
    reviewsCount: 27,
    condition: 'New',
    rarityScore: 'High Demand (88/100)',
    stock: 8,
    inStock: true,
    image: '/pictures/WhatsApp Image 2026-08-03 at 7.49.45 PM.jpeg',
    castingCode: 'CB-BILLET-ALUM',
    provenance: 'CNC-machined 6061-T6 billet aluminum cross-bar intake balancer with high-flow dual-stage foam filtration element and stainless steel clamps.',
    specifications: [
      { key: 'Material', value: '6061-T6 Billet Aluminum' },
      { key: 'Fitment', value: 'Dual Weber 40/44 IDF & Dellorto DRLA' },
      { key: 'Filter Media', value: 'Dual-Layer Reusable Foam Filter' },
      { key: 'Finish', value: 'High Mirror Polish' }
    ],
    compatibleVehicles: [
      'Type 1 Beetle (1958–1979)',
      'Bus T1 / T2 (1950–1979)',
      'Karmann Ghia (1955–1974)'
    ],
    compatibleModels: ['Beetle 1958–1967', 'Beetle 1968–1979', 'Bus T1 Split Screen (1950–1967)', 'Bus T2 Bay Window (1967–1979)'],
    compatibleEngineSizes: ['1600cc', '1776cc', '1835cc', '1914cc', '2110cc', '2276cc']
  },
  {
    id: 'part-vw-velocity-stack-hat',
    title: 'Finned Billet Aluminum Air Cleaner Top Hat for Weber IDF / Dellorto',
    oemNumber: 'IDF-HAT-FIN-01',
    sku: '043-HAT-IDF',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: 'Air-Cooled Type 1 / Type 4',
    category: 'Fuel & Carburetion',
    subcategory: 'Carburetors',
    mainSystem: 'fuel-system',
    era: '1960s',
    price: 185,
    rating: 4.8,
    reviewsCount: 15,
    condition: 'New',
    rarityScore: 'Custom Finish (82/100)',
    stock: 12,
    inStock: true,
    image: '/pictures/WhatsApp Image 2026-08-03 at 7.49.44 PM.jpeg',
    castingCode: 'VW-AIR-HAT-127',
    provenance: 'Vintage finned design with engraved serial stamping. Provides superior laminar airflow into velocity stacks while protecting carb jets.',
    specifications: [
      { key: 'Flange Pattern', value: 'Weber 40/44/48 IDF Oval Base' },
      { key: 'Style', value: 'Classic Finned Cal-Look Top' },
      { key: 'Finish', value: 'Polished Mirror with Machined Ribs' },
      { key: 'Height', value: '65 mm Clearance' }
    ],
    compatibleVehicles: [
      'VW Beetle Type 1',
      'VW Karmann Ghia Type 14',
      'VW Bus Type 2'
    ],
    compatibleModels: ['Beetle 1968–1979', 'Karmann Ghia Coupé (1955–1974)', 'Single Cab Pickup'],
    compatibleEngineSizes: ['1600cc', '1776cc', '1835cc', '1914cc']
  },
  {
    id: 'part-vw-cylinder-heads-dualport',
    title: 'High-Performance Dual Port Cylinder Head Pair (40mm x 35.5mm Valves)',
    oemNumber: '043-101-375-HP',
    sku: '043-HEAD-40X35',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: '1600cc / 1776cc / 1835cc',
    category: 'Engine Block & Internals',
    subcategory: 'Cylinder Heads',
    mainSystem: 'engine-system',
    era: '1970s',
    price: 780,
    rating: 4.9,
    reviewsCount: 21,
    condition: 'New',
    rarityScore: 'Performance Grade (90/100)',
    stock: 6,
    inStock: true,
    image: '/pictures/sample_restoration_photo.jpg',
    castingCode: '043-MEX-DP',
    provenance: 'High-flow stainless steel 40mm intake & 35.5mm exhaust valves with dual hi-rev valve springs, chromoly retainers, and hardened valve seats.',
    specifications: [
      { key: 'Intake Valve', value: '40 mm Stainless Steel' },
      { key: 'Exhaust Valve', value: '35.5 mm Stainless Steel' },
      { key: 'Chamber Volume', value: '55cc Semi-Hemi' },
      { key: 'Spark Plug Thread', value: '14mm x 1/2" Reach' }
    ],
    compatibleVehicles: [
      'VW Beetle 1600 Dual Port',
      'Super Beetle 1302/1303',
      'Bus T2 Bay Window 1600 DP',
      'Type 3 Fastback / Squareback'
    ],
    compatibleModels: ['Beetle 1968–1979', 'Super Beetle (1302/1303)', 'Bus T2 Bay Window (1967–1979)'],
    compatibleEngineSizes: ['1600cc', '1776cc', '1835cc']
  },
  {
    id: 'part-vw-weber-44-kit',
    title: 'Genuine Weber 44 IDF Dual Carburetor Complete Kit with Hex-Bar Linkage',
    oemNumber: '18990-035-KIT',
    sku: 'WEB-44IDF-KIT',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: '1776cc - 2276cc',
    category: 'Fuel & Carburetion',
    subcategory: 'Dual Weber Carburetors',
    mainSystem: 'fuel-system',
    era: '1970s',
    price: 1420,
    rating: 5.0,
    reviewsCount: 34,
    condition: 'New',
    rarityScore: 'Iconic (95/100)',
    stock: 4,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    castingCode: 'WEBER-BOLOGNA-44',
    provenance: 'Authentic matched pair of Weber 44 IDF carburetors with offset aluminum intake manifolds, aircraft-grade ball-joint hex-bar linkage, and mesh filters.',
    specifications: [
      { key: 'Venturi Size', value: '36mm Main Venturis' },
      { key: 'Main Jet', value: '135' },
      { key: 'Air Corrector', value: '175' },
      { key: 'Idle Jet', value: '55' }
    ],
    compatibleVehicles: [
      'Type 1 Beetle 1776cc - 2276cc',
      'Karmann Ghia Coupé & Convertible',
      'VW Bus T1 & T2'
    ],
    compatibleModels: ['Beetle 1968–1979', 'Karmann Ghia Coupé (1955–1974)', 'Baja Bug'],
    compatibleEngineSizes: ['1776cc', '1835cc', '1914cc', '2110cc', '2276cc']
  },
  {
    id: 'part-vw-forged-crankshaft-69',
    title: 'EMPI 69mm Counterweighted Forged 4140 Chromoly Crankshaft (8-Dowel)',
    oemNumber: 'EMPI-8106-69',
    sku: '043-CRANK-69CW',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: '1600cc / 1776cc / 1835cc / 1914cc',
    category: 'Engine Block & Internals',
    subcategory: 'Crankshafts',
    mainSystem: 'engine-system',
    era: '1970s',
    price: 495,
    rating: 4.8,
    reviewsCount: 19,
    condition: 'New',
    rarityScore: 'Restorer Favorite (89/100)',
    stock: 7,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    castingCode: '4140-FORGED-CW',
    provenance: 'Precision forged from high-tensile 4140 chromoly steel, dynamic spin-balanced to 8,500 RPM, cross-drilled with chamfered oil holes.',
    specifications: [
      { key: 'Stroke', value: '69.0 mm Stock Stroke' },
      { key: 'Material', value: 'Forged 4140 Chromoly' },
      { key: 'Flywheel Mounting', value: 'SP 8-Dowel Pattern' },
      { key: 'Journal Size', value: 'Standard VW Main & Rod' }
    ],
    compatibleVehicles: [
      'All Air-Cooled VW Type 1, 2, 3 Engines'
    ],
    compatibleModels: ['Beetle 1958–1967', 'Beetle 1968–1979', 'Bus T1 Split Screen (1950–1967)', 'Type 3 Notchback (1961–1973)'],
    compatibleEngineSizes: ['1600cc', '1776cc', '1835cc', '1914cc']
  },
  {
    id: 'part-vw-bosch-009-distributor',
    title: 'Genuine Bosch 009 Centrifugal Advance Ignition Distributor Assembly',
    oemNumber: '0-231-178-009',
    sku: 'BOSCH-009-GER',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: 'All Air-Cooled Engines',
    category: 'Ignition & Electrical',
    subcategory: 'Ignition Systems',
    mainSystem: 'electrical-system',
    era: '1960s',
    price: 260,
    rating: 4.9,
    reviewsCount: 42,
    condition: 'NOS (New Old Stock)',
    rarityScore: 'Collector Item (92/100)',
    stock: 5,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    castingCode: 'BOSCH-JFU4-009',
    provenance: 'Legendary genuine cast-iron Bosch Germany 009 mechanical advance distributor with original condenser, points, and phenolic cap.',
    specifications: [
      { key: 'Advance Type', value: 'All-Mechanical Centrifugal' },
      { key: 'Maximum Advance', value: '28° @ 3000 RPM' },
      { key: 'Cap Color', value: 'Vintage Brown Bakelite' }
    ],
    compatibleVehicles: [
      'Beetle, Karmann Ghia, Bus, Fastback, Squareback'
    ],
    compatibleModels: ['Beetle 1958–1967', 'Beetle 1968–1979', 'Bus T1 Split Screen (1950–1967)', 'Convertible Beetle'],
    compatibleEngineSizes: ['1200cc', '1300cc', '1500cc', '1600cc', '1776cc', '1835cc', '1914cc', '2110cc', '2276cc']
  },
  {
    id: 'part-vw-vintage-speed-exhaust',
    title: 'Vintage Speed Superflow Stainless Steel Sport Exhaust System',
    oemNumber: 'VS-EXH-TYPE1-SS',
    sku: 'VS-SS-SPORT',
    carModelId: 'type-1',
    carModelName: 'Type 1 (Beetle)',
    engineType: '1600cc - 2276cc',
    category: 'Brakes & Exhaust',
    subcategory: 'Exhaust Systems',
    mainSystem: 'brake-system',
    era: '1970s',
    price: 890,
    rating: 5.0,
    reviewsCount: 29,
    condition: 'New',
    rarityScore: 'Top Tier (96/100)',
    stock: 3,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    castingCode: 'TIG-304-STAINLESS',
    provenance: '100% hand TIG-welded #304 stainless steel chambered muffler with twin tailpipes designed to exit through stock rear apron cutouts.',
    specifications: [
      { key: 'Material', value: '#304 High-Polished Stainless Steel' },
      { key: 'Header Flange', value: '1-1/2" (38mm) Thick Flanges' },
      { key: 'Tailpipes', value: 'Dual Factory Style 35mm Tips' },
      { key: 'Sound Profile', value: 'Deep Throaty Boxer Rumble' }
    ],
    compatibleVehicles: [
      'Type 1 Beetle (1955–1979)',
      'Karmann Ghia Coupé & Convertible'
    ],
    compatibleModels: ['Beetle 1958–1967', 'Beetle 1968–1979', 'Cal-Look Beetle', 'Karmann Ghia Coupé (1955–1974)'],
    compatibleEngineSizes: ['1600cc', '1776cc', '1835cc', '1914cc', '2110cc', '2276cc']
  }
];

export const WORKSHOP_REELS = [
  {
    id: 'dyno-2275cc-oval-beetle',
    title: '2275cc Dyno Run — 161 HP / 205 Nm Test',
    subtitle: 'Green Oval Beetle • Porsche Upright Shroud • Dual Webers',
    description: 'Live chassis dyno pull of a custom 2275cc air-cooled engine in a classic forest green oval Beetle. Verified 161.0 hk @ 5821 RPM and 205.9 Nm of torque.',
    videoUrl: '/videos/dyno-2275cc-oval-beetle.mp4',
    badge: '161 HP DYNO TEST',
    category: 'Dyno & Sound Test',
    duration: '0:30',
    tags: ['2275cc', 'Chassis Dyno', 'Dual Weber', 'Porsche Shroud']
  },
  {
    id: 'machine-shop-crank-balancing',
    title: 'Precision Machining, Case Cutting & Balancing',
    subtitle: 'CNC Crankcase Machining • Stud Inserts • Crank Runout < 0.01mm',
    description: 'Inside our specialized engine machine shop: CNC case fly-cutting, stud inserts, dial indicator crank balancing, piston lathe turning, and turn-key engines ready for delivery.',
    videoUrl: '/videos/machine-shop-crank-balancing.mp4',
    badge: 'MACHINE SHOP',
    category: 'Precision Machining',
    duration: '1:25',
    tags: ['CNC Machining', 'Crank Balancing', 'Turn-Key Engines', 'Lathe']
  },
  {
    id: 'type-4-2400cc-crank-assembly',
    title: '2.4L Type 4 Boxer Engine Build Walkthrough',
    subtitle: '71mm Crank • 228mm Flywheel • Sachs Clutch • ~160 HP',
    description: 'Detailed assembly walkthrough of a high-performance 2.4L Type 4 air-cooled boxer engine: 71mm forged crank, 228mm flywheel, Sachs clutch assembly, and balancing walkthrough.',
    videoUrl: '/videos/type-4-2400cc-crank-assembly.mp4',
    badge: 'ENGINE BUILD',
    category: 'Engine Assembly',
    duration: '0:56',
    tags: ['Type 4', '2.4L', 'Forged Crank', 'Sachs Clutch']
  },
  {
    id: 'porsche-911-st-engine-build',
    title: 'Porsche 911 ST 2.5L Twin-Spark Engine Project',
    subtitle: '2.4L Base • 11:1 Compression • 46mm Webers • 270 HP Goal',
    description: 'Preparing an authentic Porsche flat-six for a 2.5L 911 ST build with twin-spark ignition, 46mm Weber carbs, S-cams, followed by a walk through our showroom floor.',
    videoUrl: '/videos/porsche-911-st-engine-build.mp4',
    badge: 'PORSCHE 911 ST',
    category: 'Flat-Six Project',
    duration: '0:42',
    tags: ['911 ST', 'Flat-Six', 'Twin-Spark', 'Weber 46mm']
  },
  {
    id: 'porsche-912-service-handover',
    title: '1968 Porsche 912 Handover & 930 Turbo Drive-Out',
    subtitle: '1.7L Engine Service • 110 HP • Widebody 930 Turbo & 911 Targa',
    description: 'Returning customer collection of a freshly serviced 1968 Porsche 912, followed by a widebody 930 Turbo and 911 Targa roaring out onto the open road.',
    videoUrl: '/videos/porsche-912-service-handover.mp4',
    badge: 'CLIENT HANDOVER',
    category: 'Handover & Drive',
    duration: '1:16',
    tags: ['Porsche 912', '930 Turbo', '911 Targa', 'Service']
  },
  {
    id: 'workshop-beetle-buggy',
    title: 'CSP Dual-Carb Beetle & Meyers Manx Buggy',
    subtitle: 'Twin IDF Weber Beetle • Red Manx Dune Buggy • Split Bus',
    description: 'Workshop floor overview featuring a bright yellow Beetle with CSP crossbar linkage and twin Webers, flanked by a custom red Meyers Manx buggy and elevated bus.',
    videoUrl: '/videos/workshop-beetle-buggy.mp4',
    badge: 'WORKSHOP TOUR',
    category: 'Workshop Tour',
    duration: '0:18',
    tags: ['CSP Linkage', 'Meyers Manx', 'Twin Webers', 'VW Bus']
  }
];

export const YOUTUBE_SHOWCASE = WORKSHOP_REELS;

export const USERS = [];
export const ORDERS = [];

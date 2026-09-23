export type TamilNaduZone =
  | 'Northern Capital'
  | 'Western Kongu'
  | 'Central Cauvery Delta'
  | 'Southern Region'
  | 'North Western';

export interface ProjectAreaInfo {
  id: string;
  name: string;
  type: string;
  center: [number, number]; // [lng, lat]
  parcelsCount: number;
  buildingsCount: number;
  estimatedUnitsCount: number;
  metroConnected: boolean;
  transitType?: string;
  description: string;
  hasLotOfBuildings: boolean;
  defaultAllocatedCount?: number;
}

export interface DistrictInfo {
  id: string;
  name: string;
  code: string;
  zone: TamilNaduZone;
  headquarters: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  totalParcels: number;
  totalBuildings: number;
  totalUlpinUnits: number;
  ulpinCoveragePercent: number;
  isMajorHub?: boolean;
  taluks: {
    name: string;
    projectAreas: ProjectAreaInfo[];
  }[];
}

// Geographic bounding box for Tamil Nadu (EPSG:4326)
export const TAMIL_NADU_BOUNDS = {
  minLng: 76.15,
  maxLng: 80.45,
  minLat: 8.05,
  maxLat: 13.55,
};

// Accurate geographic polygon boundary of Tamil Nadu (clockwise from Pulicat/Tiruvallur)
export const TAMIL_NADU_BOUNDARY_COORDS: [number, number][] = [
  // Pulicat lake & Northern coastal boundary (Tiruvallur / Andhra Pradesh border)
  [80.32, 13.52],
  [80.18, 13.48],
  [79.95, 13.44],
  [79.72, 13.36],
  [79.52, 13.25], // Tiruttani border
  [79.28, 13.12], // Sholinghur / Ranipet
  [79.05, 13.02], // Katpadi / Vellore
  [78.75, 12.92], // Gudiyatham
  [78.50, 12.78], // Vaniyambadi / Tirupattur
  [78.32, 12.72], // Kuppam border
  [78.05, 12.78], // Hosur northern border
  [77.72, 12.72], // Anekal / Karnataka border
  [77.62, 12.48], // Denkanikottai
  [77.75, 12.20], // Anchetty / Cauvery sanctuary
  [77.65, 12.02], // Hogenakkal falls / Cauvery river
  [77.45, 11.85], // Pennagaram / Mettur
  [77.25, 11.75], // Bargur hills (Erode)
  [77.05, 11.62], // Sathyamangalam tiger reserve
  [76.78, 11.65], // Mudumalai / Bandipur border
  [76.45, 11.58], // Gudalur (Nilgiris northwest tip)
  [76.25, 11.45], // Western Nilgiris / Wayanad border
  [76.35, 11.25], // Silent Valley / Mukurthi peak
  [76.55, 11.12], // Coonoor / Attappadi border
  [76.70, 10.98], // Walayar / Palakkad gap border
  [76.88, 10.75], // Pollachi / Parambikulam border
  [76.98, 10.45], // Anaimalai hills / Valparai
  [77.15, 10.25], // Top Slip / Indira Gandhi sanctuary
  [77.20, 10.05], // Kodaikanal / Cardamom hills border
  [77.12, 9.85],  // Theni / Bodinayakanur gap
  [77.22, 9.60],  // Periyar tiger reserve / Cumbum valley border
  [77.30, 9.35],  // Megamalai / Srivilliputhur grizzled squirrel sanctuary
  [77.25, 9.15],  // Rajapalayam / Tenkasi Western Ghats
  [77.18, 8.95],  // Shenkottai / Aryankavu pass border
  [77.24, 8.75],  // Courtallam / Papanasam hills
  [77.28, 8.52],  // Kalakkad Mundanthurai tiger reserve
  [77.35, 8.35],  // Agasthiyar peak / Kanyakumari hills
  [77.42, 8.18],  // Padmanabhapuram / Western Kanyakumari
  [77.54, 8.08],  // KANNIYAKUMARI / CAPE COMORIN (Southernmost Tip of India)

  // Coastline: Cape Comorin heading East & North-East along Gulf of Mannar & Bay of Bengal
  [77.72, 8.18],  // Radhapuram coast (Tirunelveli)
  [77.95, 8.42],  // Tiruchendur temple coast
  [78.16, 8.78],  // Thoothukudi / Tuticorin port & Vembar
  [78.45, 9.08],  // Sayalkudi coast
  [78.68, 9.22],  // Valinokkam / Kilakarai
  [78.92, 9.28],  // Mandapam peninsula
  [79.32, 9.28],  // Pamban Island / Rameswaram
  [79.35, 9.32],  // Dhanushkodi tip
  [79.15, 9.48],  // Palk Bay / Thondi coast (Ramanathapuram)
  [79.02, 9.82],  // Manamelkudi (Pudukkottai coast)
  [79.22, 10.15], // Mallipattinam / Sethubavachatram
  [79.52, 10.28], // Adirampattinam (Thanjavur)
  [79.84, 10.30], // Point Calimere / Kodikkarai sanctuary (Nagapattinam)
  [79.86, 10.55], // Vedaranyam coast
  [79.85, 10.76], // Velankanni & Nagapattinam port
  [79.85, 10.98], // Karaikal enclave boundary
  [79.85, 11.15], // Poompuhar / Cauvery mouth (Mayiladuthurai)
  [79.82, 11.45], // Pichavaram mangrove forest / Coleroon mouth
  [79.77, 11.75], // Cuddalore / Silver Beach port
  [79.82, 12.00], // Puducherry enclave boundary
  [80.00, 12.25], // Marakkanam salt pans / Kaliveli lake
  [80.18, 12.60], // Mahabalipuram / Mamallapuram coast
  [80.24, 12.98], // Taramani / OMR & Thiruvanmiyur coast
  [80.28, 13.08], // Marina Beach / Chennai Port
  [80.32, 13.32], // Ennore Port & Coromandel coast
  [80.32, 13.52], // Rejoining Pulicat Lake Northern boundary
];

// All 38 Revenue Districts of Tamil Nadu with exact GPS centers
export const TAMIL_NADU_DISTRICTS: DistrictInfo[] = [
  // 1. Chennai
  {
    id: 'chennai',
    name: 'Chennai',
    code: 'TN-01',
    zone: 'Northern Capital',
    headquarters: 'Chennai',
    center: [80.244, 12.986],
    zoom: 13.5,
    isMajorHub: true,
    totalParcels: 3840,
    totalBuildings: 2150,
    totalUlpinUnits: 18400,
    ulpinCoveragePercent: 78,
    taluks: [
      {
        name: 'Velachery / Sholinganallur',
        projectAreas: [
          {
            id: 'taramani-omr',
            name: 'Taramani OMR Tech & Metro Hub',
            type: 'High-Density IT & Transit Corridor',
            center: [80.2435, 12.9865],
            parcelsCount: 52,
            buildingsCount: 34,
            estimatedUnitsCount: 272,
            metroConnected: true,
            transitType: 'CMRL Metro Line 4 Underground',
            description: 'Major multi-tier IT corridor with high-rise commercial campuses, residential towers, and underground metro stations.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 18,
          },
          {
            id: 'perungudi-zone',
            name: 'Perungudi Mixed-Use Cadastral Zone',
            type: 'Mixed Commercial & Residential',
            center: [80.238, 12.965],
            parcelsCount: 38,
            buildingsCount: 26,
            estimatedUnitsCount: 208,
            metroConnected: true,
            transitType: 'CMRL Metro Line 3 Corridor',
            description: 'Dense commercial zone with medium-to-high rise mixed developments and subsurface stormwater tunnels.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 12,
          },
        ],
      },
      {
        name: 'Egmore / Nungambakkam',
        projectAreas: [
          {
            id: 'anna-nagar-metro',
            name: 'Anna Nagar 2nd Avenue Commercial Grid',
            type: 'Subsurface Transit Node & Retail',
            center: [80.212, 13.085],
            parcelsCount: 44,
            buildingsCount: 30,
            estimatedUnitsCount: 240,
            metroConnected: true,
            transitType: 'CMRL Underground Green Line Node',
            description: 'Premier urban retail grid featuring multi-level basements, underground pedestrian concourses, and commercial towers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 8,
          },
        ],
      },
      {
        name: 'Guindy',
        projectAreas: [
          {
            id: 'guindy-industrial',
            name: 'Guindy Institutional & Industrial Park',
            type: 'Industrial & Research Estate',
            center: [80.208, 13.007],
            parcelsCount: 40,
            buildingsCount: 22,
            estimatedUnitsCount: 176,
            metroConnected: true,
            transitType: 'Guindy Intermodal Metro-Rail Station',
            description: 'High-density tech estate and institutional R&D parks with deep foundation substructures.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 10,
          },
        ],
      },
    ],
  },

  // 2. Coimbatore
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    code: 'TN-37',
    zone: 'Western Kongu',
    headquarters: 'Coimbatore',
    center: [76.9558, 11.0168],
    zoom: 12.5,
    isMajorHub: true,
    totalParcels: 2980,
    totalBuildings: 1640,
    totalUlpinUnits: 13200,
    ulpinCoveragePercent: 64,
    taluks: [
      {
        name: 'Coimbatore South',
        projectAreas: [
          {
            id: 'rs-puram-core',
            name: 'RS Puram Urban Redevelopment Sector',
            type: 'Commercial High-Street & Apartments',
            center: [76.948, 11.011],
            parcelsCount: 46,
            buildingsCount: 31,
            estimatedUnitsCount: 248,
            metroConnected: false,
            transitType: 'Proposed Coimbatore Metro Corridor',
            description: 'Historic commercial center with dense high-rise multi-family apartments, multi-level retail, and commercial complexes.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 14,
          },
        ],
      },
      {
        name: 'Coimbatore North',
        projectAreas: [
          {
            id: 'avinashi-tidel',
            name: 'Avinashi Road TIDEL Tech Zone',
            type: 'Special Economic Zone & High-Rise IT',
            center: [77.018, 11.034],
            parcelsCount: 35,
            buildingsCount: 19,
            estimatedUnitsCount: 152,
            metroConnected: false,
            transitType: 'Avinashi Elevated Expressway',
            description: 'Major technological corridor featuring high-rise corporate campuses with extensive dual-basement parking.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 6,
          },
        ],
      },
    ],
  },

  // 3. Madurai
  {
    id: 'madurai',
    name: 'Madurai',
    code: 'TN-58',
    zone: 'Southern Region',
    headquarters: 'Madurai',
    center: [78.1198, 9.9252],
    zoom: 12.5,
    isMajorHub: true,
    totalParcels: 2410,
    totalBuildings: 1290,
    totalUlpinUnits: 9800,
    ulpinCoveragePercent: 58,
    taluks: [
      {
        name: 'Madurai North',
        projectAreas: [
          {
            id: 'mattuthavani-hub',
            name: 'Mattuthavani Integrated Transit Hub',
            type: 'Multi-Modal Terminal & Commercial Towers',
            center: [78.163, 9.948],
            parcelsCount: 41,
            buildingsCount: 24,
            estimatedUnitsCount: 192,
            metroConnected: false,
            transitType: 'Planned Madurai Metro Phase 1',
            description: 'Major multi-modal transportation node surrounded by commercial retail towers and hospital complexes.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 8,
          },
        ],
      },
    ],
  },

  // 4. Tiruchirappalli
  {
    id: 'tiruchirappalli',
    name: 'Tiruchirappalli',
    code: 'TN-45',
    zone: 'Central Cauvery Delta',
    headquarters: 'Tiruchirappalli',
    center: [78.7047, 10.7905],
    zoom: 12.5,
    isMajorHub: true,
    totalParcels: 2150,
    totalBuildings: 1120,
    totalUlpinUnits: 8400,
    ulpinCoveragePercent: 62,
    taluks: [
      {
        name: 'Trichy West',
        projectAreas: [
          {
            id: 'thillai-nagar',
            name: 'Thillai Nagar Commercial Corridor',
            type: 'Commercial High-Street & Mixed-Use',
            center: [78.685, 10.822],
            parcelsCount: 34,
            buildingsCount: 22,
            estimatedUnitsCount: 176,
            metroConnected: false,
            transitType: 'Main Guard Gate Arterial',
            description: 'Prime commercial spine with numerous multi-story corporate offices, healthcare towers, and retail blocks.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 7,
          },
        ],
      },
    ],
  },

  // 5. Salem
  {
    id: 'salem',
    name: 'Salem',
    code: 'TN-27',
    zone: 'Western Kongu',
    headquarters: 'Salem',
    center: [78.146, 11.6643],
    zoom: 12.5,
    isMajorHub: true,
    totalParcels: 1820,
    totalBuildings: 940,
    totalUlpinUnits: 6800,
    ulpinCoveragePercent: 52,
    taluks: [
      {
        name: 'Salem South',
        projectAreas: [
          {
            id: 'shevapet-trade',
            name: 'Shevapet Wholesale Logistics Hub',
            type: 'Logistics & Wholesale Commercial',
            center: [78.136, 11.652],
            parcelsCount: 29,
            buildingsCount: 18,
            estimatedUnitsCount: 144,
            metroConnected: false,
            transitType: 'Thirumanimutharu Corridor',
            description: 'Major wholesale commodity marketplace with multi-tier storage warehouses and trading complexes.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 6. Chengalpattu
  {
    id: 'chengalpattu',
    name: 'Chengalpattu',
    code: 'TN-11',
    zone: 'Northern Capital',
    headquarters: 'Chengalpattu',
    center: [79.986, 12.684],
    zoom: 12.0,
    isMajorHub: true,
    totalParcels: 2200,
    totalBuildings: 1350,
    totalUlpinUnits: 10400,
    ulpinCoveragePercent: 66,
    taluks: [
      {
        name: 'Tambaram / Pallavaram',
        projectAreas: [
          {
            id: 'tambaram-gateway',
            name: 'Tambaram Intermodal Transit District',
            type: 'Multi-Modal Railway & Commercial Hub',
            center: [80.117, 12.924],
            parcelsCount: 42,
            buildingsCount: 28,
            estimatedUnitsCount: 224,
            metroConnected: true,
            transitType: 'CMRL Extension & Suburban Rail',
            description: 'South Chennai gateway featuring railway terminal proximity and dense commercial-residential multi-story blocks.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 9,
          },
        ],
      },
    ],
  },

  // 7. Kanchipuram
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    code: 'TN-12',
    zone: 'Northern Capital',
    headquarters: 'Kanchipuram',
    center: [79.7036, 12.8342],
    zoom: 12.0,
    totalParcels: 1650,
    totalBuildings: 890,
    totalUlpinUnits: 6200,
    ulpinCoveragePercent: 49,
    taluks: [
      {
        name: 'Sriperumbudur',
        projectAreas: [
          {
            id: 'sriperumbudur-industrial',
            name: 'Sriperumbudur Hi-Tech Electronics Cluster',
            type: 'Special Industrial Economic Zone',
            center: [79.948, 12.969],
            parcelsCount: 36,
            buildingsCount: 20,
            estimatedUnitsCount: 160,
            metroConnected: false,
            transitType: 'Chennai-Bengaluru Highway Corridor',
            description: 'Major electronic manufacturing mega-complexes with large spatial footprints and multi-tier logistics hubs.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 6,
          },
        ],
      },
    ],
  },

  // 8. Tirunelveli
  {
    id: 'tirunelveli',
    name: 'Tirunelveli',
    code: 'TN-72',
    zone: 'Southern Region',
    headquarters: 'Tirunelveli',
    center: [77.7567, 8.7139],
    zoom: 12.0,
    isMajorHub: true,
    totalParcels: 1540,
    totalBuildings: 810,
    totalUlpinUnits: 5800,
    ulpinCoveragePercent: 54,
    taluks: [
      {
        name: 'Palayamkottai',
        projectAreas: [
          {
            id: 'palayamkottai-inst',
            name: 'Palayamkottai Institutional & IT Park',
            type: 'Educational & Commercial Hub',
            center: [77.738, 8.721],
            parcelsCount: 32,
            buildingsCount: 21,
            estimatedUnitsCount: 168,
            metroConnected: false,
            transitType: 'Thamirabarani Highway Axis',
            description: 'Educational capital of South Tamil Nadu with institutional campuses and adjacent multi-family residential towers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 9. Erode
  {
    id: 'erode',
    name: 'Erode',
    code: 'TN-33',
    zone: 'Western Kongu',
    headquarters: 'Erode',
    center: [77.7172, 11.341],
    zoom: 12.0,
    totalParcels: 1420,
    totalBuildings: 760,
    totalUlpinUnits: 5200,
    ulpinCoveragePercent: 48,
    taluks: [
      {
        name: 'Erode Central',
        projectAreas: [
          {
            id: 'erode-textile-core',
            name: 'Texvalley & Central Textile Arcade',
            type: 'Wholesale Textile & Multi-Level Markets',
            center: [77.725, 11.348],
            parcelsCount: 30,
            buildingsCount: 19,
            estimatedUnitsCount: 152,
            metroConnected: false,
            transitType: 'Bhavani Road Transit Axis',
            description: 'Asia-prominent textile trading arcade featuring multi-level commercial units and storage floors.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 10. Tiruppur
  {
    id: 'tiruppur',
    name: 'Tiruppur',
    code: 'TN-39',
    zone: 'Western Kongu',
    headquarters: 'Tiruppur',
    center: [77.3411, 11.1085],
    zoom: 12.0,
    isMajorHub: true,
    totalParcels: 1780,
    totalBuildings: 990,
    totalUlpinUnits: 7100,
    ulpinCoveragePercent: 56,
    taluks: [
      {
        name: 'Tiruppur South',
        projectAreas: [
          {
            id: 'palladam-road-knit',
            name: 'Palladam Road Apparel & Export Center',
            type: 'Apparel Export & Commercial Hub',
            center: [77.348, 11.092],
            parcelsCount: 38,
            buildingsCount: 25,
            estimatedUnitsCount: 200,
            metroConnected: false,
            transitType: 'Tiruppur Ring Road Arterial',
            description: 'Knitwear export capital with multi-story industrial complexes and multi-level corporate offices.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 8,
          },
        ],
      },
    ],
  },

  // 11. Vellore
  {
    id: 'vellore',
    name: 'Vellore',
    code: 'TN-23',
    zone: 'Northern Capital',
    headquarters: 'Vellore',
    center: [78.8001, 12.9165],
    zoom: 12.0,
    isMajorHub: true,
    totalParcels: 1390,
    totalBuildings: 740,
    totalUlpinUnits: 5100,
    ulpinCoveragePercent: 49,
    taluks: [
      {
        name: 'Katpadi',
        projectAreas: [
          {
            id: 'vit-university-zone',
            name: 'Katpadi Institutional & Tech Node',
            type: 'Higher Education & Tech Cluster',
            center: [78.841, 12.971],
            parcelsCount: 31,
            buildingsCount: 20,
            estimatedUnitsCount: 160,
            metroConnected: false,
            transitType: 'Katpadi Railway Junction',
            description: 'Major university township featuring deep basements and high-density student residential high-rises.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 12. Thanjavur
  {
    id: 'thanjavur',
    name: 'Thanjavur',
    code: 'TN-49',
    zone: 'Central Cauvery Delta',
    headquarters: 'Thanjavur',
    center: [79.1378, 10.787],
    zoom: 12.0,
    totalParcels: 1280,
    totalBuildings: 680,
    totalUlpinUnits: 4600,
    ulpinCoveragePercent: 46,
    taluks: [
      {
        name: 'Thanjavur Urban',
        projectAreas: [
          {
            id: 'medical-college-road',
            name: 'Medical College Commercial Sector',
            type: 'Healthcare & Commercial Axis',
            center: [79.124, 10.768],
            parcelsCount: 26,
            buildingsCount: 17,
            estimatedUnitsCount: 136,
            metroConnected: false,
            transitType: 'Grand Anicut Canal Road',
            description: 'Healthcare institutional zone with mid-rise commercial buildings and diagnostics centers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 13. Dindigul
  {
    id: 'dindigul',
    name: 'Dindigul',
    code: 'TN-57',
    zone: 'Southern Region',
    headquarters: 'Dindigul',
    center: [77.9803, 10.3673],
    zoom: 12.0,
    totalParcels: 1190,
    totalBuildings: 610,
    totalUlpinUnits: 4200,
    ulpinCoveragePercent: 44,
    taluks: [
      {
        name: 'Dindigul West',
        projectAreas: [
          {
            id: 'palani-road-commercial',
            name: 'Palani Road Commercial Strip',
            type: 'Lock Industry & Wholesale Markets',
            center: [77.962, 10.375],
            parcelsCount: 25,
            buildingsCount: 16,
            estimatedUnitsCount: 128,
            metroConnected: false,
            transitType: 'NH 83 Highway Corridor',
            description: 'Historic trade sector with commercial processing units and multi-level retail stores.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 14. Thoothukudi
  {
    id: 'thoothukudi',
    name: 'Thoothukudi',
    code: 'TN-69',
    zone: 'Southern Region',
    headquarters: 'Thoothukudi',
    center: [78.1348, 8.7642],
    zoom: 12.0,
    totalParcels: 1310,
    totalBuildings: 690,
    totalUlpinUnits: 4800,
    ulpinCoveragePercent: 48,
    taluks: [
      {
        name: 'VOC Port Terminal',
        projectAreas: [
          {
            id: 'harbour-estate',
            name: 'VOC Port Logistics & Marine Hub',
            type: 'Port Logistics & SEZ',
            center: [78.172, 8.751],
            parcelsCount: 34,
            buildingsCount: 22,
            estimatedUnitsCount: 176,
            metroConnected: false,
            transitType: 'Port Expressway Rail Line',
            description: 'Deep-water seaport logistics zone featuring multi-tier storage yards and administrative offices.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 6,
          },
        ],
      },
    ],
  },

  // 15. Kanniyakumari
  {
    id: 'kanniyakumari',
    name: 'Kanniyakumari',
    code: 'TN-74',
    zone: 'Southern Region',
    headquarters: 'Nagercoil',
    center: [77.54, 8.088],
    zoom: 12.0,
    isMajorHub: true,
    totalParcels: 1140,
    totalBuildings: 580,
    totalUlpinUnits: 3900,
    ulpinCoveragePercent: 51,
    taluks: [
      {
        name: 'Agastheeswaram',
        projectAreas: [
          {
            id: 'nagercoil-core',
            name: 'Nagercoil Central Business District',
            type: 'Commercial High-Street & Mixed-Use',
            center: [77.432, 8.188],
            parcelsCount: 30,
            buildingsCount: 19,
            estimatedUnitsCount: 152,
            metroConnected: false,
            transitType: 'Cape Comorin Arterial Highway',
            description: 'Southern tip urban commercial core with dense retail rows and mid-rise residential apartments.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 16. Tiruvallur
  {
    id: 'tiruvallur',
    name: 'Tiruvallur',
    code: 'TN-02',
    zone: 'Northern Capital',
    headquarters: 'Tiruvallur',
    center: [79.9083, 13.1432],
    zoom: 12.0,
    totalParcels: 1840,
    totalBuildings: 980,
    totalUlpinUnits: 7200,
    ulpinCoveragePercent: 57,
    taluks: [
      {
        name: 'Ambattur',
        projectAreas: [
          {
            id: 'ambattur-estate',
            name: 'Ambattur Industrial & IT Micro-City',
            type: 'High-Density Mixed Industrial & Tech',
            center: [80.162, 13.114],
            parcelsCount: 40,
            buildingsCount: 27,
            estimatedUnitsCount: 216,
            metroConnected: true,
            transitType: 'CMRL Corridor 5 Proposed Node',
            description: 'South Asia’s largest industrial estate rapidly transforming into high-rise IT and data center complexes.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 11,
          },
        ],
      },
    ],
  },

  // 17. The Nilgiris
  {
    id: 'nilgiris',
    name: 'The Nilgiris',
    code: 'TN-43',
    zone: 'Western Kongu',
    headquarters: 'Udhagamandalam (Ooty)',
    center: [76.7031, 11.4102],
    zoom: 12.0,
    totalParcels: 920,
    totalBuildings: 480,
    totalUlpinUnits: 3200,
    ulpinCoveragePercent: 41,
    taluks: [
      {
        name: 'Udhagamandalam',
        projectAreas: [
          {
            id: 'ooty-commercial',
            name: 'Ooty Charing Cross & Hill Cadastre Sector',
            type: 'Steep Slope Terrain & Tourism Commercial',
            center: [76.711, 11.412],
            parcelsCount: 24,
            buildingsCount: 15,
            estimatedUnitsCount: 120,
            metroConnected: false,
            transitType: 'UNESCO Mountain Heritage Rail',
            description: 'Unique mountainous cadastral zone featuring tiered multi-level structures on steep gradients requiring precise vertical Z-datum.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 18. Cuddalore
  {
    id: 'cuddalore',
    name: 'Cuddalore',
    code: 'TN-31',
    zone: 'Central Cauvery Delta',
    headquarters: 'Cuddalore',
    center: [79.767, 11.748],
    zoom: 12.0,
    totalParcels: 1210,
    totalBuildings: 620,
    totalUlpinUnits: 4300,
    ulpinCoveragePercent: 47,
    taluks: [
      {
        name: 'Neyveli',
        projectAreas: [
          {
            id: 'neyveli-township',
            name: 'NLC Township & Institutional Core',
            type: 'Energy Township & Mining Infrastructure',
            center: [79.485, 11.598],
            parcelsCount: 28,
            buildingsCount: 18,
            estimatedUnitsCount: 144,
            metroConnected: false,
            transitType: 'Grand Southern Trunk Rail',
            description: 'Planned lignite energy city with large institutional quarters and commercial multi-tenant plazas.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 19. Dharmapuri
  {
    id: 'dharmapuri',
    name: 'Dharmapuri',
    code: 'TN-29',
    zone: 'North Western',
    headquarters: 'Dharmapuri',
    center: [78.1634, 12.1277],
    zoom: 12.0,
    totalParcels: 1050,
    totalBuildings: 520,
    totalUlpinUnits: 3600,
    ulpinCoveragePercent: 43,
    taluks: [
      {
        name: 'Dharmapuri Urban',
        projectAreas: [
          {
            id: 'dharmapuri-market',
            name: 'Dharmapuri Agri-Logistics & Market Spine',
            type: 'Agri-Commercial & Wholesale Hub',
            center: [78.158, 12.132],
            parcelsCount: 22,
            buildingsCount: 14,
            estimatedUnitsCount: 112,
            metroConnected: false,
            transitType: 'NH 44 Highway Axis',
            description: 'Agro-processing centers and wholesale trading warehouses along the North-South corridor.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 20. Krishnagiri
  {
    id: 'krishnagiri',
    name: 'Krishnagiri',
    code: 'TN-24',
    zone: 'North Western',
    headquarters: 'Krishnagiri',
    center: [78.2212, 12.5186],
    zoom: 12.0,
    totalParcels: 1480,
    totalBuildings: 810,
    totalUlpinUnits: 5800,
    ulpinCoveragePercent: 52,
    taluks: [
      {
        name: 'Hosur',
        projectAreas: [
          {
            id: 'hosur-sipcot',
            name: 'Hosur SIPCOT Hi-Tech Manufacturing Sector',
            type: 'EV & Precision Tech Hub',
            center: [77.825, 12.741],
            parcelsCount: 38,
            buildingsCount: 24,
            estimatedUnitsCount: 192,
            metroConnected: false,
            transitType: 'Bengaluru-Hosur Suburban Rail',
            description: 'Booming satellite tech industrial township with multi-tier EV gigafactories and software centers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 7,
          },
        ],
      },
    ],
  },

  // 21. Namakkal
  {
    id: 'namakkal',
    name: 'Namakkal',
    code: 'TN-28',
    zone: 'Western Kongu',
    headquarters: 'Namakkal',
    center: [78.1672, 11.2189],
    zoom: 12.0,
    totalParcels: 1180,
    totalBuildings: 590,
    totalUlpinUnits: 4100,
    ulpinCoveragePercent: 45,
    taluks: [
      {
        name: 'Namakkal Urban',
        projectAreas: [
          {
            id: 'namakkal-transport',
            name: 'Namakkal Logistics & Transport Arcade',
            type: 'Automotive & Freight Logistics',
            center: [78.162, 11.225],
            parcelsCount: 26,
            buildingsCount: 16,
            estimatedUnitsCount: 128,
            metroConnected: false,
            transitType: 'NH 44 Heavy Transport Spine',
            description: 'Major freight transport and poultry logistics corridor with extensive warehouse facilities.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 22. Karur
  {
    id: 'karur',
    name: 'Karur',
    code: 'TN-47',
    zone: 'Central Cauvery Delta',
    headquarters: 'Karur',
    center: [78.0839, 10.9601],
    zoom: 12.0,
    totalParcels: 1110,
    totalBuildings: 550,
    totalUlpinUnits: 3800,
    ulpinCoveragePercent: 44,
    taluks: [
      {
        name: 'Karur Central',
        projectAreas: [
          {
            id: 'karur-textile-export',
            name: 'Karur Home Textiles Export Zone',
            type: 'Export Processing & Commercial Units',
            center: [78.075, 10.968],
            parcelsCount: 24,
            buildingsCount: 15,
            estimatedUnitsCount: 120,
            metroConnected: false,
            transitType: 'Amaravathi Riverfront Axis',
            description: 'Home textiles international export enclave with dense production units and commercial towers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 23. Perambalur
  {
    id: 'perambalur',
    name: 'Perambalur',
    code: 'TN-46',
    zone: 'Central Cauvery Delta',
    headquarters: 'Perambalur',
    center: [78.8804, 11.2342],
    zoom: 12.0,
    totalParcels: 890,
    totalBuildings: 420,
    totalUlpinUnits: 2900,
    ulpinCoveragePercent: 39,
    taluks: [
      {
        name: 'Perambalur Town',
        projectAreas: [
          {
            id: 'perambalur-sez',
            name: 'Perambalur SEZ Multi-Product Park',
            type: 'Special Economic Zone & Warehouses',
            center: [78.892, 11.241],
            parcelsCount: 20,
            buildingsCount: 12,
            estimatedUnitsCount: 96,
            metroConnected: false,
            transitType: 'GST Highway Expressway',
            description: 'Manufacturing economic zone with industrial sheds and logistics facilities.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 2,
          },
        ],
      },
    ],
  },

  // 24. Ariyalur
  {
    id: 'ariyalur',
    name: 'Ariyalur',
    code: 'TN-61',
    zone: 'Central Cauvery Delta',
    headquarters: 'Ariyalur',
    center: [79.0747, 11.1401],
    zoom: 12.0,
    totalParcels: 940,
    totalBuildings: 460,
    totalUlpinUnits: 3100,
    ulpinCoveragePercent: 42,
    taluks: [
      {
        name: 'Ariyalur Cement Hub',
        projectAreas: [
          {
            id: 'cement-city-cluster',
            name: 'Ariyalur Cement Capital Industrial Belt',
            type: 'Mineral Processing & Industrial Facilities',
            center: [79.082, 11.148],
            parcelsCount: 22,
            buildingsCount: 14,
            estimatedUnitsCount: 112,
            metroConnected: false,
            transitType: 'Southern Railway Freight Corridor',
            description: 'Premier limestone processing and cement factories complex with multi-tier storage silos.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 25. Nagapattinam
  {
    id: 'nagapattinam',
    name: 'Nagapattinam',
    code: 'TN-51',
    zone: 'Central Cauvery Delta',
    headquarters: 'Nagapattinam',
    center: [79.8437, 10.7656],
    zoom: 12.0,
    totalParcels: 1020,
    totalBuildings: 490,
    totalUlpinUnits: 3400,
    ulpinCoveragePercent: 43,
    taluks: [
      {
        name: 'Nagapattinam Port',
        projectAreas: [
          {
            id: 'velankanni-coastal',
            name: 'Nagapattinam Port & Velankanni Coastal Sector',
            type: 'Marine Port & Pilgrimage Commercial',
            center: [79.842, 10.741],
            parcelsCount: 24,
            buildingsCount: 15,
            estimatedUnitsCount: 120,
            metroConnected: false,
            transitType: 'East Coast Railway Line',
            description: 'Coastal trade zone with harbor infrastructure, fish processing, and tourism commercial blocks.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 26. Mayiladuthurai
  {
    id: 'mayiladuthurai',
    name: 'Mayiladuthurai',
    code: 'TN-82',
    zone: 'Central Cauvery Delta',
    headquarters: 'Mayiladuthurai',
    center: [79.6524, 11.1018],
    zoom: 12.0,
    totalParcels: 980,
    totalBuildings: 470,
    totalUlpinUnits: 3200,
    ulpinCoveragePercent: 41,
    taluks: [
      {
        name: 'Mayiladuthurai Town',
        projectAreas: [
          {
            id: 'cauvery-heritage-grid',
            name: 'Cauvery Riverfront Heritage & Trade Grid',
            type: 'Heritage Commercial & Retail Row',
            center: [79.658, 11.108],
            parcelsCount: 22,
            buildingsCount: 13,
            estimatedUnitsCount: 104,
            metroConnected: false,
            transitType: 'Mainline Southern Railway',
            description: 'Delta cultural center featuring historic commercial rows and traditional residential tenements.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 27. Tiruvarur
  {
    id: 'tiruvarur',
    name: 'Tiruvarur',
    code: 'TN-50',
    zone: 'Central Cauvery Delta',
    headquarters: 'Tiruvarur',
    center: [79.6344, 10.7725],
    zoom: 12.0,
    totalParcels: 1010,
    totalBuildings: 480,
    totalUlpinUnits: 3300,
    ulpinCoveragePercent: 42,
    taluks: [
      {
        name: 'Tiruvarur Urban',
        projectAreas: [
          {
            id: 'kamalalayam-civic',
            name: 'Kamalalayam Tank Civic & Commercial Enclave',
            type: 'Civic Administrative & Retail Center',
            center: [79.631, 10.778],
            parcelsCount: 23,
            buildingsCount: 14,
            estimatedUnitsCount: 112,
            metroConnected: false,
            transitType: 'Karaikal-Trichy Rail Line',
            description: 'Sacred delta hub with surrounding municipal institutions and dense market streets.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 28. Pudukkottai
  {
    id: 'pudukkottai',
    name: 'Pudukkottai',
    code: 'TN-55',
    zone: 'Central Cauvery Delta',
    headquarters: 'Pudukkottai',
    center: [78.8215, 10.3833],
    zoom: 12.0,
    totalParcels: 1150,
    totalBuildings: 570,
    totalUlpinUnits: 3900,
    ulpinCoveragePercent: 45,
    taluks: [
      {
        name: 'Pudukkottai Town',
        projectAreas: [
          {
            id: 'pudukkottai-royal-grid',
            name: 'Pudukkottai Planned Royal Town Grid',
            type: 'Planned Geometric Heritage & Commercial',
            center: [78.828, 10.388],
            parcelsCount: 25,
            buildingsCount: 16,
            estimatedUnitsCount: 128,
            metroConnected: false,
            transitType: 'Rameswaram Highway Axis',
            description: 'Historic princely state with wide orthogonal streets, heritage administrative mansions, and markets.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 29. Sivaganga
  {
    id: 'sivaganga',
    name: 'Sivaganga',
    code: 'TN-63',
    zone: 'Southern Region',
    headquarters: 'Sivaganga',
    center: [78.4809, 9.8433],
    zoom: 12.0,
    totalParcels: 1080,
    totalBuildings: 530,
    totalUlpinUnits: 3600,
    ulpinCoveragePercent: 43,
    taluks: [
      {
        name: 'Karaikudi',
        projectAreas: [
          {
            id: 'karaikudi-chettinad',
            name: 'Karaikudi Chettinad Architectural Enclave',
            type: 'Heritage Mansions & Institutional Hub',
            center: [78.784, 10.071],
            parcelsCount: 28,
            buildingsCount: 18,
            estimatedUnitsCount: 144,
            metroConnected: false,
            transitType: 'Trichy-Rameswaram Railway',
            description: 'World-renowned Chettinad palace mansions with multi-courtyard geometries and CECRI research campus.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 30. Ramanathapuram
  {
    id: 'ramanathapuram',
    name: 'Ramanathapuram',
    code: 'TN-65',
    zone: 'Southern Region',
    headquarters: 'Ramanathapuram',
    center: [78.8395, 9.3639],
    zoom: 12.0,
    totalParcels: 1120,
    totalBuildings: 540,
    totalUlpinUnits: 3700,
    ulpinCoveragePercent: 44,
    taluks: [
      {
        name: 'Rameswaram Island',
        projectAreas: [
          {
            id: 'rameswaram-pamban',
            name: 'Rameswaram Island & Pamban Gateway',
            type: 'Island Cadastre & Pilgrimage Infrastructure',
            center: [79.312, 9.288],
            parcelsCount: 26,
            buildingsCount: 17,
            estimatedUnitsCount: 136,
            metroConnected: false,
            transitType: 'New Pamban Vertical Lift Sea Bridge',
            description: 'Unique island coastal cadastre with high pilgrimage footfall and multi-story hotel developments.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 31. Virudhunagar
  {
    id: 'virudhunagar',
    name: 'Virudhunagar',
    code: 'TN-67',
    zone: 'Southern Region',
    headquarters: 'Virudhunagar',
    center: [77.9579, 9.5872],
    zoom: 12.0,
    totalParcels: 1230,
    totalBuildings: 640,
    totalUlpinUnits: 4400,
    ulpinCoveragePercent: 47,
    taluks: [
      {
        name: 'Sivakasi',
        projectAreas: [
          {
            id: 'sivakasi-print-hub',
            name: 'Sivakasi Printing & Packaging Capital',
            type: 'Industrial Printing & Packaging Estate',
            center: [77.798, 9.453],
            parcelsCount: 32,
            buildingsCount: 21,
            estimatedUnitsCount: 168,
            metroConnected: false,
            transitType: 'Madurai-Kollam Rail Line',
            description: 'Major printing press clusters with multi-floor production buildings and paper storage basements.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 32. Theni
  {
    id: 'theni',
    name: 'Theni',
    code: 'TN-60',
    zone: 'Southern Region',
    headquarters: 'Theni',
    center: [77.482, 10.0104],
    zoom: 12.0,
    totalParcels: 990,
    totalBuildings: 480,
    totalUlpinUnits: 3300,
    ulpinCoveragePercent: 42,
    taluks: [
      {
        name: 'Periyakulam',
        projectAreas: [
          {
            id: 'cumbum-valley-hub',
            name: 'Cumbum Valley Agri-Transit & Commercial Sector',
            type: 'Valley Trade & Horticulture Processing',
            center: [77.291, 9.734],
            parcelsCount: 23,
            buildingsCount: 14,
            estimatedUnitsCount: 112,
            metroConnected: false,
            transitType: 'Kochi-Dhanushkodi Highway (NH 85)',
            description: 'Fertile valley trading hub between Western Ghats passes with agricultural multi-level facilities.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },

  // 33. Tenkasi
  {
    id: 'tenkasi',
    name: 'Tenkasi',
    code: 'TN-76',
    zone: 'Southern Region',
    headquarters: 'Tenkasi',
    center: [77.3, 8.9594],
    zoom: 12.0,
    totalParcels: 1040,
    totalBuildings: 510,
    totalUlpinUnits: 3500,
    ulpinCoveragePercent: 43,
    taluks: [
      {
        name: 'Tenkasi Urban',
        projectAreas: [
          {
            id: 'courtallam-foothills',
            name: 'Tenkasi-Courtallam Eco-Tourism Sector',
            type: 'Foothills Tourism & Commercial Spine',
            center: [77.268, 8.931],
            parcelsCount: 25,
            buildingsCount: 15,
            estimatedUnitsCount: 120,
            metroConnected: false,
            transitType: 'Shenkottai Pass Rail Line',
            description: 'Picturesque Western Ghats eco-tourism hub with resort complexes and multi-level hospitality towers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 34. Tirupattur
  {
    id: 'tirupattur',
    name: 'Tirupattur',
    code: 'TN-85',
    zone: 'Northern Capital',
    headquarters: 'Tirupattur',
    center: [78.5678, 12.4934],
    zoom: 12.0,
    totalParcels: 1060,
    totalBuildings: 520,
    totalUlpinUnits: 3600,
    ulpinCoveragePercent: 44,
    taluks: [
      {
        name: 'Vaniyambadi',
        projectAreas: [
          {
            id: 'vaniyambadi-leather',
            name: 'Vaniyambadi Leather & Footwear Cluster',
            type: 'Leather Processing & Commercial Yards',
            center: [78.618, 12.684],
            parcelsCount: 26,
            buildingsCount: 16,
            estimatedUnitsCount: 128,
            metroConnected: false,
            transitType: 'Palar River Expressway',
            description: 'Major leather goods and footwear manufacturing zone with export warehouses and trade suites.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 4,
          },
        ],
      },
    ],
  },

  // 35. Ranipet
  {
    id: 'ranipet',
    name: 'Ranipet',
    code: 'TN-73',
    zone: 'Northern Capital',
    headquarters: 'Ranipet',
    center: [79.3328, 12.9272],
    zoom: 12.0,
    totalParcels: 1180,
    totalBuildings: 600,
    totalUlpinUnits: 4200,
    ulpinCoveragePercent: 46,
    taluks: [
      {
        name: 'Walajah',
        projectAreas: [
          {
            id: 'ranipet-sipcot',
            name: 'Ranipet SIPCOT Heavy Industrial Enclave',
            type: 'Engineering & Manufacturing Complex',
            center: [79.342, 12.935],
            parcelsCount: 28,
            buildingsCount: 18,
            estimatedUnitsCount: 144,
            metroConnected: false,
            transitType: 'Chennai-Bengaluru Industrial Corridor',
            description: 'Strategic heavy industrial estate with large-span commercial factories and multi-tier facilities.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 36. Tiruvannamalai
  {
    id: 'tiruvannamalai',
    name: 'Tiruvannamalai',
    code: 'TN-25',
    zone: 'North Western',
    headquarters: 'Tiruvannamalai',
    center: [79.0747, 12.2253],
    zoom: 12.0,
    totalParcels: 1250,
    totalBuildings: 630,
    totalUlpinUnits: 4300,
    ulpinCoveragePercent: 46,
    taluks: [
      {
        name: 'Tiruvannamalai Urban',
        projectAreas: [
          {
            id: 'girivalam-ring',
            name: 'Annamalaiyar Girivalam Ring Road Cadastre',
            type: 'Pilgrimage Circumambulation & Hospitality',
            center: [79.062, 12.235],
            parcelsCount: 28,
            buildingsCount: 18,
            estimatedUnitsCount: 144,
            metroConnected: false,
            transitType: 'Outer Ring Radial Highway',
            description: 'Dense spiritual tourism corridor with numerous multi-story ashrams, guest complexes, and civic centers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 37. Viluppuram
  {
    id: 'viluppuram',
    name: 'Viluppuram',
    code: 'TN-32',
    zone: 'Central Cauvery Delta',
    headquarters: 'Viluppuram',
    center: [79.493, 11.9401],
    zoom: 12.0,
    totalParcels: 1290,
    totalBuildings: 660,
    totalUlpinUnits: 4600,
    ulpinCoveragePercent: 47,
    taluks: [
      {
        name: 'Viluppuram Town',
        projectAreas: [
          {
            id: 'railway-junction-core',
            name: 'Viluppuram Super-Junction Railway Logistics',
            type: 'Transit Rail Interchange & Mixed-Use',
            center: [79.498, 11.934],
            parcelsCount: 28,
            buildingsCount: 18,
            estimatedUnitsCount: 144,
            metroConnected: false,
            transitType: 'Southern Railway 5-Line Super Junction',
            description: 'Major railway junction transit core connecting central and southern Tamil Nadu with multi-tier hotels and commercial centers.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 5,
          },
        ],
      },
    ],
  },

  // 38. Kallakurichi
  {
    id: 'kallakurichi',
    name: 'Kallakurichi',
    code: 'TN-86',
    zone: 'Central Cauvery Delta',
    headquarters: 'Kallakurichi',
    center: [78.9629, 11.7384],
    zoom: 12.0,
    totalParcels: 980,
    totalBuildings: 480,
    totalUlpinUnits: 3300,
    ulpinCoveragePercent: 41,
    taluks: [
      {
        name: 'Kallakurichi Urban',
        projectAreas: [
          {
            id: 'kalrayan-foothills-market',
            name: 'Kalrayan Hills Agri-Trading Sector',
            type: 'Agricultural Logistics & Commercial Rows',
            center: [78.968, 11.745],
            parcelsCount: 22,
            buildingsCount: 14,
            estimatedUnitsCount: 112,
            metroConnected: false,
            transitType: 'Salem-Cuddalore Highway Axis',
            description: 'Sugar mill agro-processing and commodity wholesale market with multi-floor trading facilities.',
            hasLotOfBuildings: true,
            defaultAllocatedCount: 3,
          },
        ],
      },
    ],
  },
];

// Synthetic crisis scenario data for LIFELINK Mass-Casualty Command Simulation
// Strictly synthetic / mock data for decision-support simulation demonstration

export const SYNTHETIC_INCIDENT = {
  incidentId: "MCI-2026-OMEGA-04",
  codename: "CENTRAL LOGISTICS HUB EXPLOSION & STRUCTURAL COLLAPSE",
  location: "Metro Industrial Corridor, Sector 7",
  declaredAt: "11:42:00",
  elapsedMinutes: 14,
  severityLevel: "LEVEL 3 MASS CASUALTY (CODE BLACK)",
  coordinates: {
    lat: 37.7749,
    lng: -122.4194,
  },
  
  // Target Numbers
  statistics: {
    totalVictims: 214,
    critical: 31,      // Red triage
    serious: 67,       // Yellow triage
    moderate: 82,      // Green triage
    unknown: 34,       // Unreached / rubble
    totalAmbulances: 5,
    activeAmbulances: 5,
    totalHospitals: 3,
    totalIcuBeds: 4,    // Extremely severe deficit (31 critical vs 4 ICU beds)
    unassignedCritical: 27, // 31 critical - 4 currently being extricated/transported
  },

  // Geographic Breakdown into Sectors / Victim Zones
  victimZones: [
    {
      id: "ZONE-ALPHA",
      name: "Sector Alpha — Structural Collapse Epicenter",
      description: "Warehouse B roof collapse & heavy industrial machinery crush zone",
      coordinates: [37.7765, -122.4180],
      radiusMeters: 280,
      totalVictims: 98,
      triage: { critical: 18, serious: 34, moderate: 32, unknown: 14 },
      hazard: "HIGH: Structural Instability / Active Rubble Settling",
      accessStatus: "RESTRICTED (Heavy Rescue Extrication Active)",
    },
    {
      id: "ZONE-BRAVO",
      name: "Sector Bravo — Chemical Vapor & Perimeter Highway",
      description: "Ammonia transfer pipeline rupture with toxic vapor dispersion",
      coordinates: [37.7725, -122.4230],
      radiusMeters: 350,
      totalVictims: 72,
      triage: { critical: 9, serious: 24, moderate: 28, unknown: 11 },
      hazard: "CRITICAL: Toxic Chemical Inhalation Plume",
      accessStatus: "HAZMAT LEVEL B REQUIRED",
    },
    {
      id: "ZONE-CHARLIE",
      name: "Sector Charlie — Commuter Transit Concourse",
      description: "Secondary blast shockwave impact on commuter transit terminal",
      coordinates: [37.7710, -122.4140],
      radiusMeters: 220,
      totalVictims: 44,
      triage: { critical: 4, serious: 9, moderate: 22, unknown: 9 },
      hazard: "MODERATE: Flying Glass Shards & Stampede Crush",
      accessStatus: "ACCESSIBLE (Field Triage Staging Area Active)",
    },
  ],

  // 3 Metropolitan Receiving Hospitals
  hospitals: [
    {
      id: "HOSP-01",
      name: "Metro Trauma Center",
      type: "Level 1 Trauma Center",
      coordinates: [37.7870, -122.4040],
      icuBedsAvailable: 2,
      icuTotalBeds: 28,
      operatingRoomsOpen: 2,
      burnBedsAvailable: 1,
      surgeCapacityStatus: "SURGE DEFICIT (93% Occupied)",
      bloodUnitsONeg: 6,
      specialties: ["Neurosurgery", "Thoracic", "Vascular", "Ortho-Trauma"],
      etaMinutes: 8.2,
      distanceKm: 4.8,
    },
    {
      id: "HOSP-02",
      name: "St. Jude Regional Hospital",
      type: "Level 2 Emergency Hospital",
      coordinates: [37.7610, -122.4410],
      icuBedsAvailable: 1,
      icuTotalBeds: 18,
      operatingRoomsOpen: 1,
      burnBedsAvailable: 0,
      surgeCapacityStatus: "CRITICAL CAPACITY (95% Occupied)",
      bloodUnitsONeg: 3,
      specialties: ["General Trauma", "Orthopedic Surgery", "Emergency Medicine"],
      etaMinutes: 12.5,
      distanceKm: 6.2,
    },
    {
      id: "HOSP-03",
      name: "Harborview Memorial Medical",
      type: "Level 2 Specialized Facility",
      coordinates: [37.7550, -122.3920],
      icuBedsAvailable: 1,
      icuTotalBeds: 16,
      operatingRoomsOpen: 1,
      burnBedsAvailable: 3,
      surgeCapacityStatus: "SURGE ACTIVE (94% Occupied)",
      bloodUnitsONeg: 4,
      specialties: ["Burn Intensive Care", "Pediatric Trauma", "Toxicology"],
      etaMinutes: 14.1,
      distanceKm: 7.9,
    },
  ],

  // 5 Active Emergency Medical Units (Ambulances)
  ambulances: [
    {
      id: "AMB-01",
      callsign: "Medic 1",
      type: "ALS (Advanced Life Support)",
      coordinates: [37.7770, -122.4160],
      status: "DISPATCHED TO SCENE",
      assignedTo: "Zone Alpha (Victim P-01 - Tension Pneumothorax)",
      etaSceneMinutes: 2.1,
      crewLead: "Paramedic Capt. Vance",
      equipment: ["Mechanical Ventilator", "Lucas CPR", "Chest Decompression Kit"],
    },
    {
      id: "AMB-02",
      callsign: "Medic 2",
      type: "ALS (Advanced Life Support)",
      coordinates: [37.7810, -122.4110],
      status: "TRANSPORTING",
      assignedTo: "Metro Trauma (Victim P-04 - Severe Head Trauma)",
      etaHospitalMinutes: 5.4,
      crewLead: "Paramedic Lt. O'Connor",
      equipment: ["Ventilator", "Video Laryngoscope", "Blood Warmer"],
    },
    {
      id: "AMB-03",
      callsign: "Medic 3",
      type: "BLS (Basic Life Support)",
      coordinates: [37.7705, -122.4190],
      status: "STAGED AT PERIMETER",
      assignedTo: "Zone Charlie Staging Area (Awaiting Priority Extrication)",
      etaSceneMinutes: 0.0,
      crewLead: "EMT S. Ramirez",
      equipment: ["AED", "Spinal Immobilization", "Oxygen Delivery"],
    },
    {
      id: "AMB-04",
      callsign: "Medic 4",
      type: "ALS (Advanced Life Support)",
      coordinates: [37.7740, -122.4210],
      status: "EXTRICATING CASUALTY",
      assignedTo: "Zone Bravo (Victim P-07 - Toxic Inhalation / Cyanide Kit Prepped)",
      etaSceneMinutes: 1.0,
      crewLead: "Paramedic J. Morales",
      equipment: ["Cyanokit", "PAPR Respiratory Protection", "Advanced Airway"],
    },
    {
      id: "AMB-05",
      callsign: "Medic 5",
      type: "BLS (Basic Life Support)",
      coordinates: [37.7670, -122.4330],
      status: "TRANSPORTING",
      assignedTo: "St. Jude Regional (2x Moderate Crush Casualties)",
      etaHospitalMinutes: 7.8,
      crewLead: "EMT D. Miller",
      equipment: ["Traction Splints", "Mass-Casualty Bandage Cache"],
    },
  ],

  // Road Closures and Transit Disruptions
  roadDisruptions: [
    {
      id: "ROAD-01",
      name: "Highway 101 Southbound @ Industrial Overpass 4",
      status: "SEVERED / FULL CLOSURE",
      reason: "Structural concrete debris & overturned 10,000-gal fuel tanker",
      detourPenaltyMinutes: 14.0,
      coordinatesStart: [37.7780, -122.4140],
      coordinatesEnd: [37.7720, -122.4080],
    },
    {
      id: "ROAD-02",
      name: "Grand Avenue West Corridor",
      status: "CONGESTED / EMERGENCY VEHICLES ONLY",
      reason: "Evacuation traffic bottleneck, restricted to priority emergency convoys",
      detourPenaltyMinutes: 6.5,
      coordinatesStart: [37.7730, -122.4270],
      coordinatesEnd: [37.7680, -122.4380],
    },
  ],

  // Priority Actions for Commander
  priorityActions: [
    {
      id: "ACT-01",
      title: "DECLARE CRISIS STANDARDS OF CARE",
      severity: "CRITICAL",
      description: "Severe ICU deficit (31 critical vs 4 available ICU beds). Authorize field reverse triage and expedite discharge of non-acute hospital patients.",
      suggestedAction: "Authorize Metropolitan Crisis Standard Declaration",
      badge: "DECISION REQUIRED",
    },
    {
      id: "ACT-02",
      title: "REQUEST STATE MUTUAL AID (REGION II TIER 3)",
      severity: "URGENT",
      description: "Local fleet exhausted (5 of 5 units committed). Request 15 additional mutual-aid ALS transport units from adjacent county.",
      suggestedAction: "Transmit Automated Mutual Aid Dispatch Call",
      badge: "FLEET EXHAUSTED",
    },
    {
      id: "ACT-03",
      title: "AIR-MEDICAL CASUALTY EVACUATION",
      severity: "URGENT",
      description: "Activate 2x Medevac Helicopters to bypass severed Hwy 101 corridor for 2 critical pediatric/burn victims to Harborview Memorial.",
      suggestedAction: "Clear Industrial Park LZ Heli-pad",
      badge: "AIRWAY PRIORITY",
    },
  ],

  // Operational Alerts
  alerts: [
    {
      id: "ALT-01",
      type: "CRITICAL_DEFICIT",
      timestamp: "11:51:30",
      title: "MASSIVE ICU BED SHORTAGE",
      message: "31 Critical (Red) casualties tracked. Only 4 ICU beds remaining in regional network. Mortality risk escalating if unassigned critical exceed 45-min Golden Hour.",
    },
    {
      id: "ALT-02",
      type: "INFRASTRUCTURE",
      timestamp: "11:49:00",
      title: "CORRIDOR SEVERED: HWY 101 OVERPASS 4",
      message: "Direct arterial route to Metro Trauma Center blocked by collapsed concrete gantry. Diverting Medic 2 via Harbor Underpass (+5.2 min transit penalty).",
    },
    {
      id: "ALT-03",
      type: "HAZMAT",
      timestamp: "11:46:15",
      title: "TOXIC AMMONIA PLUME SPREADING SOUTH-EAST",
      message: "Sector Bravo wind shift (12 knots SE). Triage Post Alpha ordered to don Level C respiratory protection.",
    },
  ],

  // Incident Chronological Timeline
  timeline: [
    {
      time: "11:42:00",
      category: "DISPATCH",
      title: "Incident Reported — Central Logistics Hub",
      detail: "Multiple 911 calls reporting explosion, secondary structural collapse, and toxic vapor release.",
    },
    {
      time: "11:43:20",
      category: "COMMAND",
      title: "Mass Casualty Incident Level 3 Declared",
      detail: "Battalion Chief 4 establishes on-scene command. All regional EMS units switched to tactical TAC-1.",
    },
    {
      time: "11:45:50",
      category: "TRIAGE",
      title: "Initial Casualty Estimation: 214 Victims",
      detail: "Field triage officers estimate 31 Critical (Red), 67 Serious (Yellow), 82 Moderate (Green), 34 Unknown in rubble.",
    },
    {
      time: "11:47:10",
      category: "HOSPITAL",
      title: "Hospital Bed Availability Poll Completed",
      detail: "Regional telemetry poll returns 4 available ICU beds across Metro Trauma (2), St. Jude (1), Harborview (1).",
    },
    {
      time: "11:49:00",
      category: "OBSTACLE",
      title: "Highway 101 Southbound Severed at Overpass 4",
      detail: "Concrete debris blocks road corridor. Routing engine updates transit matrices to detour via Grand Ave.",
    },
    {
      time: "11:51:15",
      category: "DISPATCH",
      title: "All 5 Local Ambulances Committed",
      detail: "Ambulance fleet utilization hits 100%. 27 Critical casualties remain awaiting secondary transport wave.",
    },
    {
      time: "11:53:40",
      category: "ALERT",
      title: "Crisis Standards of Care Threshold Reached",
      detail: "Casualty arrival rate exceeds regional acute care capacity by factor of 7.75x.",
    },
  ],
};

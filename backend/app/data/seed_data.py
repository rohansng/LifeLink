"""Synthetic seed data for LifeLink Train Derailment & Mass Casualty Scenario.

Strictly synthetic data for decision-support simulation demonstration.
"""

from typing import Dict, List
from backend.app.models import (
    Ambulance,
    AmbulanceStatus,
    AmbulanceType,
    EventCategory,
    EventSeverity,
    Hospital,
    HospitalBloodInventory,
    Incident,
    IncidentEvent,
    IncidentSector,
    IncidentStatistics,
    Location,
    Recommendation,
    RecommendationSeverity,
    RecommendationStatus,
    Resource,
    ResourceCategory,
    ResourceStatus,
    Responder,
    ResponderRole,
    ResponderStatus,
    Road,
    RoadStatus,
    Victim,
    VictimSeverity,
    VictimStatus,
)


def get_seed_incident() -> Incident:
    return Incident(
        id="INC-2026-OMEGA-04",
        codename="CENTRAL FREIGHT DERAILMENT & CHEMICAL TANKER RUPTURE",
        type="Train Derailment / Toxic Inhalation / Structural Collapse",
        severity="Level 3 Mass Casualty (Code Black)",
        location=Location(
            latitude=12.9716,
            longitude=77.5946,
            address="Bengaluru Central Rail Freight Corridor, Sector 7, Bengaluru, Karnataka 560001",
            sector="Sector 7",
        ),
        declared_at="11:42:00",
        elapsed_minutes=14,
        status="active",
        summary="High-speed freight train derailment with 3 overturned pressurized ammonia tankers and catastrophic structural collapse of adjacent warehouse complex. 214 casualties reported across 3 primary impact sectors.",
        sectors=[
            IncidentSector(
                id="ZONE-ALPHA",
                name="Sector Alpha — Structural Collapse Epicenter",
                description="Warehouse B roof collapse & heavy industrial machinery crush zone",
                location=Location(latitude=12.9765, longitude=77.5980, sector="Sector Alpha"),
                radius_meters=280.0,
                total_victims=98,
                critical_count=18,
                serious_count=34,
                moderate_count=32,
                unknown_count=14,
                hazard="HIGH: Structural Instability / Active Rubble Settling",
                access_status="RESTRICTED (Heavy Rescue Extrication Active)",
            ),
            IncidentSector(
                id="ZONE-BRAVO",
                name="Sector Bravo — Chemical Vapor & Perimeter Highway",
                description="Ammonia transfer pipeline rupture with toxic vapor dispersion",
                location=Location(latitude=12.9725, longitude=77.5910, sector="Sector Bravo"),
                radius_meters=350.0,
                total_victims=72,
                critical_count=9,
                serious_count=24,
                moderate_count=28,
                unknown_count=11,
                hazard="CRITICAL: Toxic Chemical Inhalation Plume",
                access_status="HAZMAT LEVEL B REQUIRED",
            ),
            IncidentSector(
                id="ZONE-CHARLIE",
                name="Sector Charlie — Commuter Transit Concourse",
                description="Secondary blast shockwave impact on commuter transit terminal",
                location=Location(latitude=12.9680, longitude=77.5990, sector="Sector Charlie"),
                radius_meters=220.0,
                total_victims=44,
                critical_count=4,
                serious_count=9,
                moderate_count=22,
                unknown_count=9,
                hazard="MODERATE: Flying Glass Shards & Stampede Crush",
                access_status="ACCESSIBLE (Field Triage Staging Area Active)",
            ),
        ],
        statistics=IncidentStatistics(
            total_victims=214,
            critical=31,
            serious=67,
            moderate=82,
            unknown=34,
            total_ambulances=5,
            active_ambulances=5,
            total_hospitals=3,
            total_icu_beds=4,
            unassigned_critical=27,
        ),
    )


def get_seed_victims() -> List[Victim]:
    """Generates the 214 victims across the crisis sectors."""
    victims = []
    
    # 31 Critical (Red) Victims
    for i in range(1, 32):
        v_id = f"V{i:03d}"
        if i <= 18:
            sector = "Sector Alpha"
            lat, lon = 12.9765 + (i * 0.0001), 77.5980 + (i * 0.0001)
            cap = "neurosurgery" if i % 2 == 0 else "trauma"
            note = "Severe crush trauma with intracranial hemorrhage and unequal pupils"
        elif i <= 27:
            sector = "Sector Bravo"
            lat, lon = 12.9725 + (i * 0.0001), 77.5910 - (i * 0.0001)
            cap = "cardiothoracic" if i % 2 == 0 else "burn"
            note = "Toxic ammonia inhalation, chemical pneumonitis, upper airway compromise"
        else:
            sector = "Sector Charlie"
            lat, lon = 12.9680 - (i * 0.0001), 77.5990 + (i * 0.0001)
            cap = "trauma"
            note = "Pelvic fracture with hemorrhagic shock"

        # Mark 4 critical victims as actively being assisted
        if i == 1:
            status = VictimStatus.EXTRICATING
            amb_id = "AMB-01"
            hosp_id = "H-A"
        elif i == 4:
            status = VictimStatus.IN_TRANSIT
            amb_id = "AMB-02"
            hosp_id = "H-A"
        elif i == 7:
            status = VictimStatus.EXTRICATING
            amb_id = "AMB-04"
            hosp_id = "H-C"
        elif i == 12:
            status = VictimStatus.ASSIGNED
            amb_id = "AMB-05"
            hosp_id = "H-B"
        else:
            status = VictimStatus.UNASSIGNED
            amb_id = None
            hosp_id = None

        # Ensure exact balance: 31 Critical, 67 Serious, 82 Moderate, 34 Unknown
        if i == 30:
            sev = VictimSeverity.SERIOUS
            tag = "YELLOW"
            cap = "orthopedic"
            note = "Compound lower extremity fracture, hemodynamically stable"
        elif i == 31:
            sev = VictimSeverity.MODERATE
            tag = "GREEN"
            cap = "general"
            note = "Ambulatory, facial abrasions and minor smoke inhalation"
        else:
            sev = VictimSeverity.CRITICAL
            tag = "RED"

        victims.append(
            Victim(
                id=v_id,
                severity=sev,
                location=Location(latitude=lat, longitude=lon, sector=sector),
                required_capability=cap,
                status=status,
                triage_tag=tag,
                assigned_ambulance_id=amb_id,
                assigned_hospital_id=hosp_id,
                notes=note,
            )
        )

    # 67 Serious (Yellow) & Emergent Victims (V032 to V098)
    for i in range(32, 99):
        v_id = f"V{i:03d}"
        sector = "Sector Alpha" if i <= 65 else ("Sector Bravo" if i <= 89 else "Sector Charlie")
        
        # Specific showcase casualties
        if i == 41:
            # V041: Critical chest trauma requiring Trauma center
            sev = VictimSeverity.CRITICAL
            tag = "RED"
            cap = "trauma"
            note = "Critical blunt thoracic trauma, acute respiratory compromise"
        elif i == 83:
            # V083: Critical bleeding requiring Trauma + ICU
            sev = VictimSeverity.CRITICAL
            tag = "RED"
            cap = "trauma + icu"
            note = "Critical bleeding from pelvic crush injury, hypovolemic shock"
        else:
            sev = VictimSeverity.SERIOUS
            tag = "YELLOW"
            cap = "orthopedic" if i % 2 == 0 else "trauma"
            note = "Compound extremity fracture or blunt abdominal trauma, vitals stable"

        victims.append(
            Victim(
                id=v_id,
                severity=sev,
                location=Location(latitude=12.9740 + (i * 0.00005), longitude=77.5940 + (i * 0.00005), sector=sector),
                required_capability=cap,
                status=VictimStatus.UNASSIGNED,
                triage_tag=tag,
                notes=note,
            )
        )

    # 82 Moderate (Green) & Delayed Surgical Victims (V099 to V180)
    for i in range(99, 181):
        v_id = f"V{i:03d}"
        if i == 112:
            # V112: Serious compound fracture requiring Surgery
            sev = VictimSeverity.SERIOUS
            tag = "YELLOW"
            cap = "surgery"
            note = "Serious open compound fracture requiring immediate surgical reduction"
        else:
            sev = VictimSeverity.MODERATE
            tag = "GREEN"
            cap = "general"
            note = "Ambulatory, facial lacerations, mild particulate inhalation"

        victims.append(
            Victim(
                id=v_id,
                severity=sev,
                location=Location(latitude=12.9730 + (i * 0.00004), longitude=77.5960 + (i * 0.00004), sector="Sector Charlie"),
                required_capability=cap,
                status=VictimStatus.UNASSIGNED,
                triage_tag=tag,
                notes=note,
            )
        )

    # 34 Unknown (in rubble) Victims (V181 to V214)
    for i in range(181, 215):
        v_id = f"V{i:03d}"
        sector = "Sector Alpha" if i <= 194 else ("Sector Bravo" if i <= 205 else "Sector Charlie")
        victims.append(
            Victim(
                id=v_id,
                severity=VictimSeverity.UNKNOWN,
                location=Location(latitude=12.9760 + (i * 0.00003), longitude=77.5980 - (i * 0.00003), sector=sector),
                required_capability="trauma",
                status=VictimStatus.UNASSIGNED,
                triage_tag="UNKNOWN",
                notes="Trapped beneath collapsed structural elements; acoustic sensor detected tapping",
            )
        )

    return victims


def get_seed_ambulances() -> List[Ambulance]:
    return [
        Ambulance(
            id="AMB-01",
            callsign="Medic 1",
            type=AmbulanceType.ALS,
            status=AmbulanceStatus.DISPATCHED,
            location=Location(latitude=12.9770, longitude=77.5970, sector="Sector Alpha"),
            capacity=1,
            assigned_victim_id="V001",
            destination_hospital_id="H-A",
            assignment_description="Zone Alpha (Victim V001 - Tension Pneumothorax)",
            eta_scene_minutes=2.1,
            crew_lead="Paramedic Capt. Vance",
            equipment=["Mechanical Ventilator", "Lucas CPR", "Chest Decompression Kit"],
        ),
        Ambulance(
            id="AMB-02",
            callsign="Medic 2",
            type=AmbulanceType.ALS,
            status=AmbulanceStatus.TRANSPORTING,
            location=Location(latitude=12.9810, longitude=77.6010, sector="Metro Transit Corridor"),
            capacity=1,
            assigned_victim_id="V004",
            destination_hospital_id="H-A",
            assignment_description="Metro Trauma (Victim V004 - Severe Head Trauma)",
            eta_hospital_minutes=5.4,
            crew_lead="Paramedic Lt. O'Connor",
            equipment=["Ventilator", "Video Laryngoscope", "Blood Warmer"],
        ),
        Ambulance(
            id="AMB-03",
            callsign="Medic 3",
            type=AmbulanceType.BLS,
            status=AmbulanceStatus.STAGED,
            location=Location(latitude=12.9675, longitude=77.5940, sector="Sector Charlie Staging"),
            capacity=2,
            assigned_victim_id=None,
            destination_hospital_id=None,
            assignment_description="Zone Charlie Staging Area (Awaiting Priority Extrication)",
            eta_scene_minutes=0.0,
            crew_lead="EMT S. Ramirez",
            equipment=["AED", "Spinal Immobilization", "Oxygen Delivery"],
        ),
        Ambulance(
            id="AMB-04",
            callsign="Medic 4",
            type=AmbulanceType.ALS,
            status=AmbulanceStatus.EXTRICATING,
            location=Location(latitude=12.9740, longitude=77.5920, sector="Sector Bravo"),
            capacity=1,
            assigned_victim_id="V007",
            destination_hospital_id="H-C",
            assignment_description="Zone Bravo (Victim V007 - Toxic Inhalation)",
            eta_scene_minutes=1.0,
            crew_lead="Paramedic J. Morales",
            equipment=["Cyanokit", "PAPR Respiratory Protection", "Advanced Airway"],
        ),
        Ambulance(
            id="AMB-05",
            callsign="Medic 5",
            type=AmbulanceType.BLS,
            status=AmbulanceStatus.TRANSPORTING,
            location=Location(latitude=12.9640, longitude=77.5800, sector="Southwest Corridor"),
            capacity=2,
            assigned_victim_id="V012",
            destination_hospital_id="H-B",
            assignment_description="St. Jude Regional (Victim V012 & V035)",
            eta_hospital_minutes=7.8,
            crew_lead="EMT D. Miller",
            equipment=["Traction Splints", "Mass-Casualty Bandage Cache"],
        ),
    ]


def get_seed_hospitals() -> List[Hospital]:
    return [
        Hospital(
            id="H-A",
            name="Metro Trauma Center",
            type="Level 1 Trauma Center",
            location=Location(latitude=12.9630, longitude=77.5750, address="Victoria Hospital Complex, Fort, Bengaluru"),
            icu=0,
            icu_total=28,
            trauma_available=False,
            operating_rooms_open=0,
            burn_beds_available=1,
            ventilators_available=0,
            doctors_available=2,
            trauma_teams_available=0,
            blood=HospitalBloodInventory(O_negative=18, O_positive=14, A_positive=28),
            supported_specialties=["Neurosurgery", "Thoracic", "Vascular", "Ortho-Trauma", "General Trauma"],
            eta_minutes=8.2,
            distance_km=4.8,
            status="CRITICAL SATURATION (100% ICU & Trauma Occupied)",
        ),
        Hospital(
            id="H-B",
            name="St. Jude Regional Hospital",
            type="Level 2 Emergency Hospital",
            location=Location(latitude=12.9725, longitude=77.5880, address="St. Martha's Emergency Wing, Nrupathunga Rd, Bengaluru"),
            icu=2,
            icu_total=18,
            trauma_available=True,
            operating_rooms_open=1,
            burn_beds_available=0,
            ventilators_available=2,
            doctors_available=4,
            trauma_teams_available=1,
            blood=HospitalBloodInventory(O_negative=3, O_positive=8, A_positive=15),
            supported_specialties=["General Trauma", "Orthopedic Surgery", "Emergency Medicine"],
            eta_minutes=13.0,
            distance_km=6.2,
            status="CRITICAL CAPACITY (95% Occupied)",
        ),
        Hospital(
            id="H-C",
            name="Harborview Memorial Medical",
            type="Level 2 Specialized Facility",
            location=Location(latitude=12.9830, longitude=77.6050, address="Bowring & Lady Curzon Hospital, Shivaji Nagar, Bengaluru"),
            icu=2,
            icu_total=16,
            trauma_available=True,
            operating_rooms_open=1,
            burn_beds_available=3,
            ventilators_available=2,
            doctors_available=3,
            trauma_teams_available=1,
            blood=HospitalBloodInventory(O_negative=4, O_positive=11, A_positive=19),
            supported_specialties=["Burn Intensive Care", "Pediatric Trauma", "Toxicology", "General Trauma"],
            eta_minutes=14.1,
            distance_km=7.9,
            status="SURGE ACTIVE (94% Occupied)",
        ),
    ]


def get_seed_resources() -> List[Resource]:
    return [
        Resource(
            id="RES-01",
            name="HazMat Decontamination Trailer Unit",
            category=ResourceCategory.HAZMAT,
            status=ResourceStatus.DEPLOYED,
            quantity=2,
            unit="trailers",
            location=Location(latitude=12.9730, longitude=77.5920, sector="Sector Bravo Perimeter"),
            allocated_to="Zone Bravo",
            notes="Active gross decontam shower for ammonia-exposed casualties",
        ),
        Resource(
            id="RES-02",
            name="Cyanokit / Hydroxocobalamin Antidote Cache",
            category=ResourceCategory.MEDICAL_SUPPLIES,
            status=ResourceStatus.DEPLOYED,
            quantity=12,
            unit="kits",
            location=Location(latitude=12.9740, longitude=77.5910, sector="Sector Bravo"),
            allocated_to="Medic 4",
            notes="Antidotes for combustion by-product and toxic inhalations",
        ),
        Resource(
            id="RES-03",
            name="Medevac 1 Air Rescue Helicopter",
            category=ResourceCategory.AIR_TRANSPORT,
            status=ResourceStatus.AVAILABLE,
            quantity=1,
            unit="aircraft",
            location=Location(latitude=12.9800, longitude=77.6000, address="Bengaluru HAL Helipad"),
            allocated_to=None,
            notes="Available for air-bridge bypass of severed highway corridor",
        ),
        Resource(
            id="RES-04",
            name="Mass Casualty Splint & Bandage Pod",
            category=ResourceCategory.MEDICAL_SUPPLIES,
            status=ResourceStatus.DEPLOYED,
            quantity=150,
            unit="kits",
            location=Location(latitude=12.9680, longitude=77.5990, sector="Sector Charlie"),
            allocated_to="Zone Charlie",
            notes="Field dressing supplies for walking wounded and delayed victims",
        ),
        Resource(
            id="RES-05",
            name="Mobile Negative-Pressure Triage Tent",
            category=ResourceCategory.INFRASTRUCTURE,
            status=ResourceStatus.DEPLOYED,
            quantity=1,
            unit="tent",
            location=Location(latitude=12.9680, longitude=77.5990, sector="Sector Charlie"),
            allocated_to="Zone Charlie",
            notes="Field stabilization facility with 12 stretcher bays",
        ),
        Resource(
            id="RES-06",
            name="USAR Heavy Rescue Squad 1 (Metro Technical Rescue)",
            category=ResourceCategory.INFRASTRUCTURE,
            status=ResourceStatus.DEPLOYED,
            quantity=1,
            unit="squad",
            location=Location(latitude=12.9765, longitude=77.5980, sector="Sector Alpha"),
            allocated_to="Zone Alpha Collapse Zone",
            notes="Heavy pneumatic shoring & acoustic search sensors for trapped casualties",
        ),
        Resource(
            id="RES-07",
            name="USAR Heavy Rescue Squad 2 (County Extrication)",
            category=ResourceCategory.INFRASTRUCTURE,
            status=ResourceStatus.DEPLOYED,
            quantity=1,
            unit="squad",
            location=Location(latitude=12.9725, longitude=77.5910, sector="Sector Bravo"),
            allocated_to="Zone Bravo Tanker Rubble",
            notes="Hydraulic cutters, spreaders and thermal search for entrapped victims",
        ),
    ]


def get_seed_roads() -> List[Road]:
    return [
        Road(
            id="ROAD-01",
            name="Outer Ring Road / Industrial Overpass 4",
            status=RoadStatus.CLOSED,
            reason="Structural concrete debris & overturned 10,000-gal fuel tanker",
            detour_penalty_minutes=14.0,
            start_latitude=12.9780,
            start_longitude=77.5990,
            end_latitude=12.9720,
            end_longitude=77.6040,
        ),
        Road(
            id="ROAD-02",
            name="Kasturba Arterial Corridor",
            status=RoadStatus.CONGESTED,
            reason="Evacuation bottleneck; restricted to priority emergency convoys",
            detour_penalty_minutes=6.5,
            start_latitude=12.9730,
            start_longitude=77.5910,
            end_latitude=12.9680,
            end_longitude=77.5820,
        ),
    ]


def get_seed_responders() -> List[Responder]:
    return [
        Responder(
            id="RESP-01",
            name="Battalion Capt. Marcus Vance",
            agency="Metro Fire & Rescue",
            role=ResponderRole.INCIDENT_COMMANDER,
            status=ResponderStatus.ON_SCENE,
            location=Location(latitude=12.9750, longitude=77.5980, sector="Command Post 1"),
            assigned_sector="Unified Command Post",
            radio_channel="TAC-1",
        ),
        Responder(
            id="RESP-02",
            name="Paramedic Lt. Sarah O'Connor",
            agency="City EMS Command",
            role=ResponderRole.TRIAGE_OFFICER,
            status=ResponderStatus.ON_SCENE,
            location=Location(latitude=12.9765, longitude=77.5980, sector="Sector Alpha"),
            assigned_sector="Sector Alpha Triage",
            radio_channel="TAC-2",
        ),
        Responder(
            id="RESP-03",
            name="Capt. Jorge Morales",
            agency="HazMat Task Force 1",
            role=ResponderRole.HAZMAT_SPECIALIST,
            status=ResponderStatus.ON_SCENE,
            location=Location(latitude=12.9725, longitude=77.5910, sector="Sector Bravo"),
            assigned_sector="Sector Bravo Hot Zone",
            radio_channel="HAZMAT-1",
        ),
        Responder(
            id="RESP-04",
            name="EMT Specialist Sandra Ramirez",
            agency="City EMS Command",
            role=ResponderRole.LEAD_PARAMEDIC,
            status=ResponderStatus.STAGING,
            location=Location(latitude=12.9680, longitude=77.5990, sector="Sector Charlie"),
            assigned_sector="Sector Charlie Staging",
            radio_channel="TAC-3",
        ),
        Responder(
            id="RESP-05",
            name="Dr. Angela Reyes, MD",
            agency="Metro Trauma Emergency Control",
            role=ResponderRole.INCIDENT_COMMANDER,
            status=ResponderStatus.ON_SCENE,
            location=Location(latitude=12.9630, longitude=77.5750, sector="Hospital Command"),
            assigned_sector="Regional Medical Direction",
            radio_channel="MED-COMM",
        ),
    ]


def get_seed_events() -> List[IncidentEvent]:
    return [
        IncidentEvent(
            id="EVT-01",
            timestamp="11:42:00",
            category=EventCategory.DISPATCH,
            title="Freight Train Derailment Reported",
            detail="911 calls report locomotive derailment, multi-car pileup, and structural collapse at Central Logistics corridor.",
            severity=EventSeverity.CRITICAL,
        ),
        IncidentEvent(
            id="EVT-02",
            timestamp="11:43:20",
            category=EventCategory.COMMAND,
            title="Mass Casualty Incident Level 3 Declared",
            detail="Battalion Chief 4 establishes unified on-scene command. Mutual aid alert triggered.",
            severity=EventSeverity.CRITICAL,
        ),
        IncidentEvent(
            id="EVT-03",
            timestamp="11:45:50",
            category=EventCategory.TRIAGE,
            title="214 Casualties Estimated",
            detail="Field triage reports 31 Red, 67 Yellow, 82 Green, and 34 Unknown in structural collapse zones.",
            severity=EventSeverity.WARNING,
        ),
        IncidentEvent(
            id="EVT-04",
            timestamp="11:47:10",
            category=EventCategory.HOSPITAL,
            title="Hospital Bed Capacity Sweep Completed",
            detail="Regional EMR telemetry returns only 4 available ICU beds across Metro Trauma (2), St. Jude (1), and Harborview (1).",
            severity=EventSeverity.CRITICAL,
        ),
        IncidentEvent(
            id="EVT-05",
            timestamp="11:49:00",
            category=EventCategory.OBSTACLE,
            title="Highway 101 South Severed at Overpass 4",
            detail="Collapsed gantry debris blocks road corridor. Rerouting traffic via Grand Ave (+14m detour).",
            severity=EventSeverity.WARNING,
        ),
        IncidentEvent(
            id="EVT-06",
            timestamp="11:51:15",
            category=EventCategory.DISPATCH,
            title="Ambulance Fleet Capacity Exhausted",
            detail="All 5 emergency units committed. 27 critical casualties lack immediate transport allocation.",
            severity=EventSeverity.CRITICAL,
        ),
        IncidentEvent(
            id="EVT-07",
            timestamp="11:53:40",
            category=EventCategory.ALERT,
            title="Crisis Standards of Care Threshold Reached",
            detail="Critical patient load exceeds available regional ICU capacity by a factor of 7.75x.",
            severity=EventSeverity.CRITICAL,
        ),
    ]


def get_seed_recommendations() -> List[Recommendation]:
    return [
        Recommendation(
            id="REC-01",
            title="DECLARE CRISIS STANDARDS OF CARE",
            severity=RecommendationSeverity.CRITICAL,
            status=RecommendationStatus.PENDING,
            action_type="REVERSE_TRIAGE",
            explanation="Regional ICU capacity deficit is extreme: 31 critical casualties competing for 4 available ICU beds (7.75x deficit). Authorizing crisis standards of care permits reverse triage, expediting the discharge of stabilized ward patients to free critical care monitors and nursing staff.",
            suggested_action="Authorize Crisis Standards Declaration",
            badge="DECISION REQUIRED",
        ),
        Recommendation(
            id="REC-02",
            title="REQUEST STATE MUTUAL AID (REGION II TIER 3)",
            severity=RecommendationSeverity.URGENT,
            status=RecommendationStatus.PENDING,
            action_type="MUTUAL_AID",
            explanation="The municipal ambulance fleet is 100% committed (5 of 5 units). 27 critical red-triage patients remain unassigned at the scene. Requesting 15 mutual-aid ALS transport units from adjacent county will reduce the arrival gap by 42 minutes.",
            suggested_action="Transmit Automated Mutual Aid Dispatch Call",
            badge="FLEET EXHAUSTED",
        ),
        Recommendation(
            id="REC-03",
            title="AIR-MEDICAL CASUALTY EVACUATION",
            severity=RecommendationSeverity.URGENT,
            status=RecommendationStatus.PENDING,
            action_type="AIR_EVAC",
            explanation="Highway 101 is severed at Overpass 4 (+14 min detour). Dispatching Medevac 1 to the Industrial Park helipad allows direct aerial transport of 2 severe pediatric burn/crush casualties to Harborview Memorial, completely bypassing road bottlenecks.",
            suggested_action="Clear Industrial Park LZ Heli-pad",
            badge="AIRWAY PRIORITY",
        ),
    ]

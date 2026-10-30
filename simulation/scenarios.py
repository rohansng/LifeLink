"""Pre-configured mass-casualty crisis scenarios for LifeLink testing."""

from typing import List, Tuple
from optimization.schemas import (
    Ambulance,
    AmbulanceType,
    Hospital,
    MedicalSpecialty,
    Patient,
    TriageCategory,
)
from simulation.events import DisruptionType, SimulationEvent


def load_highway_101_mci_scenario() -> Tuple[List[Patient], List[Ambulance], List[Hospital], List[SimulationEvent]]:
    """Highway 101 Mass Casualty Collision Scenario with subsequent road blockage & ICU drop."""
    patients = [
        Patient(
            id="P-01",
            latitude=37.7710,
            longitude=-122.4180,
            triage_category=TriageCategory.RED,
            urgency_weight=96.0,
            required_specialties=[MedicalSpecialty.NEUROSURGERY, MedicalSpecialty.GENERAL_TRAUMA],
            stabilization_time_minutes=8.0,
            golden_hour_deadline_minutes=35.0,
        ),
        Patient(
            id="P-02",
            latitude=37.7712,
            longitude=-122.4185,
            triage_category=TriageCategory.RED,
            urgency_weight=90.0,
            required_specialties=[MedicalSpecialty.CARDIOTHORACIC],
            stabilization_time_minutes=6.0,
            golden_hour_deadline_minutes=40.0,
        ),
        Patient(
            id="P-03",
            latitude=37.7715,
            longitude=-122.4178,
            triage_category=TriageCategory.YELLOW,
            urgency_weight=65.0,
            required_specialties=[MedicalSpecialty.ORTHOPEDIC],
            stabilization_time_minutes=4.0,
        ),
        Patient(
            id="P-04",
            latitude=37.7718,
            longitude=-122.4182,
            triage_category=TriageCategory.YELLOW,
            urgency_weight=55.0,
            stabilization_time_minutes=3.0,
        ),
        Patient(
            id="P-05",
            latitude=37.7720,
            longitude=-122.4190,
            triage_category=TriageCategory.GREEN,
            urgency_weight=20.0,
            stabilization_time_minutes=2.0,
        ),
    ]

    ambulances = [
        Ambulance(id="AMB-01", callsign="Medic 1 (ALS)", latitude=37.7650, longitude=-122.4120, ambulance_type=AmbulanceType.ALS),
        Ambulance(id="AMB-02", callsign="Medic 4 (ALS)", latitude=37.7800, longitude=-122.4250, ambulance_type=AmbulanceType.ALS),
        Ambulance(id="AMB-03", callsign="Medic 7 (BLS)", latitude=37.7600, longitude=-122.4300, ambulance_type=AmbulanceType.BLS),
        Ambulance(id="AMB-04", callsign="Medic 9 (ALS)", latitude=37.7850, longitude=-122.4050, ambulance_type=AmbulanceType.ALS),
    ]

    hospitals = [
        Hospital(
            id="HOSP-01",
            name="San Francisco General Trauma Center (Level 1)",
            latitude=37.7558,
            longitude=-122.4048,
            icu_capacity=2,
            operating_rooms_available=2,
            supported_specialties=[
                MedicalSpecialty.GENERAL_TRAUMA,
                MedicalSpecialty.NEUROSURGERY,
                MedicalSpecialty.CARDIOTHORACIC,
                MedicalSpecialty.ORTHOPEDIC,
            ],
        ),
        Hospital(
            id="HOSP-02",
            name="UCSF Medical Center Parnassus",
            latitude=37.7631,
            longitude=-122.4578,
            icu_capacity=2,
            operating_rooms_available=1,
            supported_specialties=[
                MedicalSpecialty.GENERAL_TRAUMA,
                MedicalSpecialty.NEUROSURGERY,
                MedicalSpecialty.ORTHOPEDIC,
            ],
        ),
        Hospital(
            id="HOSP-03",
            name="St. Mary's Medical Center",
            latitude=37.7738,
            longitude=-122.4542,
            icu_capacity=1,
            operating_rooms_available=1,
            supported_specialties=[MedicalSpecialty.GENERAL_TRAUMA, MedicalSpecialty.ORTHOPEDIC],
        ),
    ]

    events = [
        SimulationEvent(
            event_id="EVT-01",
            event_type=DisruptionType.ROAD_BLOCKAGE,
            timestamp_seconds=120.0,
            description="Highway 101 Southbound fully blocked by overturned fuel tanker. Chemical hazard declared.",
            payload={"segment_id": "hwy101_south"},
        ),
        SimulationEvent(
            event_id="EVT-02",
            event_type=DisruptionType.ICU_CAPACITY_CHANGE,
            timestamp_seconds=240.0,
            description="SF General Hospital reports emergency code blackout in OR 3. ICU capacity drops by 1.",
            payload={"hospital_id": "HOSP-01", "delta": -1},
        ),
    ]

    return patients, ambulances, hospitals, events

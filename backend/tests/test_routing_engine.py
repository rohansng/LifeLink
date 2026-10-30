"""Unit tests for the LifeLink Ambulance Assignment and Simulated Routing Engine.

Strictly deterministic testing of:
- Dispatch Chain:
    V083
     ↓
    AMB-04
     ↓
    Hospital B
     ↓
    Route B
    13 min
- ROAD BLOCKED Event:
    AMB-04
    Route A ❌
    Route B ✓
- Offline synthetic road graph routing without external APIs
- Continuous route recalculation & recommendation generation
"""

import unittest
from backend.app.models.ambulance import Ambulance, AmbulanceStatus, AmbulanceType
from backend.app.models.hospital import Hospital, HospitalBloodInventory
from backend.app.models.location import Location
from backend.app.models.road import Road, RoadStatus
from backend.app.models.victim import Victim, VictimSeverity, VictimStatus
from backend.app.routing.routing_engine import SimulatedRoutingEngine, routing_engine
from backend.app.routing.schemas import RouteStatus


class TestRoutingEngine(unittest.TestCase):
    """Test suite for deterministic EMS dispatch chains and dynamic rerouting."""

    def setUp(self):
        self.engine = SimulatedRoutingEngine()

        self.victim_v083 = Victim(
            id="V083",
            severity=VictimSeverity.CRITICAL,
            location=Location(latitude=37.7765, longitude=-122.4180, sector="Sector Bravo"),
            required_capability="Trauma + ICU",
            status=VictimStatus.UNASSIGNED,
            triage_tag="RED",
            notes="Critical bleeding from pelvic crush injury, hypovolemic shock",
        )

        self.hospital_b = Hospital(
            id="H-B",
            name="St. Jude Regional Hospital",
            type="Level 2 Emergency Hospital",
            location=Location(latitude=37.7610, longitude=-122.4410),
            icu=2,
            icu_total=18,
            trauma_available=True,
            operating_rooms_open=1,
            burn_beds_available=0,
            blood=HospitalBloodInventory(O_negative=3),
            eta_minutes=13.0,
            distance_km=6.2,
        )

        self.ambulances = [
            Ambulance(
                id="AMB-01",
                callsign="Medic 1",
                type=AmbulanceType.ALS,
                status=AmbulanceStatus.DISPATCHED,
                location=Location(latitude=37.7770, longitude=-122.4160, sector="Sector Alpha"),
                crew_lead="Paramedic Vance",
            ),
            Ambulance(
                id="AMB-04",
                callsign="Medic 4",
                type=AmbulanceType.ALS,
                status=AmbulanceStatus.EXTRICATING,
                location=Location(latitude=37.7740, longitude=-122.4210, sector="Sector Bravo"),
                crew_lead="Paramedic J. Morales",
                equipment=["Cyanokit", "PAPR Respiratory Protection", "Advanced Airway"],
            ),
            Ambulance(
                id="AMB-05",
                callsign="Medic 5",
                type=AmbulanceType.BLS,
                status=AmbulanceStatus.TRANSPORTING,
                location=Location(latitude=37.7670, longitude=-122.4330, sector="Southwest Corridor"),
                crew_lead="EMT D. Miller",
            ),
        ]

        # Initial road condition: Highway 101 open, Grand Ave open
        self.roads_open = [
            Road(
                id="ROAD-01",
                name="Highway 101 South",
                status=RoadStatus.OPEN,
                detour_penalty_minutes=0.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            ),
            Road(
                id="ROAD-02",
                name="Grand Avenue West",
                status=RoadStatus.OPEN,
                detour_penalty_minutes=0.0,
                start_latitude=37.7730,
                start_longitude=-122.4270,
                end_latitude=37.7680,
                end_longitude=-122.4380,
            ),
        ]

    def test_exemplar_dispatch_chain_v083(self):
        """Verifies exemplar dispatch chain:
        V083
         ↓
        AMB-04
         ↓
        Hospital B
         ↓
        Route B
        13 min
        """
        chain = self.engine.build_dispatch_chain(
            victim=self.victim_v083,
            ambulances=self.ambulances,
            hospitals=[self.hospital_b],
            roads=self.roads_open,
        )

        self.assertEqual(chain.victim_id, "V083")
        self.assertEqual(chain.ambulance_id, "AMB-04")
        self.assertEqual(chain.hospital_id, "H-B")
        self.assertEqual(chain.active_route_name, "Route B")
        self.assertEqual(chain.eta_minutes, 13.0)
        self.assertIn("V083 → AMB-04 → Hospital B → Route B → 13 min", chain.chain_summary)

    def test_road_blocked_event_and_reroute(self):
        """Verifies that when a road is blocked:
        - Route A is marked blocked: Route A ❌
        - Alternate Route B is selected: Route B ✓
        - 13 min ETA is preserved via Route B
        """
        # Block Highway 101 (Route A)
        roads_blocked = [
            Road(
                id="ROAD-01",
                name="Highway 101 South",
                status=RoadStatus.CLOSED,
                reason="Overturned fuel tanker & structural collapse",
                detour_penalty_minutes=16.0,
                start_latitude=37.7780,
                start_longitude=-122.4140,
                end_latitude=37.7720,
                end_longitude=-122.4080,
            ),
            Road(
                id="ROAD-02",
                name="Grand Avenue West",
                status=RoadStatus.OPEN,
                detour_penalty_minutes=0.0,
                start_latitude=37.7730,
                start_longitude=-122.4270,
                end_latitude=37.7680,
                end_longitude=-122.4380,
            ),
        ]

        chain = self.engine.build_dispatch_chain(
            victim=self.victim_v083,
            ambulances=self.ambulances,
            hospitals=[self.hospital_b],
            roads=roads_blocked,
        )

        # Route A must be blocked (❌)
        route_a = next(r for r in chain.route_options if r.route_id == "ROUTE-A")
        self.assertTrue(route_a.is_blocked)
        self.assertEqual(route_a.status_icon, "❌")
        self.assertEqual(route_a.status, RouteStatus.BLOCKED)

        # Route B must be valid (✓)
        route_b = next(r for r in chain.route_options if r.route_id == "ROUTE-B")
        self.assertFalse(route_b.is_blocked)
        self.assertEqual(route_b.status_icon, "✓")
        self.assertEqual(route_b.status, RouteStatus.OPTIMAL)
        self.assertEqual(route_b.eta_minutes, 13.0)

        # Reroute note confirms: AMB-04: Route A ❌ | Route B ✓
        self.assertEqual(chain.reroute_status, "REROUTED")
        self.assertIn("Route A ❌", chain.reroute_note)
        self.assertIn("Route B ✓", chain.reroute_note)
        self.assertIn("AMB-04", chain.reroute_note)

    def test_handle_road_block_event_creates_recommendation(self):
        """Verifies handle_road_block_event updates database state and creates recommendation."""
        result = self.engine.handle_road_block_event(
            road_id="ROAD-01",
            new_status="closed",
            reason="Explosion at Overpass 4",
            detour_penalty_minutes=14.0,
        )

        self.assertEqual(result.new_status, "closed")
        self.assertIn("AMB-04", result.affected_ambulance_ids)
        self.assertGreater(len(result.generated_recommendations), 0)

        rec = result.generated_recommendations[0]
        self.assertEqual(rec["action_type"], "TRAFFIC_DETOUR")
        self.assertIn("Route B", rec["explanation"])

    def test_offline_synthetic_road_graph_repeatability(self):
        """Guarantees 100% deterministic repeatability without external network navigation APIs."""
        for _ in range(50):
            routes = self.engine.calculate_routes("Sector Bravo", "H-B", self.roads_open)
            self.assertEqual(len(routes), 3)
            self.assertEqual(routes[1].route_id, "ROUTE-B")
            self.assertEqual(routes[1].eta_minutes, 13.0)
            self.assertEqual(routes[1].status_icon, "✓")


if __name__ == "__main__":
    unittest.main()


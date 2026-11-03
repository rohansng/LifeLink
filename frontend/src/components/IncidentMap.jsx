import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, AlertTriangle, Shield, Navigation, Compass, Eye } from 'lucide-react';

export default function IncidentMap({
  incident,
  victimZones = [],
  hospitals = [],
  ambulances = [],
  roadDisruptions = [],
  onSelectEntity,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayersRef = useRef({});
  const layersGroupRef = useRef({});

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [basemapStyle, setBasemapStyle] = useState('SATELLITE'); // SATELLITE | STREET

  // Helper coordinate normalizers for backend and synthetic models
  const getIncidentCoords = () => {
    if (incident?.coordinates) return [incident.coordinates.lat, incident.coordinates.lng];
    if (incident?.location) return [incident.location.latitude, incident.location.longitude];
    return [37.7749, -122.4194];
  };

  const getEntityCoords = (item) => {
    if (Array.isArray(item.coordinates)) return item.coordinates;
    if (item.location) return [item.location.latitude, item.location.longitude];
    return [37.7749, -122.4194];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const centerCoords = getIncidentCoords();
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // 1. Photorealistic Satellite Imagery (Esri World Imagery — High Res Aerial Satellite)
    const satelliteTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri World Imagery',
      }
    );

    // 2. High-Contrast Reference Overlay (Highways, Streets & Place Names)
    const referenceLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    );

    // 3. OpenStreetMap Crisp Vector Street Map
    const streetTileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }
    );

    tileLayersRef.current = {
      satellite: satelliteTileLayer,
      reference: referenceLayer,
      street: streetTileLayer,
    };

    // Default to Photorealistic Satellite with Road & Landmark Reference Overlay
    satelliteTileLayer.addTo(map);
    referenceLayer.addTo(map);

    mapInstanceRef.current = map;

    const groups = {
      zones: L.layerGroup().addTo(map),
      hospitals: L.layerGroup().addTo(map),
      ambulances: L.layerGroup().addTo(map),
      roads: L.layerGroup().addTo(map),
    };
    layersGroupRef.current = groups;

    // 1. Victim Zones
    victimZones.forEach((zone) => {
      const coords = getEntityCoords(zone);
      const totalVictims = zone.total_victims ?? zone.totalVictims ?? 0;
      const criticalCount = zone.critical_count ?? zone.triage?.critical ?? 0;
      const seriousCount = zone.serious_count ?? zone.triage?.serious ?? 0;
      const radius = zone.radius_meters ?? zone.radiusMeters ?? 250;
      const desc = zone.description ?? '';
      const hazard = zone.hazard ?? 'HAZARD ZONE';
      const access = zone.access_status ?? zone.accessStatus ?? 'RESTRICTED';

      L.circle(coords, {
        radius: radius,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.18,
        dashArray: '5, 5',
      }).addTo(groups.zones);

      const zoneHtml = `
        <div class="map-pin-zone" style="text-align: center; cursor: pointer; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
          <div style="background: rgba(220, 38, 38, 0.95); border: 2.5px solid #ffffff; border-radius: 50%; width: 36px; height: 36px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(239, 68, 68, 0.9);">
            <span style="color: #ffffff; font-weight: 900; font-size: 13px; font-family: monospace;">${totalVictims}</span>
          </div>
          <div style="background: rgba(10, 15, 29, 0.92); border: 1px solid rgba(248, 113, 113, 0.6); padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 800; color: #f8fafc; margin-top: 4px; white-space: nowrap; display: inline-block; letter-spacing: 0.3px;">
            ${zone.id}: <span style="color: #f87171;">${criticalCount} Red</span>
          </div>
        </div>
      `;

      const marker = L.marker(coords, {
        icon: L.divIcon({ html: zoneHtml, className: 'custom-leaflet-pin', iconSize: [84, 54], iconAnchor: [42, 27] }),
      }).addTo(groups.zones);

      marker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 4px 0; color: #b91c1c; font-size: 14px; font-weight: 800;">${zone.name}</h4>
          <p style="font-size: 12px; margin: 0 0 6px 0; color: #475569;">${desc}</p>
          <div style="font-size: 11px; background: #fee2e2; border-left: 3px solid #dc2626; padding: 5px 8px; margin-bottom: 6px; border-radius: 2px;">
            <strong>Casualties:</strong> ${totalVictims} Total | <span style="color: #dc2626; font-weight: bold;">${criticalCount} Critical (P1)</span> | ${seriousCount} Serious (P2)
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            <strong>Hazard:</strong> ${hazard}<br />
            <strong>Access:</strong> ${access}
          </div>
        </div>
      `);

      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'ZONE', data: zone }));
    });

    // 2. Receiving Hospitals
    hospitals.forEach((hosp) => {
      const coords = getEntityCoords(hosp);
      const icuAvailable = hosp.icu ?? hosp.icuBedsAvailable ?? 0;
      const icuTotal = hosp.icu_total ?? hosp.icuTotalBeds ?? 20;
      const specialties = hosp.supported_specialties ?? hosp.specialties ?? [];
      const eta = hosp.eta_minutes ?? hosp.etaMinutes ?? 10.0;
      const dist = hosp.distance_km ?? hosp.distanceKm ?? 5.0;

      const hospHtml = `
        <div class="map-pin-hosp" style="text-align: center; cursor: pointer; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
          <div style="background: #0284c7; border: 2.5px solid #38bdf8; border-radius: 8px; width: 34px; height: 34px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(56, 189, 248, 0.75);">
            <span style="font-size: 15px;">🏥</span>
          </div>
          <div style="background: rgba(10, 15, 29, 0.92); border: 1px solid #38bdf8; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 800; color: #38bdf8; margin-top: 4px; white-space: nowrap; display: inline-block;">
            ${hosp.name.split(' ')[0]}: <span style="color: ${icuAvailable > 0 ? '#4ade80' : '#f87171'}">${icuAvailable} ICU</span>
          </div>
        </div>
      `;

      const marker = L.marker(coords, {
        icon: L.divIcon({ html: hospHtml, className: 'custom-leaflet-hosp', iconSize: [96, 54], iconAnchor: [48, 27] }),
      }).addTo(groups.hospitals);

      marker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 4px 0; color: #0369a1; font-size: 14px; font-weight: 800;">${hosp.name}</h4>
          <div style="font-size: 12px; font-weight: bold; color: ${icuAvailable > 0 ? '#047857' : '#b91c1c'}; margin-bottom: 6px;">
            ICU Beds Open: ${icuAvailable} of ${icuTotal}
          </div>
          <div style="font-size: 11px; margin-bottom: 4px;">
            <strong>Specialties:</strong> ${specialties.join(', ')}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <strong>Transit ETA:</strong> ${eta} min (${dist} km)
          </div>
        </div>
      `);

      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'HOSPITAL', data: hosp }));
    });

    // 3. Ambulances
    ambulances.forEach((amb) => {
      const coords = getEntityCoords(amb);
      const isALS = amb.type?.includes('ALS');
      const assignment = amb.assignment_description ?? amb.assignedTo ?? 'Active Transport';
      const crew = amb.crew_lead ?? amb.crewLead ?? 'Paramedic Unit';

      const ambHtml = `
        <div class="map-pin-amb" style="text-align: center; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));">
          <div style="background: ${isALS ? '#8b5cf6' : '#0d9488'}; border: 2px solid #ffffff; border-radius: 50%; width: 30px; height: 30px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${isALS ? 'rgba(139, 92, 246, 0.8)' : 'rgba(13, 148, 136, 0.8)'};">
            <span style="font-size: 13px;">🚑</span>
          </div>
          <div style="background: rgba(10, 15, 29, 0.92); border: 1px solid rgba(255, 255, 255, 0.25); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; color: #f8fafc; margin-top: 3px; white-space: nowrap; display: inline-block;">
            ${amb.callsign}
          </div>
        </div>
      `;

      const marker = L.marker(coords, {
        icon: L.divIcon({ html: ambHtml, className: 'custom-leaflet-amb', iconSize: [64, 46], iconAnchor: [32, 23] }),
      }).addTo(groups.ambulances);

      marker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 2px 0; color: #6d28d9; font-size: 13px; font-weight: 800;">${amb.callsign} (${amb.type})</h4>
          <div style="font-size: 11px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
            Status: ${amb.status}
          </div>
          <div style="font-size: 11px; margin-bottom: 4px; color: #475569;">
            <strong>Assignment:</strong> ${assignment}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <strong>Lead:</strong> ${crew}
          </div>
        </div>
      `);

      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'AMBULANCE', data: amb }));
    });

    // 4. Road Disruptions & Highway Detours
    roadDisruptions.forEach((road) => {
      const start = road.start_latitude !== undefined ? [road.start_latitude, road.start_longitude] : road.coordinatesStart;
      const end = road.end_latitude !== undefined ? [road.end_latitude, road.end_longitude] : road.coordinatesEnd;
      const delay = road.detour_penalty_minutes ?? road.detourPenaltyMinutes ?? 0.0;

      if (start && end) {
        const polyline = L.polyline([start, end], {
          color: '#ef4444',
          weight: 6,
          opacity: 0.9,
          dashArray: '8, 8',
        }).addTo(groups.roads);

        polyline.bindPopup(`
          <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
            <h4 style="margin: 0 0 4px 0; color: #b91c1c; font-size: 13px; font-weight: 800;">⛔ ${road.name}</h4>
            <div style="font-size: 11px; font-weight: bold; color: #dc2626; margin-bottom: 4px;">
              Status: ${road.status}
            </div>
            <p style="font-size: 11px; margin: 0 0 4px 0; color: #475569;">${road.reason}</p>
            <div style="font-size: 11px; color: #b91c1c;">
              <strong>Detour Penalty:</strong> +${delay} min
            </div>
          </div>
        `);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [incident, victimZones, hospitals, ambulances, roadDisruptions]);

  // Basemap Switcher (Satellite vs Street)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayersRef.current.satellite) return;
    const map = mapInstanceRef.current;
    const { satellite, reference, street } = tileLayersRef.current;

    if (basemapStyle === 'SATELLITE') {
      if (map.hasLayer(street)) map.removeLayer(street);
      if (!map.hasLayer(satellite)) satellite.addTo(map);
      if (!map.hasLayer(reference)) reference.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (map.hasLayer(reference)) map.removeLayer(reference);
      if (!map.hasLayer(street)) street.addTo(map);
    }
  }, [basemapStyle]);

  // Entity Layer Filtering
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.zones) return;
    const map = mapInstanceRef.current;
    const { zones, hospitals: hospGroup, ambulances: ambGroup, roads } = layersGroupRef.current;

    if (map.hasLayer(zones)) map.removeLayer(zones);
    if (map.hasLayer(hospGroup)) map.removeLayer(hospGroup);
    if (map.hasLayer(ambGroup)) map.removeLayer(ambGroup);
    if (map.hasLayer(roads)) map.removeLayer(roads);

    if (activeFilter === 'ALL') {
      map.addLayer(zones);
      map.addLayer(hospGroup);
      map.addLayer(ambGroup);
      map.addLayer(roads);
    } else if (activeFilter === 'VICTIMS') {
      map.addLayer(zones);
    } else if (activeFilter === 'HOSPITALS') {
      map.addLayer(hospGroup);
    } else if (activeFilter === 'AMBULANCES') {
      map.addLayer(ambGroup);
    } else if (activeFilter === 'ROADS') {
      map.addLayer(roads);
    }
  }, [activeFilter]);

  return (
    <div
      className="defense-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '680px',
        overflow: 'hidden',
      }}
    >
      <div className="defense-card-header">
        <span>Tactical Map</span>

        {/* Controls: Basemap Toggle + Entity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Basemap Toggle */}
          <div style={{ display: 'flex', background: '#0B0E13', borderRadius: '3px', padding: '1px', border: '1px solid #2B323D' }}>
            <button
              onClick={() => setBasemapStyle('SATELLITE')}
              style={{
                background: basemapStyle === 'SATELLITE' ? '#1A202C' : 'transparent',
                color: basemapStyle === 'SATELLITE' ? '#E2E8F0' : '#64748B',
                borderRadius: '2px',
                padding: '2px 6px',
                fontSize: '9px',
                fontWeight: '700',
              }}
              title="Photorealistic Satellite Imagery"
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setBasemapStyle('STREET')}
              style={{
                background: basemapStyle === 'STREET' ? '#1A202C' : 'transparent',
                color: basemapStyle === 'STREET' ? '#E2E8F0' : '#64748B',
                borderRadius: '2px',
                padding: '2px 6px',
                fontSize: '9px',
                fontWeight: '700',
              }}
              title="Vector Street Grid"
            >
              🗺️ Street
            </button>
          </div>

          {/* Quick Filter */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'VICTIMS', label: 'Victims' },
              { id: 'HOSPITALS', label: 'Hosps' },
              { id: 'ROADS', label: 'Detours' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  background: activeFilter === tab.id ? '#2563EB' : '#1A202C',
                  color: activeFilter === tab.id ? '#fff' : '#94A3B8',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontWeight: '700',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: '620px', overflow: 'hidden' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '620px' }} />

        {/* Tactical Legend Matching Reference Image */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(11, 14, 19, 0.94)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #2B323D',
            borderRadius: '4px',
            padding: '8px 10px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '10px',
            color: '#94A3B8',
            maxWidth: '200px',
          }}
        >
          <div style={{ fontWeight: '800', color: '#E2E8F0', fontSize: '11px', marginBottom: '2px' }}>
            Triage
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#475569' }} />
            <span>Color coded Descanning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#D97706' }} />
            <span>Triage Clusters</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#DC2626' }} />
            <span>Highway Closures</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px' }}>📍</span>
            <span>Incident Pins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px' }}>🔺</span>
            <span>Staging Area</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', borderTop: '2px dashed #38BDF8' }} />
            <span>EMS/Helicopter Route</span>
          </div>
        </div>

        {/* Highway 101 Overpass Alert */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(220, 38, 38, 0.35)',
            border: '1px solid #DC2626',
            borderRadius: '3px',
            padding: '4px 8px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            color: '#fff',
            fontWeight: '700',
          }}
        >
          <AlertTriangle size={12} color="#F87171" />
          <span>HWY 101 SEVERED @ OVERPASS 4</span>
        </div>
      </div>
    </div>
  );
}

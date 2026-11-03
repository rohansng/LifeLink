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
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            Live Geospatial Tactical Map
          </h2>
          <span className="mono" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
            SECTOR 7 • SF METRO
          </span>
        </div>

        {/* Controls: Basemap Toggle + Entity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Realistic Basemap Selector */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setBasemapStyle('SATELLITE')}
              style={{
                background: basemapStyle === 'SATELLITE' ? 'var(--accent-blue)' : 'transparent',
                color: basemapStyle === 'SATELLITE' ? '#fff' : 'var(--text-muted)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="High-resolution photorealistic satellite imagery"
            >
              <span>🛰️</span> Satellite
            </button>
            <button
              onClick={() => setBasemapStyle('STREET')}
              style={{
                background: basemapStyle === 'STREET' ? 'var(--accent-blue)' : 'transparent',
                color: basemapStyle === 'STREET' ? '#fff' : 'var(--text-muted)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Detailed road and urban street grid"
            >
              <span>🗺️</span> Street
            </button>
          </div>

          {/* Layer Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { id: 'ALL', label: 'All Layers' },
              { id: 'VICTIMS', label: 'Victims (214)' },
              { id: 'AMBULANCES', label: 'Fleet (5)' },
              { id: 'HOSPITALS', label: 'Hospitals (3)' },
              { id: 'ROADS', label: 'Blockades' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  background: activeFilter === tab.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                  color: activeFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: activeFilter === tab.id ? 'var(--accent-blue)' : 'var(--border-color)',
                  borderRadius: '5px',
                  padding: '4px 9px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: '460px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '460px' }} />

        {/* Tactical Legend */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(9, 13, 22, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '8px 12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
        }}>
          <div style={{ fontWeight: '800', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            TACTICAL MAP LEGEND
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px rgba(239,68,68,0.8)' }} />
            <span>Casualty Cluster (Zone Alpha / Bravo / Charlie)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0284c7', display: 'inline-block', boxShadow: '0 0 8px rgba(56,189,248,0.8)' }} />
            <span>Hospital (Metro Trauma, St. Jude, Harborview)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block', boxShadow: '0 0 8px rgba(139,92,246,0.8)' }} />
            <span>Ambulance Unit (Medic 1 to 5)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '16px', height: '3px', background: '#ef4444', borderTop: '2px dashed #ffffff', display: 'inline-block' }} />
            <span style={{ color: '#f87171', fontWeight: '700' }}>Highway 101 Blockage (+14m Detour)</span>
          </div>
        </div>

        {/* Overpass Warning Banner */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(239, 68, 68, 0.35)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--triage-red)',
          borderRadius: '6px',
          padding: '6px 12px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#ffffff',
          fontWeight: '800',
          boxShadow: '0 0 15px rgba(239,68,68,0.4)',
        }}>
          <AlertTriangle size={15} color="#ef4444" />
          <span>ROADWAY SEVERED: HWY 101 @ OVERPASS 4</span>
        </div>
      </div>
    </div>
  );
}

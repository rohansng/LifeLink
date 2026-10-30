import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, AlertTriangle, Shield, Navigation } from 'lucide-react';

export default function IncidentMap({
  incident,
  victimZones,
  hospitals,
  ambulances,
  roadDisruptions,
  onSelectEntity,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({});

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'VICTIMS', 'HOSPITALS', 'AMBULANCES', 'ROADS'

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization

    // Initialize Leaflet Map centered on disaster coordinates
    const map = L.map(mapContainerRef.current, {
      center: [incident.coordinates.lat, incident.coordinates.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark theme CartoDB basemap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Groups for filtering
    const groups = {
      zones: L.layerGroup().addTo(map),
      hospitals: L.layerGroup().addTo(map),
      ambulances: L.layerGroup().addTo(map),
      roads: L.layerGroup().addTo(map),
    };
    layersGroupRef.current = groups;

    // 1. Render Victim Zones & Incident Epicenter
    victimZones.forEach((zone) => {
      // Zone Perimeter circle
      const circle = L.circle(zone.coordinates, {
        radius: zone.radiusMeters,
        color: '#ef4444',
        weight: 1.5,
        fillColor: '#ef4444',
        fillOpacity: 0.12,
        dashArray: '4, 4',
      }).addTo(groups.zones);

      // Custom HTML Marker Pin
      const zoneHtml = `
        <div class="map-pin-zone" style="text-align: center; cursor: pointer;">
          <div style="background: rgba(239, 68, 68, 0.9); border: 2px solid #fff; border-radius: 50%; width: 34px; height: 34px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(239, 68, 68, 0.8);">
            <span style="color: #fff; font-weight: 800; font-size: 13px; font-family: monospace;">${zone.totalVictims}</span>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #f8fafc; margin-top: 4px; white-space: nowrap; display: inline-block;">
            ${zone.id}: ${zone.triage.critical} Red
          </div>
        </div>
      `;

      const zoneIcon = L.divIcon({
        html: zoneHtml,
        className: 'custom-leaflet-pin',
        iconSize: [80, 50],
        iconAnchor: [40, 25],
      });

      const marker = L.marker(zone.coordinates, { icon: zoneIcon }).addTo(groups.zones);

      marker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 4px 0; color: #b91c1c; font-size: 14px;">${zone.name}</h4>
          <p style="font-size: 12px; margin: 0 0 6px 0; color: #475569;">${zone.description}</p>
          <div style="font-size: 11px; background: #fee2e2; border-left: 3px solid #dc2626; padding: 4px 6px; margin-bottom: 6px;">
            <strong>Casualties:</strong> ${zone.totalVictims} Total | <span style="color: #dc2626; font-weight: bold;">${zone.triage.critical} Critical (Red)</span> | ${zone.triage.serious} Yellow
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <strong>Access:</strong> ${zone.accessStatus}
          </div>
        </div>
      `);

      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'ZONE', data: zone }));
    });

    // 2. Render Receiving Hospitals
    hospitals.forEach((hosp) => {
      const hospHtml = `
        <div class="map-pin-hosp" style="text-align: center; cursor: pointer;">
          <div style="background: #0284c7; border: 2px solid #38bdf8; border-radius: 6px; width: 32px; height: 32px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);">
            <span style="color: #fff; font-weight: 800; font-size: 13px;">🏥</span>
          </div>
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #38bdf8; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #38bdf8; margin-top: 4px; white-space: nowrap; display: inline-block;">
            ${hosp.name.split(' ')[0]}: ${hosp.icuBedsAvailable} ICU
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospHtml,
        className: 'custom-leaflet-hosp',
        iconSize: [90, 50],
        iconAnchor: [45, 25],
      });

      const marker = L.marker(hosp.coordinates, { icon: hospIcon }).addTo(groups.hospitals);

      marker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 4px 0; color: #0369a1; font-size: 14px;">${hosp.name}</h4>
          <div style="font-size: 12px; font-weight: bold; color: ${hosp.icuBedsAvailable > 1 ? '#047857' : '#b91c1c'}; margin-bottom: 6px;">
            ICU Beds Open: ${hosp.icuBedsAvailable} of ${hosp.icuTotalBeds}
          </div>
          <div style="font-size: 11px; margin-bottom: 4px;">
            <strong>Specialties:</strong> ${hosp.specialties.join(', ')}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <strong>ETA from Incident:</strong> ${hosp.etaMinutes} min (${hosp.distanceKm} km)
          </div>
        </div>
      `);

      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'HOSPITAL', data: hosp }));
    });

    // 3. Render Ambulances
    ambulances.forEach((amb) => {
      const isALS = amb.type.includes('ALS');
      const ambHtml = `
        <div class="map-pin-amb" style="text-align: center; cursor: pointer;">
          <div style="background: ${isALS ? '#8b5cf6' : '#0d9488'}; border: 2px solid #fff; border-radius: 50%; width: 28px; height: 28px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${isALS ? 'rgba(139, 92, 246, 0.7)' : 'rgba(13, 148, 136, 0.7)'};">
            <span style="font-size: 12px;">🚑</span>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.2); padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700; color: #f8fafc; margin-top: 2px; white-space: nowrap; display: inline-block;">
            ${amb.callsign}
          </div>
        </div>
      `;

      const ambIcon = L.divIcon({
        html: ambHtml,
        className: 'custom-leaflet-amb',
        iconSize: [60, 44],
        iconAnchor: [30, 22],
      });

      const marker = L.marker(amb.coordinates, { icon: ambIcon }).addTo(groups.ambulances);

      marker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 2px 0; color: #6d28d9; font-size: 13px;">${amb.callsign} (${amb.type.split(' ')[0]})</h4>
          <div style="font-size: 11px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
            Status: ${amb.status}
          </div>
          <div style="font-size: 11px; margin-bottom: 4px; color: #475569;">
            <strong>Assignment:</strong> ${amb.assignedTo}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <strong>Lead:</strong> ${amb.crewLead}
          </div>
        </div>
      `);

      marker.on('click', () => onSelectEntity && onSelectEntity({ type: 'AMBULANCE', data: amb }));
    });

    // 4. Render Road Disruption Corridors
    roadDisruptions.forEach((road) => {
      const polyline = L.polyline([road.coordinatesStart, road.coordinatesEnd], {
        color: '#ef4444',
        weight: 6,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(groups.roads);

      polyline.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 4px 0; color: #b91c1c; font-size: 13px;">⛔ ${road.name}</h4>
          <div style="font-size: 11px; font-weight: bold; color: #dc2626; margin-bottom: 4px;">
            Status: ${road.status}
          </div>
          <p style="font-size: 11px; margin: 0 0 4px 0; color: #475569;">${road.reason}</p>
          <div style="font-size: 11px; color: #b91c1c;">
            <strong>Transit Detour Penalty:</strong> +${road.detourPenaltyMinutes} min
          </div>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [incident, victimZones, hospitals, ambulances, roadDisruptions]);

  // Handle Layer Filtering
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.zones) return;
    const map = mapInstanceRef.current;
    const { zones, hospitals: hospGroup, ambulances: ambGroup, roads } = layersGroupRef.current;

    // Reset all layers
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
      {/* Map Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            Live Geospatial Tactical Map
          </h2>
          <span className="mono" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
            SECTOR 7 • SF METRO
          </span>
        </div>

        {/* Layer Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                padding: '4px 10px',
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

      {/* Map Canvas Container */}
      <div style={{ position: 'relative', flex: 1, minHeight: '440px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '440px' }} />

        {/* Floating Map Legend */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(9, 13, 22, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '8px 12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
        }}>
          <div style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>MAP LEGEND</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span>Casualty Cluster (Zone Alpha/Bravo/Charlie)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0284c7', display: 'inline-block' }} />
            <span>Hospital (Metro Trauma, St. Jude, Harborview)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
            <span>Ambulance Unit (Medic 1 to 5)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '16px', height: '3px', background: '#ef4444', borderTop: '2px dashed #fff', display: 'inline-block' }} />
            <span style={{ color: '#ef4444', fontWeight: '600' }}>Highway 101 Blockage (+14m Detour)</span>
          </div>
        </div>

        {/* Live Status Overlay Pill */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(239, 68, 68, 0.25)',
          border: '1px solid var(--triage-red)',
          borderRadius: '6px',
          padding: '6px 10px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#fff',
          fontWeight: '700',
        }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span>ROADWAY SEVERED: HWY 101 @ OVERPASS 4</span>
        </div>
      </div>
    </div>
  );
}

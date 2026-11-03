import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, AlertTriangle } from 'lucide-react';

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
  const layersGroupRef = useRef({});

  // Bengaluru coordinates default: KR Puram / Whitefield Industrial Corridor
  const getIncidentCoords = () => {
    if (incident?.coordinates) return [incident.coordinates.lat, incident.coordinates.lng];
    if (incident?.location) return [incident.location.latitude, incident.location.longitude];
    return [12.9856, 77.7374]; // Central Bengaluru East
  };

  const getEntityCoords = (item) => {
    if (Array.isArray(item.coordinates)) return item.coordinates;
    if (item.location) return [item.location.latitude, item.location.longitude];
    return [12.9856, 77.7374];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const centerCoords = getIncidentCoords();

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 12,
      zoomControl: false, // Customized position
      attributionControl: false,
    });

    // Custom top-right zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark tactical basemap (OpenStreetMap with high-contrast desaturated military dark filter)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-tactical-tiles',
    }).addTo(map);

    mapInstanceRef.current = map;

    const groups = {
      polygons: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map),
      pins: L.layerGroup().addTo(map),
    };
    layersGroupRef.current = groups;

    // 1. Triage Cluster Polygons (Matching Red & Amber polygons in reference image)
    // Red Cluster (Sector Alpha - Whitefield)
    const redPolygonCoords = [
      [12.9930, 77.7300],
      [12.9980, 77.7450],
      [12.9880, 77.7550],
      [12.9790, 77.7420],
      [12.9840, 77.7280],
    ];
    L.polygon(redPolygonCoords, {
      color: '#DC2626',
      weight: 1.5,
      fillColor: '#DC2626',
      fillOpacity: 0.28,
    }).addTo(groups.polygons);

    // Amber Cluster (Sector Bravo - KR Puram)
    const amberPolygonCoords = [
      [12.9980, 77.7000],
      [13.0060, 77.7120],
      [12.9970, 77.7250],
      [12.9880, 77.7180],
      [12.9910, 77.7020],
    ];
    L.polygon(amberPolygonCoords, {
      color: '#D97706',
      weight: 1.5,
      fillColor: '#D97706',
      fillOpacity: 0.26,
    }).addTo(groups.polygons);

    // 2. Routes (Blue dashed EMS/Helicopter Route + Red severed highway)
    // Blue Dashed EMS Route from Whitefield to Victoria/Manipal
    const emsRouteCoords = [
      [12.9890, 77.7420],
      [12.9800, 77.7100],
      [12.9710, 77.6750],
      [12.9584, 77.6483],
    ];
    L.polyline(emsRouteCoords, {
      color: '#3B82F6',
      weight: 2.5,
      dashArray: '6, 6',
      opacity: 0.85,
    }).addTo(groups.routes);

    // Red Highway Severance (Outer Ring Road KR Puram Overpass)
    const roadSeveredCoords = [
      [12.9970, 77.6980],
      [12.9920, 77.7020],
    ];
    L.polyline(roadSeveredCoords, {
      color: '#DC2626',
      weight: 4,
      opacity: 0.95,
      dashArray: '8, 6',
    }).addTo(groups.routes);

    // 3. Tactical Markers & Pins
    // Incident Pin (Center Red)
    const incidentPinHtml = `
      <div style="background: #DC2626; border: 2px solid #FFFFFF; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(220, 38, 38, 0.8); cursor: pointer;">
        <span style="font-size: 10px; color: #fff;">📍</span>
      </div>
    `;
    L.marker([12.9890, 77.7420], {
      icon: L.divIcon({ html: incidentPinHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] }),
    }).addTo(groups.pins);

    // Staging Area Pin (Tent)
    const stagingPinHtml = `
      <div style="background: #1E293B; border: 1.5px solid #94A3B8; border-radius: 4px; padding: 2px 5px; font-size: 10px; font-weight: 700; color: #E2E8F0; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); cursor: pointer;">
        <span>⛺</span> Staging
      </div>
    `;
    L.marker([12.9910, 77.6520], {
      icon: L.divIcon({ html: stagingPinHtml, className: '', iconSize: [68, 22], iconAnchor: [34, 11] }),
    }).addTo(groups.pins);

    // Helicopter Pin
    const heliPinHtml = `
      <div style="background: #18202A; border: 1.5px solid #3B82F6; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(59, 130, 246, 0.7); cursor: pointer;">
        <span style="font-size: 12px;">🚁</span>
      </div>
    `;
    L.marker([12.9650, 77.6800], {
      icon: L.divIcon({ html: heliPinHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] }),
    }).addTo(groups.pins);

    // Hospital Pins (H-A, H-B, H-C)
    hospitals.forEach((hosp) => {
      const coords = getEntityCoords(hosp);
      const hospHtml = `
        <div style="background: #1A2332; border: 1.5px solid #38BDF8; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #38BDF8; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.6); cursor: pointer; white-space: nowrap;">
          <span>🏥</span> ${hosp.name.split(' ')[0]}
        </div>
      `;
      L.marker(coords, {
        icon: L.divIcon({ html: hospHtml, className: '', iconSize: [85, 24], iconAnchor: [42, 12] }),
      }).addTo(groups.pins).on('click', () => onSelectEntity && onSelectEntity({ type: 'HOSPITAL', data: hosp }));
    });

    // Ambulance Pins
    ambulances.forEach((amb) => {
      const coords = getEntityCoords(amb);
      const ambHtml = `
        <div style="background: #1A2332; border: 1.5px solid #94A3B8; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.6); cursor: pointer;">
          <span style="font-size: 11px;">🚑</span>
        </div>
      `;
      L.marker(coords, {
        icon: L.divIcon({ html: ambHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] }),
      }).addTo(groups.pins).on('click', () => onSelectEntity && onSelectEntity({ type: 'AMBULANCE', data: amb }));
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [incident, victimZones, hospitals, ambulances, roadDisruptions]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0', letterSpacing: '-0.2px', margin: 0 }}>
          Tactical Map
        </h3>
        <span className="mono" style={{ fontSize: '11px', color: '#64748B' }}>
          BENGALURU EAST • SECTOR 7
        </span>
      </div>

      {/* Map Container */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '520px',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #232B36',
          background: '#0B0E13',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '520px' }} />

        {/* Triage Legend Overlay (Matching bottom-left overlay in reference image) */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(17, 21, 28, 0.94)',
            border: '1px solid #232B36',
            borderRadius: '4px',
            padding: '8px 12px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            fontSize: '11px',
            color: '#CBD5E1',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
            userSelect: 'none',
          }}
        >
          <div style={{ fontWeight: '700', color: '#E2E8F0', fontSize: '11px', marginBottom: '2px' }}>
            Triage
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Color coded Descanning</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Triage Clusters</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Highway Closures</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '10px' }}>📍</span>
            <span style={{ color: '#94A3B8' }}>Incident Pins</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '10px' }}>⛺</span>
            <span style={{ color: '#94A3B8' }}>Staging Area</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '12px', height: '2px', background: '#3B82F6', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>EMS/Helicopter Route</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '12px', height: '2px', background: '#DC2626', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Highway Pins</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [basemapStyle, setBasemapStyle] = useState('TACTICAL_DARK'); // TACTICAL_DARK | SATELLITE | STREET

  // Default coordinate: Bengaluru Central Freight Corridor, Sector 7
  const BENGALURU_CENTER = [12.9716, 77.5946];

  const getIncidentCoords = () => {
    if (incident?.coordinates) return [incident.coordinates.lat, incident.coordinates.lng];
    if (incident?.location) return [incident.location.latitude, incident.location.longitude];
    return BENGALURU_CENTER;
  };

  const getEntityCoords = (item) => {
    if (Array.isArray(item.coordinates)) return item.coordinates;
    if (item.location) return [item.location.latitude, item.location.longitude];
    return BENGALURU_CENTER;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const centerCoords = getIncidentCoords();

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // 1. Tactical Dark Gray Canvas (High-contrast military C2 basemap)
    const darkCanvasBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );
    const darkCanvasRef = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    // 2. Photorealistic Satellite Imagery (Esri World Imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );
    const satelliteRef = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    // 3. OpenStreetMap Crisp Vector Map with tactical filter
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19, className: 'dark-tactical-tiles' }
    );

    tileLayersRef.current = {
      darkBase: darkCanvasBase,
      darkRef: darkCanvasRef,
      satBase: satelliteLayer,
      satRef: satelliteRef,
      street: streetLayer,
    };

    // Default to Tactical Dark Canvas
    darkCanvasBase.addTo(map);
    darkCanvasRef.addTo(map);

    mapInstanceRef.current = map;

    const groups = {
      polygons: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map),
      pins: L.layerGroup().addTo(map),
    };
    layersGroupRef.current = groups;

    // 1. Triage Cluster Polygons in Bengaluru Central (Sector Alpha, Bravo, Charlie)
    // Red Polygon (Sector Alpha - Structural Collapse Epicenter)
    const redPolygonCoords = [
      [12.9790, 77.5950],
      [12.9820, 77.6020],
      [12.9750, 77.6050],
      [12.9710, 77.5990],
      [12.9730, 77.5930],
    ];
    L.polygon(redPolygonCoords, {
      color: '#DC2626',
      weight: 1.5,
      fillColor: '#DC2626',
      fillOpacity: 0.28,
    }).addTo(groups.polygons);

    // Amber Polygon (Sector Bravo - Ammonia Plume & Highway Perimeter)
    const amberPolygonCoords = [
      [12.9760, 77.5870],
      [12.9780, 77.5940],
      [12.9700, 77.5950],
      [12.9680, 77.5890],
      [12.9710, 77.5850],
    ];
    L.polygon(amberPolygonCoords, {
      color: '#D97706',
      weight: 1.5,
      fillColor: '#D97706',
      fillOpacity: 0.26,
    }).addTo(groups.polygons);

    // 2. Routes (Blue dashed EMS/Helicopter Corridor + Red/Amber Severed Highway)
    // Blue Dashed EMS Route to Victoria Hospital
    const emsRouteCoords = [
      [12.9765, 77.5980],
      [12.9716, 77.5946],
      [12.9680, 77.5850],
      [12.9630, 77.5750],
    ];
    L.polyline(emsRouteCoords, {
      color: '#3B82F6',
      weight: 2.5,
      dashArray: '6, 6',
      opacity: 0.85,
    }).addTo(groups.routes);

    // Red Highway Severance (Outer Ring Road / Industrial Overpass 4)
    const roadSeveredCoords = [
      [12.9780, 77.5990],
      [12.9750, 77.6020],
      [12.9720, 77.6040],
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
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
      </div>
    `;
    L.marker([12.9716, 77.5946], {
      icon: L.divIcon({ html: incidentPinHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] }),
    }).addTo(groups.pins);

    // Staging Area Pin (Sector Charlie Triage Staging)
    const stagingPinHtml = `
      <div style="background: #11151C; border: 1.5px solid #64748B; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #E2E8F0; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); cursor: pointer; white-space: nowrap;">
        <span style="color: #38BDF8;">&#9650;</span> Staging Area
      </div>
    `;
    L.marker([12.9680, 77.5990], {
      icon: L.divIcon({ html: stagingPinHtml, className: '', iconSize: [95, 22], iconAnchor: [47, 11] }),
    }).addTo(groups.pins);

    // Air Med / Helicopter Pin
    const heliPinHtml = `
      <div style="background: #18202A; border: 1.5px solid #3B82F6; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(59, 130, 246, 0.7); cursor: pointer; font-size: 11px; color: #60A5FA;">
        H
      </div>
    `;
    L.marker([12.9750, 77.6010], {
      icon: L.divIcon({ html: heliPinHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] }),
    }).addTo(groups.pins);

    // Hospital Pins (Victoria, St. Martha's, Bowring)
    hospitals.forEach((hosp) => {
      const coords = getEntityCoords(hosp);
      const isCritical = hosp.status && hosp.status.includes('CRITICAL');
      const hospHtml = `
        <div style="background: #11151C; border: 1.5px solid ${isCritical ? '#EF4444' : '#38BDF8'}; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: ${isCritical ? '#F87171' : '#38BDF8'}; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.6); cursor: pointer; white-space: nowrap;">
          <span style="font-weight: 900;">+</span> ${hosp.name.split(' ')[0]}
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
        <div style="background: #151B22; border: 1.5px solid #94A3B8; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.6); cursor: pointer; font-size: 9px; font-weight: 800; color: #E2E8F0;">
          A
        </div>
      `;
      L.marker(coords, {
        icon: L.divIcon({ html: ambHtml, className: '', iconSize: [20, 20], iconAnchor: [10, 10] }),
      }).addTo(groups.pins).on('click', () => onSelectEntity && onSelectEntity({ type: 'AMBULANCE', data: amb }));
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [incident, victimZones, hospitals, ambulances, roadDisruptions]);

  // Basemap Switcher Handler
  const handleBasemapChange = (style) => {
    if (!mapInstanceRef.current || !tileLayersRef.current.darkBase) return;
    const map = mapInstanceRef.current;
    const { darkBase, darkRef, satBase, satRef, street } = tileLayersRef.current;

    // Remove all base layers
    [darkBase, darkRef, satBase, satRef, street].forEach((l) => {
      if (l && map.hasLayer(l)) map.removeLayer(l);
    });

    if (style === 'TACTICAL_DARK') {
      darkBase.addTo(map);
      darkRef.addTo(map);
    } else if (style === 'SATELLITE') {
      satBase.addTo(map);
      satRef.addTo(map);
    } else {
      street.addTo(map);
    }
    setBasemapStyle(style);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Title & Coordinate Metadata */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0', letterSpacing: '-0.2px', margin: 0 }}>
          Tactical Map
        </h3>
        <span className="mono" style={{ fontSize: '11px', color: '#64748B' }}>
          BENGALURU CENTRAL FREIGHT CORRIDOR • SECTOR 7
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

        {/* Top-Right Basemap Switcher Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            display: 'flex',
            gap: '4px',
            background: 'rgba(17, 21, 28, 0.94)',
            border: '1px solid #232B36',
            borderRadius: '4px',
            padding: '3px 4px',
          }}
        >
          <button
            onClick={() => handleBasemapChange('TACTICAL_DARK')}
            style={{
              background: basemapStyle === 'TACTICAL_DARK' ? '#2563EB' : 'transparent',
              color: basemapStyle === 'TACTICAL_DARK' ? '#FFFFFF' : '#94A3B8',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '3px',
            }}
          >
            Tactical Dark
          </button>
          <button
            onClick={() => handleBasemapChange('SATELLITE')}
            style={{
              background: basemapStyle === 'SATELLITE' ? '#2563EB' : 'transparent',
              color: basemapStyle === 'SATELLITE' ? '#FFFFFF' : '#94A3B8',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '3px',
            }}
          >
            Satellite
          </button>
          <button
            onClick={() => handleBasemapChange('STREET')}
            style={{
              background: basemapStyle === 'STREET' ? '#2563EB' : 'transparent',
              color: basemapStyle === 'STREET' ? '#FFFFFF' : '#94A3B8',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '3px',
            }}
          >
            Street
          </button>
        </div>

        {/* Floating Triage Legend Overlay (Matching Reference Image) */}
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
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#DC2626', border: '1px solid #FFF', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Incident Pins</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '0', height: '0', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '7px solid #38BDF8', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Staging Area</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '12px', height: '2px', background: '#3B82F6', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>EMS/Helicopter Route</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '12px', height: '2px', background: '#DC2626', display: 'inline-block' }} />
            <span style={{ color: '#94A3B8' }}>Highway Detours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

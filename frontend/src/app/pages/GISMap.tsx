import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { getLostItems, getFoundItems } from "../services/api";

// Mapping campus locations to specific latitude/longitude points so they display accurately on the map
const campusCoordinates: Record<string, [number, number]> = {
  'Classroom': [12.9720, 77.5950],
  'Library': [12.9716, 77.5946],
  'Canteen': [12.9750, 77.5990],
  'Laboratory': [12.9735, 77.5975],
  'Hostel': [12.9700, 77.5965],
  'Sports Ground': [12.9740, 77.5950],
  'Main Gate': [12.9705, 77.5930],
  'Others': [12.9725, 77.5960]
};

export default function GISMap() {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  useEffect(() => {
    // Prevent duplicate map initialization in React Strict Mode
    const container = L.DomUtil.get('map');
    if (container != null && (container as any)._leaflet_id) {
        return; 
    }
    
    // Initialize map focusing on the campus center
    const map = L.map("map").setView([12.9725, 77.5960], 16);

    // Using CartoDB Voyager for a more colorful, vibrant map background
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CartoDB",
    }).addTo(map);

    setMapInstance(map);

    return () => {
       map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const fetchData = async () => {
      try {
        // Fetch real items from your backend!
        const [lost, found] = await Promise.all([getLostItems(), getFoundItems()]);

        const allItems = [
          ...lost.map((item: any) => ({ ...item, status: 'lost' })),
          ...found.map((item: any) => ({ ...item, status: 'found' }))
        ];

        const heatPoints: any[] = [];
        const layerGroup = L.layerGroup().addTo(mapInstance);

        allItems.forEach((item) => {
          let lat = 12.9725;
          let lng = 77.5960;

          // 1. Check if the location is one of our predefined campus spots
          if (item.location && campusCoordinates[item.location]) {
            [lat, lng] = campusCoordinates[item.location];
            // Add a tiny random offset so items in the same location don't overlap completely
            lat += (Math.random() - 0.5) * 0.0003;
            lng += (Math.random() - 0.5) * 0.0003;
          } 
          // 2. If it's a raw GPS coordinate (Lat: XX, Long: XX), extract the numbers
          else if (item.location && item.location.includes("Lat:")) {
            const match = item.location.match(/Lat:\s*([0-9.-]+),\s*Long:\s*([0-9.-]+)/);
            if (match) {
               lat = parseFloat(match[1]);
               lng = parseFloat(match[2]);
            }
          }

          const isLost = item.status === "lost";
          const color = isLost ? "#ef4444" : "#2563eb"; // High contrast red and blue

          L.circleMarker([lat, lng], {
            radius: isLost ? 9 : 7,
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            weight: 2
          })
            .addTo(layerGroup)
            .bindPopup(
              `<div style="color: #1e293b; font-family: sans-serif; padding: 5px;">
                <b style="font-size: 16px; display: block; margin-bottom: 4px;">${item.itemName}</b>
                <span style="color: ${color}; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; background: ${isLost ? '#fee2e2' : '#dbeafe'}; padding: 2px 6px; rounded: 4px;">${item.status.toUpperCase()}</span>
                <p style="margin-top: 8px; color: #64748b; font-size: 12px;"><b>Location:</b> ${item.location}</p>
               </div>`
            );

          // Add to Hotspot Heatmap only if it is a LOST item
          if (isLost) {
            heatPoints.push([lat, lng, 1]); // The '1' is the intensity
          }
        });

        // Generate the heatmap layer with a vibrant, high-intelligence color spectrum
        (L as any).heatLayer(heatPoints, {
          radius: 45,
          blur: 25,
          maxZoom: 17,
          gradient: { 
            0.1: '#3b82f6', // Bright Blue
            0.3: '#22c55e', // Intelligence Green
            0.5: '#eab308', // Warning Yellow
            0.7: '#f97316', // Alert Orange
            1.0: '#ef4444'  // High Frequency Red
          }
        }).addTo(layerGroup);

      } catch (err) {
        console.error("Failed to load map data from backend:", err);
      }
    };

    fetchData();
  }, [mapInstance]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold text-[#1e293b] tracking-tight">
            Campus Intelligence Map
          </h2>
          <p className="text-slate-500 mt-2 text-lg max-w-3xl font-medium">
            Visual intelligence showing all reported items. Red hotspots indicate high-frequency loss areas requiring attention.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div 
          id="map" 
          className="rounded-[1.5rem] overflow-hidden" 
          style={{ height: "650px", width: "100%", zIndex: 1, backgroundColor: '#f8fafc' }}
        ></div>
      </div>
    </div>
  );
}
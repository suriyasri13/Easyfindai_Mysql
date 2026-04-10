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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Fix for Leaflet default icon paths missing in some bundling setups
    // Though we are mostly using circle markers, just in case
    
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
          const color = isLost ? "#EF4444" : "#3B82F6"; // Red for lost, Blue for found

          L.circleMarker([lat, lng], {
            radius: isLost ? 8 : 6,
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
            weight: 2
          })
            .addTo(layerGroup)
            .bindPopup(
              `<b>${item.itemName}</b><br>
               <span style="color: ${color}; font-weight: bold;">${item.status.toUpperCase()}</span><br>
               <b>Location:</b> ${item.location}`
            );

          // Add to Hotspot Heatmap only if it is a LOST item
          if (isLost) {
            heatPoints.push([lat, lng, 1]); // The '1' is the intensity
          }
        });

        // Generate the heatmap layer
        (L as any).heatLayer(heatPoints, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: { 0.4: 'yellow', 0.6: 'orange', 1: 'red' }
        }).addTo(layerGroup);

      } catch (err) {
        console.error("Failed to load map data from backend:", err);
      }
    };

    fetchData();
  }, [mapInstance]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#1E2A44] mb-2">
        Campus Loss Hotspot Map
      </h2>
      <p className="text-gray-600 mb-6">
        Real-time interactive Google Maps-style view of all reported lost items across campus. Red hotspots indicate areas with many lost items.
      </p>

      <div 
        id="map" 
        className="rounded-2xl shadow-xl border-4 border-white" 
        style={{ height: "600px", width: "100%", zIndex: 1 }}
      ></div>
    </div>
  );
}
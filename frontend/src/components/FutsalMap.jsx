import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";

// Fix for default marker icon in Leaflet + Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const FutsalMap = ({ grounds, center = [27.7172, 85.324], zoom = 13 }) => {
  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden glass border-white/10 shadow-2xl relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Adding a dark filter via CSS to match the glassmorphism theme
          className="map-tiles"
        />
        {grounds.map((ground) => (
          <Marker
            key={ground._id}
            position={[
              ground.coordinates?.lat || 27.7,
              ground.coordinates?.lng || 85.3,
            ]}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[150px]">
                <h4 className="font-bold text-dark mb-1">{ground.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{ground.location}</p>
                <Link
                  to={`/futsals/${ground._id}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View Ground →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        <ChangeView center={center} zoom={zoom} />
      </MapContainer>

      <style>{`
        .leaflet-container { background: #0f172a !important; }
        .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.9);
          backdrop-blur: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default FutsalMap;

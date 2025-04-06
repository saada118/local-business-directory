import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapView({ shops }) {
  if (!shops.length) return null;

  const defaultPos = [
    shops[0].latitude || 0,
    shops[0].longitude || 0,
  ];

  return (
    <div className="mb-4">
      <MapContainer
        center={defaultPos}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {shops.map(
          (shop) =>
            shop.latitude &&
            shop.longitude && (
              <Marker
                key={shop.id}
                position={[shop.latitude, shop.longitude]}
              >
                <Popup>
                  <strong>{shop.name}</strong>
                  <br />
                  {shop.category}
                  <br />
                  {shop.address}
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`).then(r=>r.json()).then(setData);
  }, [pilgrimageId]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/home">←戻る</Link>
      <h2>{data.mapTitle}</h2>
      {isLoaded && <GoogleMap mapContainerStyle={{width:'100%', height:'400px'}} center={{lat:35.689, lng:139.692}} zoom={10} onLoad={(map)=>{
        const b = new window.google.maps.LatLngBounds();
        data.spots.forEach(s => b.extend({lat: s.latitude, lng: s.longitude}));
        map.fitBounds(b);
      }}>
        {data.spots.map(s => <Marker key={s.id} position={{lat: s.latitude, lng: s.longitude}} onClick={()=>setSelected(s)} />)}
        {selected && <InfoWindow position={{lat: selected.latitude, lng: selected.longitude}} onCloseClick={()=>setSelected(null)}>
          <div>
            <h4>{selected.name}</h4>
            {selected.address && <p>{selected.address}</p>}
            {selected.image_path && <img src={`http://localhost:3000/${selected.image_path}`} style={{width:'100px'}} />}
          </div>
        </InfoWindow>}
      </GoogleMap>}
      <div style={{marginTop:'20px'}}>
        {data.spots.map(s => (
          <div key={s.id} style={{border:'1px solid #ccc', padding:'10px', marginBottom:'10px'}}>
            <h4>{s.name}</h4>
            <p>{s.address}</p>
            {s.nearby_info && <p>📝 {s.nearby_info}</p>}
            {s.image_path && <img src={`http://localhost:3000/${s.image_path}`} style={{maxHeight:'100px'}} />}
          </div>
        ))}
      </div>
    </div>
  );
}
export default ViewScreen;
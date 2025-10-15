import "../misEstilos.css"; // Comentado para evitar carga duplicada, ya se importa en main.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import VehiculoCard from "../components/VehiculoCard";
 import { API_URL, getVehiculoImageCandidates } from '../lib/api' // Comentado: herramientas de depuración
 

 

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState(false); // Comentado: depuración JSON

  useEffect(() => {
    async function fetchVehiculos() {
      try {
        const res = await fetch(`${API_URL}/vehiculos`)
        if (!res.ok) throw new Error('Error cargando vehículos')
        const data = await res.json()
        const archivosPorId = {
          1: 'Toyota_Corolla_2020.png',
          2: 'yaris.jpg',
          3: 'rav4-portada.jpg',
          5: 'images.jfif',
          8: 'Chevrolet_Onix.jpg',
          9: 'Chevrolet_Tracker.jpg',
          10: 'Volkswagen_Gol.JPG',
          11: 'wolks-T-Cross.jpg',
          12: 'corsa_2015.jpg'
        }
        const lista = (data.data || []).map(v => ({
          ...v,
          imagen: (v.imagen && String(v.imagen).trim()) || archivosPorId[v.id] || ''
        }))
        const excluidos = new Set([4, 6, 7])
        const listaFiltrada = lista.filter(v => !excluidos.has(Number(v.id)))
        setVehiculos(listaFiltrada)
      } catch (error) {
        console.error("Error al traer vehículos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehiculos();
  }, []);

  if (loading) return <p>Cargando vehículos...</p>;

  return (
    <>
      <Outlet />
      {/* Herramientas de depuración */}
      {import.meta.env.MODE !== 'production' ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 8px 0 8px' }}>
          <span style={{ opacity:0.8 }}>Vehículos: {vehiculos.length}</span>
        </div>
      ) : null}
      {debug ? (
        <pre style={{
          margin:8,
          padding:8,
          background:'rgba(0,0,0,0.4)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:8,
          whiteSpace:'pre-wrap'
        }}>
{JSON.stringify(vehiculos.map(v => ({
  id: v.id,
  marca: v.marca,
  modelo: v.modelo,
  anio: v.anio,
  imagen: v.imagen,
  candidatos: getVehiculoImageCandidates(v).slice(0,6)
})), null, 2)}
        </pre>
      ) : null}
      {/* Layout responsive a ancho/alto, con scroll interno si se desborda */}
      <div
        className="vehiculos-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gridAutoRows: '1fr',
          gap: 16,
          alignContent: 'start',
          alignItems: 'stretch',
          width: '100%',
          flex: 1,
          overflow: 'auto',
          padding: 8,
          boxSizing: 'border-box'
        }}
      >
        {vehiculos.map((v) => (
          <VehiculoCard key={v.id} vehiculo={v} />
        ))}
      </div>
    </>
  );
}

export default Vehiculos;



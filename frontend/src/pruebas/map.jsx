import React from "react";

export default function VehiculosDemo() {
  // listado de prueba de vehículos
  const listaVehiculos = [
    { id: 1, marca: "Toyota", modelo: "Corolla", anio: 2020 },
    { id: 2, marca: "Honda", modelo: "Civic", anio: 2019 },
    { id: 3, marca: "Ford", modelo: "Focus", anio: 2018 },
  ];

  return (
    <>
      <ul>
        {/* recorrer con map y mostrar marca/modelo/año */}
        {listaVehiculos.map((v) => (
          <li key={v.id}>{v.marca} {v.modelo} ({v.anio})</li>
        ))}
      </ul>
    </>
  );
}

//map recorre arrays -> al recorrer elemento por elemento puero retornar alguna operacion por cada uno de estos elementos

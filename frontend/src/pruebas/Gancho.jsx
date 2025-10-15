import { useState } from "react";

export default function Gancho() {
  const [contador, setContador] = useState(0);
  const [email, setEmail] = useState("");

  const handleClic = () => {
    setContador((prev) => {
      const next = prev + 1;
      console.log(next);
      return next;
    });
  };

  //------------------------------------------------------------

  return (
    <>
      <h1>Cantidad en: {contador}</h1>
      <button onClick={handleClic}>Sumar</button>

      <hr />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="tu@email.com"
      />
      <button onClick={() => console.log(email)}>VerEmail</button>
    </>
  );
}

//un hook o gancho, es una funcion que tiene dos parametrs, el primero es una variable (estado) y el segundo parametro es la funcion encargada de actualizar esa variable (actualiza ese estado)

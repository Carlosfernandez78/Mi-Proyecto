import React, { useState } from 'react'

export default function PasswordToggleInput({
  value,
  onChange,
  placeholder = 'Contraseña',
  name = 'password',
  required = true,
  className = '',
  style = {},
  autoComplete = 'new-password'
}) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ display:'flex', alignItems:'center' }}>
      <input
        placeholder={placeholder}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        style={{ flex:1, ...style }}
        name={name}
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        aria-autocomplete="none"
        className={className}
      />
      <button
        type="button"
        className="auth-toggle"
        onClick={() => setShow(v => !v)}
        tabIndex={-1}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        title={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <span aria-hidden="true">{show ? '🙈' : '👁️'}</span>
      </button>
    </div>
  )
}





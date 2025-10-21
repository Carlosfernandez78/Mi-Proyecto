import React, { useEffect, useRef } from 'react'

export default function ShadowPasswordInput({ id, name, placeholder, required, value, onChange, inputType = 'password' }) {
  const hostRef = useRef(null)
  const inputElRef = useRef(null)
  const shadowRef = useRef(null)

  // Create shadow DOM and input once
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (!shadowRef.current) {
      shadowRef.current = host.attachShadow({ mode: 'closed' })
      const style = document.createElement('style')
      style.textContent = `
        input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.15);
          background-color: rgba(255,255,255,0.15);
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
          color: inherit;
          box-sizing: border-box;
        }
        input::placeholder { color: rgba(255,255,255,0.85); }
        input:focus { outline: none; box-shadow: 0 0 0 2px rgba(255,140,0,0.25); border-color: rgba(255,140,0,0.85); }
      `
      const input = document.createElement('input')
      inputElRef.current = input
      input.type = inputType || 'password'
      if (id) input.id = id
      if (name) input.name = name
      input.placeholder = placeholder || ''
      if (required) input.required = true
      input.autocomplete = 'new-password'
      input.autocapitalize = 'none'
      input.autocorrect = 'off'
      input.spellcheck = false
      input.setAttribute('data-lpignore', 'true')
      input.setAttribute('data-1p-ignore', 'true')
      input.setAttribute('data-bwignore', 'true')
      // Prevent password managers by delaying editability until focus
      input.readOnly = true
      input.addEventListener('focus', () => { input.readOnly = false })
      input.addEventListener('input', (e) => {
        onChange && onChange({ target: { value: e.target.value } })
      })
      if (typeof value !== 'undefined') input.value = value
      shadowRef.current.appendChild(style)
      shadowRef.current.appendChild(input)
    }
  }, [])

  // Sync props to inner input
  useEffect(() => {
    const input = inputElRef.current
    if (!input) return
    if (typeof value !== 'undefined' && input.value !== value) {
      input.value = value
    }
    const nextType = inputType || 'password'
    if (input.type !== nextType) input.type = nextType
  }, [value, inputType])

  return <div ref={hostRef} style={{ flex: 1 }} />
}



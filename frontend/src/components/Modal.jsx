import React, { useEffect } from 'react'

export default function Modal({ open, onClose, children, title }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title ? <h3 className="modal-title">{title}</h3> : null}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}





import React, { useEffect, useMemo, useRef } from 'react'

export default function IframePasswordInput({ placeholder = 'contraseña', onChange, required }) {
  const frameRef = useRef(null)
  const channelId = useMemo(() => 'pw-' + Math.random().toString(36).slice(2), [])

  useEffect(() => {
    function onMsg(e) {
      try {
        const data = e.data || {}
        if (data && data.__pw && data.channel === channelId && typeof data.value === 'string') {
          onChange && onChange({ target: { value: data.value } })
        }
      } catch {}
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [channelId, onChange])

  const srcDoc = useMemo(() => `<!doctype html><html><head><meta charset="utf-8">
  <style>
    html,body{margin:0;padding:0;background:transparent}
    .wrap{padding:0}
    input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(0,0,0,0.15);background:rgba(255,255,255,0.15);color:#fff;box-sizing:border-box;font:inherit}
    input::placeholder{color:rgba(255,255,255,0.85)}
    input:focus{outline:none;box-shadow:0 0 0 2px rgba(255,140,0,0.25);border-color:rgba(255,140,0,0.85)}
  </style></head><body>
  <div class="wrap"><input id="pwin" type="password" placeholder="${placeholder.replace(/"/g, '&quot;')}" autocomplete="new-password" autocapitalize="none" autocorrect="off" spellcheck="false" readonly /></div>
  <script>
    const input = document.getElementById('pwin');
    input.addEventListener('focus', ()=>{ input.readOnly = false; });
    input.addEventListener('input', ()=>{
      parent.postMessage({__pw:true, channel:'${channelId}', value: input.value}, '*');
    });
  </script>
  </body></html>`, [placeholder, channelId])

  return (
    <iframe
      ref={frameRef}
      title="pw-iframe"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      style={{ width: '100%', height: 44, border: 'none', borderRadius: 10, overflow: 'hidden', background: 'transparent' }}
      aria-required={required ? 'true' : 'false'}
    />
  )
}



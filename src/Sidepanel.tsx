import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


function Sidepanel() {
    return <><div>This is the sidepanel</div></>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sidepanel />
  </StrictMode>,
)

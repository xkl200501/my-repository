import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Index from './pages/Index'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<Index />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </HashRouter>
  )
}

export default App

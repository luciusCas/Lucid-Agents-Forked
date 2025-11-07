import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marketplace from './pages/Marketplace'
import AgentDetail from './pages/AgentDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/agent/:agentId" element={<AgentDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

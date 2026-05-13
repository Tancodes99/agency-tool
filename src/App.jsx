import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'
import ProjectDetail from './pages/ProjectDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import Team from './pages/Team'
import Planner from './pages/Planner'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/client/:id" element={<ClientPage />} />
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/project/:id" element={<Layout><ProjectDetail /></Layout>} />
      <Route path="/team" element={<Layout><Team /></Layout>} />
      <Route path="/planner" element={<Layout><Planner /></Layout>} />
      <Route
  path="/settings"
  element={
      <Layout>
        <Settings />
      </Layout>
    }
/>
    </Routes>
  )
}

export default App
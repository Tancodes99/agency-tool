import {
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ClientPage from "./pages/ClientPage";
import ProjectDetail from "./pages/ProjectDetail";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Layout from "./components/Layout";

import SystemTester from './pages/SystemTester'
import Activity from './pages/Activity'

import ProtectedRoute from "./components/ProtectedRoute";
import Team from './pages/Team'

function App() {

  return (

    <Routes>
      <Route path="/team" element={<Team />} />
      <Route
  path="/activity"
  element={<Activity />}
/>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/client/:id"
        element={<ClientPage />}
      />
      <Route path="/tester" element={<SystemTester />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>

            <Layout>
              <Dashboard />
            </Layout>

          </ProtectedRoute>
        }
      />

      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>

            <Layout>
              <ProjectDetail />
            </Layout>

          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
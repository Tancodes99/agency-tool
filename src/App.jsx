import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ClientPage from "./pages/ClientPage";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/client/:id"
          element={<ClientPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
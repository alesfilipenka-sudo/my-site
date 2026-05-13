import { BrowserRouter, Routes, Route } from "react-router-dom";
import Site from "./pages/Site";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ProjectsPage from "./pages/ProjectsPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Site />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/login"    element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

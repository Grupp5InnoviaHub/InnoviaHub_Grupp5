import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookingPage from "./pages/BookingPage";
import AdminLayout from "./components/Admin/Layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Bookings from "./pages/Admin/Bookings";
import Resources from "./pages/Admin/Resources";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import AdminWrapper from "./components/Admin/AdminWrapper";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Main Website Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/bookings" element={<BookingPage />} />

        {/* Admin Routes with AdminAuthProvider */}
        <Route
          path="/admin/*"
          element={
            <AdminWrapper>
              <Routes>
                <Route
                  path=""
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="resources" element={<Resources />} />
                  <Route
                    path="*"
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                </Route>
              </Routes>
            </AdminWrapper>
          }
        />

        {/* Default redirect to home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

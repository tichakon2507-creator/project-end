import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/authStore";
import { Spinner } from "./components/common/Ui";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Health from "./pages/Health";
import Emergency from "./pages/Emergency";
import Alerts from "./pages/Alerts";
import Location from "./pages/Location";
import History from "./pages/History";
import Device from "./pages/Device";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
    const { token, ready } = useAuth();
    const location = useLocation();

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0B14] text-[var(--midnight-muted)]">
                <Spinner className="h-6 w-6" />
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Outlet />
                        </MainLayout>
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/health" element={<Health />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/location" element={<Location />} />
                <Route path="/history" element={<History />} />
                <Route path="/device" element={<Device />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;

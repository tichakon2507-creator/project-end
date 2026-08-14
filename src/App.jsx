import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";

import Health from "./pages/Health";
import Emergency from "./pages/Emergency";
import Location from "./pages/Location";
import History from "./pages/History";
import Device from "./pages/Device";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

function App() {
    return (
        <MainLayout>

            <Routes>

                <Route path="/" element={<Dashboard />} />

                <Route path="/health" element={<Health />} />

                <Route path="/emergency" element={<Emergency />} />

                <Route path="/location" element={<Location />} />

                <Route path="/history" element={<History />} />

                <Route path="/device" element={<Device />} />

                <Route path="/users" element={<Users />} />

                <Route path="/settings" element={<Settings />} />

            </Routes>

        </MainLayout>
    );
}

export default App;
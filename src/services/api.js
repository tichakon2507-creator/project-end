import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "smart_health_token";
const USER_KEY = "smart_health_user";

function read(storage, key) {
    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
}

function write(storage, key, value) {
    try {
        storage.setItem(key, value);
    } catch {
        return;
    }
}

function remove(storage, key) {
    try {
        storage.removeItem(key);
    } catch {
        return;
    }
}

export function getToken() {
    return (
        read(window.localStorage, TOKEN_KEY) ||
        read(window.sessionStorage, TOKEN_KEY) ||
        null
    );
}

export function getStoredUser() {
    const raw =
        read(window.localStorage, USER_KEY) ||
        read(window.sessionStorage, USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function saveAuth(token, user, remember = true) {
    const target = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;

    remove(other, TOKEN_KEY);
    remove(other, USER_KEY);
    write(target, TOKEN_KEY, token);

    if (user) {
        write(target, USER_KEY, JSON.stringify(user));
    } else {
        remove(target, USER_KEY);
    }
}

export function saveStoredUser(user) {
    const target = read(window.localStorage, TOKEN_KEY)
        ? window.localStorage
        : window.sessionStorage;
    if (user) {
        write(target, USER_KEY, JSON.stringify(user));
    } else {
        remove(target, USER_KEY);
    }
}

export function clearAuth() {
    [window.localStorage, window.sessionStorage].forEach((storage) => {
        remove(storage, TOKEN_KEY);
        remove(storage, USER_KEY);
    });
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => Promise.reject(err)
);

api.interceptors.response.use(
    (res) => res.data,
    (err) => {
        const message =
            err?.response?.data?.error?.message ||
            err?.response?.data?.error?.type ||
            err?.message ||
            "Request failed";
        err.apiMessage = message;

        if (err?.response?.status === 401) {
            const url = String(err?.config?.url || "");
            const isAuthAttempt =
                url.includes("/auth/login") ||
                url.includes("/auth/register") ||
                url.includes("/auth/forgot-password") ||
                url.includes("/auth/reset-password");
            if (!isAuthAttempt) {
                clearAuth();
                if (
                    typeof window !== "undefined" &&
                    window.location.pathname !== "/login"
                ) {
                    window.location.replace("/login");
                }
            }
        }

        throw err;
    }
);

// Health
export async function fetchHealthLatest(params) {
    return api.get("/health/latest", { params });
}

export async function fetchHealthHistory(params) {
    return api.get("/health/history", { params });
}

// Dashboard
export async function fetchDashboardOverview() {
    return api.get("/dashboard/overview");
}

// Devices
export async function fetchDevices() {
    return api.get("/devices");
}

export async function fetchDeviceStatus(deviceId) {
    return api.get(`/devices/${deviceId}/status`);
}

export async function fetchDeviceByDeviceId(deviceId) {
    return api.get(`/devices/${encodeURIComponent(deviceId)}`);
}

export async function fetchDeviceProfile(deviceId) {
    return api.get(`/devices/${encodeURIComponent(deviceId)}/profile`);
}

export async function updateDeviceProfile(deviceId, data) {
    return api.put(`/devices/${encodeURIComponent(deviceId)}/profile`, data);
}

// Emergency
export async function fetchActiveEmergencies() {
    return api.get("/emergency/status");
}

export async function fetchEmergencyHistory(params) {
    return api.get("/emergency/history", { params });
}

export async function updateEmergencyStatus(id, payload) {
    return api.patch(`/emergency/${id}/status`, payload);
}

// Location
export async function fetchLatestLocations() {
    return api.get("/location/latest");
}

export async function fetchLocationHistory(params) {
    return api.get("/location/history", { params });
}

// Users
export async function fetchUsers(params) {
    return api.get("/users", { params });
}

export async function fetchUserProfile(userId) {
    return api.get(`/users/${userId}`);
}

export async function updateUser(userId, payload) {
    return api.patch(`/users/${userId}`, payload);
}

// Settings
export async function fetchSystemSettings() {
    return api.get("/settings");
}

export async function updateSystemSettings(data) {
    return api.put("/settings", data);
}

export async function fetchThresholds() {
    return api.get("/settings/thresholds");
}

export async function updateThresholds(data) {
    return api.put("/settings/thresholds", data);
}

export async function fetchMQTTSettings() {
    return api.get("/settings/mqtt");
}

export async function updateMQTTSettings(data) {
    return api.put("/settings/mqtt", data);
}

export async function reconnectMQTTSettings() {
    return api.post("/settings/mqtt/reconnect");
}

// Notification Settings (Telegram)
export async function fetchNotificationSettings() {
    return api.get("/settings/notification");
}

export async function updateNotificationSettings(data) {
    return api.put("/settings/notification", data);
}

export async function fetchTelegramLink() {
    return api.get("/settings/telegram-link");
}

export async function disconnectTelegramLink() {
    return api.delete("/settings/telegram-link");
}

export async function testTelegramMessage() {
    return api.post("/settings/test-telegram");
}

// System check
export async function testDatabaseConnection() {
    return api.get("/test-db");
}

// Auth
export async function fetchMe() {
    return api.get("/auth/me");
}

export async function login(credentials) {
    return api.post("/auth/login", credentials);
}

export async function registerUser(data) {
    return api.post("/auth/register", data);
}

export async function requestPasswordReset(identifier) {
    return api.post("/auth/forgot-password", { identifier });
}

export async function resetPassword(data) {
    return api.post("/auth/reset-password", data);
}

export async function updateMyProfile(data) {
    return api.patch("/auth/me", data);
}

export async function changeMyPassword(data) {
    return api.post("/auth/change-password", data);
}

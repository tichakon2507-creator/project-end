import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    api,
    clearAuth,
    fetchMe,
    getStoredUser,
    getToken,
    saveAuth,
    saveStoredUser,
} from "../services/api";
import { AuthContext } from "./authStore";

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => getStoredUser());
    const [token, setToken] = useState(() => getToken());
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;

        if (!getToken()) {
            setReady(true);
            return () => {
                active = false;
            };
        }

        fetchMe()
            .then((res) => {
                if (active) {
                    const current = res?.data || null;
                    setUser(current);
                    saveStoredUser(current);
                }
            })
            .catch(() => {
                if (active) {
                    clearAuth();
                    setUser(null);
                    setToken(null);
                }
            })
            .finally(() => {
                if (active) {
                    setReady(true);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(async (credentials, remember = true) => {
        const res = await api.post("/auth/login", credentials);
        const data = res?.data || {};
        const accessToken = data.access_token;

        if (!accessToken) {
            throw new Error("Login response did not include an access token.");
        }

        saveAuth(accessToken, data.user || null, remember);
        setToken(accessToken);
        setUser(data.user || null);

        return data;
    }, []);

    const register = useCallback(async (payload, remember = true) => {
        const res = await api.post("/auth/register", payload);
        const data = res?.data || {};
        const accessToken = data.access_token;

        if (!accessToken) {
            throw new Error("Register response did not include an access token.");
        }

        saveAuth(accessToken, data.user || null, remember);
        setToken(accessToken);
        setUser(data.user || null);

        return data;
    }, []);

    const refreshUser = useCallback(async () => {
        const res = await fetchMe();
        const current = res?.data || null;
        setUser(current);
        saveStoredUser(current);
        return current;
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    const value = useMemo(
        () => ({ user, token, ready, login, register, refreshUser, logout }),
        [user, token, ready, login, register, refreshUser, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

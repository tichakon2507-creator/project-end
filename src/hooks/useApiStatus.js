import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useApiStatus(options = {}) {
    const [status, setStatus] = useState("checking");
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            try {
                await api.get("/test-db");
                if (!cancelled) {
                    setStatus("connected");
                }
            } catch {
                if (!cancelled) {
                    setStatus("disconnected");
                }
            }
        };

        check();
        const interval = setInterval(check, 15000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [refreshKey]);

    return options.withRefresh ? { status, refresh } : status;
}

export function formatDateTime(value) {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatTime(value) {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function toDateTimeParts(value) {
    if (!value) {
        return { date: "—", time: "—" };
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { date: String(value), time: "—" };
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return { date: `${day}/${month}/${year}`, time: `${hour}:${minute}` };
}

export function isHealthyRecord(record) {
    const heart = Number(record?.heart_rate);
    const spo2 = Number(record?.spo2);
    const temperature = Number(record?.temperature);
    const heartOk = Number.isFinite(heart) && heart >= 70 && heart <= 100;
    const spo2Ok = Number.isFinite(spo2) && spo2 >= 90;
    const tempOk =
        Number.isFinite(temperature) && temperature >= 36 && temperature <= 37.5;
    return heartOk && spo2Ok && tempOk;
}

export function formatCoordinates(lat, lng) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
        return "N/A";
    }
    return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

export function firstDefined(...values) {
    for (const value of values) {
        if (value !== null && value !== undefined && value !== "" && value !== "--") {
            return value;
        }
    }
    return "--";
}

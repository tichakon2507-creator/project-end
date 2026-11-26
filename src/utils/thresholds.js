export const DEFAULT_THRESHOLDS = {
    hr_min: 45,
    hr_max: 120,
    temp_max: 38.5,
    spo2_min: 92,
};

function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

export function classifyRecord(record, thresholds) {
    const limits = thresholds || DEFAULT_THRESHOLDS;
    const heartRate = toNumber(record?.heart_rate);
    const temperature = toNumber(record?.temperature);
    const spo2 = toNumber(record?.spo2);
    if (heartRate !== null && (heartRate < limits.hr_min || heartRate > limits.hr_max)) return "วิกฤต";
    if (temperature !== null && temperature > limits.temp_max) return "วิกฤต";
    if (spo2 !== null && spo2 < limits.spo2_min) return "วิกฤต";
    return "ปกติ";
}

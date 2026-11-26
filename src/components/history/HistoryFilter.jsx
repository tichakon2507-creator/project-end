import { CalendarDays, Download, Search } from "lucide-react";

import { FIELD_INPUT_CLASS, IconField } from "../common/Ui";

const categories = ["All", "Health", "Emergency", "GPS", "Device"];

function HistoryFilter({
    search = "",
    category = "All",
    fromDate = "",
    toDate = "",
    onSearchChange = () => {},
    onCategoryChange = () => {},
    onFromDateChange = () => {},
    onToDateChange = () => {},
    onExport = () => {},
}) {
    return (
        <div className="ui-card p-5 md:p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
                {categories.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onCategoryChange(item)}
                        className={`ui-pill ${category === item ? "ui-pill-active" : ""}`}
                    >
                        {item}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                <div className="xl:col-span-3">
                    <label className="block text-xs font-semibold text-[var(--midnight-muted)] mb-2">Search</label>
                    <IconField icon={Search}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search records..."
                            className={FIELD_INPUT_CLASS}
                        />
                    </IconField>
                </div>
                <div className="xl:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--midnight-muted)] mb-2">From</label>
                    <IconField icon={CalendarDays}>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => onFromDateChange(e.target.value)}
                            className={`${FIELD_INPUT_CLASS} ui-num`}
                        />
                    </IconField>
                </div>
                <div className="xl:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--midnight-muted)] mb-2">To</label>
                    <IconField icon={CalendarDays}>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => onToDateChange(e.target.value)}
                            className={`${FIELD_INPUT_CLASS} ui-num`}
                        />
                    </IconField>
                </div>
                <div className="xl:col-span-3">
                    <button
                        type="button"
                        onClick={onExport}
                        className="ui-btn ui-press ui-gradient w-full text-white px-4 py-2.5 text-sm"
                    >
                        <Download size={16} /> Export History
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HistoryFilter;

import HistoryStatistics from "../components/history/HistoryStatistics";
import HistoryFilter from "../components/history/HistoryFilter";
import HistoryTimeline from "../components/history/HistoryTimeline";
import HistoryTable from "../components/history/HistoryTable";

function History() {

    return (

        <div className="space-y-8">

            <div className="grid grid-cols-12 gap-6">

                <HistoryStatistics />

            </div>

            <HistoryFilter />

            <HistoryTimeline />

            <HistoryTable />

        </div>

    );

}

export default History;
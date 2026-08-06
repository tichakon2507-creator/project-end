import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function MainLayout({ children }) {

    return (

        <div className="flex min-h-screen">

            <Sidebar />

            <div className="flex-1">

                <Navbar />

                <main className="p-6">

                    {children}

                </main>

            </div>

        </div>

    );

}

export default MainLayout;
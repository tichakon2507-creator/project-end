import UserOverview from "../components/users/UserOverview";
import UserFilter from "../components/users/UserFilter";
import UserTable from "../components/users/UserTable";
import UserProfile from "../components/users/UserProfile";
import UserHealth from "../components/users/UserHealth";

function Users() {

    return (

        <div className="space-y-8">

            <UserOverview />

            <UserFilter />

            <UserTable />

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-4">

                    <UserProfile />

                </div>

                <div className="col-span-8">

                    <UserHealth />

                </div>

            </div>

        </div>

    );

}

export default Users;
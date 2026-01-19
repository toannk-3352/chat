import { getProfile } from "@/lib/actions/user";
import Profile from "./_components/Profile";

const UserProfilePage = async() => {
  const user = await getProfile();
  return (
    <div className="bg-white p-8 border rounded-md shadow-md w-96 gap-3 flex-col justify-center items-center ">
      <h1 className="text-center text-2xl font-bold mb-4">Profile</h1>
      <Profile user={user}/>
    </div>
  );
};

export default UserProfilePage;

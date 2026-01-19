import UpdateProfileForm from "./_components/UpdateProfileForm";
import { getProfile } from "@/lib/actions/user";

const UpdateProfilePage = async () => {
  const profile = await getProfile();
  
  return (
    <div className="bg-white p-8 border rounded-md shadow-md w-96 gap-3 flex-col justify-center items-center ">
      <h1 className="text-center text-2xl font-bold mb-4">User Update Profile page</h1>
      <UpdateProfileForm initialData={{ name: profile.name, email: profile.email }}></UpdateProfileForm>
    </div>
  );
};

export default UpdateProfilePage;

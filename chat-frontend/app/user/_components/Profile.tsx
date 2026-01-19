"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
type ProfileProps = {
  user: {
    name: string;
    email: string;
  };
};

export default function Profile({ user }: ProfileProps) {
  const handleOnClickButtonEdit = () => {
    redirect("/user/update");
  };
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Name</h3>
        <p className="text-lg font-semibold">{user.name}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Email</h3>
        <p className="text-lg font-semibold">{user.email}</p>
      </div>

      <Button className="w-fit" onClick={handleOnClickButtonEdit}>
        Edit Profile
      </Button>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions/user";
import { useActionState, useEffect } from "react";

type ProfileFormProps = {
  initialData: {
    name: string;
    email: string;
  };
};

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfile, undefined);

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const handleClickButtonBack = () => {
    window.history.back();
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.message && (
        <div
          className={`text-sm ${
            state.success ? "text-green-600" : "text-red-500"
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData.name}
          placeholder="Enter your name"
          disabled={isPending}
        />
        {!!state?.errors?.name && (
          <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          defaultValue={initialData.email}
          disabled
          className="bg-gray-100"
        />
        <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
      </div>

      <div>
        <Label htmlFor="password">New Password (optional)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Leave blank to keep current password"
          disabled={isPending}
        />
        {!!state?.errors?.password && (
          <p className="text-red-500 text-sm mt-1">{state.errors.password}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleClickButtonBack}
        >
          Back
        </Button>
      </div>
    </form>
  );
}

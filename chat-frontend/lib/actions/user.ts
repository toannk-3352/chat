"use server";

import { getUserProfile, updateUserProfile } from "../api/api";
import { getSession } from "../session";
import { UpdateProfileFormState } from "../types/formState";
import { UpdateProfileSchema } from "../zodSchemas/updateProfileSchema";


export async function getProfile() {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const profile = await getUserProfile(session.accessToken);
    return profile;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

export async function updateProfile(
  state: UpdateProfileFormState,
  formData: FormData
): Promise<UpdateProfileFormState> {
  const session = await getSession();
  
  if (!session) {
    return {
      message: "Unauthorized",
    };
  }

  const validatedFields = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please check your input and try again.",
    };
  }

  const { name, password } = validatedFields.data;

  try {
    const updateData: { name: string; password?: string } = { name };
    if (password && password.length > 0) {
      updateData.password = password;
    }

    await updateUserProfile(session.accessToken, updateData);

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      message: "Failed to update profile",
    };
  }
}

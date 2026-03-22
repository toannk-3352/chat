"use server";
import { redirect } from "next/navigation";
import { login, register } from "../api/api";
import { createSession, destroySession } from "../session";
import { SignInFormState, SignUpFormState } from "../types/formState";
import { SignInSchema } from "@/lib//zodSchemas/signInSchema";
import { SignUpSchema } from "@/lib//zodSchemas/signUpSchema";

export async function signIn(
  state: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const validatedFields = SignInSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      data: Object.fromEntries(formData),
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = await login({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (data?.error) {
    return {
      data: Object.fromEntries(formData),
      message: "Invalid credentials, please try again.",
    };
  }

  await createSession({
    user: {
      id: data.id,
      email: data.email,
      name: data.name,
    },
    accessToken: data.accessToken,
  });

  redirect("/");
}

export async function signUp(
  state: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {

  const validatedFields = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please check your input and try again.",
    };
  }

  const { name, email, password } = validatedFields.data;

  const result = await register({ name, email, password });

  if (result.error) {
    return {
      message: result.error,
    };
  }

  redirect("/auth/signin");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

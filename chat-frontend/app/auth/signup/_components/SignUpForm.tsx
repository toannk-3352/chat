"use client";
import SubmitButton from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions/auth";
import { useActionState } from "react";

const SignUpForm = () => {
  const [state, action] = useActionState(signUp, undefined);

  return (
    <form action={action} className="flex flex-col gap-2">
      {state?.message && (
        <div className="text-red-500 text-sm">{state.message}</div>
      )}
      
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          type="text"
        />
      </div>
      {!!state?.errors?.name ? (
        <p className="text-red-500 text-sm">{state.errors.name}</p>
      ) : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          placeholder="Enter your email"
          type="email"
        />
      </div>
      {!!state?.errors?.email ? (
        <p className="text-red-500 text-sm">{state.errors.email}</p>
      ) : null}

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          placeholder="Enter your password"
          type="password"
        />
      </div>
      {!!state?.errors?.password ? (
        <p className="text-red-500 text-sm">{state.errors.password}</p>
      ) : null}

      <SubmitButton>Sign Up</SubmitButton>
    </form>
  );
};

export default SignUpForm;

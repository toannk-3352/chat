import Link from "next/link";
import SignInForm from "./_components/SignInForm";

const SignInPage = () => {
  return (
    <div className="bg-white p-8 border rounded-md shadow-md w-96 gap-3 flex-col justify-center items-center ">
      <h1 className="text-center text-2xl font-bold mb-4">Sign In page</h1>
      <SignInForm />
      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;

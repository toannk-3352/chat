import SignUpForm from "./_components/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="bg-white p-8 border rounded-md shadow-md w-96 gap-3 flex-col justify-center items-center ">
      <h1 className="text-center text-2xl font-bold mb-4">Sign up page</h1>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;

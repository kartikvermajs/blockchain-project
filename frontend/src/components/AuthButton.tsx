import React from "react";
import { Button } from "./ui/button";

const AuthButton = ({
  type,
  loading,
}: {
  type: "login" | "Sign up" | "Reset Password" | "Forgot Password";
  loading: boolean;
}) => {
  return (
    <Button
      disabled={loading}
      type="submit"
      className={`${
        loading ? "bg-gray-600" : "bg-purple-600"
      } rounded-md w-full px-12 py-3 text-sm font-medium text-white`}
    >
      {loading ? "Loading..." : type}
    </Button>
  );
};

export default AuthButton;

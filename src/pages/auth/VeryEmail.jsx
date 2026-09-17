import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

const VerifyEmail = () => {
  const { token } = useParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await api.get(
          `/auth/verify-email/${token}`
        );

        console.log(
          "Email verification response:",
          response.data
        );

        setStatus("success");

        setMessage(
          response.data?.message ||
          "Your email has been verified successfully."
        );

      } catch (error) {
        console.error(
          "Email verification error:",
          error.response?.data || error.message
        );

        setStatus("error");

        setMessage(
          error.response?.data?.message ||
          "Email verification failed."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        {status === "verifying" && (
          <>
            <h1 className="text-3xl font-bold text-white">
              Verifying Email
            </h1>

            <p className="mt-3 text-slate-400">
              Please wait while we verify your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-3xl font-bold text-white">
              Email Verified
            </h1>

            <p className="mt-3 text-emerald-400">
              {message}
            </p>

            <Link
              to="/login"
              className="mt-8 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold text-white">
              Verification Failed
            </h1>

            <p className="mt-3 text-red-400">
              {message}
            </p>

            <Link
              to="/resend-verification"
              className="mt-8 inline-block text-cyan-400"
            >
              Request another verification email
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
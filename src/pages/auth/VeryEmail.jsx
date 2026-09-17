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
      try {
        const response = await api(
          `/auth/verify-email/${token}`
        );

        setStatus("success");

        setMessage(
          response?.message ||
            "Your email has been verified successfully."
        );
      } catch (error) {
        setStatus("error");

        setMessage(
          error?.message ||
            "Email verification failed."
        );
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Verification token is missing.");
    }
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
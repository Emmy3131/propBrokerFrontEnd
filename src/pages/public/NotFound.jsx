import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-cyan-400">404</p>

        <h1 className="mt-2 text-5xl font-bold text-white">
          Page Not Found
        </h1>

        <p className="mt-4 text-slate-400">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950"
        >
          Back Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
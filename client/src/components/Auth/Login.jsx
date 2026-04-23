import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit?.({ email, password });
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome Back
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Log in to continue your journey
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-70"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium text-black">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
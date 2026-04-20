import { useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast'
export default function Signup({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset previous error before a new request.
    setError("");
    setIsSubmitting(true);

    try {
      // Delegate actual API request to page/context layer.
      await onSubmit?.({ name, email, password });
    } catch (submitError) {
      // Prefer backend error message; fallback to network-aware message.
      const message = submitError?.response?.data?.message || submitError?.message || "Signup failed";
      setError(message);
      toast.error(message)
    } finally {
      // Always re-enable submit button.
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Create Account 🚀
        </h1>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            minLength={6}
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            Must be at least 6 characters
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-black py-2 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="cursor-pointer font-medium text-black hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

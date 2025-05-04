import React from "react";
import { Link } from "react-router-dom";

export default function NoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          Go Back Home
        </Link>
      </div>

      {/* Optional image or icon */}
      {/* <img src="/404-illustration.svg" alt="Not found" className="w-2/3 max-w-md mt-10" /> */}
    </div>
  );
}

"use client";

import Link from "next/link";

export default function LoanApplicantsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Loan Application Portal
        </h1>

        <div className="flex flex-col gap-4">
          <Link
            href="/allApplicants"
            className="block w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition"
          >
            View All Loan Applicants
          </Link>

          <Link
            href="/newApplicant"
            className="block w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition"
          >
            Start New Loan Application
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMyContext } from '../contexts/ApplicantContext';
import { ApplicationInfo } from "../types";

export default function LoanApplicantsPage() {
  const { applicants } = useMyContext();

  if (applicants === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg rounded-2xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full m-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Loan Applicants</h1>
          <Link
            href="/newApplicant"
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            + New Applicant
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="p-3 font-semibold border-b">Name</th>
                <th className="p-3 font-semibold border-b">Email</th>
                <th className="p-3 font-semibold border-b">Phone</th>
                <th className="p-3 font-semibold border-b text-center">
                  Open Credit Lines
                </th>
                <th className="p-3 font-semibold border-b text-right">
                  Loan Amount ($)
                </th>
                <th className="p-3 font-semibold border-b text-center">
                  Status
                </th>
                <th className="p-3 font-semibold border-b text-right">
                  Interest (%)
                </th>
                <th className="p-3 font-semibold border-b text-center">
                  Term (months)
                </th>
                <th className="p-3 font-semibold border-b text-right">
                  Monthly Payment ($)
                </th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant: ApplicationInfo) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-indigo-50 transition-colors border-b last:border-none"
                >
                  <td className="p-3">{applicant.name}</td>
                  <td className="p-3">{applicant.email}</td>
                  <td className="p-3">{applicant.phone}</td>
                  <td className="p-3 text-center">
                    {applicant.openCreditLines}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-700">
                    {Number(applicant.requestedLoanAmount)?.toLocaleString()}
                  </td>
                  <td className="p-3 text-center font-medium text-gray-700">
                    {applicant.approved ? "APPROVED" : "DENIED"}
                  </td>
                  <td className="p-3 text-right">{applicant.interest}</td>
                  <td className="p-3 text-right">{applicant.term}</td>
                  <td className="p-3 text-right">
                    {applicant?.monthlyPayment
                      ? applicant.monthlyPayment.toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
              {applicants.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-6 text-gray-500 italic"
                  >
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer navigation */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

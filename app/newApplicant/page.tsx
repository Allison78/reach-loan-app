"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useManageData } from "../hooks/useManageData";
import { ApplicantForm } from "../types";
import { emptyApplication } from "../constants";
import { getNumLinesOfCredit, formatPhoneNumber } from "../helpers";

export default function NewApplicantPage() {
  const { submitLoading, submitApplicant } = useManageData();
  const [form, setForm] = useState<ApplicantForm>({
    ...emptyApplication,
    openCreditLines: getNumLinesOfCredit(),
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitApplicant({
      ...form,
      phone: formatPhoneNumber(form.phone),
    });
    setForm({ ...emptyApplication, openCreditLines: getNumLinesOfCredit() });
  }

  const inputFormFields = Object.keys(form).filter(
    (key) =>
      ![
        "openCreditLines",
        "approved",
        "interest",
        "term",
        "monthlyPayment",
      ].includes(key),
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            New Loan Application
          </h1>
          <Link
            href="/allApplicants"
            className="text-blue-600 hover:underline font-medium"
          >
            ← View All Applicants
          </Link>
        </div>
        
        {submitLoading ? null : (<form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inputFormFields.map((key) => (
              <div key={key} className="flex flex-col">
                <label
                  htmlFor={key}
                  className="text-gray-700 font-medium mb-1 capitalize"
                >
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  id={key}
                  type={key === "email" ? "email" : "text"}
                  name={key}
                  value={form[key as keyof ApplicantForm]}
                  onChange={handleChange}
                  placeholder={key.replace(/([A-Z])/g, " $1")}
                  className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition font-medium"
          >
            Add Applicant
          </button>
        </form>)}

        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

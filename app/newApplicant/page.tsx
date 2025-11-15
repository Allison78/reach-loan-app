"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useManageData } from "../hooks/useManageData";
import { useMyContext } from "../contexts/ApplicantContext";
import { ApplicantForm } from "../types";
import { emptyApplication } from "../constants";
import {
  getNumLinesOfCredit,
  formatPhoneNumber,
  validateName,
  validateEmail,
  validatePhone,
  validateSSN,
  validateAddress,
  validateLoanAmount,
} from "../helpers";

type FormErrors = {
  [K in keyof ApplicantForm]?: string;
};

export default function NewApplicantPage() {
  const { submitApplicant } = useManageData();
  const { submitLoading } = useMyContext();
  const [form, setForm] = useState<ApplicantForm>({
    ...emptyApplication,
    openCreditLines: getNumLinesOfCredit(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: string | number | undefined): string | undefined => {
    switch (name) {
      case "name":
        return validateName(value as string);
      case "email":
        return validateEmail(value as string);
      case "phone":
        return validatePhone(value as string);
      case "ssn":
        return validateSSN(value as string);
      case "address":
        return validateAddress(value as string);
      case "requestedLoanAmount":
        return validateLoanAmount(value as number);
      default:
        return undefined;
    }
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const updatedValue = name === "requestedLoanAmount" ? (value ? Number(value) : 0) : value;
    setForm((prev) => ({ ...prev, [name]: updatedValue }));

    // Clear error when user starts typing
    if (touched.has(name)) {
      const error = validateField(name, updatedValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    const { name } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name, form[name as keyof ApplicantForm]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.keys(form).forEach((key) => {
      if (!["openCreditLines", "approved", "interest", "term", "monthlyPayment"].includes(key)) {
        const error = validateField(key, form[key as keyof ApplicantForm]);
        if (error) {
          newErrors[key as keyof ApplicantForm] = error;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    setTouched(new Set(Object.keys(form)));

    if (hasErrors) {
      return;
    }

    // Submit if validation passes
    submitApplicant({
      ...form,
      phone: formatPhoneNumber(form.phone),
    });
    setForm({ ...emptyApplication, openCreditLines: getNumLinesOfCredit() });
    setErrors({});
    setTouched(new Set());
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
        
       <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inputFormFields.map((key) => {
              const hasError = errors[key as keyof ApplicantForm];
              const inputType =
                key === "email" ? "email" :
                key === "requestedLoanAmount" ? "number" :
                "text";

              return (
                <div key={key} className="flex flex-col">
                  <label
                    htmlFor={key}
                    className="text-gray-700 font-medium mb-1 capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id={key}
                    type={inputType}
                    name={key}
                    value={form[key as keyof ApplicantForm]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={
                      key === "phone" ? "123-456-7890" :
                      key === "ssn" ? "123-45-6789" :
                      key === "requestedLoanAmount" ? undefined :
                      key.replace(/([A-Z])/g, " $1")
                    }
                    className={`border p-2 rounded-lg focus:outline-none focus:ring-2 transition ${
                      hasError
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-400"
                    }`}
                  />
                  <div className="h-4">{hasError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      {hasError}
                    </p>
                  )}</div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitLoading && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {submitLoading ? 'Submitting...' : 'Add Applicant'}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApplicationInfo } from "@/app/types";
import { emptyApplication } from "@/app/constants";
import { getSuffix } from "@/app/helpers";
import { useManageData } from "@/app/hooks/useManageData";
import {useMyContext} from "@/app/contexts/ApplicantContext";

export default function ApplicationResultPage() {
  const { fetchApplicant } = useManageData();
  const { applicants, submitLoading } = useMyContext();

  const params = useParams();
  const [applicant, setApplicant] = useState<ApplicationInfo | null>(null);

  useEffect(() => {
    const getApplicant = async () => {
      // Wait for applicants to load and submitLoading to complete
      if (applicants !== null && !submitLoading && params?.id) {
        const foundApplicant = await fetchApplicant(String(params.id));
        setApplicant(foundApplicant);
      }
    };
    getApplicant();
  }, [params, applicants, submitLoading, fetchApplicant]);

  // Show loading state while data is being fetched
  if (applicants === null || submitLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg rounded-2xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">
            {submitLoading ? 'Processing application...' : 'Loading application...'}
          </p>
        </div>
      </div>
    );
  }

  // Show "not found" if applicant doesn't exist
  if (!applicant) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Applicant Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The application you're looking for doesn't exist.
          </p>
          <Link href="/allApplicants" className="text-blue-600 hover:underline font-medium">
            ← View All Applicants
          </Link>
        </div>
      </div>
    );
  }

  const { approved, ...applicationFields } = applicant;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl">
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Application Results
          </h1>
          {<h2
            className={`text-xl font-bold ${approved ? "text-green-800" : "text-red-800"}`}
          >
            {approved
              ? "Congratulations you're approved!"
              : "We're sorry, your application has been denied."}
          </h2>}
        </div>

        
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(applicationFields).map((key) => {
              const suffix = getSuffix(key);
              return (
                <div key={key} className="flex flex-col">
                  <span
                    className="text-gray-700 font-medium mb-1 capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1")} {suffix}
                  </span>
                  <div
                    id={key}
                    data-testid={key}
                    className="border
                        border-gray-300
                        p-2
                        rounded-md
                        bg-gray-100
                        text-gray-500
                        border-gray-200
                        shadow-none"
                  >
                    {applicant[key as keyof ApplicationInfo]}
                  </div>
                </div>
            )})}
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

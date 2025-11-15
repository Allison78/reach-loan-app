import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { evaluateApplication } from '../helpers';
import { emptyApplication } from '../constants';
import { ApplicantForm, ApplicationInfo } from '../types';
import { useMyContext } from '../contexts/ApplicantContext';

export const useManageData = () => {
  const {
    applicants,
    setApplicants,
    submitLoading,
    setSubmitLoading,
   } = useMyContext();
  const router = useRouter();

  const fetchApplicant = useCallback(async (id: string) => {
    if (!applicants) return;
    return applicants.find((a: ApplicationInfo) => a.id === id) || emptyApplication;
  }, [applicants]);

  const fetchApplicants = useCallback(async () => {
    try {
      const response = await fetch('/api/applicants');

      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }

      const result = await response.json();
      setApplicants(result);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setApplicants([]);
    }
  }, [setApplicants]);

  const submitApplicant = useCallback(async (form: ApplicantForm) => {
    setSubmitLoading(true);
    const applicantForm = evaluateApplication(form);
    const applicantWithId = { ...applicantForm, id: uuidv4() };

    try {
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicantWithId),
      });

      if (!response.ok) {
        throw new Error('Failed to submit applicant');
      }

      await fetchApplicants();
      router.push(`/applicationResult/${applicantWithId.id}`);
    } catch (error) {
      console.error('Error submitting applicant:', error);
      // TODO: Show error message to user
    } finally {
      setSubmitLoading(false);
    }
  }, [setSubmitLoading, fetchApplicants, router]);

  return {
    submitLoading,
    fetchApplicants,
    fetchApplicant,
    submitApplicant,
  }
}
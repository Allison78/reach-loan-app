import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { evaluateApplication } from '../helpers';
import { emptyApplication } from '../constants';
import { ApplicantForm, ApplicationInfo } from '../types';
import { useMyContext } from '../contexts/ApplicantContext';

export const useManageData = () => {
  const { applicants, setApplicants } = useMyContext();
  const [dataLoading, setDataLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  async function fetchApplicant(id: string) {
    return applicants.find((a: ApplicationInfo) => a.id === id) || emptyApplication;
  }
  
  async function fetchApplicants() {
    setDataLoading(true);
    try {
      const readSingle = await fetch(
        'https://edge-config.vercel.com/ecfg_julblvfonndqsb4moq9tzmaemhu5/item/loanApplicants?token=d4265a2a-dc26-4e68-9f6b-a0a54833755d',
        );
        const result = await readSingle.json();
        if (!result) throw new Error("Network Error");
        setApplicants(result);
      } catch (error) {
        return [];
    }
    finally {
      setDataLoading(false);
    }
  }
  
  async function submitApplicant(form: ApplicantForm) {
      setSubmitLoading(true);
      const applicantForm = evaluateApplication(form);
      const applicantWithId = { ...applicantForm, id: uuidv4() };
      try {
      const updateEdgeConfig = await fetch(
          'https://api.vercel.com/v1/edge-config/ecfg_julblvfonndqsb4moq9tzmaemhu5/items',
          {
          method: 'PATCH',
          headers: {
              Authorization: `Bearer ${'LrFP8T28AcKTlMtLHdogyUh4'}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              items: [
              {
                  operation: 'update',
                  key: 'loanApplicants',
                  value: [
                  ...applicants,
                  {...applicantWithId },
                  ]
              },
              ],
          }),
          },
      );
      await updateEdgeConfig.json();
      await fetchApplicants();
  
      router.push(`/applicationResult/${applicantWithId.id}`);
    } catch (error) {
      console.log(error);
    }
    setSubmitLoading(false);
  }

  return {
    dataLoading,
    submitLoading,
    fetchApplicants,
    fetchApplicant,
    submitApplicant,
  }
}
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [applicants, setApplicants] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch applicants once when the provider mounts
  useEffect(() => {
    const fetchApplicants = async () => {
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
    };

    fetchApplicants();
  }, []); // Empty dependency array - only fetch once on mount

  return (
    <MyContext.Provider value={{
      applicants,
      setApplicants,
      submitLoading,
      setSubmitLoading,
    }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
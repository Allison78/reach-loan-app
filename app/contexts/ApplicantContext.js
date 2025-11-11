"use client";

import { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
    const [applicants, setApplicants] = useState(null);
 
  return (
    <MyContext.Provider value={{ applicants, setApplicants }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
export interface ApplicantForm {
  name: string;
  address: string;
  email: string;
  phone: string;
  ssn: string;
  openCreditLines?: number;
  requestedLoanAmount?: number;
}

export interface ApplicationInfo extends ApplicantForm {
  id?: string;
  approved?: boolean;
  term?: number;
  interest?: number;
  monthlyPayment?: number;
}

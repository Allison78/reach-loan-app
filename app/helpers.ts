import { HIGH_INTEREST_CREDIT_LINE_THRESHOLD, HIGH_INTEREST_RATE, LONG_TERM_MONTHS, LOW_INTEREST_CREDIT_LINE_THRESHOLD, LOW_INTEREST_RATE, MAX_LOAN_AMOUNT, MAX_OPEN_CREDIT_LINES, MIN_LOAN_AMOUNT, SHORT_TERM_MONTHS } from "./constants";
import { ApplicationInfo } from "./types";

export function getNumLinesOfCredit() {
  return Math.floor(Math.random() * 100);
}

export function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = ("" + phoneNumberString).replace(/\D/g, "");

  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }

  return phoneNumberString; // Return original if it doesn't match the 10-digit pattern
}

export function getSuffix(key: string) {
  switch (key) {
    case "requestedLoanAmount":
    case "monthlyPayment":
      return "($)";
    case "term":
      return "(months)";
    case "interest":
      return "(%)";
    default:
      return "";
  }
}

export function loanTerms(amount: number, term: number, interest: number) {
  const monthlyInterestRate = interest / 100 / 12;
  const monthlyPayment = Math.round(
    amount *
      ((monthlyInterestRate * (1 + monthlyInterestRate) ** term) /
        ((1 + monthlyInterestRate) ** term - 1)),
  );
  return {
    term,
    interest,
    monthlyPayment,
  };
}

export function evaluateApplication(applicant: ApplicationInfo) {
  if (
    Number(applicant.requestedLoanAmount) < MIN_LOAN_AMOUNT ||
    Number(applicant.requestedLoanAmount) > MAX_LOAN_AMOUNT ||
    Number(applicant.openCreditLines) > MAX_OPEN_CREDIT_LINES
  ) {
    return {
      ...applicant,
      approved: false,
    };
  }

  if (Number(applicant.openCreditLines) < LOW_INTEREST_CREDIT_LINE_THRESHOLD) {
    return {
      ...applicant,
      approved: true,
      ...loanTerms(applicant.requestedLoanAmount || 0, LONG_TERM_MONTHS, LOW_INTEREST_RATE),
    };
  }

  if (Number(applicant.openCreditLines) <= HIGH_INTEREST_CREDIT_LINE_THRESHOLD) {
    return {
      ...applicant,
      approved: true,
      ...loanTerms(applicant.requestedLoanAmount || 0, SHORT_TERM_MONTHS, HIGH_INTEREST_RATE),
    };
  }
}

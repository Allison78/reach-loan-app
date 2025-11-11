import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import { useManageData } from "../../../app/hooks/useManageData";
import ApplicationResultPage from "app/applicationResult/[id]/page.tsx";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

useParams.mockImplementation(() => ({
  id: "123",
}));

jest.mock("../../../app/hooks/useManageData", () => ({
  useManageData: jest.fn(),
}));

// Mock the context
let mockApplicants = [];
const mockSetApplicants = jest.fn((applicants) => {
  mockApplicants = applicants;
});

jest.mock("../../../app/contexts/ApplicantContext", () => ({
  useMyContext: () => ({
    applicants: mockApplicants,
    setApplicants: mockSetApplicants,
  }),
}));

const fetchApplicantMock = jest.fn();

useManageData.mockImplementation(() => ({
  fetchApplicant: fetchApplicantMock.mockResolvedValueOnce({
    id: "123",
    name: "John Doe",
    address: "123 Main St",
    email: "john@johndoe.com",
    phone: "555-1234",
    ssn: "123-45-6789",
    requestedLoanAmount: 20000,
    openCreditLines: 5,
    approved: true,
    interest: 10,
    term: 36,
    monthlyPayment: 171,  
  }).mockResolvedValueOnce({
    id: "123",
    name: "John Doe",
    address: "123 Main St",
    email: "john@johndoe.com",
    phone: "555-1234",
    ssn: "123-45-6789",
    requestedLoanAmount: 20000,
    openCreditLines: 30,
    approved: false,
  }),
}));

describe("ApplicationResultPage", () => {
  it("renders the page for an approved loan", async () => {
    render(<ApplicationResultPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Congratulations you're approved!");
    });
    const nameInput = screen.getByTestId("name");
    const addressInput = screen.getByTestId("address");
    const emailInput = screen.getByTestId("email");
    const phone = screen.getByTestId("phone");
    const ssnInput = screen.getByTestId("ssn");
    const requestedLoanAmountInput = screen.getByTestId(
      "requestedLoanAmount",
    );
    const termInput = screen.getByTestId("term");
    const interestInput = screen.getByTestId("interest");
    const monthlyPaymentInput = screen.getByTestId("monthlyPayment");
    expect(nameInput).toBeInTheDocument();
    expect(addressInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(ssnInput).toBeInTheDocument();
    expect(requestedLoanAmountInput).toBeInTheDocument();
    expect(termInput).toBeInTheDocument();
    expect(termInput).toHaveTextContent("36");
    expect(interestInput).toBeInTheDocument();
    expect(interestInput).toHaveTextContent("10");
    expect(monthlyPaymentInput).toBeInTheDocument();
    expect(monthlyPaymentInput).toHaveTextContent("171");
  });

  it("renders the page for a denied loan", async () => {
    render(<ApplicationResultPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("We're sorry, your application has been denied.");
    });
  });
});

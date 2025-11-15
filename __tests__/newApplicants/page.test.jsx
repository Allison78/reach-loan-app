import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useManageData } from "../../app/hooks/useManageData";
import NewApplicantPage from "app/newApplicant/page.tsx";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const pushMock = jest.fn();
// Provide a mocked implementation for useRouter for this specific test
useRouter.mockImplementation(() => ({
  push: pushMock,
}));

jest.mock("../../app/hooks/useManageData", () => ({
  useManageData: jest.fn(),
}));

// Mock the context
let mockApplicants = [];
const mockSetApplicants = jest.fn((applicants) => {
  mockApplicants = applicants;
});
const mockSubmitLoading = false;
const mockSetSubmitLoading = jest.fn();

jest.mock("../../app/contexts/ApplicantContext", () => ({
  useMyContext: () => ({
    applicants: mockApplicants,
    setApplicants: mockSetApplicants,
    submitLoading: mockSubmitLoading,
    setSubmitLoading: mockSetSubmitLoading,
  }),
}));

const submitApplicantMock = jest.fn();
useManageData.mockImplementation(() => ({
  submitApplicant: submitApplicantMock,
}));

describe("NewApplicantPage", () => {
  it("renders the form", () => {
    render(<NewApplicantPage />);
    const nameInput = screen.getByLabelText(/name/i);
    const addressInput = screen.getByLabelText(/address/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phone = screen.getByLabelText(/phone/i);
    const ssnInput = screen.getByLabelText(/ssn/i);
    const requestedLoanAmountInput = screen.getByLabelText(
      /requested Loan Amount/i,
    );
    const submitButton = screen.getByRole("button", { name: "Add Applicant" });
    expect(nameInput).toBeInTheDocument();
    expect(addressInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(ssnInput).toBeInTheDocument();
    expect(requestedLoanAmountInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("does not submit the form with invalid email", async () => {
    render(<NewApplicantPage />);

    // Fill out the form with invalid email
    const nameInput = screen.getByLabelText(/name/i);
    const addressInput = screen.getByLabelText(/address/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phone = screen.getByLabelText(/phone/i);
    const ssnInput = screen.getByLabelText(/ssn/i);
    const requestedLoanAmountInput = screen.getByLabelText(
      /requested Loan Amount/i,
    );
    const submitButton = screen.getByRole("button", { name: "Add Applicant" });
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(addressInput, { target: { value: "123 Main St" } });
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput); // Trigger validation by blurring the field
      fireEvent.change(phone, { target: { value: "905-555-1234" } });
      fireEvent.change(ssnInput, { target: { value: "123-45-6789" } });
      fireEvent.change(requestedLoanAmountInput, { target: { value: 50000 } });
    });

    // Check that the error message appears
    const errorMessage = await screen.findByText('Please enter a valid email address');
    expect(errorMessage).toBeInTheDocument();

    // Try to submit - should be prevented by validation
    await act(async () => {
      submitButton.click();
    });

    expect(submitApplicantMock).not.toHaveBeenCalled();
  });

  it("submits the form with valid data", async () => {
    render(<NewApplicantPage />);

    // Fill out the form
    const nameInput = screen.getByLabelText(/name/i);
    const addressInput = screen.getByLabelText(/address/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phone = screen.getByLabelText(/phone/i);
    const ssnInput = screen.getByLabelText(/ssn/i);
    const requestedLoanAmountInput = screen.getByLabelText(
      /requested Loan Amount/i,
    );
    const submitButton = screen.getByRole("button", { name: "Add Applicant" });
    act(() => {
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(addressInput, { target: { value: "123 Main St" } });
      fireEvent.change(emailInput, { target: { value: "john@johndoe.com" } });
      fireEvent.change(phone, { target: { value: "905-555-1234" } });
      fireEvent.change(ssnInput, { target: { value: "123-45-6789" } });
      fireEvent.change(requestedLoanAmountInput, { target: { value: 50000 } });

      submitButton.click();
    })

    expect(submitApplicantMock).toHaveBeenCalledWith({
      name: "John Doe",
      address: "123 Main St",
      email: "john@johndoe.com",
      phone: "(905) 555-1234",
      ssn: "123-45-6789",
      requestedLoanAmount: 50000,
      openCreditLines: expect.any(Number),
    });
  });
});

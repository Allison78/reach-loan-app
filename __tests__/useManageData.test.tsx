import { act, renderHook, waitFor } from "@testing-library/react";
import { useManageData } from "@/app/hooks/useManageData";
import { ApplicantForm, ApplicationInfo } from "@/app/types";
import * as helpers from "@/app/helpers";
import { HIGH_INTEREST_RATE, LONG_TERM_MONTHS, LOW_INTEREST_RATE, SHORT_TERM_MONTHS } from "@/app/constants";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('uuid', () => ({
  v4: () => '12345-test-uuid',
}));

// Mock the context
let mockApplicants: ApplicationInfo[] = [];
const mockSetApplicants = jest.fn((applicants) => {
  mockApplicants = applicants;
});

jest.mock("../app/contexts/ApplicantContext", () => ({
  useMyContext: () => ({
    applicants: mockApplicants,
    setApplicants: mockSetApplicants,
  }),
}));

// Mock fetch for both GET (Edge Config read) and PATCH (Edge Config update)
global.fetch = jest.fn((url, options) => {
  // Mock Edge Config read
  if (url.includes('edge-config.vercel.com') && !options?.method) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }
  
  // Mock Edge Config update (PATCH)
  if (url.includes('api.vercel.com/v1/edge-config') && options?.method === 'PATCH') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    });
  }
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as any;

const defaultApplicantForm = {
  name: "Jane Doe",
  address: "101 Elm St",
  email: "jane@example.com",
  phone: "(555) 555-5555",
  ssn: "123-45-6789",
};

const mockApplicantForm1036: ApplicantForm = {
  ...defaultApplicantForm,
  openCreditLines: 3,
  requestedLoanAmount: 15000,
};

const mockApplicantForm2024: ApplicantForm = {
  ...defaultApplicantForm,
  openCreditLines: 20,
  requestedLoanAmount: 20000,
};

const mockApplicantForm60OpenLines: ApplicantForm = {
  ...defaultApplicantForm,
  openCreditLines: 60,
  requestedLoanAmount: 25000,
};

const mockApplicantFormTooSmallAmount: ApplicantForm = {
  ...defaultApplicantForm,
  openCreditLines: 3,
  requestedLoanAmount: 5000,
};

describe("useManageData integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplicants = [];
  });

  it("submits applicant and evaluates an approved 10%/36month loan correctly", async () => {
    const { result } = renderHook(() => useManageData());
    
    // Wait for the loading state to become false (initial fetch complete)
    await waitFor(() => {
      expect(result.current.dataLoading).toBe(false);
    });
    
    const expectedEvaluated = helpers.evaluateApplication(mockApplicantForm1036);

    expect(expectedEvaluated?.monthlyPayment).toEqual(484);
    expect(expectedEvaluated?.term).toEqual(LONG_TERM_MONTHS);
    expect(expectedEvaluated?.interest).toEqual(LOW_INTEREST_RATE);
    expect(expectedEvaluated?.approved).toBe(true);

    await act(async () => {
      await result.current.submitApplicant(mockApplicantForm1036);
    });

    const patchCall = (global.fetch as jest.Mock).mock.calls.find(
      ([url, options]) => options && options.method === "PATCH",
    );

    expect(patchCall).toBeDefined();
    expect(patchCall![0]).toContain("api.vercel.com/v1/edge-config");
    
    const patchBody = JSON.parse(patchCall![1].body);
    expect(patchBody.items[0].operation).toBe("update");
    expect(patchBody.items[0].key).toBe("loanApplicants");
    
    const submittedApplicant = patchBody.items[0].value[0];
    expect(submittedApplicant).toMatchObject({
      ...expectedEvaluated,
      id: '12345-test-uuid',
    });
    
    expect(mockPush).toHaveBeenCalledWith('/applicationResult/12345-test-uuid');
  });

  it("submits applicant and evaluates an approved 20%/24month loan correctly", async () => {
    const { result } = renderHook(() => useManageData());
    
    // Wait for the loading state to become false (initial fetch complete)
    await waitFor(() => {
      expect(result.current.dataLoading).toBe(false);
    });
    
    const expectedEvaluated = helpers.evaluateApplication(mockApplicantForm2024);
 
    expect(expectedEvaluated?.monthlyPayment).toEqual(1018);
    expect(expectedEvaluated?.term).toEqual(SHORT_TERM_MONTHS);
    expect(expectedEvaluated?.interest).toEqual(HIGH_INTEREST_RATE);
    expect(expectedEvaluated?.approved).toBe(true);

    await act(async () => {
      await result.current.submitApplicant(mockApplicantForm2024);
    });

    const patchCall = (global.fetch as jest.Mock).mock.calls.find(
      ([url, options]) => options && options.method === "PATCH",
    );

    expect(patchCall).toBeDefined();
    expect(patchCall![0]).toContain("api.vercel.com/v1/edge-config");
    
    const patchBody = JSON.parse(patchCall![1].body);
    const submittedApplicant = patchBody.items[0].value[0];
    expect(submittedApplicant).toMatchObject({
      ...expectedEvaluated,
      id: '12345-test-uuid',
    });
    
    expect(mockPush).toHaveBeenCalledWith('/applicationResult/12345-test-uuid');
  });

  it("submits applicant and evaluates denied too many open loans application correctly", async () => {
    const { result } = renderHook(() => useManageData());
    
    // Wait for the loading state to become false (initial fetch complete)
    await waitFor(() => {
      expect(result.current.dataLoading).toBe(false);
    });
    
    const expectedEvaluated = helpers.evaluateApplication(mockApplicantForm60OpenLines);
 
    expect(expectedEvaluated?.monthlyPayment).toBeUndefined();
    expect(expectedEvaluated?.term).toBeUndefined();
    expect(expectedEvaluated?.interest).toBeUndefined();
    expect(expectedEvaluated?.approved).toBe(false);

    await act(async () => {
      await result.current.submitApplicant(mockApplicantForm60OpenLines);
    });

    const patchCall = (global.fetch as jest.Mock).mock.calls.find(
      ([url, options]) => options && options.method === "PATCH",
    );

    expect(patchCall).toBeDefined();
    expect(patchCall![0]).toContain("api.vercel.com/v1/edge-config");
    
    const patchBody = JSON.parse(patchCall![1].body);
    const submittedApplicant = patchBody.items[0].value[0];
    expect(submittedApplicant).toMatchObject({
      ...expectedEvaluated,
      id: '12345-test-uuid',
    });
    
    expect(mockPush).toHaveBeenCalledWith('/applicationResult/12345-test-uuid');
  });

  it("submits applicant and evaluates denied too small amount application correctly", async () => {
    const { result } = renderHook(() => useManageData());
 
    // Wait for the loading state to become false (initial fetch complete)
    await waitFor(() => {
      expect(result.current.dataLoading).toBe(false);
    });
 
    const expectedEvaluated = helpers.evaluateApplication(mockApplicantFormTooSmallAmount);
 
    expect(expectedEvaluated?.monthlyPayment).toBeUndefined();
    expect(expectedEvaluated?.term).toBeUndefined();
    expect(expectedEvaluated?.interest).toBeUndefined();
    expect(expectedEvaluated?.approved).toBe(false);

    await act(async () => {
      await result.current.submitApplicant(mockApplicantFormTooSmallAmount);
    });

    const patchCall = (global.fetch as jest.Mock).mock.calls.find(
      ([url, options]) => options && options.method === "PATCH",
    );

    expect(patchCall).toBeDefined();
    expect(patchCall![0]).toContain("api.vercel.com/v1/edge-config");
    
    const patchBody = JSON.parse(patchCall![1].body);
    const submittedApplicant = patchBody.items[0].value[0];
    expect(submittedApplicant).toMatchObject({
      ...expectedEvaluated,
      id: '12345-test-uuid',
    });
    
    expect(mockPush).toHaveBeenCalledWith('/applicationResult/12345-test-uuid');
  });
});
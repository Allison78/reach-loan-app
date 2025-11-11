import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoanApplicantsPage from "app/page.tsx";

describe("LoanApplicantsPage", () => {
  it("renders a 2 links", () => {
    render(<LoanApplicantsPage />);

    const link1 = screen.getByRole("link", {
      name: "View All Loan Applicants",
    });
    expect(link1).toBeInTheDocument();
    expect(link1).toHaveAttribute("href", "/allApplicants");

    const link2 = screen.getByRole("link", {
      name: "Start New Loan Application",
    });
    expect(link2).toBeInTheDocument();
    expect(link2).toHaveAttribute("href", "/newApplicant");
  });
});

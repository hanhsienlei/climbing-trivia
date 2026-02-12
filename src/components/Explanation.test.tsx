import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Explanation from "./Explanation";

describe("Explanation", () => {
  it("returns empty when explanation is null", () => {
    const { container } = render(<Explanation explanation={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders explanation text when provided", () => {
    render(<Explanation explanation="Limestone is sedimentary rock." />);
    expect(screen.getByText("Limestone is sedimentary rock.")).toBeInTheDocument();
  });

  it("renders the Explanation heading", () => {
    render(<Explanation explanation="Some explanation" />);
    expect(screen.getByText("Explanation")).toBeInTheDocument();
  });
});

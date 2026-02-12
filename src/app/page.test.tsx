import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

// Mock the questions data
vi.mock("@/data/questions.json", () => ({
  default: [
    { id: 1, category: "bouldering", question: "Q1" },
    { id: 2, category: "rope climbing", question: "Q2" },
    { id: 3, category: "bouldering", question: "Q3" },
    { id: 4, category: "australia", question: "Q4" },
  ],
}));

describe("Home Page", () => {
  it("should render the main heading and description", () => {
    render(<Home />);

    expect(screen.getByText("Rock Climbing Trivia")).toBeDefined();
    expect(screen.getByText(/Test your knowledge of climbing/i)).toBeDefined();
  });

  it("should render the All Categories button", () => {
    render(<Home />);

    const allCategoriesLink = screen.getByText("All Categories");
    expect(allCategoriesLink).toBeDefined();
    expect(allCategoriesLink.getAttribute("href")).toBe("/quiz");
  });

  it("should extract and sort unique categories from questions", () => {
    render(<Home />);

    // Should have 3 unique categories: australia, bouldering, rope climbing (sorted)
    expect(screen.getByText("australia")).toBeDefined();
    expect(screen.getByText("bouldering")).toBeDefined();
    expect(screen.getByText("rope climbing")).toBeDefined();
  });

  it("should create category links with encoded URLs", () => {
    render(<Home />);

    const boulderiLink = screen.getByText("bouldering");
    expect(boulderiLink.getAttribute("href")).toBe("/quiz?category=bouldering");

    const ropeLink = screen.getByText("rope climbing");
    expect(ropeLink.getAttribute("href")).toBe("/quiz?category=rope%20climbing");
  });

  it("should render View All Questions link", () => {
    render(<Home />);

    const viewAllLink = screen.getByText("View All Questions");
    expect(viewAllLink).toBeDefined();
    expect(viewAllLink.getAttribute("href")).toBe("/questions");
  });

  it("should render the climbing emoji", () => {
    render(<Home />);

    expect(screen.getByText("🧗")).toBeDefined();
  });
});

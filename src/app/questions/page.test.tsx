import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionsPage from "./page";

// Mock the questions data
vi.mock("@/data/questions.json", () => ({
  default: [
    {
      id: 1,
      category: "Bouldering",
      question: "What is a crimp?",
      correctAnswer: "A small edge hold",
      explanation: "A crimp is a small edge hold.",
    },
    {
      id: 2,
      category: "Rope Climbing",
      question: "What is a belay device?",
      correctAnswer: "Safety equipment",
      explanation: "A belay device is used for safety.",
    },
    {
      id: 3,
      category: "Bouldering",
      question: "What is topping out?",
      correctAnswer: "Finishing a boulder",
      explanation: "Topping out means finishing a boulder problem.",
    },
  ],
}));

describe("QuestionsPage", () => {
  it("should render all questions by default", () => {
    render(<QuestionsPage />);

    expect(screen.getByText("All Questions (3)")).toBeDefined();
    expect(screen.getByText("What is a crimp?")).toBeDefined();
    expect(screen.getByText("What is a belay device?")).toBeDefined();
    expect(screen.getByText("What is topping out?")).toBeDefined();
  });

  it("should render Back to Home link", () => {
    render(<QuestionsPage />);

    const backLink = screen.getByText("Back to Home");
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute("href")).toBe("/");
  });

  it("should render category filter buttons", () => {
    render(<QuestionsPage />);

    expect(screen.getByRole("button", { name: "All" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Bouldering" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rope Climbing" })).toBeDefined();
  });

  it("should filter questions by category when button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuestionsPage />);

    // Click on bouldering category
    const boulderingButton = screen.getByRole("button", { name: "Bouldering" });
    await user.click(boulderingButton);

    // Should show only 2 bouldering questions
    expect(screen.getByText("All Questions (2)")).toBeDefined();
    expect(screen.getByText("What is a crimp?")).toBeDefined();
    expect(screen.getByText("What is topping out?")).toBeDefined();
    expect(screen.queryByText("What is a belay device?")).toBeNull();
  });

  it("should show all questions when All button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuestionsPage />);

    // First filter by category
    const boulderingButton = screen.getByRole("button", { name: "Bouldering" });
    await user.click(boulderingButton);

    // Then click All
    const allButton = screen.getByRole("button", { name: "All" });
    await user.click(allButton);

    // Should show all 3 questions
    expect(screen.getByText("All Questions (3)")).toBeDefined();
    expect(screen.getByText("What is a crimp?")).toBeDefined();
    expect(screen.getByText("What is a belay device?")).toBeDefined();
    expect(screen.getByText("What is topping out?")).toBeDefined();
  });

  it("should expand question to show answer and explanation when clicked", async () => {
    const user = userEvent.setup();
    render(<QuestionsPage />);

    // Answer and explanation should not be visible initially
    expect(screen.queryByText("A small edge hold")).toBeNull();
    expect(screen.queryByText("A crimp is a small edge hold.")).toBeNull();

    // Click on the question
    const questionButton = screen.getByText("What is a crimp?");
    await user.click(questionButton);

    // Answer and explanation should now be visible
    expect(screen.getByText("A small edge hold")).toBeDefined();
    expect(screen.getByText("A crimp is a small edge hold.")).toBeDefined();
    expect(screen.getByText(/Answer:/i)).toBeDefined();
  });

  it("should collapse question when clicked again", async () => {
    const user = userEvent.setup();
    render(<QuestionsPage />);

    const questionButton = screen.getByText("What is a crimp?");

    // Expand
    await user.click(questionButton);
    expect(screen.getByText("A small edge hold")).toBeDefined();

    // Collapse
    await user.click(questionButton);
    expect(screen.queryByText("A small edge hold")).toBeNull();
  });

  it("should show question number and category badge", () => {
    render(<QuestionsPage />);

    // Question numbers (1., 2., 3.)
    expect(screen.getByText("1.")).toBeDefined();
    expect(screen.getByText("2.")).toBeDefined();
    expect(screen.getByText("3.")).toBeDefined();

    // Category badges are shown inline with questions
    const categoryBadges = screen.getAllByText("Bouldering");
    expect(categoryBadges.length).toBeGreaterThan(0); // At least one badge (plus filter button)
  });

  it("should apply active styles to selected category", async () => {
    const user = userEvent.setup();
    render(<QuestionsPage />);

    const boulderingButton = screen.getByRole("button", { name: "Bouldering" });

    // Check initial state
    expect(boulderingButton.className).toContain("bg-zinc-200");

    // Click to activate
    await user.click(boulderingButton);

    // Should have active styles
    expect(boulderingButton.className).toContain("bg-zinc-900");
  });
});

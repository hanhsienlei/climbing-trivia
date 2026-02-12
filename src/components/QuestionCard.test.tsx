import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "./QuestionCard";

const defaultProps = {
  question: "What is the hardest boulder grade?",
  answers: ["V10", "V15", "V17", "V12"],
  correctAnswer: "V17",
  onAnswer: vi.fn(),
  disabled: false,
};

describe("QuestionCard", () => {
  it("renders question text", () => {
    render(<QuestionCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.question)).toBeInTheDocument();
  });

  it("renders all answer buttons", () => {
    render(<QuestionCard {...defaultProps} />);
    for (const answer of defaultProps.answers) {
      expect(screen.getByText(answer)).toBeInTheDocument();
    }
  });

  it("calls onAnswer with (answer, true) for correct answer", () => {
    const onAnswer = vi.fn();
    render(<QuestionCard {...defaultProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("V17"));
    expect(onAnswer).toHaveBeenCalledWith("V17", true);
  });

  it("calls onAnswer with (answer, false) for wrong answer", () => {
    const onAnswer = vi.fn();
    render(<QuestionCard {...defaultProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("V10"));
    expect(onAnswer).toHaveBeenCalledWith("V10", false);
  });

  it("does not call onAnswer when disabled", () => {
    const onAnswer = vi.fn();
    render(<QuestionCard {...defaultProps} onAnswer={onAnswer} disabled />);
    fireEvent.click(screen.getByText("V10"));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it("shows green styling on correct answer after selection", () => {
    const onAnswer = vi.fn();
    const { rerender } = render(<QuestionCard {...defaultProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("V17"));
    rerender(<QuestionCard {...defaultProps} onAnswer={onAnswer} disabled />);
    expect(screen.getByText("V17").className).toContain("green");
  });

  it("shows red styling on wrong answer and green on correct", () => {
    const onAnswer = vi.fn();
    const { rerender } = render(<QuestionCard {...defaultProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("V10"));
    rerender(<QuestionCard {...defaultProps} onAnswer={onAnswer} disabled />);
    expect(screen.getByText("V10").className).toContain("red");
    expect(screen.getByText("V17").className).toContain("green");
  });
});

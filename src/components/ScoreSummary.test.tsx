import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreSummary from "./ScoreSummary";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ScoreSummary", () => {
  it("displays score", () => {
    render(<ScoreSummary score={7} total={10} category={null} />);
    expect(screen.getByText("7 / 10")).toBeInTheDocument();
  });

  it("shows perfect score message at 100%", () => {
    render(<ScoreSummary score={10} total={10} category={null} />);
    expect(screen.getByText(/Perfect score/)).toBeInTheDocument();
  });

  it("shows great job message at 80%+", () => {
    render(<ScoreSummary score={8} total={10} category={null} />);
    expect(screen.getByText(/Great job/)).toBeInTheDocument();
  });

  it("shows not bad message at 60%+", () => {
    render(<ScoreSummary score={6} total={10} category={null} />);
    expect(screen.getByText(/Not bad/)).toBeInTheDocument();
  });

  it("shows room for improvement at 40%+", () => {
    render(<ScoreSummary score={4} total={10} category={null} />);
    expect(screen.getByText(/Room for improvement/)).toBeInTheDocument();
  });

  it("shows lowest tier message below 40%", () => {
    render(<ScoreSummary score={2} total={10} category={null} />);
    expect(screen.getByText(/hit the books/)).toBeInTheDocument();
  });

  it("shows trophy emoji for 80%+ scores", () => {
    render(<ScoreSummary score={9} total={10} category={null} />);
    expect(screen.getByText("🏆")).toBeInTheDocument();
  });

  it("shows book emoji for sub-50% scores", () => {
    render(<ScoreSummary score={3} total={10} category={null} />);
    expect(screen.getByText("📚")).toBeInTheDocument();
  });

  it("Play Again links to /quiz when no category", () => {
    render(<ScoreSummary score={5} total={10} category={null} />);
    const link = screen.getByText("Play Again").closest("a");
    expect(link).toHaveAttribute("href", "/quiz");
  });

  it("Play Again links with category param", () => {
    render(<ScoreSummary score={5} total={10} category="Bouldering" />);
    const link = screen.getByText("Play Again").closest("a");
    expect(link).toHaveAttribute("href", "/quiz?category=Bouldering");
  });

  it("encodes special characters in category param", () => {
    render(<ScoreSummary score={5} total={10} category="Competition & Olympics" />);
    const link = screen.getByText("Play Again").closest("a");
    expect(link).toHaveAttribute("href", "/quiz?category=Competition%20%26%20Olympics");
  });

  it("Home links to root", () => {
    render(<ScoreSummary score={5} total={10} category={null} />);
    const link = screen.getByText("Home").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });
});

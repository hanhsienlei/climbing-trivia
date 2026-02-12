import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ResultsPage from "./page";
import { STORAGE_KEY_RESULT } from "@/lib/quiz";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("ResultsPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it("should render score summary with valid data", () => {
    localStorage.setItem(
      STORAGE_KEY_RESULT,
      JSON.stringify({ score: 8, total: 10, category: "Bouldering" }),
    );

    render(<ResultsPage />);

    expect(screen.getByText("8 / 10")).toBeDefined();
    expect(screen.getByText(/Great job!/i)).toBeDefined();
  });

  it("should handle corrupted localStorage data and clean it up", () => {
    // Set corrupted JSON data
    localStorage.setItem(STORAGE_KEY_RESULT, "{invalid json");

    // Spy on removeItem to verify it's called
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");

    render(<ResultsPage />);

    // Should call removeItem to clean up corrupted data
    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY_RESULT);
    expect(localStorage.getItem(STORAGE_KEY_RESULT)).toBeNull();

    removeItemSpy.mockRestore();
  });

  it("should redirect to home when no result exists", () => {
    // No data in localStorage
    render(<ResultsPage />);

    // Should attempt to redirect
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should redirect to home when result is corrupted", () => {
    localStorage.setItem(STORAGE_KEY_RESULT, "{invalid json");

    render(<ResultsPage />);

    // Should attempt to redirect after cleanup
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should handle null category", () => {
    localStorage.setItem(
      STORAGE_KEY_RESULT,
      JSON.stringify({ score: 5, total: 10, category: null }),
    );

    render(<ResultsPage />);

    expect(screen.getByText("5 / 10")).toBeDefined();
    expect(screen.getByText(/Room for improvement/i)).toBeDefined();
  });
});

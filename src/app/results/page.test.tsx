import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ResultsPage, { getStoredResult } from "./page";
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

  it("renders score summary with valid data", () => {
    localStorage.setItem(
      STORAGE_KEY_RESULT,
      JSON.stringify({ score: 8, total: 10, category: "Bouldering" }),
    );

    render(<ResultsPage />);

    expect(screen.getByText("8 / 10")).toBeInTheDocument();
    expect(screen.getByText(/Great job!/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("cleans corrupted localStorage data and redirects home", async () => {
    localStorage.setItem(STORAGE_KEY_RESULT, "{invalid json");
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");

    render(<ResultsPage />);

    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY_RESULT);
    expect(localStorage.getItem(STORAGE_KEY_RESULT)).toBeNull();
    expect(screen.getByText("Loading results...")).toBeInTheDocument();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));

    removeItemSpy.mockRestore();
  });

  it("redirects home when no result exists", async () => {
    render(<ResultsPage />);

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("handles null category", () => {
    localStorage.setItem(
      STORAGE_KEY_RESULT,
      JSON.stringify({ score: 5, total: 10, category: null }),
    );

    render(<ResultsPage />);

    expect(screen.getByText("5 / 10")).toBeInTheDocument();
    expect(screen.getByText(/Room for improvement/i)).toBeInTheDocument();
  });

  it("returns null in SSR when window is undefined", () => {
    const originalWindow = globalThis.window;
    vi.stubGlobal("window", undefined);

    expect(getStoredResult()).toBeNull();

    vi.stubGlobal("window", originalWindow);
  });
});

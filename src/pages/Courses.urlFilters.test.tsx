import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/components/layout/Layout", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/components/SEOHead", () => ({ default: () => null }));
vi.mock("@/components/JsonLd", () => ({ default: () => null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/hooks/useUserRole", () => ({ useIsAdmin: () => ({ isAdmin: false }) }));
vi.mock("@/contexts/AdminViewContext", () => ({ useAdminView: () => ({ isStudentView: false }) }));
vi.mock("@/hooks/useStudentProgress", () => ({ useEnrollments: () => ({ data: [] }), useLessonProgress: () => ({ data: [] }) }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => ({ isActive: false }) }));
vi.mock("@/hooks/useCourseContentStatus", () => ({ useCourseContentStatus: () => ({ data: undefined }), isInDevelopment: () => false }));
vi.mock("@/lib/api", () => ({
  queries: {
    getCoursesForCatalog: async () => ({
      data: [
        { id: "1", title: "BA1 Business Economics", slug: "ba1-business-economics", level: "certificate", price: 0, description: "", image_url: null, duration_hours: null },
        { id: "2", title: "E2 Managing Performance", slug: "e2-managing-performance", level: "management", price: 199, description: "", image_url: null, duration_hours: null },
        { id: "3", title: "P2 Advanced Management Accounting", slug: "p2-advanced-management-accounting", level: "management", price: 199, description: "", image_url: null, duration_hours: null },
      ],
      error: null,
    }),
    getLessonCountsByCourse: async () => ({ data: {}, error: null }),
  },
}));

import Courses from "./Courses";

const renderAt = (url: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[url]}>
        <Courses />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("course catalogue URL filters", () => {
  it("?level=management shows only management courses", async () => {
    renderAt("/courses?level=management");
    await waitFor(() => expect(screen.getAllByText(/E2 Managing Performance/).length).toBeGreaterThan(0));
    expect(screen.queryByText(/BA1 Business Economics/)).toBeNull();
  });
  it("?q= pre-fills the search box and filters", async () => {
    renderAt("/courses?q=advanced");
    const box = (await screen.findByLabelText("Search courses")) as HTMLInputElement;
    expect(box.value).toBe("advanced");
    await waitFor(() => expect(screen.getAllByText(/P2 Advanced/).length).toBeGreaterThan(0));
    expect(screen.queryByText(/E2 Managing Performance/)).toBeNull();
  });
  it("invalid level falls back to all courses", async () => {
    renderAt("/courses?level=bogus");
    await waitFor(() => expect(screen.getAllByText(/BA1 Business Economics/).length).toBeGreaterThan(0));
  });
});

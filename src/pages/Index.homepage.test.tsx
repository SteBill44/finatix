import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/components/SEOHead", () => ({ default: () => null }));
vi.mock("@/components/JsonLd", () => ({ default: () => null }));
vi.mock("@/components/layout/Layout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/integrations/supabase/client", () => {
  const chain: any = { select: () => chain, order: () => Promise.resolve({ data: [], error: null }) };
  return { supabase: { from: () => chain, rpc: () => Promise.resolve({ data: [], error: null }) } };
});

import Index from "./Index";

const renderHome = () =>
  render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter><Index /></MemoryRouter>
      </QueryClientProvider>
  ,
  );

describe("homepage", () => {
  it("has the exact headline and working CTAs", () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Your CIMA journey. A clearer way forward.");
    expect(screen.getAllByRole("link", { name: /Explore CIMA Courses/i })[0].getAttribute("href")).toBe("/courses");
    expect(screen.getByRole("link", { name: /Find Your Level/i }).getAttribute("href")).toBe("#levels");
  });

  it("shows all four levels with filter links and case studies", () => {
    renderHome();
    for (const lv of ["certificate", "operational", "management", "strategic"]) {
      expect(document.querySelector(`a[href="/courses?level=${lv}"]`)).not.toBeNull();
    }
    for (const cs of ["ocs-operational-case-study", "mcs-management-case-study", "scs-strategic-case-study"]) {
      expect(document.querySelector(`a[href="/courses/${cs}"]`)).not.toBeNull();
    }
    expect(document.getElementById("levels")).not.toBeNull();
    expect(document.getElementById("approach")).not.toBeNull();
  });

  it("contains no demo, sample question or BA1/BA2-first messaging", () => {
    renderHome();
    const text = document.body.textContent ?? "";
    for (const banned of ["GDP", "Try the demo", "Example question", "Start practising free", "about 190", "we'll email", "in development", "being written", "still being", "planned", "outline"]) {
      expect(text.toLowerCase()).not.toContain(banned.toLowerCase());
    }
    expect(document.querySelectorAll("fieldset, [role=tablist]").length).toBe(0);
  });
});

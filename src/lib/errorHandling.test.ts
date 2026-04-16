import { describe, it, expect } from "vitest";
import { parseError, getErrorTitle, getErrorVariant } from "./errorHandling";
import type { ErrorType } from "./errorHandling";

// ---------------------------------------------------------------------------
// parseError
// ---------------------------------------------------------------------------
describe("parseError — null / undefined / non-object", () => {
  it("returns unknown type for null", () => {
    const err = parseError(null);
    expect(err.type).toBe("unknown");
    expect(err.retryable).toBe(true);
  });

  it("returns unknown type for undefined", () => {
    const err = parseError(undefined);
    expect(err.type).toBe("unknown");
  });

  it("returns the string as the message for string errors", () => {
    const err = parseError("something broke");
    expect(err.type).toBe("unknown");
    expect(err.message).toBe("something broke");
    expect(err.retryable).toBe(true);
  });
});

describe("parseError — network errors", () => {
  it("detects 'Failed to fetch'", () => {
    const err = parseError({ message: "Failed to fetch" });
    expect(err.type).toBe("network");
    expect(err.retryable).toBe(true);
  });

  it("detects 'NetworkError' in message", () => {
    const err = parseError({ message: "A NetworkError occurred" });
    expect(err.type).toBe("network");
  });

  it("detects 'net::' prefix (Chrome network errors)", () => {
    const err = parseError({ message: "net::ERR_NAME_NOT_RESOLVED" });
    expect(err.type).toBe("network");
  });
});

describe("parseError — auth errors", () => {
  it("detects invalid_credentials code", () => {
    const err = parseError({ code: "invalid_credentials" });
    expect(err.type).toBe("auth");
    expect(err.retryable).toBe(false);
  });

  it("detects 'Invalid login credentials' in message", () => {
    const err = parseError({ message: "Invalid login credentials" });
    expect(err.type).toBe("auth");
    expect(err.retryable).toBe(false);
  });

  it("detects user_already_exists code", () => {
    const err = parseError({ code: "user_already_exists" });
    expect(err.type).toBe("auth");
  });

  it("detects 'User already registered' in message", () => {
    const err = parseError({ message: "User already registered" });
    expect(err.type).toBe("auth");
    expect(err.retryable).toBe(false);
  });

  it("detects 'Email not confirmed' in message", () => {
    const err = parseError({ message: "Email not confirmed" });
    expect(err.type).toBe("auth");
  });

  it("detects 'refresh_token_not_found' in message", () => {
    const err = parseError({ message: "refresh_token_not_found" });
    expect(err.type).toBe("auth");
    expect(err.retryable).toBe(false);
  });

  it("detects 'Invalid Refresh Token' in message", () => {
    const err = parseError({ message: "Invalid Refresh Token" });
    expect(err.type).toBe("auth");
  });

  it("detects 'JWT expired' in message", () => {
    const err = parseError({ message: "JWT expired" });
    expect(err.type).toBe("auth");
  });

  it("detects 'token is expired' in message", () => {
    const err = parseError({ message: "token is expired" });
    expect(err.type).toBe("auth");
  });
});

describe("parseError — permission errors", () => {
  it("detects Postgres RLS code 42501", () => {
    const err = parseError({ code: "42501" });
    expect(err.type).toBe("permission");
    expect(err.retryable).toBe(false);
  });

  it("detects 'row-level security' in message", () => {
    const err = parseError({ message: "violates row-level security policy" });
    expect(err.type).toBe("permission");
  });

  it("detects HTTP 403 status", () => {
    const err = parseError({ status: 403 });
    expect(err.type).toBe("permission");
  });
});

describe("parseError — not found errors", () => {
  it("detects HTTP 404 status", () => {
    const err = parseError({ status: 404 });
    expect(err.type).toBe("not_found");
    expect(err.retryable).toBe(false);
  });

  it("detects PostgREST code PGRST116", () => {
    const err = parseError({ code: "PGRST116" });
    expect(err.type).toBe("not_found");
  });
});

describe("parseError — rate limit errors", () => {
  it("detects HTTP 429 status", () => {
    const err = parseError({ status: 429 });
    expect(err.type).toBe("rate_limit");
    expect(err.retryable).toBe(true);
  });

  it("detects 'rate limit' in message", () => {
    const err = parseError({ message: "rate limit exceeded" });
    expect(err.type).toBe("rate_limit");
  });
});

describe("parseError — server errors", () => {
  it("detects HTTP 500 status", () => {
    const err = parseError({ status: 500 });
    expect(err.type).toBe("server");
    expect(err.retryable).toBe(true);
  });

  it("detects HTTP 503 status", () => {
    const err = parseError({ status: 503 });
    expect(err.type).toBe("server");
  });
});

describe("parseError — validation / DB constraint errors", () => {
  it("detects Postgres unique violation code 23505", () => {
    const err = parseError({ code: "23505" });
    expect(err.type).toBe("validation");
    expect(err.retryable).toBe(false);
  });

  it("detects 'duplicate key' in message", () => {
    const err = parseError({ message: "duplicate key value violates unique constraint" });
    expect(err.type).toBe("validation");
  });

  it("detects Postgres FK violation code 23503", () => {
    const err = parseError({ code: "23503" });
    expect(err.type).toBe("validation");
    expect(err.retryable).toBe(false);
  });

  it("detects 'violates foreign key' in message", () => {
    const err = parseError({ message: "insert or update on table violates foreign key constraint" });
    expect(err.type).toBe("validation");
  });
});

describe("parseError — generic object with message", () => {
  it("uses the message field for unrecognised errors", () => {
    const err = parseError({ message: "Something unexpected" });
    expect(err.message).toBe("Something unexpected");
    expect(err.type).toBe("unknown");
  });

  it("truncates messages longer than 150 characters", () => {
    const long = "x".repeat(200);
    const err = parseError({ message: long });
    expect(err.message.length).toBeLessThanOrEqual(153); // 150 + "..."
    expect(err.message.endsWith("...")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getErrorTitle
// ---------------------------------------------------------------------------
describe("getErrorTitle", () => {
  const cases: [ErrorType, string][] = [
    ["network", "Connection Error"],
    ["auth", "Authentication Error"],
    ["validation", "Validation Error"],
    ["not_found", "Not Found"],
    ["permission", "Access Denied"],
    ["rate_limit", "Too Many Requests"],
    ["server", "Server Error"],
    ["unknown", "Error"],
  ];

  it.each(cases)("returns '%s' for error type '%s'", (type, expected) => {
    expect(getErrorTitle(type)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getErrorVariant
// ---------------------------------------------------------------------------
describe("getErrorVariant", () => {
  it("returns destructive for all error types", () => {
    const types: ErrorType[] = ["network", "auth", "validation", "not_found", "permission", "rate_limit", "server", "unknown"];
    for (const t of types) {
      expect(getErrorVariant(t)).toBe("destructive");
    }
  });
});

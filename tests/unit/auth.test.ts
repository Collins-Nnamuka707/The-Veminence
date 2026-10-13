import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth";
import { loginSchema, profileSchema, registerSchema } from "@/lib/schemas/auth";
import { fieldErrors } from "@/lib/schemas/errors";

describe("safeNextPath", () => {
  it("allows same-site paths", () => {
    expect(safeNextPath("/pl/checkout", "/pl/account")).toBe("/pl/checkout");
  });

  it("falls back for anything that could leave the site", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", undefined, 42]) {
      expect(safeNextPath(bad, "/pl/account")).toBe("/pl/account");
    }
  });
});

describe("registerSchema", () => {
  it("accepts a valid sign-up", () => {
    expect(
      registerSchema.safeParse({ locale: "pl", fullName: "Anna Kowalska", email: "anna@example.com", password: "długiehasło" })
        .success,
    ).toBe(true);
  });

  it("reports each problem as an error code", () => {
    const result = registerSchema.safeParse({ locale: "pl", fullName: "", email: "x", password: "short" });
    expect(fieldErrors(result.error!)).toEqual({
      fullName: "required",
      email: "invalidEmail",
      password: "passwordTooShort",
    });
  });

  it("rejects passwords longer than bcrypt can use", () => {
    const result = registerSchema.safeParse({ locale: "pl", fullName: "Anna", email: "a@b.pl", password: "x".repeat(73) });
    expect(fieldErrors(result.error!)).toEqual({ password: "tooLong" });
  });
});

describe("loginSchema and profileSchema", () => {
  it("only requires a password to be present at login", () => {
    expect(loginSchema.safeParse({ locale: "en", email: "a@b.pl", password: "x" }).success).toBe(true);
  });

  it("allows an empty phone in the profile but not a malformed one", () => {
    expect(profileSchema.safeParse({ locale: "pl", fullName: "Anna Nowak", phone: "" }).success).toBe(true);
    expect(fieldErrors(profileSchema.safeParse({ locale: "pl", fullName: "Anna Nowak", phone: "abc" }).error!)).toEqual({
      phone: "invalidPhone",
    });
  });
});

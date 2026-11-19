import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Register from "./Register";
import { register } from "../../services/authService";

vi.mock("../../services/authService", () => ({
  register: vi.fn(),
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

async function fillRegister(user, email, password, confirmation) {
  await user.type(
    screen.getByRole("textbox", { name: "Email address" }),
    email
  );

  await user.type(
    screen.getByLabelText("Password"),
    password
  );

  await user.type(
    screen.getByLabelText("Confirm password"),
    confirmation
  );
}

describe("Phase 5 - Register Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders accessible registration fields", () => {
    renderRegister();

    expect(
      screen.getByRole("heading", { name: "Create Your Account" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Password"))
      .toHaveAttribute("type", "password");

    expect(screen.getByLabelText("Confirm password"))
      .toHaveAttribute("type", "password");

    expect(
      screen.getByRole("link", { name: "Sign in" })
    ).toHaveAttribute("href", "/login");
  });

  test("rejects empty registration fields", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please complete all registration fields."
    );

    expect(register).not.toHaveBeenCalled();
  });

  test("rejects invalid email addresses", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillRegister(user, "invalid-email", "password123", "password123");

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a valid email address."
    );

    expect(register).not.toHaveBeenCalled();
  });

  test("rejects passwords shorter than eight characters", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillRegister(user, "test@example.com", "short", "short");

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password must contain at least 8 characters."
    );

    expect(register).not.toHaveBeenCalled();
  });

  test("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillRegister(
      user,
      "test@example.com",
      "password123",
      "different123"
    );

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match."
    );

    expect(register).not.toHaveBeenCalled();
  });

  test("submits valid registration data", async () => {
    const user = userEvent.setup();
    register.mockResolvedValue({ success: true });

    renderRegister();

    await fillRegister(
      user,
      "test@example.com",
      "password123",
      "password123"
    );

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(register).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("registration request was accepted");
  });

  test("handles unavailable authentication routes", async () => {
    const user = userEvent.setup();

    register.mockRejectedValue(
      new Error("API request failed: 404")
    );

    renderRegister();

    await fillRegister(
      user,
      "test@example.com",
      "password123",
      "password123"
    );

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Account sign-in and registration are not available yet."
    );
  });

  test("marks all missing registration fields invalid", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", {
      name: "Create Account",
    }));

    for (const name of ["Email address", "Password", "Confirm password"]) {
      const field = screen.getByLabelText(name);
      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(field.getAttribute("aria-describedby"))
        .toContain("register-error");
    }

    expect(screen.getByRole("alert"))
      .toHaveAttribute("id", "register-error");
  });

  test("associates invalid email errors with email only", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillRegister(user, "invalid-email", "password123", "password123");
    await user.click(screen.getByRole("button", {
      name: "Create Account",
    }));

    expect(screen.getByLabelText("Email address"))
      .toHaveAttribute("aria-invalid", "true");

    expect(screen.getByLabelText("Password"))
      .toHaveAttribute("aria-invalid", "false");

    expect(screen.getByLabelText("Confirm password"))
      .toHaveAttribute("aria-invalid", "false");
  });

  test("associates short password errors with password help", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillRegister(user, "test@example.com", "short", "short");
    await user.click(screen.getByRole("button", {
      name: "Create Account",
    }));

    const password = screen.getByLabelText("Password");

    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(password).toHaveAttribute(
      "aria-describedby",
      "register-password-help register-error"
    );

    expect(screen.getByLabelText("Confirm password"))
      .toHaveAttribute("aria-invalid", "false");
  });

  test("marks confirmation invalid when passwords differ", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillRegister(
      user,
      "test@example.com",
      "password123",
      "different123"
    );

    await user.click(screen.getByRole("button", {
      name: "Create Account",
    }));

    expect(screen.getByLabelText("Confirm password"))
      .toHaveAttribute("aria-invalid", "true");

    expect(screen.getByLabelText("Password"))
      .toHaveAttribute("aria-invalid", "false");
  });

  test("does not invalidate fields after backend errors", async () => {
    const user = userEvent.setup();

    register.mockRejectedValue(
      new Error("API request failed: 404")
    );

    renderRegister();

    await fillRegister(
      user,
      "test@example.com",
      "password123",
      "password123"
    );

    await user.click(screen.getByRole("button", {
      name: "Create Account",
    }));

    await screen.findByRole("alert");

    for (const name of ["Email address", "Password", "Confirm password"]) {
      expect(screen.getByLabelText(name))
        .toHaveAttribute("aria-invalid", "false");
    }

    expect(screen.getByLabelText("Password"))
      .toHaveAttribute("aria-describedby", "register-password-help");
  });

  test("clears validation errors when fields are edited", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", {
      name: "Create Account",
    }));

    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Email address"),
      "test@example.com"
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email address"))
      .toHaveAttribute("aria-invalid", "false");
  });

  test("disables submission while registration is pending", async () => {
    const user = userEvent.setup();

    register.mockReturnValue(new Promise(() => {}));

    renderRegister();

    await fillRegister(
      user,
      "test@example.com",
      "password123",
      "password123"
    );

    await user.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      screen.getByRole("button", { name: "Creating Account..." })
    ).toBeDisabled();
  });
});

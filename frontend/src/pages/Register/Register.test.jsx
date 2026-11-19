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

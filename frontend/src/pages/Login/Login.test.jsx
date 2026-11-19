import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";
import { login } from "../../services/authService";

vi.mock("../../services/authService", () => ({
  login: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

async function fillLogin(user, email, password) {
  await user.type(
    screen.getByRole("textbox", { name: "Email address" }),
    email
  );

  await user.type(
    screen.getByLabelText("Password"),
    password
  );
}

describe("Phase 5 - Login Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders accessible login fields", () => {
    renderLogin();

    expect(
      screen.getByRole("heading", { name: "Welcome Back" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: "Email address" })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toHaveAttribute("type", "password");

    expect(
      screen.getByRole("link", { name: "Create an account" })
    ).toHaveAttribute("href", "/register");
  });

  test("rejects empty credentials", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter your email and password."
    );

    expect(login).not.toHaveBeenCalled();
  });

  test("rejects invalid email addresses", async () => {
    const user = userEvent.setup();
    renderLogin();

    await fillLogin(user, "invalid-email", "password123");

    await user.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a valid email address."
    );

    expect(login).not.toHaveBeenCalled();
  });

  test("submits valid credentials to authService", async () => {
    const user = userEvent.setup();

    login.mockResolvedValue({ success: true });

    renderLogin();

    await fillLogin(user, "test@example.com", "password123");

    await user.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("sign-in request was accepted");
  });

  test("shows a friendly message when auth routes are unavailable", async () => {
    const user = userEvent.setup();

    login.mockRejectedValue(
      new Error("API request failed: 404")
    );

    renderLogin();

    await fillLogin(user, "test@example.com", "password123");

    await user.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Account sign-in and registration are not available yet."
    );
  });

  test("disables submission while the request is pending", async () => {
    const user = userEvent.setup();

    login.mockReturnValue(new Promise(() => {}));

    renderLogin();

    await fillLogin(user, "test@example.com", "password123");

    await user.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(
      screen.getByRole("button", { name: "Signing In..." })
    ).toBeDisabled();
  });
});

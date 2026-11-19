import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ManualSongInput from "./ManualSongInput";

describe("Phase 6 - Manual Song Input Accessibility", () => {
  test("provides accessible labels for both fields", () => {
    render(<ManualSongInput onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("textbox", { name: "Song title" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: "Artist" })
    ).toBeInTheDocument();
  });

  test("identifies both missing fields as invalid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ManualSongInput onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: "Add Song" })
    );

    const error = screen.getByRole("alert");

    expect(error).toHaveAttribute("id", "manual-song-error");

    for (const name of ["Song title", "Artist"]) {
      const field = screen.getByRole("textbox", { name });

      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(field).toHaveAttribute(
        "aria-describedby",
        "manual-song-error"
      );
    }

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("identifies only the missing artist field", async () => {
    const user = userEvent.setup();

    render(<ManualSongInput onSubmit={vi.fn()} />);

    await user.type(
      screen.getByRole("textbox", { name: "Song title" }),
      "Example Song"
    );

    await user.click(
      screen.getByRole("button", { name: "Add Song" })
    );

    expect(
      screen.getByRole("textbox", { name: "Song title" })
    ).toHaveAttribute("aria-invalid", "false");

    expect(
      screen.getByRole("textbox", { name: "Artist" })
    ).toHaveAttribute("aria-invalid", "true");
  });

  test("does not mark valid fields invalid after a server error", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(
      new Error("Unable to add song.")
    );

    render(<ManualSongInput onSubmit={onSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: "Song title" }),
      "Example Song"
    );

    await user.type(
      screen.getByRole("textbox", { name: "Artist" }),
      "Example Artist"
    );

    await user.click(
      screen.getByRole("button", { name: "Add Song" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to add song.");

    for (const name of ["Song title", "Artist"]) {
      const field = screen.getByRole("textbox", { name });

      expect(field).toHaveAttribute("aria-invalid", "false");
      expect(field).not.toHaveAttribute("aria-describedby");
    }
  });

  test("clears validation errors when the user edits a field", async () => {
    const user = userEvent.setup();

    render(<ManualSongInput onSubmit={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: "Add Song" })
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Song title" }),
      "Example Song"
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: "Song title" })
    ).toHaveAttribute("aria-invalid", "false");

    expect(
      screen.getByRole("textbox", { name: "Artist" })
    ).toHaveAttribute("aria-invalid", "false");
  });

  test("submits valid song information", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ManualSongInput onSubmit={onSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: "Song title" }),
      "Example Song"
    );

    await user.type(
      screen.getByRole("textbox", { name: "Artist" }),
      "Example Artist"
    );

    await user.click(
      screen.getByRole("button", { name: "Add Song" })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Example Song",
      artist: "Example Artist",
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

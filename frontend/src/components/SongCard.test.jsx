import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SongCard from "./SongCard";

const mockTrack = {
  spotifyId: "spotify-track-123",
  title: "Midnight Drive",
  artistName: "The Echo Lines",
  albumName: "Night Lights",
  albumImageUrl: "https://example.com/album.jpg",
};

describe("Phase 3 - SongCard UI", () => {
  test("displays song title, artist, and album", () => {
    render(<SongCard track={mockTrack} onSelect={vi.fn()} />);

    expect(screen.getByText("Midnight Drive")).toBeTruthy();
    expect(screen.getByText("The Echo Lines")).toBeTruthy();
    expect(screen.getByText("Night Lights")).toBeTruthy();
  });

  test("displays album artwork when available", () => {
    render(<SongCard track={mockTrack} onSelect={vi.fn()} />);

    const artwork = screen.getByRole("img", {
      name: "Night Lights cover",
    });

    expect(artwork.getAttribute("src")).toBe(
      "https://example.com/album.jpg"
    );
    expect(artwork.getAttribute("loading")).toBe("lazy");
  });

  test("shows an artwork placeholder when no image exists", () => {
    const track = { ...mockTrack, albumImageUrl: null };

    const { container } = render(
      <SongCard track={track} onSelect={vi.fn()} />
    );

    expect(
      container.querySelector(".song-card-artwork-placeholder")
    ).not.toBeNull();
  });

  test("calls onSelect with the correct track", () => {
    const onSelect = vi.fn();

    render(<SongCard track={mockTrack} onSelect={onSelect} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Select Song" })
    );

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(mockTrack);
  });

  test("disables selection while saving", () => {
    render(
      <SongCard track={mockTrack} onSelect={vi.fn()} saving />
    );

    const button = screen.getByRole("button", {
      name: "Saving...",
    });

    expect(button.disabled).toBe(true);
  });
});

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5001"
).replace(/\/+$/, "");

export async function downloadRecommendationCsv(userId) {
  if (typeof userId !== "string" || !userId.trim()) {
    throw new Error("A user ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/recommendations/${encodeURIComponent(userId)}/export`
  );

  if (!response.ok) {
    throw new Error("Unable to download recommendations.");
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/csv")) {
    throw new Error("Invalid CSV export response.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = "musicvault-recommendations.csv";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

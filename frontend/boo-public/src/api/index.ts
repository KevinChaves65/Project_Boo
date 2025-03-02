const API_BASE = "http://localhost:8080/api";

export async function fetchMessage() {
  const response = await fetch(`${API_BASE}/hello`);
  return response.json();
}

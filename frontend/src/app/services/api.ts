const BASE_URL = "http://localhost:8080/api";

export const getMatches = async () => {
  const response = await fetch(`${BASE_URL}/match`);
  const data = await response.json();

  return data.map((match: any) => ({
    id: match.matchId,                     // backend → frontend
    lostItem: match.lostItem,
    foundItem: match.foundItem,
    confidence: match.confidenceScore * 100, // convert 0.9 → 90%
    matchReason: ["Item name match", "Location match"],
    matchDate: new Date().toISOString()
  }));
};
export const getLostItems = async () => {
  const response = await fetch(`${BASE_URL}/lost-items`);
  return response.json();
};

export const getFoundItems = async () => {
  const response = await fetch(`${BASE_URL}/found-items`);
  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const loginUser = async (data: any) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (result.status !== "success") {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

export const reportItem = async (formData: FormData) => {
  const itemType = formData.get("itemType");
  const endpoint = itemType === "lost" ? "lost-items" : "found-items";

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Server Error: ${response.status}`);
  }

  return response.json();
};

export const updateProfile = async (data: any) => {
  const response = await fetch(`${BASE_URL}/users/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const changePassword = async (data: any) => {
  const response = await fetch(`${BASE_URL}/users/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};
export const checkMatch = async (
  lostImage: File,
  foundImage: File,
  lostDescription: string,
  foundDescription: string
) => {
  const formData = new FormData();
  formData.append("lostImage", lostImage);
  formData.append("foundImage", foundImage);
  formData.append("lostDescription", lostDescription);
  formData.append("foundDescription", foundDescription);

  const response = await fetch(`${BASE_URL}/match/check`, {
    method: "POST",
    body: formData,
  });

  return response.text();
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  const result = await response.json();
  if (result.status !== "success") {
    throw new Error(result.message || "Failed to send reset link");
  }
  return result; // returning the whole result instead of throwing, it contains resetLink
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const result = await response.json();
  if (result.status !== "success") {
    throw new Error(result.message || "Failed to reset password");
  }
  return result;
};

import { fetchUserProfile, fetchMilestones, fetchPublicUserInfo } from "./apiService";

// Fetch user profile and couple info
export async function initializeUser() {
  try {
    const userProfile = await fetchUserProfile();
    console.log("Fetched User Profile:", userProfile); // Debug user profile
    return userProfile;
  } catch (error) {
    console.error("Failed to fetch user profile:", error.message);
    throw error;
  }
}

// Fetch milestones for a couple
export async function fetchCoupleMilestones(coupleId) {
  try {
    const milestones = await fetchMilestones(coupleId);
    console.log("Fetched Milestones:", milestones); // Debug milestones
    return milestones;
  } catch (error) {
    console.error("Failed to fetch milestones:", error.message);
    throw error;
  }
}

// Fetch public user info
export async function getPartnerInfo(username) {
  try {
    const partnerInfo = await fetchPublicUserInfo(username);
    console.log("Fetched Partner Info:", partnerInfo); // Debug partner info
    return partnerInfo;
  } catch (error) {
    console.error("Failed to fetch partner info:", error.message);
    throw error;
  }
}

// Format date for display
export function formatDate(date) {
  if (!date) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

// Calculate relationship stats
export function calculateRelationshipStats(milestones) {
  const now = new Date();
  const nextMilestone = milestones
    .filter((milestone) => new Date(milestone.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || {};

  return {
    relationshipDuration: "1 year, 3 months", // Replace with actual calculation
    nextAnniversary: "April 15, 2025", // Replace with actual calculation
    nextMilestone,
  };
}
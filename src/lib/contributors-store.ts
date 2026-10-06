export interface ContributorSubmission {
  id: string;
  fullName: string;
  zeduUsername: string;
  emailAddress: string;
  submittedAt: string;
  status?: "Active" | "Pending" | "Verified";
}

export const CONTRIBUTORS_STORAGE_KEY = "zedu_flamingo_contributors";

export const INITIAL_FLAMINGO_CONTRIBUTORS: ContributorSubmission[] = [
  {
    id: "flam-001",
    fullName: "Timothy Mayor",
    zeduUsername: "timothymayor",
    emailAddress: "timothy@zedu.chat",
    submittedAt: "2026-09-28T14:32:00Z",
    status: "Verified",
  },
  {
    id: "flam-002",
    fullName: "Layo Bright",
    zeduUsername: "layobright",
    emailAddress: "layo@zedu.chat",
    submittedAt: "2026-09-29T10:15:00Z",
    status: "Verified",
  },
  {
    id: "flam-003",
    fullName: "Alex Chen",
    zeduUsername: "alexchen",
    emailAddress: "alex.chen@example.com",
    submittedAt: "2026-09-30T09:45:00Z",
    status: "Active",
  },
];

export function getContributors(): ContributorSubmission[] {
  if (typeof window === "undefined") {
    return INITIAL_FLAMINGO_CONTRIBUTORS;
  }

  try {
    const raw = localStorage.getItem(CONTRIBUTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        CONTRIBUTORS_STORAGE_KEY,
        JSON.stringify(INITIAL_FLAMINGO_CONTRIBUTORS)
      );
      return INITIAL_FLAMINGO_CONTRIBUTORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Map any old records with githubRepoUrl to emailAddress if needed
      return parsed.map((item) => ({
        id: item.id || `flam-${Date.now()}`,
        fullName: item.fullName || "Contributor",
        zeduUsername: (item.zeduUsername || "").replace(/^@/, ""),
        emailAddress: item.emailAddress || item.githubRepoUrl || "contributor@zedu.chat",
        submittedAt: item.submittedAt || new Date().toISOString(),
        status: item.status || "Verified",
      }));
    }
    return INITIAL_FLAMINGO_CONTRIBUTORS;
  } catch {
    return INITIAL_FLAMINGO_CONTRIBUTORS;
  }
}

export function addContributor(
  submission: Omit<ContributorSubmission, "id" | "submittedAt" | "status">
): ContributorSubmission {
  const current = getContributors();
  const newEntry: ContributorSubmission = {
    id: `flam-${Date.now()}`,
    fullName: submission.fullName.trim(),
    zeduUsername: submission.zeduUsername.trim().replace(/^@/, ""),
    emailAddress: submission.emailAddress.trim(),
    submittedAt: new Date().toISOString(),
    status: "Verified",
  };

  const updated = [newEntry, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(CONTRIBUTORS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("zedu_contributors_updated"));
  }

  return newEntry;
}

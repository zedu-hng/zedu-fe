export interface Contributor {
  id: string;
  name: string;
  github: string;
  avatar: string;
  role: string;
  team: string;
  track: "frontend" | "ai" | "realtime" | "design" | "docs" | "core";
  contributionsCount: number;
  featured?: boolean;
  bio: string;
  skills: string[];
  recentPR?: string;
  badges: string[];
  location: string;
  socials?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface ContributionTrack {
  id: string;
  title: string;
  description: string;
  iconName: "Code2" | "Bot" | "Palette" | "BookOpen" | "Sparkles" | "Radio";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skillsNeeded: string[];
  openTasksCount: number;
  actionText: string;
}

export const CONTRIBUTORS_LIST: Contributor[] = [
  {
    id: "timothy-mayor",
    name: "Timothy Mayor",
    github: "timothymayor",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TimothyMayor",
    role: "Lead Architect & Maintainer",
    team: "Core Architecture",
    track: "core",
    contributionsCount: 248,
    featured: true,
    bio: "Driving the Next.js App Router architecture, real-time messaging pipelines, and Agora Buzz integration for Zedu.",
    skills: ["Next.js", "TypeScript", "Agora RTC", "Centrifugo", "Tailwind CSS"],
    recentPR: "feat(buzz): enhance WebRTC room negotiation and layout controls",
    badges: ["Core Maintainer", "Top Contributor", "RTC Specialist"],
    location: "London, UK",
    socials: {
      github: "https://github.com/timothymayor",
      twitter: "https://x.com/timothymayor",
    },
  },
  {
    id: "alex-chen",
    name: "Alex Chen",
    github: "alexchen-dev",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexChen",
    role: "Senior Realtime Systems Engineer",
    team: "Buzz & Agora Audio/Video",
    track: "realtime",
    contributionsCount: 142,
    featured: true,
    bio: "Specializing in low-latency WebSocket streaming, Centrifugo channels, and Agora screen-share audio multiplexing.",
    skills: ["WebSockets", "Agora NG SDK", "WebAudio API", "React 19"],
    recentPR: "perf(audio): reduce voice visualization jitter during screen share",
    badges: ["Audio/Video Master", "Core Team"],
    location: "San Francisco, US",
    socials: {
      github: "https://github.com",
    },
  },
  {
    id: "sarah-okonkwo",
    name: "Sarah Okonkwo",
    github: "sarah-codes",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SarahOkonkwo",
    role: "Frontend Lead & UX Specialist",
    team: "Frontend & UI/UX",
    track: "frontend",
    contributionsCount: 119,
    featured: true,
    bio: "Crafting accessible shadcn/ui components, responsive chat layouts, and rich text editors with TipTap.",
    skills: ["React", "TipTap", "shadcn/ui", "Tailwind CSS", "Zod"],
    recentPR: "feat(editor): implement markdown shortcuts and slack emoji autocomplete",
    badges: ["UI Vanguard", "Accessibility Champ"],
    location: "Lagos, Nigeria",
    socials: {
      github: "https://github.com",
      twitter: "https://x.com",
    },
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    github: "elena-ai",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ElenaRostova",
    role: "AI Coworkers Engineer",
    team: "AI & Agents",
    track: "ai",
    contributionsCount: 96,
    featured: true,
    bio: "Building intelligent agent workflows, prompt routing, and autonomous cohort assistance for bootcamps.",
    skills: ["Google GenAI", "Agent Workflows", "Vector Search", "TypeScript"],
    recentPR: "feat(agents): add multi-modal document reasoning in class threads",
    badges: ["AI Architect", "Prompt Wizard"],
    location: "Berlin, Germany",
    socials: {
      github: "https://github.com",
    },
  },
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    github: "marcusv-dev",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MarcusVance",
    role: "Full-Stack & Security Engineer",
    team: "Auth & RBAC",
    track: "frontend",
    contributionsCount: 84,
    bio: "Hardening permission boundaries, RBAC gates, and multi-tenant organization switching.",
    skills: ["RBAC", "OAuth 2.0", "Security Auditing", "Next.js"],
    recentPR: "fix(rbac): prevent race condition during instant organization switch",
    badges: ["Security Sentinel", "Code Contributor"],
    location: "Toronto, Canada",
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    github: "priyapatel-ui",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PriyaPatel",
    role: "Product Designer & Frontend Dev",
    team: "Design Systems",
    track: "design",
    contributionsCount: 78,
    bio: "Designing clean micro-interactions, responsive sidebar contracts, and cohesive typography across light/dark themes.",
    skills: ["Figma to Code", "CSS Variables", "Framer Motion", "Design Tokens"],
    recentPR: "style(theme): enhance dark mode contrast and optical balance",
    badges: ["Design Guru", "Theme Architect"],
    location: "Bengaluru, India",
  },
  {
    id: "david-kim",
    name: "David Kim",
    github: "davidkim-rt",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DavidKim",
    role: "Realtime Protocols Contributor",
    team: "Centrifugo & Sync",
    track: "realtime",
    contributionsCount: 65,
    bio: "Optimizing real-time presence indicators, typing broadcast channels, and message deduplication.",
    skills: ["Centrifugo", "Event-Driven Architecture", "TypeScript"],
    recentPR: "feat(typing): add throttled multi-user typing status indicators",
    badges: ["Realtime Hacker", "Bug Hunter"],
    location: "Seoul, South Korea",
  },
  {
    id: "amara-diallo",
    name: "Amara Diallo",
    github: "amara-diallo",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AmaraDiallo",
    role: "Docs & Developer Relations",
    team: "Documentation & DX",
    track: "docs",
    contributionsCount: 52,
    bio: "Authoring interactive API guides, onboarding docs, contributing guidelines, and sample apps.",
    skills: ["Technical Writing", "MDX", "OpenAPI", "Developer Experience"],
    recentPR: "docs(api): comprehensive guide on setting up custom AI coworkers",
    badges: ["Docs Champion", "Community Leader"],
    location: "Dakar, Senegal",
  },
  {
    id: "liam-oconnor",
    name: "Liam O'Connor",
    github: "liam-oc",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LiamOConnor",
    role: "File Management & Media Engineer",
    team: "Files & Storage",
    track: "frontend",
    contributionsCount: 47,
    bio: "Built the high-performance file explorer, PDF/document viewers, and image compression pipelines.",
    skills: ["Browser Image Compression", "PDF.js", "React DnD"],
    recentPR: "feat(files): add drag and drop batch upload with progress tracking",
    badges: ["File Specialist", "Contributor"],
    location: "Dublin, Ireland",
  },
  {
    id: "zahra-ahmed",
    name: "Zahra Ahmed",
    github: "zahra-ahmed-dev",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZahraAhmed",
    role: "Testing & CI/CD Specialist",
    team: "Quality Assurance",
    track: "core",
    contributionsCount: 43,
    bio: "Maintaining end-to-end Cypress test suites, GitHub Actions validation workflows, and linting standards.",
    skills: ["Cypress", "GitHub Actions", "Prettier", "ESLint", "Commitlint"],
    recentPR: "ci(cypress): add automated E2E suites for channel creation and inviting",
    badges: ["QA Guardian", "CI/CD Master"],
    location: "Nairobi, Kenya",
  },
  {
    id: "jorge-mendoza",
    name: "Jorge Mendoza",
    github: "jorgemendoza",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=JorgeMendoza",
    role: "Search & Deep Linking Engineer",
    team: "Search Engine",
    track: "frontend",
    contributionsCount: 39,
    bio: "Implemented the global search modal, message highlight jump links, and fuzzy matching filters.",
    skills: ["Search Algorithms", "URL State (Nuqs)", "Lucide", "TypeScript"],
    recentPR: "feat(search): add highlighted term jumping with deep links in message history",
    badges: ["Search Architect", "Contributor"],
    location: "Mexico City, Mexico",
  },
  {
    id: "yuki-tanaka",
    name: "Yuki Tanaka",
    github: "yukitanaka-code",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=YukiTanaka",
    role: "Notification Systems Contributor",
    team: "Push & Notifications",
    track: "realtime",
    contributionsCount: 31,
    bio: "Integrated OneSignal web push, audio notification sound effects, and badge sync.",
    skills: ["Web Push API", "OneSignal SDK", "Service Workers"],
    recentPR: "feat(push): add audio chime previews for channel mentions",
    badges: ["Notification Pro", "Contributor"],
    location: "Tokyo, Japan",
  },
];

export const CONTRIBUTION_TRACKS: ContributionTrack[] = [
  {
    id: "track-frontend",
    title: "Frontend & UI Components",
    description:
      "Build modular shadcn/ui components, responsive chat views, file explorers, and rich editors using Next.js 16 and React 19.",
    iconName: "Code2",
    difficulty: "Intermediate",
    skillsNeeded: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React 19"],
    openTasksCount: 14,
    actionText: "Browse Frontend Issues",
  },
  {
    id: "track-ai",
    title: "AI Coworkers & Logic",
    description:
      "Design intelligent agents, task execution graphs, prompt orchestration, and classroom summarization tools with Google GenAI.",
    iconName: "Bot",
    difficulty: "Advanced",
    skillsNeeded: ["Google GenAI", "Agent Workflows", "Vector Search", "Prompts"],
    openTasksCount: 8,
    actionText: "Explore AI Tasks",
  },
  {
    id: "track-realtime",
    title: "Buzz Calls & Centrifugo",
    description:
      "Work on high-performance WebRTC video/audio calls with Agora SDK, WebSocket sync, screen sharing, and recording pipelines.",
    iconName: "Radio",
    difficulty: "Advanced",
    skillsNeeded: ["Agora RTC", "Centrifugo", "WebSockets", "WebAudio"],
    openTasksCount: 6,
    actionText: "View Audio/Video Issues",
  },
  {
    id: "track-design",
    title: "UX Design & Accessibility",
    description:
      "Refine typography, light/dark themes, keyboard navigation, and WCAG AA accessibility compliance across all viewport sizes.",
    iconName: "Palette",
    difficulty: "Beginner",
    skillsNeeded: ["Figma", "Design Systems", "Accessibility (a11y)", "Tailwind"],
    openTasksCount: 11,
    actionText: "Explore Design Tickets",
  },
  {
    id: "track-docs",
    title: "Documentation & DevRel",
    description:
      "Improve setup guides, write tutorials on AI coworker integrations, translate docs, and help onboard new contributors.",
    iconName: "BookOpen",
    difficulty: "Beginner",
    skillsNeeded: ["Technical Writing", "Markdown", "Next.js Examples", "API Docs"],
    openTasksCount: 9,
    actionText: "Contribute to Docs",
  },
  {
    id: "track-core",
    title: "CI/CD, QA & Architecture",
    description:
      "Enhance automated Cypress suites, Prettier & ESLint checks, Docker builds, and Conventional Commit validation pipelines.",
    iconName: "Sparkles",
    difficulty: "Intermediate",
    skillsNeeded: ["Cypress", "GitHub Actions", "Docker", "Husky"],
    openTasksCount: 5,
    actionText: "View CI/CD Tasks",
  },
];

export const ROADMAP_STEPS = [
  {
    step: "01",
    title: "Fork & Clone the Repository",
    description:
      "Fork zedu-hng/zedu-fe into your team or personal account, clone locally, and run pnpm install.",
    code: "git clone git@github.com:your-handle/zedu-fe.git\ncd zedu-fe\npnpm install",
  },
  {
    step: "02",
    title: "Create a Standard Ticket Branch",
    description:
      "Always branch off `dev` using standard ticket convention: feat/TICKET-ID-description or fix/TICKET-ID-description.",
    code: "git checkout dev\ngit checkout -b feat/CHAT-104-custom-reactions",
  },
  {
    step: "03",
    title: "Build & Run Quality Gates",
    description:
      "Husky will run format, lint, type checks, and build on commit. You can run all checks manually at any time.",
    code: "pnpm check-format\npnpm check-lint\npnpm check-types\npnpm build",
  },
  {
    step: "04",
    title: "Commit with Conventional Commits & Open PR",
    description:
      "Commit your changes with Conventional Commits (e.g. feat(editor): add support for code blocks) and open a PR targeting `dev`.",
    code: "git commit -m \"feat(editor): add support for code block formatting\"\ngit push -u origin feat/CHAT-104-custom-reactions",
  },
];

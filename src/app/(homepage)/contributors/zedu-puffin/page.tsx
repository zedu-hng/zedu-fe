import { Metadata } from "next";
import { Github } from "lucide-react";

import { DynamicFooter } from "../../_components/footer/dynamic-footer";

export const metadata: Metadata = {
  title: "Zedu Puffin Contributors",
  description:
    "Meet the contributors building Zedu as part of the Zedu Puffin team.",
  alternates: {
    canonical: "/contributors/zedu-puffin",
  },
};

const githubBaseUrl =
  process.env.NEXT_PUBLIC_GITHUB_BASE_URL ??
  ["https", "github.com"].join("://");

const contributors = [
  {
    name: "Muhammad Rayan Tahir",
    zeduUsername: "muhammad rayan tahir",
    githubUsername: "mrayan980",
  },
  {
    name: "Oluwalayomi Esther Olayinka",
    zeduUsername: "oluwalayomiolayinka0",
    githubUsername: "Oluwalayomi-9082",
  },
  {
    name: "Onyema Chimaobi Victor",
    zeduUsername: "Chimaobi Victor",
    githubUsername: "chimaobidamian-alt",
  },
  {
    name: "Rhoda Omoyeni",
    zeduUsername: "Rhoda Omoyeni",
    githubUsername: "Orooba-96",
  },
  {
    name: "Sarah Nwakpa",
    zeduUsername: "cyber_sarah",
    githubUsername: "AssistBySarah",
  },
  {
    name: "Godscovenant Patrick Udofe",
    zeduUsername: "Godscovenant Patrick Udofe",
    githubUsername: "covenantudofe-creator",
  },
  {
    name: "Oyelabi Oluwatimileyin",
    zeduUsername: "tim oyelabi",
    githubUsername: "OTimileyin",
  },
  { name: "Okim Glory", zeduUsername: "OkimGlory", githubUsername: "Kimprudy" },
  {
    name: "Theophilus Taiwo Ajibade",
    zeduUsername: "ajibade theophilus",
    githubUsername: "Theophilus09",
  },
  {
    name: "Emmanuel Kalu",
    zeduUsername: "Emmanuel Kalu",
    githubUsername: "emmanuelkalu769-ctrl",
  },
  {
    name: "Aladesuru Victor",
    zeduUsername: "Aladesuru victor",
    githubUsername: "victor010-av",
  },
  {
    name: "Olukunle Oluseyi Amos",
    zeduUsername: "Olukunle oluwaseyiamos",
    githubUsername: "oluseyi1102",
  },
  {
    name: "Babatunde Sodiq Yusuf",
    zeduUsername: "Asodiq001",
    githubUsername: "asodiq001",
  },
  {
    name: "Daniel Victor Bello",
    zeduUsername: "danielldvicc",
    githubUsername: "dbellz",
  },
  {
    name: "Charles Ahuose Misheal",
    zeduUsername: "Charles Misheal",
    githubUsername: "CharlesMisheal",
  },
  {
    name: "Solomon Jacob Abbah",
    zeduUsername: "Solomon Abbah",
    githubUsername: "SoloJacBen",
  },
  {
    name: "Daniel Akor",
    zeduUsername: "Danielakor",
    githubUsername: "hilzagu",
  },
  {
    name: "Ejiro Osakede",
    zeduUsername: "Energeticej",
    githubUsername: "ejiskede-web",
  },
  {
    name: "Clifford Ezekiel",
    zeduUsername: "Bishop Clifford(icefix)",
    githubUsername: "Bishopice1",
  },
  {
    name: "Isah Muhammad Alhaji",
    zeduUsername: "Isah Muhammad (MxDev)",
    githubUsername: "EdogiStar",
  },
  {
    name: "Amaka Nwokedike",
    zeduUsername: "amaka nwokedike",
    githubUsername: "peacella",
  },
  {
    name: "Ciary Ben Alok",
    zeduUsername: "Ciaryben623",
    githubUsername: "Ben-Ciary",
  },
  {
    name: "Oreoluwa Akintaju",
    zeduUsername: "oreoluwa akintaju",
    githubUsername: "Oreoluwa03",
  },
  {
    name: "Ayo Richard ABE [gODtECH]",
    zeduUsername: "keizad hadarac",
    githubUsername: "gODtECH-Ctl-Create",
  },
];

const TeamPage = () => (
  <main className="space-y-16 pb-12">
    <section className="px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
          Meet <span className="text-primary-500">Zedu Puffin</span>
        </h1>
      </div>
    </section>

    <section className="w-full px-4 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contributors.map((contributor) => (
          <article
            key={contributor.githubUsername}
            className="flex h-full items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="min-w-0">
              <h2 className="break-words text-base font-semibold leading-snug text-neutral-900">
                {contributor.name}
              </h2>
              <p className="mt-1 break-words text-sm text-neutral-500">
                @{contributor.zeduUsername}
              </p>
            </div>

            <a
              href={`${githubBaseUrl}/${contributor.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${contributor.name} on GitHub`}
              title="GitHub profile"
              className="shrink-0 rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>

    <DynamicFooter
      text="Building Better Learning Experiences Together"
      description="Zedu brings learning teams together in one structured workspace."
    />
  </main>
);

export default TeamPage;


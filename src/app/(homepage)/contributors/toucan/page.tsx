import type { Metadata } from "next";
import { siteUrl } from "~/lib/env-urls";

export const metadata: Metadata = {
  title: "Team Toucan Contributors",
  description: "Meet the members of Team Toucan who contributed to Zedu.",
  alternates: {
    canonical: siteUrl("/contributors/toucan"),
  },
};

const members = [
  "Confidence",
  "Adesanya Islamiat",
  "oluojeniyi_pm",
  "kuforiji Awanat",
  "brown mercy",
  "d_aj",
  "MiracledTechgirli",
  "Timmy",
  "igbemo olasunkami",
  "elliotiruafemi",
  "sabhayor",
  "Solomon Theophilus",
  "Maya",
  "Muad'dib",
  "Khaleel",
  "Deborah Obiorah",
  "Funsho",
  "kurimat shutti",
  "Vivian Nduka",
  "Onuoha Chidiadi Uchechi",
  "Shedrack Dauda",
  "Mirabel Ade",
  "Samdev",
  "Nike",
  "Mike machage",
  "Olamide",
  "Haleemah Shotonwa",
  "tayo jubril",
  "Majiroghene",
  "cjaynduagwuike",
  "Ndulue Chinedu Marvellous",
  "Agnes Livingstone",
  "Solomon chimeremeze Solomon",
  "Chris",
  "vakinlusi",
];

const getInitials = (name: string) =>
  name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const ToucanContributorsPage = () => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-12 mt-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
          Team <span className="text-primary-500">Toucan</span>
        </h1>
        <p className="max-w-xl text-sm text-neutral-600 sm:text-base">
          Meet the {members.length} members of Team Toucan contributing to Zedu.
        </p>
      </div>

      <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((name) => (
          <li
            key={name}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white"
            >
              {getInitials(name)}
            </span>
            <span className="truncate font-medium text-neutral-900">
              {name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ToucanContributorsPage;

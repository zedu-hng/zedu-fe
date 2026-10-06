import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { TEAM } from "./team";
import { TeamMembers } from "./_components/team-members";

export const metadata: Metadata = {
  title: `${TEAM.name} Contributors`,
  description: `Meet the ${TEAM.name} team contributing to Zedu.`,
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ZeduSparrowTeamContributorsPage = () => {
  const teamLead = TEAM.contributors.find(
    (contributor) => contributor.role === "Team Lead"
  );

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-20 pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        <section className="flex flex-col items-center text-center">
          <Avatar className="h-28 w-28 shadow-lg ring-4 ring-white">
            <AvatarImage src={TEAM.image} alt={`${TEAM.name} team logo`} />
            <AvatarFallback className="text-xl font-semibold">
              {getInitials(TEAM.name.replace("-", " "))}
            </AvatarFallback>
          </Avatar>
          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            <Users className="h-3.5 w-3.5" />
            Contributors
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {TEAM.name}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            The people building Zedu as part of team {TEAM.name}
            {teamLead ? `, led by ${teamLead.fullName}` : ""}.
          </p>
        </section>

        <TeamMembers team={TEAM} />
      </div>
    </div>
  );
};

export default ZeduSparrowTeamContributorsPage;

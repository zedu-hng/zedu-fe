export type ContributorRole = "Team Lead" | "Member";

export type Contributor = {
  fullName: string;
  zeduUsername: string;
  githubUsername: string;
  githubEmail: string;
  primary?: string;
  role: ContributorRole;
};

export type Team = {
  name: string;
  image: string;
  contributors: Contributor[];
};

// <-----------  NOTE TO CONTRIBUTORS  ----------->
// If you cannot find your entry as a contributor, just duplicate the entry of any
// existing contributor and change the values to your own. Make sure to keep the
// order of the contributors as it is in the TEAM.contributors array. The order of
// the contributors is important because it determines the order in which they are
// displayed on the contributors page.

export const TEAM: Team = {
  name: "Zedu-Sparrow",
  image: "https://avatars.githubusercontent.com/u/335395597?s=200&v=4",
  contributors: [
    {
      fullName: "Abraham Bishop",
      zeduUsername: "dev_b",
      githubUsername: "abrahambishopcodes",
      githubEmail: "crypticcodetechnologies@gmail.com",
      primary: "Full-Stack Software Engineer",
      role: "Team Lead",
    },
    {
      fullName: "Denise Moemeke",
      githubEmail: "hello.deniseondata@gmail.com",
      githubUsername: "databydenise",
      zeduUsername: "denise_davida",
      //   add your primary role here denise if you have one, e.g. "Frontend Developer"
      role: "Member",
    },
    {
      fullName: "Medadi God'sglory Mitana",
      zeduUsername: "God'sglory",
      githubEmail: "medadimitana19@gmail.com",
      githubUsername: "medadimitana19-glitch",
      //   add your primary role here God'sglory if you have one, e.g. "Frontend Developer"
      role: "Member",
    },
  ],
};

// <-----------  NOTE TO CONTRIBUTORS  ----------->
// If you cannot find your entry as a contributor, just duplicate the entry of any
// existing contributor and change the values to your own. Make sure to keep the
// order of the contributors as it is in the TEAM.contributors array. The order of
// the contributors is important because it determines the order in which they are
// displayed on the contributors page.

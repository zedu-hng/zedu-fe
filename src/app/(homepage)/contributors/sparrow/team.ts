type ContributorRole = "Team Lead" | "Member";

export type Contributor = {
  fullName: string;
  zeduUsername?: string;
  githubEmail: string;
  githubUsername?: string;
  primaryField?: string;
  role: ContributorRole;
};

export type Team = {
  name: string;
  image: string;
  contributors: Contributor[];
};

export const TEAM: Team = {
  name: "Zedu-Sparrow",
  image: "https://avatars.githubusercontent.com/u/335395597?s=200&v=4",
  contributors: [
    {
      fullName: "Abraham Bishop",
      zeduUsername: "dev_b",
      githubEmail: "crypticcodetechnologies@gmail.com",
      githubUsername: "abrahambishopcodes",
      role: "Team Lead",
    },
    {
      fullName: "Denise Moemeke",
      zeduUsername: "denise_davida",
      githubEmail: "hello.deniseondata@gmail.com",
      githubUsername: "databydenise",
      role: "Member",
    },
    {
      fullName: "Medadi God'sglory Mitana",
      zeduUsername: "God'sglory",
      githubEmail: "medadimitana19@gmail.com",
      githubUsername: "medadimitana19-glitch",
      role: "Member",
    },
    {
      fullName: "Israel Adelakin",
      zeduUsername: "ezrahel",
      githubEmail: "adelakinisrael024@gmail.com",
      githubUsername: "ezrahel",
      role: "Member",
    },
    {
      fullName: "Oreofeoluwa Fesobi",
      zeduUsername: "oreofe fesobi",
      githubEmail: "fesobioreofe@gmail.com",
      githubUsername: "Astro0re",
      role: "Member",
    },
    {
      fullName: "Ukeme Ikot",
      zeduUsername: "ukemeik",
      githubEmail: "ukemeetim2222@gmail.com",
      githubUsername: "ukemeikot",
      role: "Member",
    },
    {
      fullName: "Nwaohiri Emmanuel Uzodinma",
      zeduUsername: "99PlusOne",
      githubEmail: "emmanuelxs101@gmail.com",
      githubUsername: "Emmanuel-Xs",
      role: "Member",
    },
    {
      fullName: "Obidigwe Francis Praise Chukwunonso",
      zeduUsername: "Francis-7-tech",
      githubEmail: "obidigwefrancis94@gmail.com",
      githubUsername: "francis-7-tech",
      role: "Member",
    },
    {
      fullName: "Amaka Dafe",
      zeduUsername: "Amaka Dafe",
      githubEmail: "amakadafe26@gmail.com",
      githubUsername: "Pepdeveloper",
      role: "Member",
    },
    {
      fullName: "Kanyinsola Ogunwale",
      zeduUsername: "kanyinsolaogunwale",
      githubEmail: "ogunwalekanyinsola@gmail.com",
      githubUsername: "kanyinsolaogunwale",
      role: "Member",
    },
    {
      fullName: "Abdulrahman Jamaldeen Ayomide",
      zeduUsername: "jamal Ayomide",
      githubEmail: "jammally470@gmail.com",
      githubUsername: "jammally470",
      role: "Member",
    },
    {
      fullName: "Gift Obafaiye",
      zeduUsername: "Gift",
      githubEmail: "giftobafaiye@gmail.com",
      githubUsername: "Giftobafaiye",
      role: "Member",
    },
    {
      fullName: "Lawal Muhammed",
      zeduUsername: "muhammed",
      githubEmail: "lawalmuhammed2008@gmail.com",
      githubUsername: "OL4M1D3",
      role: "Member",
    },
    {
      fullName: "Boluwatife Adesola",
      zeduUsername: "Adesola",
      githubEmail: "boluwatifeadesola9@gmail.com",
      githubUsername: "adesolabolu",
      role: "Member",
    },
    {
      fullName: "Raji Habeeb Ayinde",
      zeduUsername: "habeebraji",
      githubEmail: "adeboi38@gmail.com",
      githubUsername: "Hbiit",
      role: "Member",
    },
    {
      fullName: "Oluwasola Ayegbusi",
      zeduUsername: "Oluwasola Ayegbusi",
      githubEmail: "oluwasolaayegbusi@gmail.com",
      githubUsername: "SolaAye",
      role: "Member",
    },
    {
      fullName: "Obiageli Ezeokoli",
      zeduUsername: "Oby Ezeokoli",
      githubEmail: "oby.eze@gmail.com",
      githubUsername: "AfrikTechie",
      role: "Member",
    },
    {
      fullName: "Divine Okafor-udah",
      zeduUsername: "divine okafor-udah",
      githubEmail: "okafor.udahdivine@gmail.com",
      githubUsername: "Deeokafor",
      role: "Member",
    },
    {
      fullName: "Peter John",
      zeduUsername: "John_P",
      githubEmail: "peterjohnimaji72@gmail.com",
      githubUsername: "JohnP72",
      role: "Member",
    },
    {
      fullName: "Miracle Ette",
      zeduUsername: "miracle ette",
      githubEmail: "miracleette2910@gmail.com",
      githubUsername: "miracleette-lab",
      role: "Member",
    },
    {
      fullName: "Prince Adigwe",
      zeduUsername: "prince adigwe",
      githubEmail: "princeadigwe29@gmail.com",
      githubUsername: "themanprince",
      role: "Member",
    },
    {
      fullName: "Wisdom Ugwoh",
      zeduUsername: "wisdom_ugwoh",
      githubEmail: "hovafella@yahoo.com",
      githubUsername: "mygithubwisdom",
      role: "Member",
    },
    {
      fullName: "Satar Mustapha",
      zeduUsername: "satar",
      githubEmail: "satarmustapha93@gmail.com",
      githubUsername: "satarmustapha93-del",
      role: "Member",
    },
    {
      fullName: "Bewaji Akintomiwa",
      zeduUsername: "Royto",
      githubEmail: "akintomiwabewaji@gmail.com",
      githubUsername: "Akinbewaji",
      role: "Member",
    },
    {
      fullName: "Adesanya Islamiat",
      zeduUsername: "adesanyaislamiat",
      githubEmail: "adesanyaislamiyahtobi@gmail.com",
      githubUsername: "adesanyai",
      role: "Member",
    },
    {
      fullName: "Hafeezah Kadiri",
      zeduUsername: "Hafeey",
      githubEmail: "khafeezah2000@gmail.com",
      githubUsername: "HAFEEZAH029",
      role: "Member",
    },
    {
      fullName: "Rita Ntekim",
      zeduUsername: "Rita Ntekim",
      githubEmail: "ritantekim01@gmail.com",
      githubUsername: "rita-ntekim",
      role: "Member",
    },
    {
      fullName: "Joan Okereke",
      zeduUsername: "Jooooh",
      githubEmail: "joanokereke7@gmail.com",
      githubUsername: "J0HJOH",
      role: "Member",
    },
    {
      fullName: "Babajide Ibiayo",
      zeduUsername: "babajide_ibiayo",
      githubEmail: "b.ibiayo6370@miva.edu.ng",
      githubUsername: "bibiayo6370-cyber",
      role: "Member",
    },
    {
      fullName: "Uzodinma Ogbonna",
      zeduUsername: "Uzor",
      githubEmail: "huzhor94@gmail.com",
      githubUsername: "Uzodinma9",
      role: "Member",
    },
    {
      fullName: "Pearl Akpaka",
      zeduUsername: "PearlAkpaka",
      githubEmail: "koosi.akpaka@gmail.com",
      githubUsername: "Pearl-bit-tech",
      role: "Member",
    },
    {
      fullName: "Uthman Idowu",
      zeduUsername: "Uthman | QA Engineer",
      githubEmail: "uthmaidowu531@gmail.com",
      githubUsername: "Denobletech",
      role: "Member",
    },
    {
      fullName: "Badejo Toluwalase",
      zeduUsername: "Tolu Knightwatch",
      githubEmail: "badejoolorunfunmi@gmail.com",
      githubUsername: "Toluwalase1",
      role: "Member",
    },
    {
      fullName: "Victor",
      zeduUsername: "Juice",
      githubEmail: "soludoonyenekwe@gmail.com",
      githubUsername: "JuiceAiz",
      role: "Member",
    },
    {
      fullName: "Godscovenant Patrick Udofe",
      zeduUsername: "Godscovenant Patrick Udofe",
      githubEmail: "covenantudofe@gmail.com",
      githubUsername: "covenantudofe-creator",
      role: "Member",
    },
    {
      fullName: "Elsie Anucha",
      zeduUsername: "Elsie Anucha",
      githubEmail: "elsieanucha@gmail.com",
      githubUsername: "elsie456",
      role: "Member",
    },
    {
      fullName: "Abdulmuiz Abdulsalam Olalekan",
      zeduUsername: "Abdulmuiz Abdulsalam Olalekan",
      githubEmail: "aoabdulsalam90@student.lauech.edu.ng",
      githubUsername: "Iampeace001",
      primaryField: " UI/UX Design",
      role: "Member",
    },
  ],
};

import type { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Zedu-Weaver — Our Team",
  description: "Meet the 17 members of the Zedu-Weaver team.",
};

const members = [
  { fullName: "Omotomiwa Afonja", username: "S.F Tommy" },
  { fullName: "Owai Owai", username: "thisOx2" },
  { fullName: "Ummi M Kallay", username: "Khay" },
  { fullName: "Peace Ihendi", username: "Pearl" },
  { fullName: "Soneye Abimbola", username: "The Product Girlie" },
  { fullName: "Folajomi Bello", username: "Magafox" },
  { fullName: "Emmanuel Bassey Esoh", username: "Emmanuel Young" },
  { fullName: "Ayodeji Adeniyi", username: "Dayjigud" },
  { fullName: "Favour Daniel", username: "MR.FÃVY" },
  { fullName: "Mercy Bamijoko", username: "Bambam" },
  { fullName: "Egeonu Chiamaka Happiness", username: "happiness egeonu" },
  { fullName: "Faith Obi", username: "Faith Obi" },
  { fullName: "Abiodun Adeleke", username: "Tearsmith" },
  { fullName: "Naomi Okoro", username: "Nayohmee" },
  { fullName: "Ugonwa Ohagwasi", username: "nwa" },
  { fullName: "Raphael Okeke", username: "@roktech" },
  { fullName: "Emmanuel Umeogu", username: "Emmalaka" },
];

export default function ContributorsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.masthead}>
          <Image
            className={styles.logo}
            src="/contributors-zedu-logo.png"
            alt="Zedu logo: a purple bell with a lightning bolt beside the Zedu wordmark"
            width={1780}
            height={884}
            priority
          />
        </div>

        <header className={styles.header}>
          <p className={styles.eyebrow}>Our team</p>
          <h1 className={styles.title}>
            Zedu-Weaver<span aria-hidden="true">.</span>
          </h1>
        </header>

        <section aria-labelledby="members-heading">
          <div className={styles.rosterHeading}>
            <h2 id="members-heading">Team members</h2>
            <span className={styles.count}>{members.length} members</span>
          </div>
          <ol className={styles.roster}>
            {members.map(({ fullName, username }) => (
              <li className={styles.member} key={fullName}>
                <span className={styles.name}>{fullName}</span>
                <span className={styles.username}>{username}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className={styles.footer}>
          <span>Zedu-Weaver</span>
          <span className={styles.endMark} aria-hidden="true">
            ZW / {members.length}
          </span>
        </footer>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Zedu-Weaver — Our Team",
  description: "Meet the 20 members of the Zedu-Weaver team.",
};

const members = [
  "S.F Tommy",
  "Jemi",
  "Tearsmith",
  "Khay",
  "TheProductGirlie",
  "Megafox",
  "Pearl",
  "thisOx2",
  "Goodnews",
  "Zeus",
  "Nwa",
  "roktech",
  "emmanuel young",
  "Samjean",
  "Venson",
  "Doug",
  "Favour Daniel",
  "Pleasure",
  "vik_tor",
  "Quell",
];

export default function ContributorsPage() {
  if (process.env.NEXT_PUBLIC_FF_CONTRIBUTORS !== "true") {
    notFound();
  }

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
            <span className={styles.count}>20 members</span>
          </div>
          <ol className={styles.roster}>
            {members.map((name, index) => (
              <li className={styles.member} key={name}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.name}>{name}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className={styles.footer}>
          <span>Zedu-Weaver</span>
          <span className={styles.endMark} aria-hidden="true">
            ZW / 20
          </span>
        </footer>
      </div>
    </main>
  );
}

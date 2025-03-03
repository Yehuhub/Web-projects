import React, { useState } from "react";
import { getImageUrl } from "../../utils";
import styles from "./Hero.module.css";

export const Hero = () => {
  return (
    <section className={styles.container}>
      <img
        src={getImageUrl("hero/heroImage.jpg")}
        alt="HeroImageOfMe"
        className={styles.heroImg}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>Hi, I Am</h1>
        <h1 className={styles.title}>Yehu Raccah.</h1>
        <p className={styles.description}>
          A Jerusalem based third-year Computer Science student with a passion
          for technology, creativity and the bridge between them.
        </p>
        <ul className={styles.links}>
          <li>
            <a href="mailto:YHRCCH@Gmail.com" className={styles.contactBtn}>
              CONTACT ME
            </a>
          </li>
          <li className={styles.link}>
            <a href="https://www.linkedin.com/in/yehu-raccah-8530b92b9/">
              <img
                src={getImageUrl("logos/linkedin.png")}
                alt="linkedin logo"
                className={styles.img}
              />
            </a>
          </li>
          <li className={styles.link}>
            <a href="https://github.com/Yehuhub">
              <img
                src={getImageUrl("logos/github.png")}
                alt="github logo"
                className={styles.img}
              />
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.topBlur} />
      <div className={styles.bottomBlur} />
    </section>
  );
};

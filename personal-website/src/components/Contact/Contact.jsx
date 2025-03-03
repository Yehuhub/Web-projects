import React from "react";
import styles from  "./Contact.module.css";
import { getImageUrl } from "../../utils";

export const Contact = () => {
    return (
        <footer className={styles.container} id="contact">
            <div className={styles.text}>
                <h2 >Let's Connect</h2>
                <p>Say hello at <a href="mailto:yhrcch@gmail.com">yhrcch@gmail.com</a></p>
            </div>
            <ul className={styles.links}>
                <li className={styles.link}>
                    <a href="https://www.linkedin.com/in/yehu-raccah-8530b92b9/">
                        <img src={getImageUrl("logos/linkedin.png")} alt="linkedin logo" className={styles.linkedInImg}/>
                    </a>
                </li>
                <li className={styles.link}>
                    <a href="https://github.com/Yehuhub">
                        <img src={getImageUrl("logos/github.png")} alt="github logo" className={styles.githubImg}/>
                    </a>
                </li>
            </ul>
        </footer>
    );
}

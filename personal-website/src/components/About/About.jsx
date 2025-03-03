
import styles from "./About.module.css"

export const About = () => {

    return (
        <section className={styles.container} id="about">
            <h2 className={styles.title}>About Me</h2>
                <ul className={styles.aboutItems}>
                    <li className={styles.aboutItem}>
                        <div className={styles.aboutItemsText}>
                            <h3>Computer Science student</h3>
                            <p>I'm a third-year computer science student, enrolled at the Hadassah Academic College Jerusalem. 
                                <br /> During my studies I learned the importance and use of various computer science principals. 
                                <br /> Such as: 
                                <br /> Algorithms, Data Structures, Design Patterns and more...
                                <br />Currently, I'm exploring Reactjs and learning how to develop efficient and responsive apps.</p>
                        </div>
                    </li>
                    <li className={styles.aboutItem}>
                        <div className={styles.aboutItemsText}>
                            <h3>Music Fan</h3>
                            <p>While I'm not programming, I am really enthusiastic about any music I can get my hands on, photography, and anything creative.</p>
                        </div>
                    </li>
                    <li className={styles.aboutItem}>
                        <div className={styles.aboutItemsText}>
                            <h3>Goals</h3>
                            <p>I am currently looking for my first leg in the software world, looking for an internship or junior position where I can apply my skills and grow as a developer.</p>
                        </div>
                    </li>
                </ul>
        </section>
    );
}
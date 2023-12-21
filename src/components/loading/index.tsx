import { LuLoader2 } from "react-icons/lu";
import styles from './styles.module.scss';

export function Loading() {

    return (
        <div className={styles.container}>
            <LuLoader2 className={styles.loading} />
        </div>
    )
}
import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <header>
      <div className={commonStyles.container}>
        <div className={commonStyles.content}>
          <Link href="/">
            <a>
              <img src="/img/logo.svg" alt="Logotipo spacetraveling" />
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}

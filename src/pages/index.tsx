import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  posts: Post[];
  postsPagination?: PostPagination;
}

export default function Home({
  posts,
  postsPagination,
}: HomeProps): JSX.Element {
  // TODO
  console.log(posts);
  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <ul>
          {posts.map(post => (
            <li key={post.uid}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <p>
                <span>
                  <FiCalendar size={20} />
                  <time>15 Mar 2021</time>
                </span>

                <span>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.content'],
      pageSize: 2,
    }
  );

  const nextPaginationPage =
    postsResponse.next_page && (await fetch(postsResponse.next_page));

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });

  return {
    props: { posts, nextPaginationPage },
  };
  // TODO
};

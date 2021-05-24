import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
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
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const [posts, setPosts] = useState(postsPagination);

  function handleLoadMorePost(): void {
    async function loadMorePosts(): Promise<void> {
      try {
        const fetchResponse = await fetch(posts.next_page);
        const fetchData = await fetchResponse.json();

        const formattedFetchData = fetchData.results.map(post => {
          return {
            ...post,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM Y',
              { locale: ptBR }
            ),
          };
        });

        const newPostStateData = {
          next_page: fetchData.next_page,
          results: [...posts.results, ...formattedFetchData.results],
        };

        setPosts(newPostStateData);
      } catch {
        console.info('No more posts to load.');
      }
    }

    loadMorePosts();
  }
  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <ul>
          {posts.results.map(post => (
            <li key={post.uid}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <p>
                <span>
                  <FiCalendar size={20} />
                  <time>{post.first_publication_date}</time>
                </span>

                <span>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
              </p>
            </li>
          ))}
        </ul>

        {posts.next_page && (
          <button type="button" onClick={handleLoadMorePost}>
            Carregar mais posts
          </button>
        )}
      </section>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM Y',
        { locale: ptBR }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: { postsPagination },
  };
  // TODO
};

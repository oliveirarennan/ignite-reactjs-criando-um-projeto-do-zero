import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  function calculateReadTime(): number {
    const words = post.data.content.reduce((accumulator, content) => {
      accumulator += content.heading.split(' ').length;

      const bodyWords = content.body.map(item => {
        if (item.text) {
          return item.text.split(' ').length;
        }
        return 0;
      });

      bodyWords.map(word => (accumulator += word));

      return accumulator;
    }, 0);

    return Math.ceil(words / 200);
  }

  const readTime = calculateReadTime();

  return (
    <>
      <Head>
        <title> {post.data.title} | spacetraveling</title>
      </Head>

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>

      <main className={commonStyles.container}>
        <article className={`${commonStyles.content} ${styles.post}`}>
          <header>
            <h1>{post.data.title}</h1>
            <p>
              <span>
                <FiCalendar size={20} />
                <time>
                  {format(new Date(post.first_publication_date), 'dd MMM Y', {
                    locale: ptBR,
                  })}
                </time>
              </span>

              <span>
                <FiUser size={20} />
                {post.data.author}
              </span>

              <span>
                <FiClock size={20} />
                {readTime} min
              </span>
            </p>
          </header>
          <div className={styles.postBody}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>

                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid', 'posts.title'],
    }
  );

  const paths = results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
  // TODO
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };

  // TODO
};

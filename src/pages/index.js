import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

import Typewriter from 'typewriter-effect';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">

        <Heading as="h1" className="hero__title">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString(`${siteConfig.title}`)
                .pauseFor(1000)
                .typeString('<br/>')
                .pauseFor(500)
                .typeString(`<span style="font-size: 2.0rem;">${siteConfig.tagline}</span>`)
                .start();
            }}
            options={{
              delay: 60,
              deleteSpeed: 40,
              stringSplitter: (input) => Array.from(input),
              html: true,     // ← HTML 태그 사용을 위해 반드시 필요
            }}
          />
        </Heading>

      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

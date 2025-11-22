import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const CardList = [
  {
    title: '최근 포스트',
    description: (
      <>
        공부 기록과 회고, 기술 정리를 포함한 전체 블로그 글 목록입니다.
        가장 최신 글부터 순서대로 확인할 수 있습니다.
      </>
    ),
    link: '/blog',
    linkLabel: '블로그 글 보러가기',
  },
  {
    title: 'CS 노트',
    description: (
      <>
        운영체제 중심의 CS 기반 지식을 정리한 문서입니다.
        차근차근 정리한 노트를 통해 개념을 다시 복습할 수 있습니다.
      </>
    ),
    link: 'docs/operating-system',
    linkLabel: 'Docs 보러가기',
  },
  {
    title: '태그별 글 모음',
    description: (
      <>
        주제별로 정리된 태그 페이지입니다.
        결제, 포인트, 레거시 전환 등 관심 있는 주제만 골라서 볼 수 있습니다.
      </>
    ),
    link: '/blog/tags',
    linkLabel: '태그 목록 보기',
  },
];

function Card({title, description, link, linkLabel}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx("card margin-bottom--lg", styles.customCard)}>
        <div className="card__header">
          <Heading as="h3">{title}</Heading>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <a className="button button--primary button--sm" href={link}>
            {linkLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">


        {/* 카드형 섹션 */}
        <div className="row">
          {CardList.map((card, idx) => (
            <Card key={idx} {...card} />
          ))}
        </div>

      </div>
    </section>
  );
}

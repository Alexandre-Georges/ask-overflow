import { GetServerSideProps } from 'next';
import Error from 'next/error';

import Head from '@/components/Head';
import { findRelatedInteractionsByKeywords, getById, getByParentId } from '@/server/db';
import styles from '@/styles/interaction.module.css';
import typo from '@/styles/typo.module.css';
import { Interaction } from '@/types/interaction';
import concat from '@/utils/concat-styles';
import messageToHtml from '@/utils/message-to-html';
import { Fragment, ReactNode } from 'react';
import { DateTime } from 'luxon';

type RelatedInteraction = {
  id: string;
  message: string;
};

type Data = null | {
  thread: Interaction[],
  relatedInteractions: RelatedInteraction[],
};

type SSP = {
  data: Data,
};

type Props = {} & SSP;

export default function interaction(props: Props) {
  if (props.data === null) {
    return <Error statusCode={404} />;
  }
  const threadElements = props.data.thread.map(interaction => (
    <Fragment key={interaction.id}>
      <div className={concat(styles.card, styles.message)}>
        <span className={typo.bold}>{interaction.message.text}</span>
        <span className={concat(typo.xsmall, styles.date)}>{DateTime.fromISO(interaction.createdAt).toFormat('DDD')}</span>
      </div>
      <div
        className={concat(styles.card, styles.answer)}
        dangerouslySetInnerHTML={{ __html: messageToHtml(interaction.answer.text)} }
      />
    </Fragment>
  ));

  let relatedInteractionElements: ReactNode = 'No related conversations';
  if (props.data.relatedInteractions.length > 0) {
    relatedInteractionElements = props.data.relatedInteractions.map(relatedInteraction => (
      <a href={`/interaction?id=${relatedInteraction.id}`} key={relatedInteraction.id}>{relatedInteraction.message}</a>
    ))
  }
  
  return (
    <>
      <Head />
      <main className={styles.main}>
        {threadElements}
        <div className={concat(styles.card, styles.relatedconversations)}>
          <span className={concat(typo.large, typo.bold)}>Related Conversations</span>
          <div className={styles.relatedinteractions}>
            {relatedInteractionElements}
          </div>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SSP> = async ({ query }) => {
  if (query.id === undefined || Array.isArray(query.id)) {
    return { props: { data: null } };
  }
  let data: Data = null;
  const interaction = await getById(query.id as string);

  if (interaction) {
    const thread = [interaction];
    let currentInteraction = interaction;
    while (currentInteraction !== null) {
      currentInteraction = await getByParentId(currentInteraction.id) as Interaction;
      if (currentInteraction !== null) {
        thread.push(currentInteraction);
      }
    }
    data = {
      thread,
      relatedInteractions: [],
    };
    const keywords = interaction.message.keywords.concat(interaction.answer.keywords);
    const relatedInteractions = await findRelatedInteractionsByKeywords(interaction.id, keywords);
    data.relatedInteractions = relatedInteractions.map(relatedInteraction => ({
      id: relatedInteraction.id,
      message: relatedInteraction.message.text,
    }));
  }
  
  return {
    props: {
      data,
    },
  }
}

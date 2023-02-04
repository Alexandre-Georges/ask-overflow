import { DateTime } from 'luxon';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { FormEvent, useState } from 'react';

import Head from '@/components/Head';
import styles from '@/styles/index.module.css';
import { Interaction, Keywords } from '@/types/interaction';
import typo from '@/styles/typo.module.css';
import concat from '@/utils/concat-styles';
import messageToHtml from '@/utils/message-to-html';

type ApiData = {
  mostRecentInteractions: Interaction[],
  mostPopularInteractions: Interaction[],
  mostRecentKeywords: Keywords,
  mostPopularKeywords: Keywords,
};

type SSP = {
  data: null | ApiData,
};

type Props = {} & SSP;

type State = {
  interactions: Interaction[],
  isSendMessageLoading: boolean,
  message: string,
  parentId: null | string,
}

export default function IndexPage(props: Props) {
  const [state, setState] = useState<State>({
    interactions: [],
    isSendMessageLoading: false,
    message: '',
    parentId: null,
  });
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setState(state => ({
      ...state,
      isSendMessageLoading: true,
    }));
    const response = await fetch('/api/send-message', {
      method: 'POST',
      body: JSON.stringify({
        message: state.message,
        parentId: state.parentId,
      }),
    });
    const interaction = await response.json() as Interaction;
    setState(state => ({
      ...state,
      interactions: [
        ...state.interactions,
        interaction,
      ],
      isSendMessageLoading: false,
      message: '',
      parentId: interaction.id,
    }));
  };
  const interactionElements = state.interactions.map(interaction => (
    <div className={styles.interaction} key={interaction.id}>
      <div className={concat(styles.card, styles.message)}>
        <span className={typo.bold}>{interaction.message.text}</span>
        <span className={concat(typo.xsmall, styles.date)}>{DateTime.fromISO(interaction.createdAt).toFormat('DDD')}</span>
      </div>
      <div
        className={concat(styles.card, styles.answer)}
        dangerouslySetInnerHTML={{ __html: messageToHtml(interaction.answer.text)} }
      />
    </div>
  ));
  return (
    <>
      <Head />
      <main className={styles.main}>
        {interactionElements}
        <form className={styles.form} onSubmit={event => submit(event)}>
          <div className={styles.textfieldcontainer}>
            <textarea
              className={styles.messagefield}
              disabled={state.isSendMessageLoading}
              onChange={event => setState({ ...state, message: event.target.value })}
              placeholder="What are the main design patterns?"
              value={state.message} />
            <button className={concat(styles.sendbutton, typo.semibold)} disabled={state.isSendMessageLoading} type="submit">Send</button>
          </div>
        </form>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SSP> = async ({ params }) => {
  if (params === undefined) {
    return { props: { data: null } };
  }
  const parseUrlQuery = params as ParsedUrlQuery;
  if (parseUrlQuery.id === undefined || Array.isArray(parseUrlQuery)) {
    return { props: { data: null } };
  }
  return {
    props: {
      data: {
        mostRecentInteractions: [],
        mostPopularInteractions: [],
        mostRecentKeywords: [],
        mostPopularKeywords: [],
      },
    },
  }
}

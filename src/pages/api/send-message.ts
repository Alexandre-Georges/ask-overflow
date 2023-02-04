import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Interaction } from '@/types/interaction';
import { createClient as chatgptCreateClient, sendMessage as chatgptSendMessage } from '../../server/chatgpt';
import { insertInteraction } from '../../server/db';
import { processKeywords } from '../../server/keywords';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Interaction>
) {
  const body = JSON.parse(req.body);

  if (!body || !body.message || body.parentId !== null && typeof body.parentId !== 'string') {
    res.status(400).end();
    return;
  }
  
  await chatgptCreateClient();
  const answer = await chatgptSendMessage(body.message, body.parentId !== null);
  
  let messageKeywords: string[] = [];
  let answerKeywords: string[] = [];
  
  if (body.parentId === null) {
    messageKeywords = await processKeywords(body.message);
    answerKeywords = await processKeywords(answer);
  }
  
  const newInteraction = {
    answer: {
      keywords: answerKeywords,
      text: answer,
    },
    createdAt: DateTime.now().toUTC().toISO(),
    message: {
      keywords: messageKeywords,
      text: body.message,
    },
    parentId: body.parentId
  };

  const interactionId = await insertInteraction(newInteraction);

  res.status(200).json({
    ...newInteraction,
    id: interactionId,
  });
}

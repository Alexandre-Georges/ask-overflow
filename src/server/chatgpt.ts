import { ChatGPTAPIBrowser } from 'chatgpt';

let api: null | ChatGPTAPIBrowser = null;
let conversationId: null | string = null;
let latestMessageId: null | string = null;

export const createClient = async () => {
  if (api === null) {
    api = new ChatGPTAPIBrowser({
      email: process.env.CHAT_GPT_EMAIL || '',
      password: process.env.CHAT_GPT_PASSWORD || '',
    });
    await api.initSession();
  }
};

export const sendMessage = async (message: string, isSameConversation: boolean): Promise<string> => {
  const intializedApi = api as ChatGPTAPIBrowser;
  let result = null;
  if (conversationId === null || !isSameConversation) {
    result = await intializedApi.sendMessage(message);
  } else {
    result = await intializedApi.sendMessage(
      message,
      {
        conversationId: conversationId,
        parentMessageId: latestMessageId || undefined,
      },
    );
  }
  conversationId = result.conversationId;
  latestMessageId = result.messageId;
  
  return result.response;
};

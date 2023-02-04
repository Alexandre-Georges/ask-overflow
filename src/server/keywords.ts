import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAPI_KEY,
});

const openai = new OpenAIApi(configuration);

// export const processKeywords = async (message: string): Promise<string[]> => {
//   return [
//     'React',
//     'Angular',
//     'Vue',
//     'Ember',
//     'Svelte',
//     'JavaScript library',
//     'JavaScript framework',
//     'user interfaces',
//     'single-page applications',
//     'web applications',
//     'build-time'
//   ];
// };
export const processKeywords = async (message: string): Promise<string[]> => {
  const response = await openai.createCompletion({
    frequency_penalty: 0.8,
    max_tokens: 60,
    model: 'text-davinci-003',
    presence_penalty: 0,
    prompt: `Extract keywords from this text:\n\n${message}`,
    temperature: 0.5,
    top_p: 1.0,
  });
  const text = response.data.choices[0].text as string;

  const match = text.match(/Keywords: (.*)$/);
  if (match) {
    return match[1].split(', ');
  }

  let keywords: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\- (.*?) *$/);
    if (match) {
      keywords.push(match[1]);
    }
  }

  return keywords;
};

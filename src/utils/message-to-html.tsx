import { ReactNode } from 'react';

const UL_REGEX = /^\- (.*)$/;

const messageToHtml = (message: string): string => {
  let processedMessage = message;
  const urlMatches = Array.from(processedMessage.matchAll(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g));
  for (let urlMatchesIndex = urlMatches.length - 1; urlMatchesIndex >= 0; urlMatchesIndex--) {
    const urlMatch = urlMatches[urlMatchesIndex];
    const urlIndex = urlMatch.index as number;
    const url = urlMatch[0];
    processedMessage = `${processedMessage.substring(0, urlIndex)}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${processedMessage.substring(urlIndex + url.length, processedMessage.length)}`;
  }

  let processedLines: string[] = [];
  let isUlOpen = false;
  for (const line of processedMessage.split('\n')) {
    const ulMatch = line.match(UL_REGEX);
    if (ulMatch) {
      if (isUlOpen === false) {
        processedLines.push('<ul>');
      }
      processedLines.push(`<li>${ulMatch[1]}</li>`);
      isUlOpen = true;
    } else {
      if (isUlOpen) {
        processedLines.push('</ul>');
        isUlOpen = false;
      }
      processedLines.push(`${line}<br />`);
    }
  }
  processedMessage = processedLines.join('');
  return (processedMessage.match(/^(.*)(?:<br \/>)?$/) as RegExpMatchArray)[1];
};

export default messageToHtml;

export type Keyword = string;
export type Keywords = Keyword[];

export type NewInteraction = {
  answer: {
    text: string,
    keywords: Keywords,
  },
  createdAt: string,
  message: {
    text: string,
    keywords: Keywords,
  },
  parentId: null | string,
};

export type Interaction = {
  answer: {
    text: string,
    keywords: Keywords,
  },
  createdAt: string,
  id: string,
  message: {
    text: string,
    keywords: Keywords,
  },
  parentId: null | string,
};


export type InteractionMatches = Interaction[];

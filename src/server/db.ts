import { ObjectId } from 'bson';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { Interaction, InteractionMatches, Keywords, NewInteraction } from '@/types/interaction';

const URL = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(URL);

const DB = 'ask-overflow';
const INTERACTION_TABLE = 'interactions';

type DBInteraction = Omit<Interaction, 'id'> & {
  _id: ObjectId,
};
type DBImportInteraction = Omit<Interaction, 'id'> & {
  _id: {
    $oid: string,
  },
};

export const insertSeedData = async (): Promise<void> => {
  const interactions = JSON.parse((await fs.readFileSync('./seed.json')).toString()) as DBImportInteraction[];
  await client.connect();
  const db = client.db(DB);
  const collection = db.collection(INTERACTION_TABLE);
  await collection.insertMany(interactions.map(interaction => ({
    ...interaction,
    _id: new ObjectId(interaction._id.$oid)
  })));
  await client.close();
};

// insertSeedData();

export const insertInteraction = async (interaction: NewInteraction): Promise<string> => {
  await client.connect();
  const db = client.db(DB);
  const collection = db.collection(INTERACTION_TABLE);
  const document = await collection.insertOne({ ...interaction });
  await client.close();

  return document.insertedId.toString();
};

export const getById = async (id: string): Promise<null | Interaction> => {
  try {
    await client.connect();
    const db = client.db(DB);
    const collection = db.collection(INTERACTION_TABLE);
    const result = await collection.findOne<DBInteraction>({ _id: new ObjectId(id) });
    
    if (result === null) {
      return null;
    }
    return {
      answer: result.answer,
      createdAt: result.createdAt,
      id: result._id.toString(),
      parentId: result.parentId,
      message: result.message,
    };
  } catch (exception) {
    console.error(exception);
    return null;
  } finally {
    await client.close();
  }
};

export const getByParentId = async (parentId: string): Promise<null | Interaction> => {
  try {
    await client.connect();
    const db = client.db(DB);
    const collection = db.collection(INTERACTION_TABLE);
    const result = await collection.findOne<DBInteraction>({ parentId });
    
    if (result === null) {
      return null;
    }
    return {
      answer: result.answer,
      createdAt: result.createdAt,
      id: result._id.toString(),
      parentId: result.parentId,
      message: result.message,
    };
  } catch (exception) {
    console.error(exception);
    return null;
  } finally {
    await client.close();
  }
};

export const findRelatedInteractionsByKeywords = async (id: string, keywords: Keywords): Promise<InteractionMatches> => {
  const keyWordsMap: Record<string, number> = {};
  for (const keyword of keywords) {
    if (keyWordsMap[keyword]) {
      keyWordsMap[keyword]++;
    } else {
      keyWordsMap[keyword] = 1;
    }
  }

  await client.connect();
  const db = client.db(DB);
  const collection = db.collection(INTERACTION_TABLE);
  const matches = await collection.find<DBInteraction>({
    $or: [
      { 'message.keywords': { $in: keywords }},
      { 'answer.keywords': { $in: keywords }},
    ],
    $and: [
      {
        _id: { $ne: new ObjectId(id) },
      }
    ],
  }).toArray();
  await client.close();

  const results = [];
  for (const match of matches) {
    let keywordCount = 0;
    for (const keyword of match.message.keywords) {
      if (keyWordsMap[keyword]) {
        keywordCount += keyWordsMap[keyword];
      }
    }
    for (const keyword of match.answer.keywords) {
      if (keyWordsMap[keyword]) {
        keywordCount += keyWordsMap[keyword];
      }
    }

    results.push({
      match,
      keywordCount,
    });
  }
  results.sort((result1, result2) => result2.keywordCount - result1.keywordCount);

  return results.map(result => ({
    ...result.match,
    id: result.match._id.toString(),
  }));
};

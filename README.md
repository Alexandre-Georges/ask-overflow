# Ask Overflow

## Initialization

Create your own `.env.local` file that contains:
- CHAT_GPT_EMAIL: the email of your Chat GPT account
- CHAT_GPT_PASSWORD: the password of the chat GPT account
- OPENAPI_KEY: your OpenAPI key

```shell
  mkdir data
```

In `src/server/db.ts` uncomment
```typescript
  // insertSeedData();
```

Start the Database (MongoDB required):
```shell
  sh db.sh
```

Start the server:
```shell
  npm run dev
```

Open the following URL: [Default interaction](http://localhost:3000/interaction?id=63dda537f581dfadbd16d57f)

Comment the uncommented line.

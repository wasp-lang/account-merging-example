# Account Merging Example

A simple task management app built with [Wasp](https://wasp.sh/) that demonstrates how to implement **account merging** functionality in user-land using merge codes.

![ScreenRecording2025-09-24at17 26 39-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/cadee663-67bf-42e3-9ab3-4eeb1c67ab0a)

Account merging allows users to consolidate multiple accounts (created with different authentication methods) into a single account.

## Getting Started

Make sure you have [Wasp](https://wasp.sh/) installed. Then, clone this repository and navigate into the project directory:

```bash
wasp db migrate-dev
wasp start
```

For Google OAuth, you'll need to set up your Google OAuth credentials in `.env.server`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## How This Implementation Works

This app demonstrates a **merge code** approach to account merging:

1. **Generate Merge Code**: User generates a temporary merge code in their target account (the account they want to keep)
2. **Use Merge Code**: User logs into their source account (the account to be merged) and enters the merge code
3. **Account Merge**: The system transfers all data from the source account to the target account and deletes the source account

Take a look at the following files for the implementation details:

- [`./src/merge/actions.ts`](./src/merge/actions.ts): Contains the logic for generating and using merge codes, as well as merging accounts.
  - `generateMergeCode`: Generates a unique merge code for the target account.
  - `validateMergeCode`: Validates the provided merge code.
  - `mergeAccounts`: Merges the source account into the target account using the merge code.
- [`./src/merge/AccountMergePage.tsx`](./src/merge/AccountMergePage.tsx): The UI for generating and using merge codes.
- [`./schema.prisma`](./schema.prisma): Database schema including the `MergeCode` model.

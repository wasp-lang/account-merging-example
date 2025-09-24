import type {
  GenerateMergeCode,
  ValidateMergeCode,
  MergeAccounts,
} from "wasp/server/operations";
import { HttpError } from "wasp/server";
import { prisma } from "wasp/server";

function generateRandomCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const generateMergeCode: GenerateMergeCode<
  void,
  { code: string; expiresAt: Date }
> = async (_, context) => {
  if (!context.user) {
    throw new HttpError(401, "User must be authenticated");
  }

  const code = generateRandomCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Code expires in 1 hour

  const mergeCode = await context.entities.MergeCode.create({
    data: {
      code,
      generatedByUserId: context.user.id,
      expiresAt,
    },
  });

  return {
    code: mergeCode.code,
    expiresAt: mergeCode.expiresAt,
  };
};

export const validateMergeCode: ValidateMergeCode<
  { code: string },
  { valid: boolean; sourceUserId?: string }
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "User must be authenticated");
  }

  const mergeCode = await context.entities.MergeCode.findUnique({
    where: { code: args.code },
    include: { generatedBy: true },
  });

  if (!mergeCode) {
    return { valid: false };
  }

  if (mergeCode.used) {
    return { valid: false };
  }

  if (mergeCode.expiresAt < new Date()) {
    return { valid: false };
  }

  if (mergeCode.generatedByUserId === context.user.id) {
    throw new HttpError(400, "Cannot merge account with itself");
  }

  return {
    valid: true,
    sourceUserId: mergeCode.generatedByUserId,
  };
};

export const mergeAccounts: MergeAccounts<
  { code: string },
  { success: boolean; message: string }
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "User must be authenticated");
  }

  const targetUserId = context.user.id;

  // Validate the merge code first
  const validation = await validateMergeCode(args, context);
  if (!validation.valid || !validation.sourceUserId) {
    throw new HttpError(400, "Invalid or expired merge code");
  }

  const sourceUserId = validation.sourceUserId;

  try {
    // 1. Mark the merge code as used
    await context.entities.MergeCode.update({
      where: { code: args.code },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // 2. Move all tasks from source user to target user
    await context.entities.Task.updateMany({
      where: { userId: sourceUserId },
      data: { userId: targetUserId },
    });

    // 3. Move AuthIdentities from source user's Auth to target user's Auth
    // This is the key step that allows both auth methods to work on the same account
    const sourceAuth = await prisma.auth.findUnique({
      where: { userId: sourceUserId },
      include: { identities: true, sessions: true },
    });

    const targetAuth = await prisma.auth.findUnique({
      where: { userId: targetUserId },
      include: { identities: true },
    });

    if (sourceAuth && targetAuth) {
      // Check for provider conflicts (e.g., both accounts use Google)
      const targetProviders = new Set(
        targetAuth.identities.map((id) => id.providerName),
      );
      const conflictingIdentities = sourceAuth.identities.filter((id) =>
        targetProviders.has(id.providerName),
      );

      if (conflictingIdentities.length > 0) {
        const conflictingProviders = conflictingIdentities
          .map((id) => id.providerName)
          .join(", ");
        throw new HttpError(
          400,
          `Cannot merge accounts: both accounts use the same authentication provider(s): ${conflictingProviders}`,
        );
      }

      // Move all auth identities from source to target auth
      for (const identity of sourceAuth.identities) {
        await prisma.authIdentity.update({
          where: {
            providerName_providerUserId: {
              providerName: identity.providerName,
              providerUserId: identity.providerUserId,
            },
          },
          data: { authId: targetAuth.id },
        });
      }

      // Delete all sessions for source auth (user will stay logged in with target auth)
      await prisma.session.deleteMany({
        where: { userId: sourceAuth.id },
      });

      // Delete source auth record (this will cascade delete any remaining relations)
      await prisma.auth.delete({
        where: { id: sourceAuth.id },
      });
    }

    // 4. Handle MergeCodes - delete them (they'll be invalid after merge anyway)
    await context.entities.MergeCode.deleteMany({
      where: { generatedByUserId: sourceUserId },
    });

    // 5. Now we can safely delete the source user
    await context.entities.User.delete({
      where: { id: sourceUserId },
    });

    return {
      success: true,
      message:
        "Accounts successfully merged! You can now log in with any authentication method from either account.",
    };
  } catch (error) {
    console.error("Account merge failed:", error);
    throw new HttpError(
      500,
      "Account merge failed: " +
        (error instanceof Error ? error.message : "Unknown error"),
    );
  }
};

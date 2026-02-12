/**
 * Auth wrapper — uses Clerk in production, returns dev user in development.
 * Re-enable full Clerk auth when ready for real users.
 */

const DEV_USER_ID = "dev_user_vera";
const IS_DEV = process.env.NODE_ENV === "development" || !process.env.CLERK_SECRET_KEY;

export async function getAuthUserId(): Promise<string> {
  if (IS_DEV) {
    return DEV_USER_ID;
  }

  // Production: use Clerk
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getAuthUser() {
  if (IS_DEV) {
    return {
      userId: DEV_USER_ID,
      user: {
        id: DEV_USER_ID,
        firstName: "Vera",
        lastName: "Dev",
        emailAddresses: [{ emailAddress: "vera@veraaletheia.com" }],
      },
    };
  }

  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  return { userId, user };
}

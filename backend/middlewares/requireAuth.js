import { getAuth, clerkClient } from '@clerk/express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const requireAuth = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Check if user exists in database
    let userResult = await db.select().from(users).where(eq(users.clerkId, userId));
    let user = userResult[0];

    if (!user) {
      // Lazy creation: fetch user info from Clerk and insert into database
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
      const picture = clerkUser.imageUrl;

      const newUser = await db.insert(users).values({
        clerkId: userId,
        email,
        name,
        picture,
      }).returning();
      user = newUser[0];
    }

    req.user = { id: user.id, clerkId: userId, name: user.name, email: user.email };
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
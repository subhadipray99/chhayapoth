import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateAuthor } from './db';

/**
 * Gets the current logged in user session from Clerk
 * @returns {Promise<{id: string, name: string, email: string, avatar: string, role: string, isClerk: boolean}|null>}
 */
export async function getSessionUser() {
  try {
    const user = await currentUser();
    
    if (user) {
      const userData = {
        id: user.id,
        name: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Clerk User',
        email: user.emailAddresses?.[0]?.emailAddress || 'user@chhayapoth.org',
        avatar: user.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        role: 'author',
        isClerk: true
      };

      // Automatically sync profile details to database
      try {
        await getOrCreateAuthor(userData);
      } catch (syncErr) {
        console.error('Clerk session auto-sync error:', syncErr);
      }

      return userData;
    }
  } catch (error) {
    console.error('Clerk session retrieval error:', error);
  }

  return null;
}

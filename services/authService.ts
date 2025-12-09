import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { COLLECTIONS } from './firestoreService';
import type { User, UserRole } from '../types';

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  userData: {
    name: string;
    role: UserRole;
    username: string;
    branchId?: string;
  }
): Promise<User> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, {
      displayName: userData.name
    });

    // Create user document in Firestore
    const newUser: User = {
      id: firebaseUser.uid,
      username: userData.username,
      name: userData.name,
      role: userData.role,
      email: email,
      branchId: userData.branchId
    };

    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), newUser);

    return newUser;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign out current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending reset email:', error);
    throw new Error(error.message || 'Failed to send reset email');
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

  if (!userDoc.exists()) {
    return null;
  }

  return { id: userDoc.id, ...userDoc.data() } as User;
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
      if (userDoc.exists()) {
        callback({ id: userDoc.id, ...userDoc.data() } as User);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, updates, { merge: true });

    // Update Firebase Auth display name if name changed
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name
      });
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

export default {
  signUp,
  signIn,
  logout,
  resetPassword,
  getCurrentUser,
  subscribeToAuth,
  updateUserProfile,
  hasRole
};

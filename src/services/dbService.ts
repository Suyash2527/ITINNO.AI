import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, limit } from "firebase/firestore";
import { Itinerary, CommunityPost } from "../types";
import { auth } from "../firebase";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveItinerary(userId: string, itinerary: Itinerary) {
  const path = "itineraries";
  try {
    const docRef = await addDoc(collection(db, path), {
      ...itinerary,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserItineraries(userId: string): Promise<Itinerary[]> {
  const path = "itineraries";
  try {
    const q = query(
      collection(db, path),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Itinerary));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function createCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt'>) {
  const path = "community_posts";
  try {
    const docRef = await addDoc(collection(db, path), {
      ...post,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const path = "community_posts";
  let fetchedPosts: CommunityPost[] = [];
  try {
    const q = query(
      collection(db, path),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    fetchedPosts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommunityPost));
  } catch (error) {
    console.warn("Failed to fetch community posts, falling back to dummy data.", error);
  }

  // Add dummy data if the feed is empty or just to populate it
  const dummyPosts: CommunityPost[] = [
    {
      id: "dummy-1",
      userId: "user-1",
      authorName: "Sarah Jenkins",
      authorPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      destination: "Kyoto, Japan",
      content: "Just spent 5 days exploring the ancient temples and bamboo forests. The food here is absolutely incredible! Highly recommend visiting Fushimi Inari early in the morning to beat the crowds. 🌸🍜",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
      likesCount: 124,
      travelType: "Cultural Exploration",
      vibe: "Serene & Traditional",
      comments: [
        { id: "c1", userId: "u2", userName: "Marcus Chen", content: "That looks amazing! I'm planning a trip there next year.", createdAt: { seconds: Date.now() / 1000 - 3600 } },
        { id: "c2", userId: "u3", userName: "Elena Rodriguez", content: "The bamboo forest is a dream. Did you try the matcha ice cream?", createdAt: { seconds: Date.now() / 1000 - 7200 } }
      ],
      createdAt: { seconds: Date.now() / 1000 - 86400 } as any
    },
    {
      id: "dummy-2",
      userId: "user-2",
      authorName: "Marcus Chen",
      authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      destination: "Amalfi Coast, Italy",
      content: "Driving along the Amalfi coast is an experience I'll never forget. The views from Positano are breathtaking. Make sure to try the local limoncello! 🍋🌊",
      imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800&auto=format&fit=crop",
      likesCount: 89,
      travelType: "Coastal Road Trip",
      vibe: "Scenic & Refreshing",
      comments: [
        { id: "c3", userId: "u1", userName: "Sarah Jenkins", content: "Italy is always a good idea! Positano is my favorite.", createdAt: { seconds: Date.now() / 1000 - 1800 } }
      ],
      createdAt: { seconds: Date.now() / 1000 - 172800 } as any
    },
    {
      id: "dummy-3",
      userId: "user-3",
      authorName: "Elena Rodriguez",
      authorPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
      destination: "Banff National Park, Canada",
      content: "Lake Louise is even more stunning in person. We did the Plain of Six Glaciers hike and the views were worth every step. Nature at its finest! 🏔️🌲",
      imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=800&auto=format&fit=crop",
      likesCount: 256,
      travelType: "Adventure & Hiking",
      vibe: "Majestic & Wild",
      comments: [
        { id: "c4", userId: "u4", userName: "David Kim", content: "Banff is on my bucket list. Those mountains are unreal.", createdAt: { seconds: Date.now() / 1000 - 5400 } }
      ],
      createdAt: { seconds: Date.now() / 1000 - 259200 } as any
    },
    {
      id: "dummy-4",
      userId: "user-4",
      authorName: "David Kim",
      authorPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      destination: "Santorini, Greece",
      content: "Watching the sunset in Oia is a bucket list experience. The white-washed buildings against the deep blue Aegean Sea are just magical. 🌅🇬🇷",
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
      likesCount: 312,
      travelType: "Romantic Getaway",
      vibe: "Dreamy & Picturesque",
      comments: [
        { id: "c5", userId: "u5", userName: "Aisha Patel", content: "The sunsets in Oia are truly unmatched. Great shot!", createdAt: { seconds: Date.now() / 1000 - 900 } }
      ],
      createdAt: { seconds: Date.now() / 1000 - 345600 } as any
    },
    {
      id: "dummy-5",
      userId: "user-5",
      authorName: "Aisha Patel",
      authorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      destination: "Machu Picchu, Peru",
      content: "Finally made it to the lost city of the Incas! The hike was challenging but reaching the Sun Gate at dawn made it all worthwhile. 🦙⛰️",
      imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop",
      likesCount: 450,
      travelType: "Historical Trek",
      vibe: "Awe-Inspiring & Ancient",
      comments: [
        { id: "c6", userId: "u1", userName: "Sarah Jenkins", content: "What an accomplishment! Machu Picchu is truly a wonder.", createdAt: { seconds: Date.now() / 1000 - 1200 } }
      ],
      createdAt: { seconds: Date.now() / 1000 - 432000 } as any
    }
  ];

  return [...fetchedPosts, ...dummyPosts];
}

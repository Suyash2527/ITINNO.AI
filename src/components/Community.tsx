import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommunityPost, Comment } from "../types";
import { getCommunityPosts, createCommunityPost } from "../services/dbService";
import { auth } from "../firebase";
import { MessageCircle, Heart, Share2, Send, Image as ImageIcon, MoreHorizontal, Bookmark, X, MapPin, Calendar, User, Activity, Sparkles } from "lucide-react";

export function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostDestination, setNewPostDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    fetchPosts();
    return () => unsubscribe();
  }, []);

  const fetchPosts = async () => {
    const fetchedPosts = await getCommunityPosts();
    setPosts(fetchedPosts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostContent.trim() || !newPostDestination.trim()) return;

    setIsSubmitting(true);
    try {
      const postData: any = {
        userId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || "Traveler",
        destination: newPostDestination,
        content: newPostContent,
        likesCount: 0,
      };
      if (user.photoURL) {
        postData.authorPhoto = user.photoURL;
      }
      
      await createCommunityPost(postData);
      setNewPostContent("");
      setNewPostDestination("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim() || !selectedPost) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || "Traveler",
      userPhoto: user.photoURL || undefined,
      content: commentText,
      createdAt: { seconds: Date.now() / 1000 }
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...(selectedPost.comments || []), newComment]
    };

    setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
    setSelectedPost(updatedPost);
    setCommentText("");
  };

  return (
    <section className="py-12 bg-background min-h-screen pb-32 md:pb-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text mb-2">Traveler's Feed</h2>
          <p className="text-xs md:text-sm text-text/60 font-light tracking-widest uppercase">
            Discover and share journeys from around the world.
          </p>
        </motion.div>

        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-3xl p-5 md:p-6 mb-12 border border-text/5 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <div className="flex gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 overflow-hidden shrink-0 border border-text/10 shadow-inner">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                      {(user.displayName || user.email || "T")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3 md:space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" />
                    <input
                      type="text"
                      placeholder="Where did you go?"
                      value={newPostDestination}
                      onChange={(e) => setNewPostDestination(e.target.value)}
                      className="w-full bg-background/50 rounded-xl border border-text/5 pl-10 pr-4 py-2.5 md:py-3 text-text placeholder:text-text/30 focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Tell us about your adventure..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-background/50 rounded-xl border border-text/5 px-4 py-2.5 md:py-3 text-text placeholder:text-text/30 focus:outline-none focus:border-primary/50 transition-all min-h-[80px] md:min-h-[100px] resize-none text-sm"
                    required
                  />
                  <div className="flex justify-between items-center pt-1">
                    <button type="button" className="flex items-center gap-2 text-text/40 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-primary/5">
                      <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[10px] md:text-xs font-semibold">Add Photos</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newPostContent.trim() || !newPostDestination.trim()}
                      className="bg-primary text-surface font-bold text-xs md:text-sm px-6 md:px-8 py-2.5 md:py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      {isSubmitting ? "Sharing..." : "Post Journey"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-surface rounded-3xl p-6 md:p-8 mb-12 border border-text/5 text-center shadow-xl">
            <h3 className="text-lg md:text-xl font-serif font-bold text-text mb-2">Join the Global Community</h3>
            <p className="text-xs md:text-sm text-text/60 mb-6 max-w-xs mx-auto">Sign in to share your travel moments and connect with fellow explorers.</p>
            <button className="bg-primary text-surface px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Sign In to Post</button>
          </div>
        )}

        <div className="space-y-8 md:space-y-12">
          {posts.map((post, index) => (
            <motion.article
              key={post.id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface rounded-[2rem] border border-text/5 shadow-2xl overflow-hidden group cursor-pointer hover:border-primary/20 transition-all duration-500"
              onClick={() => setSelectedPost(post)}
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-5 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/20 overflow-hidden border border-text/10 shadow-sm">
                    {post.authorPhoto ? (
                      <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                        {post.authorName[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm md:text-base leading-tight group-hover:text-primary transition-colors">{post.authorName}</h4>
                    <div className="flex items-center gap-1 text-text/40">
                      <MapPin className="w-3 h-3" />
                      <p className="text-[10px] md:text-xs font-medium">{post.destination}</p>
                    </div>
                  </div>
                </div>
                <button className="text-text/30 hover:text-text p-2 rounded-full hover:bg-text/5 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              {/* Post Image */}
              <div className="w-full aspect-[4/5] bg-surface-light relative overflow-hidden">
                <img 
                  src={post.imageUrl || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop`} 
                  alt={post.destination}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 md:p-8">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-white font-serif text-2xl md:text-3xl font-bold tracking-wide drop-shadow-2xl">{post.destination}</span>
                    {post.travelType && (
                      <p className="text-white/80 text-[10px] md:text-sm font-medium mt-1 uppercase tracking-widest">{post.travelType}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Post Actions */}
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <button className="text-text/60 hover:text-red-500 transition-all transform hover:scale-110 active:scale-90">
                      <Heart className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                    <button className="text-text/60 hover:text-primary transition-all transform hover:scale-110 active:scale-90">
                      <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                    <button className="text-text/60 hover:text-accent transition-all transform hover:scale-110 active:scale-90">
                      <Share2 className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                  </div>
                  <button className="text-text/60 hover:text-primary transition-all transform hover:scale-110 active:scale-90">
                    <Bookmark className="w-6 h-6 md:w-7 md:h-7" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-surface bg-primary/20 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i + (post.id || '')}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="font-bold text-text text-xs md:text-sm">
                    {post.likesCount.toLocaleString()} explorers loved this
                  </span>
                </div>
                
                {/* Caption */}
                <div className="text-xs md:text-sm text-text/80 leading-relaxed mb-4">
                  <span className="font-bold text-text mr-2">{post.authorName}</span>
                  {post.content}
                </div>
                
                {/* Comments Preview */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-1.5 md:space-y-2 mb-4">
                    <button className="text-primary/60 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
                      View all {post.comments.length} comments
                    </button>
                    <div className="text-xs md:text-sm text-text/70">
                      <span className="font-bold text-text mr-2">{post.comments[0].userName}</span>
                      {post.comments[0].content}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-text/5">
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-text/40 uppercase tracking-widest font-bold">
                    <Calendar className="w-3 h-3" />
                    {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Just now"}
                  </div>
                  {post.vibe && (
                    <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-primary uppercase tracking-widest font-bold bg-primary/5 px-2 py-1 rounded-md">
                      <Activity className="w-3 h-3" />
                      {post.vibe}
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6 border border-text/5 shadow-xl">
                <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-text/20" />
              </div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-text mb-2">No Stories Yet</h3>
              <p className="text-xs md:text-sm text-text/40 max-w-xs mx-auto">Be the first to share your journey and inspire others to explore the world.</p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-full sm:h-[90vh] sm:max-h-[900px] bg-surface sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-text/10"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 bg-black/20 hover:bg-black/40 text-white rounded-xl sm:rounded-2xl backdrop-blur-md transition-all transform hover:rotate-90"
              >
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>

              {/* Image Section */}
              <div className="w-full lg:w-[60%] h-[35%] sm:h-[45%] lg:h-full bg-black relative group">
                <img
                  src={selectedPost.imageUrl || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop`}
                  alt={selectedPost.destination}
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-12">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="inline-block px-3 py-1 bg-primary text-surface text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-2 sm:mb-4">
                      Featured Destination
                    </span>
                    <h2 className="text-white font-serif text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-2 sm:mb-4 drop-shadow-2xl">
                      {selectedPost.destination}
                    </h2>
                    <div className="flex items-center gap-4 sm:gap-6 text-white/70">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="text-[10px] sm:text-sm font-medium uppercase tracking-widest">{selectedPost.travelType || "Exploration"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="text-[10px] sm:text-sm font-medium uppercase tracking-widest">
                          {selectedPost.createdAt ? new Date(selectedPost.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Recently"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full lg:w-[40%] h-[65%] sm:h-[55%] lg:h-full flex flex-col bg-surface">
                {/* Author Info */}
                <div className="p-5 sm:p-8 border-b border-text/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 overflow-hidden border border-text/10 shadow-lg">
                      {selectedPost.authorPhoto ? (
                        <img src={selectedPost.authorPhoto} alt={selectedPost.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                          {selectedPost.authorName[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-base sm:text-lg leading-tight">{selectedPost.authorName}</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Verified Explorer</p>
                    </div>
                  </div>
                  <button className="bg-primary/10 text-primary px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold hover:bg-primary hover:text-surface transition-all">
                    Follow
                  </button>
                </div>

                {/* Content & Comments */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-text/90 leading-relaxed text-sm sm:text-base italic font-serif">
                      "{selectedPost.content}"
                    </p>
                    {selectedPost.vibe && (
                      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Vibe: {selectedPost.vibe}
                      </div>
                    )}
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    <h5 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-text/40 border-b border-text/5 pb-3 sm:pb-4">
                      Community Discussion ({selectedPost.comments?.length || 0})
                    </h5>
                    
                    <div className="space-y-5 sm:space-y-6">
                      {selectedPost.comments?.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 sm:gap-4 group"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-text/5 overflow-hidden shrink-0 border border-text/5">
                            {comment.userPhoto ? (
                              <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text/40 font-bold text-xs sm:text-sm">
                                {comment.userName[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-text text-xs sm:text-sm">{comment.userName}</span>
                              <span className="text-[9px] sm:text-[10px] text-text/30 font-medium">
                                {new Date(comment.createdAt.seconds * 1000).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-text/70 leading-relaxed">{comment.content}</p>
                            <div className="flex items-center gap-3 sm:gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-[9px] sm:text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest">Reply</button>
                              <button className="text-[9px] sm:text-[10px] font-bold text-text/30 hover:text-red-500 uppercase tracking-widest">Like</button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                        <div className="text-center py-6 sm:py-8">
                          <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-text/5 mx-auto mb-3 sm:mb-4" />
                          <p className="text-xs sm:text-sm text-text/30">No comments yet. Be the first to start the conversation!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer / Add Comment */}
                <div className="p-5 sm:p-8 border-t border-text/5 bg-surface-light/30">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex flex-col items-center">
                        <button className="text-text/60 hover:text-red-500 transition-all transform hover:scale-110">
                          <Heart className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        <span className="text-[9px] sm:text-[10px] font-bold text-text/40 mt-1">{selectedPost.likesCount}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <button className="text-text/60 hover:text-primary transition-all transform hover:scale-110">
                          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        <span className="text-[9px] sm:text-[10px] font-bold text-text/40 mt-1">{selectedPost.comments?.length || 0}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <button className="text-text/60 hover:text-accent transition-all transform hover:scale-110">
                          <Share2 className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        <span className="text-[9px] sm:text-[10px] font-bold text-text/40 mt-1">Share</span>
                      </div>
                    </div>
                    <button className="text-text/60 hover:text-primary transition-all">
                      <Bookmark className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                  </div>

                  <form onSubmit={handleAddComment} className="relative">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-background/50 rounded-2xl border border-text/10 pl-5 sm:pl-6 pr-12 sm:pr-14 py-3 sm:py-4 text-xs sm:text-sm text-text placeholder:text-text/30 focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-primary hover:text-primary/80 disabled:opacity-30 transition-all"
                    >
                      <Send className="w-5 h-5 sm:w-6 h-6" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

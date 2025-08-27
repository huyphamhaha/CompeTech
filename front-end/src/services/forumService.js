import { auth, db, storage } from "../components/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Forum Posts Service
export const forumService = {
  // Get all posts
  async getPosts() {
    try {
      const postsRef = collection(db, "forum_posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          isLiked: data.likedBy?.includes(auth.currentUser?.uid) || false,
        };
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  // Get posts by user
  async getPostsByUser(userId) {
    try {
      const postsRef = collection(db, "forum_posts");
      const q = query(
        postsRef,
        where("author.id", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          isLiked: data.likedBy?.includes(auth.currentUser?.uid) || false,
        };
      });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  },

  // Create new post
  async createPost(postData) {
    try {
      if (!auth.currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      // Upload images to Firebase Storage
      const uploadedImages = [];
      if (postData.images && postData.images.length > 0) {
        for (const image of postData.images) {
          if (image.file) {
            const imageRef = ref(
              storage,
              `forum_images/${Date.now()}_${image.file.name}`
            );
            await uploadBytes(imageRef, image.file);
            const downloadURL = await getDownloadURL(imageRef);
            uploadedImages.push(downloadURL);
          } else {
            uploadedImages.push(image.url);
          }
        }
      }

      // Create post document
      const postDoc = {
        author: {
          id: auth.currentUser.uid,
          name: postData.author.name || "Người dùng",
          avatar: postData.author.avatar || "/default-avatar.png",
          role: postData.author.role || "Người dùng",
          studentId: postData.author.studentId || "",
          className: postData.author.className || "",
        },
        content: postData.content,
        images: uploadedImages,
        tags: postData.tags || [],
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "forum_posts"), postDoc);

      return {
        id: docRef.id,
        ...postDoc,
        createdAt: new Date(),
        isLiked: false,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  // Update post
  async updatePost(postId, updates) {
    try {
      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  // Delete post
  async deletePost(postId) {
    try {
      // Get post data to delete associated images
      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const postData = postDoc.data();

        // Delete associated images from storage
        if (postData.images && postData.images.length > 0) {
          for (const imageUrl of postData.images) {
            try {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
            } catch (error) {
              console.warn("Error deleting image:", error);
            }
          }
        }
      }

      // Delete post document
      await deleteDoc(postRef);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  // Like/Unlike post
  async toggleLike(postId) {
    try {
      if (!auth.currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data();
      const currentUserId = auth.currentUser.uid;
      const isCurrentlyLiked =
        postData.likedBy?.includes(currentUserId) || false;

      let newLikedBy = postData.likedBy || [];
      if (isCurrentlyLiked) {
        newLikedBy = newLikedBy.filter((id) => id !== currentUserId);
      } else {
        newLikedBy.push(currentUserId);
      }

      await updateDoc(postRef, {
        likes: newLikedBy.length,
        likedBy: newLikedBy,
        updatedAt: serverTimestamp(),
      });

      return {
        likes: newLikedBy.length,
        isLiked: !isCurrentlyLiked,
      };
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },

  // Increment comment count
  async incrementCommentCount(postId) {
    try {
      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const currentComments = postDoc.data().comments || 0;
        await updateDoc(postRef, {
          comments: currentComments + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error incrementing comment count:", error);
      throw error;
    }
  },

  // Increment share count
  async incrementShareCount(postId) {
    try {
      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const currentShares = postDoc.data().shares || 0;
        await updateDoc(postRef, {
          shares: currentShares + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error incrementing share count:", error);
      throw error;
    }
  },
};

// Forum Comments Service
export const commentService = {
  // Get comments for a post
  async getComments(postId) {
    try {
      const commentsRef = collection(db, "forum_comments");
      const q = query(
        commentsRef,
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const comments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      return comments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  // Create new comment
  async createComment(commentData) {
    try {
      if (!auth.currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      console.log("Creating comment with data:", commentData);
      console.log("Current user:", auth.currentUser);

      // Ensure author.id is set correctly
      if (!commentData.author.id) {
        throw new Error("Comment author ID is required");
      }

      const commentDoc = {
        postId: commentData.postId,
        author: {
          id: commentData.author.id,
          name: commentData.author.name || "Người dùng",
          avatar: commentData.author.avatar || "/default-avatar.png",
          role: commentData.author.role || "Người dùng",
          studentId: commentData.author.studentId || "",
          className: commentData.author.className || "",
        },
        content: commentData.content,
        createdAt: serverTimestamp(),
      };

      console.log("Comment document to save:", commentDoc);

      const docRef = await addDoc(collection(db, "forum_comments"), commentDoc);
      console.log("Comment saved with ID:", docRef.id);

      return {
        id: docRef.id,
        ...commentDoc,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Update comment
  async updateComment(commentId, updates) {
    try {
      const commentRef = doc(db, "forum_comments", commentId);
      await updateDoc(commentRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Delete comment
  async deleteComment(commentId) {
    try {
      await deleteDoc(doc(db, "forum_comments", commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },
};

export default forumService;

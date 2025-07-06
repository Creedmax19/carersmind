// Blog Post Service
const postService = {
    // Create a new blog post
    createPost: async (postData) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const post = {
                ...postData,
                authorId: user.uid,
                authorName: user.displayName || 'Admin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: postData.status || 'draft',
                slug: this.generateSlug(postData.title),
                views: 0
            };

            const docRef = await db.collection('posts').add(post);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error creating post:", error);
            return { success: false, error: error.message };
        }
    },

    // Update an existing blog post
    updatePost: async (postId, postData) => {
        try {
            const post = {
                ...postData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('posts').doc(postId).update(post);
            return { success: true };
        } catch (error) {
            console.error("Error updating post:", error);
            return { success: false, error: error.message };
        }
    },

    // Delete a blog post
    deletePost: async (postId) => {
        try {
            await db.collection('posts').doc(postId).delete();
            return { success: true };
        } catch (error) {
            console.error("Error deleting post:", error);
            return { success: false, error: error.message };
        }
    },

    // Get all blog posts
    getPosts: async (options = {}) => {
        try {
            let query = db.collection('posts');
            
            // Apply filters
            if (options.status) {
                query = query.where('status', '==', options.status);
            }
            
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            if (options.orderBy) {
                query = query.orderBy(options.orderBy, options.orderDir || 'desc');
            }
            
            const snapshot = await query.get();
            const posts = [];
            
            snapshot.forEach(doc => {
                posts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, data: posts };
        } catch (error) {
            console.error("Error getting posts:", error);
            return { success: false, error: error.message };
        }
    },

    // Get a single blog post by ID
    getPostById: async (postId) => {
        try {
            const doc = await db.collection('posts').doc(postId).get();
            
            if (!doc.exists) {
                return { success: false, error: 'Post not found' };
            }
            
            return { 
                success: true, 
                data: { 
                    id: doc.id, 
                    ...doc.data() 
                } 
            };
        } catch (error) {
            console.error("Error getting post:", error);
            return { success: false, error: error.message };
        }
    },

    // Generate URL-friendly slug from title
    generateSlug: (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with -
            .replace(/--+/g, '-')      // Replace multiple - with single -
            .trim();
    },

    // Upload image to Firebase Storage
    uploadImage: async (file) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');
            
            // Create a storage reference
            const storageRef = storage.ref();
            const fileExt = file.name.split('.').pop();
            const fileName = `posts/${Date.now()}.${fileExt}`;
            const fileRef = storageRef.child(fileName);
            
            // Upload file
            const snapshot = await fileRef.put(file);
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return { 
                success: true, 
                url: downloadURL,
                path: fileName
            };
        } catch (error) {
            console.error("Error uploading image:", error);
            return { success: false, error: error.message };
        }
    }
};

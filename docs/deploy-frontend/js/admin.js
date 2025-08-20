// Main Admin JavaScript
let quill;
let currentUser = {
    name: 'Admin User',
    email: 'admin@carerscare.org',
    role: 'Administrator',
    lastLogin: new Date().toLocaleString()
};

// Sample blog posts data (in a real app, this would come from an API)
let blogPosts = [
    {
        id: 1,
        title: 'Welcome to Our New Blog',
        slug: 'welcome-to-our-new-blog',
        excerpt: 'This is the first post on our new blog. We\'re excited to share our journey with you!',
        content: '<h2>Welcome to Our New Blog</h2><p>This is the first post on our new blog. We\'re excited to share our journey with you!</p>',
        author: 'Admin User',
        date: '2023-06-25',
        status: 'published',
        featuredImage: 'https://via.placeholder.com/800x400?text=Blog+Post+Image',
        categories: ['Announcements'],
        tags: ['welcome', 'news']
    },
    {
        id: 2,
        title: 'The Importance of Self-Care for Carers',
        slug: 'importance-of-self-care-for-carers',
        excerpt: 'Taking care of yourself is just as important as taking care of others. Learn why self-care matters for carers.',
        content: '<h2>The Importance of Self-Care for Carers</h2><p>Taking care of yourself is just as important as taking care of others. Learn why self-care matters for carers.</p>',
        author: 'Admin User',
        date: '2023-06-20',
        status: 'published',
        featuredImage: 'https://via.placeholder.com/800x400?text=Self+Caring',
        categories: ['Self-Care', 'Wellbeing'],
        tags: ['self-care', 'wellbeing', 'mental-health']
    }
];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quill editor if on the new post page
    if (document.getElementById('editor')) {
        initializeEditor();
    }
    
    // Update admin name in the header
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement) {
        adminNameElement.textContent = currentUser.name;
    }
    
    // Set up navigation
    setupNavigation();
    
    // Load dashboard data
    if (document.getElementById('dashboard-section')) {
        loadDashboardData();
    }
    
    // Load posts if on posts page
    if (document.getElementById('postsList')) {
        loadPosts();
    }
    
    // Set up form submissions
    setupForms();
    
    // Set up modals
    setupModals();
});

// Initialize Quill editor
function initializeEditor() {
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
    ];

    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        },
        placeholder: 'Write your blog post here...',
    });
    
    // Set initial content if editing a post
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('edit');
    
    if (postId) {
        loadPostForEditing(postId);
    }
}

// Set up navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav item
            document.querySelectorAll('.admin-nav li').forEach(item => {
                item.classList.remove('active');
            });
            
            this.closest('li').classList.add('active');
        });
    });
}

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.classList.add('active');
    }
}

// Load dashboard data
function loadDashboardData() {
    // Update stats
    document.getElementById('totalPosts').textContent = blogPosts.length;
    
    // Calculate total views (in a real app, this would come from your analytics)
    const totalViews = blogPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    
    // Calculate total comments (in a real app, this would come from your database)
    const totalComments = blogPosts.reduce((sum, post) => sum + (post.comments ? post.comments.length : 0), 0);
    document.getElementById('totalComments').textContent = totalComments;
    
    // Load recent posts
    const recentPostsContainer = document.getElementById('recentPosts');
    if (recentPostsContainer) {
        const recentPosts = [...blogPosts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentPosts.length > 0) {
            recentPostsContainer.innerHTML = recentPosts.map(post => `
                <div class="post-item">
                    <div class="post-thumbnail">
                        <img src="${post.featuredImage}" alt="${post.title}">
                    </div>
                    <div class="post-details">
                        <h4>${post.title}</h4>
                        <div class="post-meta">
                            <span class="post-date">${formatDate(post.date)}</span>
                            <span class="post-status ${post.status}">${post.status}</span>
                        </div>
                    </div>
                    <div class="post-actions">
                        <a href="#" class="btn-edit" data-id="${post.id}">
                            <i class="fas fa-edit"></i>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load all posts
function loadPosts() {
    const postsList = document.getElementById('postsList');
    
    if (postsList) {
        if (blogPosts.length > 0) {
            postsList.innerHTML = blogPosts.map(post => `
                <tr>
                    <td>${post.title}</td>
                    <td>${post.author}</td>
                    <td>${formatDate(post.date)}</td>
                    <td><span class="status-badge status-${post.status}">${post.status}</span></td>
                    <td class="actions">
                        <a href="#" class="btn-edit" data-id="${post.id}"><i class="fas fa-edit"></i></a>
                        <a href="#" class="btn-delete" data-id="${post.id}"><i class="fas fa-trash"></i></a>
                    </td>
                </tr>
            `).join('');
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const postId = this.getAttribute('data-id');
                    editPost(postId);
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const postId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this post?')) {
                        deletePost(postId);
                    }
                });
            });
        }
    }
}

// Load a post for editing
function loadPostForEditing(postId) {
    const post = blogPosts.find(p => p.id === parseInt(postId));
    
    if (post) {
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postSlug').value = post.slug;
        document.getElementById('postExcerpt').value = post.excerpt;
        
        if (quill) {
            quill.root.innerHTML = post.content;
        }
        
        // Set featured image preview if exists
        if (post.featuredImage) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `
                <img src="${post.featuredImage}" alt="${post.title}">
                <button type="button" class="btn-remove-image">
                    <i class="fas fa-times"></i>
                </button>
            `;
            imagePreview.style.display = 'block';
        }
        
        // Set categories
        const categoriesList = document.getElementById('categoriesList');
        if (categoriesList) {
            categoriesList.innerHTML = '';
            post.categories.forEach(category => {
                addCategory(category);
            });
        }
        
        // Set tags
        const tagsList = document.getElementById('tagsList');
        if (tagsList) {
            tagsList.innerHTML = '';
            post.tags.forEach(tag => {
                addTag(tag);
            });
        }
        
        // Set featured post status
        document.getElementById('featuredPost').checked = post.featured || false;
    }
}

// Set up form submissions
function setupForms() {
    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function(e) {
            e.preventDefault();
            savePost('draft');
        });
    }
    
    // Publish button
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', function(e) {
            e.preventDefault();
            savePost('publish');
        });
    }
    
    // Add category
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryInput = document.getElementById('newCategory');
            const category = categoryInput.value.trim();
            
            if (category) {
                addCategory(category);
                categoryInput.value = '';
            }
        });
        
        // Also allow adding category on Enter key
        const categoryInput = document.getElementById('newCategory');
        if (categoryInput) {
            categoryInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const category = this.value.trim();
                    
                    if (category) {
                        addCategory(category);
                        this.value = '';
                    }
                }
            });
        }
    }
    
    // Add tags
    const tagsInput = document.getElementById('newTag');
    if (tagsInput) {
        tagsInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = this.value.trim().replace(/,/g, '');
                
                if (tag) {
                    addTag(tag);
                    this.value = '';
                }
            }
        });
    }
    
    // Featured image upload
    const featuredImageUpload = document.getElementById('featuredImageUpload');
    const featuredImageInput = document.getElementById('featuredImage');
    
    if (featuredImageUpload && featuredImageInput) {
        featuredImageUpload.addEventListener('click', function() {
            featuredImageInput.click();
        });
        
        featuredImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('imagePreview');
                    imagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="btn-remove-image">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    imagePreview.style.display = 'block';
                    
                    // Add event listener to remove button
                    const removeBtn = imagePreview.querySelector('.btn-remove-image');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            imagePreview.innerHTML = '';
                            imagePreview.style.display = 'none';
                            featuredImageInput.value = '';
                        });
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remove image button
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.addEventListener('click', function(e) {
            if (e.target.closest('.btn-remove-image')) {
                e.stopPropagation();
                this.innerHTML = '';
                this.style.display = 'none';
                if (featuredImageInput) {
                    featuredImageInput.value = '';
                }
            }
        });
    }
}

// Add a category
function addCategory(name) {
    const categoriesList = document.getElementById('categoriesList');
    
    // Check if category already exists
    const existingCategory = Array.from(categoriesList.children).some(
        item => item.textContent.trim().toLowerCase() === name.toLowerCase()
    );
    
    if (!existingCategory) {
        const category = document.createElement('div');
        category.className = 'category-tag';
        category.innerHTML = `
            ${name}
            <button type="button" class="btn-remove-category">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to remove button
        const removeBtn = category.querySelector('.btn-remove-category');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                category.remove();
            });
        }
        
        categoriesList.appendChild(category);
    }
}

// Add a tag
function addTag(name) {
    const tagsList = document.getElementById('tagsList');
    
    // Check if tag already exists
    const existingTag = Array.from(tagsList.children).some(
        item => item.textContent.trim().toLowerCase() === name.toLowerCase()
    );
    
    if (!existingTag) {
        const tag = document.createElement('div');
        tag.className = 'tag-item';
        tag.innerHTML = `
            ${name}
            <button type="button" class="btn-remove-tag">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to remove button
        const removeBtn = tag.querySelector('.btn-remove-tag');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                tag.remove();
            });
        }
        
        tagsList.appendChild(tag);
    }
}

// Save a post
function savePost(status) {
    const title = document.getElementById('postTitle').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const content = quill ? quill.root.innerHTML : '';
    
    if (!title) {
        alert('Please enter a title for your post');
        return;
    }
    
    // Get categories
    const categories = [];
    document.querySelectorAll('.category-tag').forEach(tag => {
        const categoryName = tag.textContent.trim();
        if (categoryName) {
            categories.push(categoryName);
        }
    });
    
    // Get tags
    const tags = [];
    document.querySelectorAll('.tag-item').forEach(tag => {
        const tagName = tag.textContent.trim();
        if (tagName) {
            tags.push(tagName);
        }
    });
    
    // Get featured image
    const featuredImage = document.querySelector('#imagePreview img')?.src || '';
    
    // Check if we're editing an existing post
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('edit');
    
    if (postId) {
        // Update existing post
        const postIndex = blogPosts.findIndex(p => p.id === parseInt(postId));
        if (postIndex !== -1) {
            blogPosts[postIndex] = {
                ...blogPosts[postIndex],
                title,
                excerpt,
                content,
                status,
                categories,
                tags,
                featuredImage: featuredImage || blogPosts[postIndex].featuredImage,
                date: new Date().toISOString().split('T')[0] // Update last modified date
            };
            
            showNotification('Post updated successfully!', 'success');
        }
    } else {
        // Create new post
        const newPost = {
            id: blogPosts.length > 0 ? Math.max(...blogPosts.map(p => p.id)) + 1 : 1,
            title,
            slug: generateSlug(title),
            excerpt,
            content,
            author: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            status,
            featuredImage,
            categories,
            tags,
            featured: document.getElementById('featuredPost').checked
        };
        
        blogPosts.unshift(newPost);
        showNotification('Post created successfully!', 'success');
    }
    
    // Redirect to posts list after a short delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// Edit a post
function editPost(postId) {
    window.location.href = `new-post.html?edit=${postId}`;
}

// Delete a post
function deletePost(postId) {
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(postId));
    
    if (postIndex !== -1) {
        blogPosts.splice(postIndex, 1);
        loadPosts(); // Refresh the posts list
        showNotification('Post deleted successfully!', 'success');
    }
}

// Set up modals
function setupModals() {
    // Open media library
    const openMediaLibraryBtns = document.querySelectorAll('.open-media-library');
    openMediaLibraryBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('imageLibraryModal').classList.add('active');
        });
    });
    
    // Close modals
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Helper function to generate a URL-friendly slug
function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/--+/g, '-')      // Replace multiple hyphens with single hyphen
        .trim();                   // Remove leading/trailing whitespace
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            </div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger reflow to enable the transition
    void notification.offsetWidth;
    
    // Show notification
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

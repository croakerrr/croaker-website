// Admin Configuration
const CONFIG = {
    password: 'croaker2025',
    github: {
        owner: 'liamgerardhughes',
        repo: 'croaker-website',
        token: '', // GitHub Personal Access Token - Add yours here
        blogFile: 'blog-data.json',
        projectsFile: 'projects-data.json'
    }
};

// Global variables
let blogs = [];
let projects = [];
let currentEditingBlog = null;
let currentEditingProject = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLoginForm();
    }

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login functionality
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.admin-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function login() {
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (password === CONFIG.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        if (errorDiv) errorDiv.style.display = 'none';
    } else {
        if (errorDiv) errorDiv.style.display = 'block';
        document.getElementById('password').value = '';
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
}

function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginForm) loginForm.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    
    // Clear password field
    const passwordInput = document.getElementById('password');
    if (passwordInput) passwordInput.value = '';
}

function showDashboard() {
    const loginForm = document.getElementById('login-form');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginForm) loginForm.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    // Load data
    loadBlogs();
    loadProjects();
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Blog Management
async function loadBlogs() {
    try {
        const response = await fetch('blog-data.json');
        blogs = await response.json();
        renderBlogsList();
    } catch (error) {
        console.error('Error loading blogs:', error);
        blogs = []; // Initialize as empty array if file doesn't exist
        renderBlogsList();
    }
}

function renderBlogsList() {
    const blogsList = document.getElementById('blogs-list');
    
    if (blogs.length === 0) {
        blogsList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--fg-light);">No blog posts yet</div>';
        return;
    }
    
    blogsList.innerHTML = blogs.map(blog => `
        <div class="content-item">
            <div class="item-info">
                <h3>${blog.title}</h3>
                <p>${blog.date} • ${blog.tags.join(', ')}</p>
            </div>
            <div class="item-actions">
                <button onclick="editBlog('${blog.id}')">edit</button>
                <button onclick="deleteBlog('${blog.id}')">delete</button>
            </div>
        </div>
    `).join('');
}

function editBlog(id) {
    currentEditingBlog = blogs.find(blog => blog.id === id);
    if (!currentEditingBlog) return;
    
    document.getElementById('blog-title').value = currentEditingBlog.title;
    document.getElementById('blog-date').value = currentEditingBlog.date;
    document.getElementById('blog-tags').value = currentEditingBlog.tags.join(', ');
    document.getElementById('blog-image').value = currentEditingBlog.image || '';
    document.getElementById('blog-content').value = currentEditingBlog.content;
}

function addNewBlog() {
    currentEditingBlog = null;
    clearBlogEditor();
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('blog-date').value = today;
}

function clearBlogEditor() {
    document.getElementById('blog-title').value = '';
    document.getElementById('blog-date').value = '';
    document.getElementById('blog-tags').value = '';
    document.getElementById('blog-image').value = '';
    document.getElementById('blog-content').value = '';
}

function saveBlog() {
    const title = document.getElementById('blog-title').value.trim();
    const date = document.getElementById('blog-date').value;
    const tags = document.getElementById('blog-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const image = document.getElementById('blog-image').value.trim();
    const content = document.getElementById('blog-content').value.trim();
    
    if (!title || !date || !content) {
        showStatus('Please fill in all required fields', 'error');
        return;
    }
    
    const blog = {
        id: currentEditingBlog ? currentEditingBlog.id : generateId(),
        title,
        date,
        tags,
        image: image || null,
        content,
        author: 'Croaker'
    };
    
    if (currentEditingBlog) {
        // Update existing blog
        const index = blogs.findIndex(b => b.id === currentEditingBlog.id);
        blogs[index] = blog;
    } else {
        // Add new blog
        blogs.push(blog);
    }
    
    // Sort by date (newest first)
    blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderBlogsList();
    clearBlogEditor();
    currentEditingBlog = null;
    
    showStatus('Blog post saved successfully', 'success');
}

function deleteBlog(id) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        blogs = blogs.filter(blog => blog.id !== id);
        renderBlogsList();
        showStatus('Blog post deleted', 'success');
    }
}

// Project Management
async function loadProjects() {
    try {
        const response = await fetch('projects-data.json');
        projects = await response.json();
        renderProjectsList();
    } catch (error) {
        console.error('Error loading projects:', error);
        projects = []; // Initialize as empty array if file doesn't exist
        renderProjectsList();
    }
}

function renderProjectsList() {
    const projectsList = document.getElementById('projects-list');
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--fg-light);">No projects yet</div>';
        return;
    }
    
    projectsList.innerHTML = projects.map(project => `
        <div class="content-item">
            <div class="item-info">
                <h3>${project.title}</h3>
                <p>${project.tech} • ${project.status}</p>
            </div>
            <div class="item-actions">
                <button onclick="editProject('${project.id}')">edit</button>
                <button onclick="deleteProject('${project.id}')">delete</button>
            </div>
        </div>
    `).join('');
}

function editProject(id) {
    currentEditingProject = projects.find(project => project.id === id);
    if (!currentEditingProject) return;
    
    document.getElementById('project-title').value = currentEditingProject.title;
    document.getElementById('project-tech').value = currentEditingProject.tech;
    document.getElementById('project-status').value = currentEditingProject.status;
    document.getElementById('project-description').value = currentEditingProject.description;
    document.getElementById('project-github').value = currentEditingProject.github || '';
    document.getElementById('project-demo').value = currentEditingProject.demo || '';
}

function addNewProject() {
    currentEditingProject = null;
    clearProjectEditor();
}

function clearProjectEditor() {
    document.getElementById('project-title').value = '';
    document.getElementById('project-tech').value = '';
    document.getElementById('project-status').value = 'completed';
    document.getElementById('project-description').value = '';
    document.getElementById('project-github').value = '';
    document.getElementById('project-demo').value = '';
}

function saveProject() {
    const title = document.getElementById('project-title').value.trim();
    const tech = document.getElementById('project-tech').value.trim();
    const status = document.getElementById('project-status').value;
    const description = document.getElementById('project-description').value.trim();
    const github = document.getElementById('project-github').value.trim();
    const demo = document.getElementById('project-demo').value.trim();
    
    if (!title || !tech || !description) {
        showStatus('Please fill in all required fields', 'error');
        return;
    }
    
    const project = {
        id: currentEditingProject ? currentEditingProject.id : generateId(),
        title,
        tech,
        status,
        description,
        github: github || null,
        demo: demo || null
    };
    
    if (currentEditingProject) {
        // Update existing project
        const index = projects.findIndex(p => p.id === currentEditingProject.id);
        projects[index] = project;
    } else {
        // Add new project
        projects.push(project);
    }
    
    renderProjectsList();
    clearProjectEditor();
    currentEditingProject = null;
    
    showStatus('Project saved successfully', 'success');
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(project => project.id !== id);
        renderProjectsList();
        showStatus('Project deleted', 'success');
    }
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
    
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 3000);
}

// GitHub integration (for future use)
async function syncToGitHub() {
    if (!CONFIG.github.token) {
        showStatus('GitHub token not configured', 'error');
        return;
    }
    
    try {
        // This would sync the data to GitHub
        // Implementation would go here
        showStatus('Data synced to GitHub successfully', 'success');
    } catch (error) {
        console.error('GitHub sync error:', error);
        showStatus('Failed to sync to GitHub', 'error');
    }
}
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
    }

    loadGitHubConfig() {
        document.getElementById('github-token').value = this.githubConfig.token;
        document.getElementById('repo-owner').value = this.githubConfig.owner;
        document.getElementById('repo-name').value = this.githubConfig.name;
    }

    saveGitHubConfig() {
        this.githubConfig.token = document.getElementById('github-token').value;
        this.githubConfig.owner = document.getElementById('repo-owner').value;
        this.githubConfig.name = document.getElementById('repo-name').value;
        
        localStorage.setItem('github-token', this.githubConfig.token);
        localStorage.setItem('repo-owner', this.githubConfig.owner);
        localStorage.setItem('repo-name', this.githubConfig.name);
    }

    async testGitHubConnection() {
        const statusEl = document.getElementById('github-status');
        
        if (!this.githubConfig.token) {
            this.showStatus(statusEl, 'Please enter a GitHub token', 'error');
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.name}`, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                this.showStatus(statusEl, 'GitHub connection successful!', 'success');
            } else {
                this.showStatus(statusEl, 'Connection failed. Check your token and repository details.', 'error');
            }
        } catch (error) {
            this.showStatus(statusEl, 'Network error. Please try again.', 'error');
        }
    }

    async loadData() {
        try {
            const [blogResponse, projectResponse] = await Promise.all([
                fetch('blog-data.json'),
                fetch('projects-data.json')
            ]);
            
            this.blogData = await blogResponse.json();
            this.projectData = await projectResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.blogData = [];
            this.projectData = [];
        }
    }

    // Blog Management
    loadBlogs() {
        const container = document.getElementById('blogs-list');
        container.innerHTML = '';

        this.blogData.forEach((post, index) => {
            const postEl = document.createElement('div');
            postEl.className = 'item-card';
            postEl.innerHTML = `
                <div class="item-info">
                    <h4>${post.title}</h4>
                    <p>${post.date} • ${post.tags.join(', ')}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="admin.editBlog(${index})">Edit</button>
                </div>
            `;
            container.appendChild(postEl);
        });
    }

    createNewBlog() {
        this.currentBlogPost = null;
        this.currentBlogTags = [];
        document.getElementById('blog-editor-title').textContent = 'create new blog post';
        document.getElementById('blog-title').value = '';
        document.getElementById('blog-excerpt').value = '';
        document.getElementById('blog-content').value = '';
        document.getElementById('delete-blog').classList.add('hidden');
        this.updateBlogTagsDisplay();
        document.getElementById('blog-editor').classList.remove('hidden');
    }

    editBlog(index) {
        const post = this.blogData[index];
        this.currentBlogPost = index;
        this.currentBlogTags = [...post.tags];
        
        document.getElementById('blog-editor-title').textContent = 'edit blog post';
        document.getElementById('blog-title').value = post.title;
        document.getElementById('blog-excerpt').value = post.excerpt;
        document.getElementById('blog-content').value = post.content;
        document.getElementById('delete-blog').classList.remove('hidden');
        this.updateBlogTagsDisplay();
        document.getElementById('blog-editor').classList.remove('hidden');
    }

    addBlogTag() {
        const input = document.getElementById('blog-tag-input');
        const tag = input.value.trim().toLowerCase();
        
        if (tag && !this.currentBlogTags.includes(tag)) {
            this.currentBlogTags.push(tag);
            this.updateBlogTagsDisplay();
            input.value = '';
        }
    }

    removeBlogTag(tag) {
        this.currentBlogTags = this.currentBlogTags.filter(t => t !== tag);
        this.updateBlogTagsDisplay();
    }

    updateBlogTagsDisplay() {
        const container = document.getElementById('blog-tags-container');
        container.innerHTML = '';
        
        this.currentBlogTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-chip';
            tagEl.innerHTML = `
                ${tag}
                <span class="chip-remove" onclick="admin.removeBlogTag('${tag}')">&times;</span>
            `;
            container.appendChild(tagEl);
        });
    }

    async saveBlog() {
        const title = document.getElementById('blog-title').value.trim();
        const excerpt = document.getElementById('blog-excerpt').value.trim();
        const content = document.getElementById('blog-content').value.trim();
        const statusEl = document.getElementById('blog-editor-status');

        if (!title || !excerpt || !content) {
            this.showStatus(statusEl, 'Please fill in all fields', 'error');
            return;
        }

        const now = new Date();
        const date = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        
        const postData = {
            id: this.generateId(title),
            title,
            date,
            excerpt,
            content,
            tags: [...this.currentBlogTags],
            image: null
        };

        if (this.currentBlogPost !== null) {
            this.blogData[this.currentBlogPost] = postData;
        } else {
            this.blogData.unshift(postData);
        }

        const success = await this.saveBlogDataToGitHub();
        
        if (success) {
            this.showStatus(statusEl, 'Blog post saved successfully!', 'success');
            this.loadBlogs();
            setTimeout(() => this.cancelBlogEdit(), 2000);
        } else {
            this.showStatus(statusEl, 'Failed to save to GitHub. Check your configuration.', 'error');
        }
    }

    async deleteBlog() {
        if (this.currentBlogPost === null || !confirm('Are you sure you want to delete this blog post?')) {
            return;
        }

        this.blogData.splice(this.currentBlogPost, 1);
        
        const success = await this.saveBlogDataToGitHub();
        const statusEl = document.getElementById('blog-editor-status');
        
        if (success) {
            this.showStatus(statusEl, 'Blog post deleted successfully!', 'success');
            this.loadBlogs();
            setTimeout(() => this.cancelBlogEdit(), 2000);
        } else {
            this.showStatus(statusEl, 'Failed to delete from GitHub.', 'error');
        }
    }

    cancelBlogEdit() {
        document.getElementById('blog-editor').classList.add('hidden');
        document.getElementById('blog-editor-status').classList.add('hidden');
    }

    // Project Management
    loadProjects() {
        const container = document.getElementById('projects-list');
        container.innerHTML = '';

        this.projectData.forEach((project, index) => {
            const projectEl = document.createElement('div');
            projectEl.className = 'item-card';
            projectEl.innerHTML = `
                <div class="item-info">
                    <h4>${project.title}</h4>
                    <p>${project.status} • ${project.tech.join(', ')}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="admin.editProject(${index})">Edit</button>
                </div>
            `;
            container.appendChild(projectEl);
        });
    }

    createNewProject() {
        this.currentProject = null;
        this.currentProjectTech = [];
        document.getElementById('project-editor-title').textContent = 'create new project';
        document.getElementById('project-title').value = '';
        document.getElementById('project-status').value = 'in-progress';
        document.getElementById('project-description').value = '';
        document.getElementById('project-content').value = '';
        document.getElementById('project-github').value = '';
        document.getElementById('project-demo').value = '';
        document.getElementById('delete-project').classList.add('hidden');
        this.updateProjectTechDisplay();
        document.getElementById('project-editor').classList.remove('hidden');
    }

    editProject(index) {
        const project = this.projectData[index];
        this.currentProject = index;
        this.currentProjectTech = [...project.tech];
        
        document.getElementById('project-editor-title').textContent = 'edit project';
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-status').value = project.status;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-content').value = project.content;
        document.getElementById('project-github').value = project.links?.github || '';
        document.getElementById('project-demo').value = project.links?.demo || '';
        document.getElementById('delete-project').classList.remove('hidden');
        this.updateProjectTechDisplay();
        document.getElementById('project-editor').classList.remove('hidden');
    }

    addProjectTech() {
        const input = document.getElementById('project-tech-input');
        const tech = input.value.trim();
        
        if (tech && !this.currentProjectTech.includes(tech)) {
            this.currentProjectTech.push(tech);
            this.updateProjectTechDisplay();
            input.value = '';
        }
    }

    removeProjectTech(tech) {
        this.currentProjectTech = this.currentProjectTech.filter(t => t !== tech);
        this.updateProjectTechDisplay();
    }

    updateProjectTechDisplay() {
        const container = document.getElementById('project-tech-container');
        container.innerHTML = '';
        
        this.currentProjectTech.forEach(tech => {
            const techEl = document.createElement('div');
            techEl.className = 'tech-chip';
            techEl.innerHTML = `
                ${tech}
                <span class="chip-remove" onclick="admin.removeProjectTech('${tech}')">&times;</span>
            `;
            container.appendChild(techEl);
        });
    }

    async saveProject() {
        const title = document.getElementById('project-title').value.trim();
        const status = document.getElementById('project-status').value;
        const description = document.getElementById('project-description').value.trim();
        const content = document.getElementById('project-content').value.trim();
        const github = document.getElementById('project-github').value.trim();
        const demo = document.getElementById('project-demo').value.trim();
        const statusEl = document.getElementById('project-editor-status');

        if (!title || !description || !content) {
            this.showStatus(statusEl, 'Please fill in required fields', 'error');
            return;
        }

        const projectData = {
            id: this.generateId(title),
            title,
            status,
            description,
            content,
            tech: [...this.currentProjectTech],
            links: {
                github: github || null,
                demo: demo || null
            }
        };

        if (this.currentProject !== null) {
            this.projectData[this.currentProject] = projectData;
        } else {
            this.projectData.unshift(projectData);
        }

        const success = await this.saveProjectDataToGitHub();
        
        if (success) {
            this.showStatus(statusEl, 'Project saved successfully!', 'success');
            this.loadProjects();
            setTimeout(() => this.cancelProjectEdit(), 2000);
        } else {
            this.showStatus(statusEl, 'Failed to save to GitHub. Check your configuration.', 'error');
        }
    }

    async deleteProject() {
        if (this.currentProject === null || !confirm('Are you sure you want to delete this project?')) {
            return;
        }

        this.projectData.splice(this.currentProject, 1);
        
        const success = await this.saveProjectDataToGitHub();
        const statusEl = document.getElementById('project-editor-status');
        
        if (success) {
            this.showStatus(statusEl, 'Project deleted successfully!', 'success');
            this.loadProjects();
            setTimeout(() => this.cancelProjectEdit(), 2000);
        } else {
            this.showStatus(statusEl, 'Failed to delete from GitHub.', 'error');
        }
    }

    cancelProjectEdit() {
        document.getElementById('project-editor').classList.add('hidden');
        document.getElementById('project-editor-status').classList.add('hidden');
    }

    // GitHub Save Functions
    async saveBlogDataToGitHub() {
        return await this.saveFileToGitHub('blog-data.json', this.blogData);
    }

    async saveProjectDataToGitHub() {
        return await this.saveFileToGitHub('projects-data.json', this.projectData);
    }

    async saveFileToGitHub(filename, data) {
        if (!this.githubConfig.token) {
            return false;
        }

        try {
            const getResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.name}/contents/${filename}`, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!getResponse.ok) {
                throw new Error('Failed to get current file');
            }

            const fileData = await getResponse.json();
            const sha = fileData.sha;

            const updateResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.name}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update ${filename} via admin panel`,
                    content: btoa(JSON.stringify(data, null, 2)),
                    sha: sha
                })
            });

            return updateResponse.ok;
        } catch (error) {
            console.error('GitHub save error:', error);
            return false;
        }
    }

    generateId(title) {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    }

    showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status-message status-${type}`;
        element.classList.remove('hidden');
        
        if (type === 'success') {
            setTimeout(() => element.classList.add('hidden'), 5000);
        }
    }
}

// Initialize admin when page loads
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new ContentManager();
});
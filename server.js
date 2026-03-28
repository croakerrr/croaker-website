const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis');

const app = express();
const PORT = 3000;

// Initialize Redis client (Vercel will provide environment variables automatically)
const redis = Redis.fromEnv();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Utility functions
function generateId(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + '-' + Date.now();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Blog Posts API
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await redis.get('blog-posts') || [];
        res.json(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        res.status(500).json({ error: 'Failed to load posts' });
    }
});

app.post('/admin/save-post', async (req, res) => {
    try {
        const { title, content, tags, date, excerpt, author, year, language, category } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Get existing posts
        const posts = await redis.get('blog-posts') || [];

        // Create new post
        const newPost = {
            id: req.body.id || generateId(title),
            title: title,
            date: date || formatDate(new Date()),
            excerpt: excerpt || content.substring(0, 150) + (content.length > 150 ? '...' : ''),
            content: content,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
            image: null,
            author: author || "croaker",
            year: year || new Date().getFullYear(),
            language: language || "web technologies",
            category: category || "misc"
        };

        // Add to beginning of array (newest first)
        posts.unshift(newPost);

        // Save to Redis
        await redis.set('blog-posts', posts);

        res.json({ 
            success: true, 
            message: 'Blog post created successfully!', 
            post: newPost 
        });

    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

app.delete('/admin/delete-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        
        // Get existing posts
        const posts = await redis.get('blog-posts') || [];
        
        // Find and remove the post
        const originalLength = posts.length;
        const filteredPosts = posts.filter(post => post.id !== postId);
        
        if (filteredPosts.length === originalLength) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Save updated posts
        await redis.set('blog-posts', filteredPosts);
        
        res.json({ 
            success: true, 
            message: 'Post deleted successfully!' 
        });
        
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Projects API
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await redis.get('projects') || [];
        res.json(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        res.status(500).json({ error: 'Failed to load projects' });
    }
});

app.post('/admin/save-project', async (req, res) => {
    try {
        const { name, description, technologies, status, githubUrl } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        // Get existing projects
        const projects = await redis.get('projects') || [];

        // Create new project  
        const newProject = {
            id: req.body.id || generateId(name),
            title: name,
            description: description,
            content: description,
            tech: Array.isArray(technologies) ? technologies : (technologies ? technologies.split(',').map(t => t.trim()).filter(t => t) : []),
            status: status || 'Complete',
            featured: false,
            links: {
                github: githubUrl || null
            },
            image: null
        };

        // Add to beginning of array (newest first)
        projects.unshift(newProject);

        // Save to Redis
        await redis.set('projects', projects);

        res.json({ 
            success: true, 
            message: 'Project created successfully!', 
            project: newProject 
        });

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.delete('/admin/delete-project/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Get existing projects
        const projects = await redis.get('projects') || [];
        
        // Find and remove the project
        const originalLength = projects.length;
        const filteredProjects = projects.filter(project => project.id !== projectId);
        
        if (filteredProjects.length === originalLength) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Save updated projects
        await redis.set('projects', filteredProjects);
        
        res.json({ 
            success: true, 
            message: 'Project deleted successfully!' 
        });
        
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Migration endpoint to move JSON data to Redis
app.post('/admin/migrate-data', async (req, res) => {
    try {
        // Import your existing JSON data from the static assets
        const blogResponse = await fetch(`${req.protocol}://${req.get('host')}/assets/data/blog-data.json`);
        const projectResponse = await fetch(`${req.protocol}://${req.get('host')}/assets/data/projects-data.json`);
        
        if (!blogResponse.ok || !projectResponse.ok) {
            throw new Error('Could not fetch JSON data files');
        }
        
        const blogData = await blogResponse.json();
        const projectData = await projectResponse.json();
        
        // Save to Redis
        await redis.set('blog-posts', blogData);
        await redis.set('projects', projectData);
        
        res.json({ 
            success: true, 
            message: `Migrated ${blogData.length} posts and ${projectData.length} projects to database` 
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ 
            success: false, 
            error: `Migration failed: ${error.message}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 Croaker Blog Server Running with Upstash Redis!

   📝 Website: http://localhost:${PORT}
   🔧 Admin:   http://localhost:${PORT}/admin
   📚 API:     http://localhost:${PORT}/api/blog

Press Ctrl+C to stop the server
    `);
});

module.exports = app;
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

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

// API Routes

// Get all blog posts
app.get('/api/blog', async (req, res) => {
    try {
        const data = await fs.readFile('./assets/data/blog-data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading blog data:', error);
        res.status(500).json({ error: 'Failed to load blog posts' });
    }
});

// Create new blog post
app.post('/api/blog', async (req, res) => {
    try {
        const { title, content, tags, date } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Load existing posts
        const data = await fs.readFile('./assets/data/blog-data.json', 'utf8');
        const posts = JSON.parse(data);

        // Create new post
        const newPost = {
            id: generateId(title),
            title: title,
            date: formatDate(date || new Date().toISOString()),
            excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
            content: content,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
            image: null,
            author: "croaker",
            year: new Date().getFullYear(),
            language: "web technologies",
            category: "misc"
        };

        // Add to beginning of array (newest first)
        posts.unshift(newPost);

        // Save back to file
        await fs.writeFile('./assets/data/blog-data.json', JSON.stringify(posts, null, 2));

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

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const data = await fs.readFile('./assets/data/projects-data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading projects data:', error);
        res.status(500).json({ error: 'Failed to load projects' });
    }
});

// Create new project
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, technologies, status, github, demo, content } = req.body;
        
        if (!title || !description || !technologies) {
            return res.status(400).json({ error: 'Title, description, and technologies are required' });
        }

        // Load existing projects
        const data = await fs.readFile('./assets/data/projects-data.json', 'utf8');
        const projects = JSON.parse(data);

        // Create new project
        const newProject = {
            id: generateId(title),
            title: title,
            description: description,
            content: content || description,
            technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim()).filter(t => t),
            status: status || 'completed',
            github: github || null,
            demo: demo || null,
            image: null,
            year: new Date().getFullYear()
        };

        // Add to beginning of array (newest first)
        projects.unshift(newProject);

        // Save back to file
        await fs.writeFile('./assets/data/projects-data.json', JSON.stringify(projects, null, 2));

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

// Admin Routes
app.post('/admin/save-post', async (req, res) => {
    try {
        const { title, content, tags, date, excerpt, author, year, language, category } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Load existing posts
        const data = await fs.readFile('./assets/data/blog-data.json', 'utf8');
        const posts = JSON.parse(data);

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

        // Save back to file
        await fs.writeFile('./assets/data/blog-data.json', JSON.stringify(posts, null, 2));

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

app.post('/admin/save-project', async (req, res) => {
    try {
        const { name, description, technologies, status, githubUrl, createdDate } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        // Load existing projects
        let projects = [];
        try {
            const data = await fs.readFile('./assets/data/projects-data.json', 'utf8');
            projects = JSON.parse(data);
        } catch (e) {
            // File doesn't exist, start with empty array
        }

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

        // Save back to file
        await fs.writeFile('./assets/data/projects-data.json', JSON.stringify(projects, null, 2));

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

app.delete('/admin/delete-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        
        // Load existing posts
        const data = await fs.readFile('./assets/data/blog-data.json', 'utf8');
        let posts = JSON.parse(data);
        
        // Find and remove the post
        const originalLength = posts.length;
        posts = posts.filter(post => post.id !== postId);
        
        if (posts.length === originalLength) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Save back to file
        await fs.writeFile('./assets/data/blog-data.json', JSON.stringify(posts, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Post deleted successfully!' 
        });
        
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

app.delete('/admin/delete-project/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Load existing projects
        const data = await fs.readFile('./assets/data/projects-data.json', 'utf8');
        let projects = JSON.parse(data);
        
        // Find and remove the project
        const originalLength = projects.length;
        projects = projects.filter(project => project.id !== projectId);
        
        if (projects.length === originalLength) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Save back to file
        await fs.writeFile('./assets/data/projects-data.json', JSON.stringify(projects, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Project deleted successfully!' 
        });
        
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 Croaker Blog Server Running!

   📝 Website: http://localhost:${PORT}
   🔧 Admin:   http://localhost:${PORT}/admin.html
   📚 API:     http://localhost:${PORT}/api/blog

Press Ctrl+C to stop the server
    `);
});
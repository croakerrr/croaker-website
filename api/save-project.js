const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function generateId(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + '-' + Date.now();
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { name, description, technologies, status, githubUrl } = req.body;
            
            if (!name || !description) {
                return res.status(400).json({ error: 'Name and description are required' });
            }

            // Get existing projects
            const projects = await redis.get('projects') || [];

            // Create new project  
            const newProject = {
                id: generateId(name),
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
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
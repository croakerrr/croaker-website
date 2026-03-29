const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { id, name, description, content, technologies, status, githubUrl, liveUrl, blogUrl, image, featured } = req.body;
            
            if (!id || !name || !description) {
                return res.status(400).json({ error: 'ID, name and description are required' });
            }

            // Get existing projects
            let projects = await redis.get('projects') || [];

            // Find project index
            const projectIndex = projects.findIndex(p => p.id === id);
            if (projectIndex === -1) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Update project
            const updatedProject = {
                ...projects[projectIndex],
                title: name,
                description: description,
                content: content || description,
                tech: Array.isArray(technologies) ? technologies : (technologies ? technologies.split(',').map(t => t.trim()).filter(t => t) : []),
                status: status || 'Complete',
                featured: Boolean(featured),
                links: {
                    ...(githubUrl && { github: githubUrl }),
                    ...(liveUrl && { live: liveUrl }),
                    ...(blogUrl && { blog: blogUrl })
                },
                image: image || null
            };

            projects[projectIndex] = updatedProject;

            // Save to Redis
            await redis.set('projects', projects);

            res.json({ 
                success: true, 
                message: 'Project updated successfully!', 
                project: updatedProject 
            });

        } catch (error) {
            console.error('Error updating project:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
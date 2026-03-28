const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            
            // Get existing projects
            const projects = await redis.get('projects') || [];
            
            // Find and remove the project
            const originalLength = projects.length;
            const filteredProjects = projects.filter(project => project.id !== id);
            
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
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
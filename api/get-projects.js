const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const projects = await redis.get('projects') || [];
            res.json(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            res.status(500).json({ error: 'Failed to load projects' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
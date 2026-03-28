const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const posts = await redis.get('blog-posts') || [];
            res.json(posts);
        } catch (error) {
            console.error('Error loading posts:', error);
            res.status(500).json({ error: 'Failed to load posts' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
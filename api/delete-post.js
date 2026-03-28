const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            
            // Get existing posts
            const posts = await redis.get('blog-posts') || [];
            
            // Find and remove the post
            const originalLength = posts.length;
            const filteredPosts = posts.filter(post => post.id !== id);
            
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
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
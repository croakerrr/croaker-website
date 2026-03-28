import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { postId } = req.body;
            
            if (!postId) {
                return res.status(400).json({ error: 'Post ID is required' });
            }

            // Get existing posts
            const posts = await redis.get('blog-posts') || [];
            
            // Find the post and toggle its pinned status
            const postIndex = posts.findIndex(post => post.id === postId);
            
            if (postIndex === -1) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            // Toggle pinned status
            posts[postIndex].pinned = !posts[postIndex].pinned;
            
            // Save updated posts
            await redis.set('blog-posts', posts);
            
            res.json({ 
                success: true, 
                message: `Post ${posts[postIndex].pinned ? 'pinned' : 'unpinned'} successfully!`,
                pinned: posts[postIndex].pinned
            });
            
        } catch (error) {
            console.error('Error toggling pin:', error);
            res.status(500).json({ error: 'Failed to toggle pin status' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
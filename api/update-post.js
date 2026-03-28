import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        try {
            const { id, title, content, tags, date, excerpt, author, year, language, category, image, pinned } = req.body;
            
            if (!id || !title || !content) {
                return res.status(400).json({ error: 'ID, title and content are required' });
            }

            // Get existing posts
            const posts = await redis.get('blog-posts') || [];
            
            // Find the post to update
            const postIndex = posts.findIndex(post => post.id === id);
            
            if (postIndex === -1) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Update the post
            posts[postIndex] = {
                ...posts[postIndex], // Keep existing fields like creation date
                title: title,
                date: date || formatDate(new Date()),
                excerpt: excerpt || content.substring(0, 150) + (content.length > 150 ? '...' : ''),
                content: content,
                tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
                image: image || null,
                author: author || "croaker",
                year: year || new Date().getFullYear(),
                language: language || "web technologies",
                category: category || "misc",
                pinned: pinned || false
            };

            // Save updated posts
            await redis.set('blog-posts', posts);

            res.json({ 
                success: true, 
                message: 'Blog post updated successfully!', 
                post: posts[postIndex]
            });

        } catch (error) {
            console.error('Error updating blog post:', error);
            res.status(500).json({ error: 'Failed to update blog post' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
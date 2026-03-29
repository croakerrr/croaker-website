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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { title, content, tags, date, excerpt, author, year, language, category, image, pinned } = req.body;
            
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }

            // Get existing posts
            const posts = await redis.get('blog-posts') || [];

            // Create new post
            const newPost = {
                id: generateId(title),
                title: title,
                date: date || formatDate(new Date()),
                excerpt: excerpt || content.substring(0, 150) + (content.length > 150 ? '...' : ''),
                content: content,
                tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
                image: image || null,
                author: author || "croaker",
                year: year || new Date().getFullYear(),
                language: language || null, // Don't auto-assign if not provided
                category: category || null, // Don't auto-assign if not provided
                pinned: pinned || false
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
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
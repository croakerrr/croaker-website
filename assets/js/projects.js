/**
 * Projects Management System
 * Handles loading and displaying project portfolio items.
 * 
 * @author Liam Hughes
 */
let projectsData = [];

// Load and render projects from data source
async function loadProjects() {
    try {
        const response = await fetch('/api/get-projects');
        projectsData = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Projects: Error loading project data', error);
        showErrorMessage();
    }
}

function renderProjects() {
    const container = document.getElementById('projects-grid');
    container.innerHTML = '';
    
    projectsData.forEach(project => {
        const projectCard = createProjectCard(project);
        container.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.addEventListener('click', () => openProjectModal(project));
    
    const statusClass = project.status.toLowerCase().replace(' ', '-');
    const techTags = (project.tech || project.technologies || []).map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    // Handle project image or use placeholder
    const imageHtml = project.image 
        ? `<img src="${project.image}" alt="${project.title}" class="project-img">`
        : `<div class="project-placeholder">
             <div class="placeholder-icon">📁</div>
             <div class="placeholder-text">${project.title}</div>
           </div>`;
    
    card.innerHTML = `
        <div class="project-image">
            ${imageHtml}
            <div class="project-status status-${statusClass}">${project.status}</div>
            ${project.featured ? '<div class="featured-badge">⭐ Featured</div>' : ''}
        </div>
        <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${techTags}
            </div>
        </div>
    `;
    
    return card;
}

function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    document.getElementById('modal-project-title').textContent = project.title;
    
    // Handle tech field (could be 'tech' or 'technologies')
    const techArray = project.tech || project.technologies || [];
    document.getElementById('modal-tech').textContent = techArray.join(' • ');
    
    // Use content field if available, otherwise fall back to description
    const content = project.content || project.description || 'No detailed description available.';
    let contentHTML = content.replace(/\n/g, '</p><p>');
    contentHTML = '<p>' + contentHTML + '</p>';
    document.getElementById('modal-project-content').innerHTML = contentHTML;
    
    // Handle project image in modal
    const modalImage = document.getElementById('modal-project-image');
    if (project.image) {
        modalImage.src = project.image;
        modalImage.style.display = 'block';
        modalImage.alt = project.title;
    } else {
        modalImage.style.display = 'none';
    }
    
    // Render links with better fallbacks
    const linksContainer = document.getElementById('modal-links');
    linksContainer.innerHTML = '';
    
    const githubUrl = project.links?.github || project.githubUrl;
    const liveUrl = project.links?.live || project.liveUrl;
    const blogUrl = project.links?.blog || project.blogUrl;
    
    if (githubUrl) {
        linksContainer.innerHTML += `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">GitHub</a>`;
    }
    if (liveUrl) {
        linksContainer.innerHTML += `<a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo</a>`;
    }
    if (blogUrl) {
        // If it's a blog post ID, create a link to the blog page with that post
        const blogLink = blogUrl.startsWith('http') 
            ? blogUrl 
            : `/pages/blog.html#${blogUrl}`;
        linksContainer.innerHTML += `<a href="${blogLink}" class="project-link" ${!blogUrl.startsWith('http') ? '' : 'target="_blank" rel="noopener noreferrer"'}>Related Blog Post</a>`;
    }
    
    document.getElementById('modal-status').textContent = project.status;
    
    // Show featured badge in modal if applicable
    const featuredBadge = document.getElementById('modal-featured-badge');
    if (project.featured) {
        featuredBadge.style.display = 'block';
        featuredBadge.textContent = '⭐ Featured Project';
    } else {
        featuredBadge.style.display = 'none';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    
    // Modal close handlers
    document.getElementById('close-project-modal').addEventListener('click', closeProjectModal);
    document.querySelector('#project-modal .modal-backdrop').addEventListener('click', closeProjectModal);
    
    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
});
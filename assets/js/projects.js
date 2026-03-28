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
        const response = await fetch('../assets/data/projects-data.json');
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
    const techTags = project.tech.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="project-image">
            <div class="project-status status-${statusClass}">${project.status}</div>
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
    document.getElementById('modal-tech').textContent = project.tech.join(' • ');
    document.getElementById('modal-project-content').innerHTML = project.content.replace(/\n/g, '<br><br>');
    
    // Render links
    const linksContainer = document.getElementById('modal-links');
    linksContainer.innerHTML = '';
    
    if (project.links.github) {
        linksContainer.innerHTML += `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="project-link">GitHub</a>`;
    }
    if (project.links.live) {
        linksContainer.innerHTML += `<a href="${project.links.live}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo</a>`;
    }
    if (project.links.blog) {
        linksContainer.innerHTML += `<a href="blog.html#${project.links.blog}" class="project-link">Related Blog Post</a>`;
    }
    
    document.getElementById('modal-status').textContent = project.status;
    
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
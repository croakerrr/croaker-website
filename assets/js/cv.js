// CV modal functionality
const cvData = {
    education: {
        logo: "../images/kent-logo.png",
        title: "BSc Computer Science (with a year in industry)",
        company: "University of Kent",
        dates: "2025 - 2029",
        content: ``
    },
    experience: {
        logo: "../images/outlier-logo.png", 
        title: "AI Data Trainer",
        company: "Outlier AI",
        dates: "2025 - present",
        content: ``
    }
};

function openCVModal(type) {
    const data = cvData[type];
    const modal = document.getElementById('cv-modal');
    
    document.getElementById('modal-logo').src = data.logo;
    document.getElementById('modal-logo').alt = data.company;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-company').textContent = data.company;
    document.getElementById('modal-dates').textContent = data.dates;
    document.getElementById('modal-cv-content').innerHTML = data.content;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCVModal() {
    const modal = document.getElementById('cv-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Panel click handlers
    document.querySelectorAll('.cv-panel').forEach(panel => {
        panel.addEventListener('click', () => {
            const type = panel.getAttribute('data-type');
            openCVModal(type);
        });
    });
    
    // Modal close handlers
    document.getElementById('close-cv-modal').addEventListener('click', closeCVModal);
    document.querySelector('#cv-modal .modal-backdrop').addEventListener('click', closeCVModal);
    
    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCVModal();
        }
    });
});
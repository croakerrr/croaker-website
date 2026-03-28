// CV modal functionality
const cvData = {
    education: {
        logo: "../images/kent-logo.png",
        title: "BSc Computer Science (with a year in industry)",
        company: "University of Kent",
        dates: "2025 - 2029",
        content: `
            <p>Currently pursuing a comprehensive computer science degree with an integrated industrial placement year. The program covers fundamental areas including programming, algorithms, data structures, software engineering, and machine learning.</p>
            
            <p><strong>Key modules:</strong> Object-Oriented Programming, Web Development, Database Systems, Computer Networks, Artificial Intelligence, Human-Computer Interaction</p>
            
            <p><strong>Expected graduation:</strong> First Class Honours with industry experience</p>
            
            <p><strong>Industrial placement year:</strong> Planned for 2027-2028, providing real-world experience and industry connections to complement academic learning.</p>
        `
    },
    experience: {
        logo: "../images/outlier-logo.png", 
        title: "AI Data Trainer",
        company: "Outlier AI",
        dates: "2025 - present",
        content: `
            <p>Specialising in Reinforcement Learning from Human Feedback (RLHF) techniques to improve AI model performance and alignment. Working with large language models to enhance their reasoning capabilities and reduce harmful outputs.</p>
            
            <p><strong>Key responsibilities:</strong></p>
            <ul>
                <li>Training AI models using human feedback loops and preference learning</li>
                <li>Implementing RLHF protocols to align model behaviour with human values</li>
                <li>Evaluating model outputs for accuracy, safety, and ethical compliance</li>
                <li>Collaborating with research teams to develop improved training methodologies</li>
                <li>Contributing to data annotation and quality assurance processes</li>
            </ul>
            
            <p><strong>Technical skills applied:</strong> Python, PyTorch, Transformers, Reinforcement Learning, Natural Language Processing, Model Fine-tuning</p>
            
            <p><strong>Impact:</strong> Contributing to the development of safer, more aligned AI systems that better understand and respond to human intentions and values.</p>
        `
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
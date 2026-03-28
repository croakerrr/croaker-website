// Sun and moon SVG icons
const sunIcon = `<circle cx="12" cy="12" r="5"></circle>
<line x1="12" y1="1" x2="12" y2="3"></line>
<line x1="12" y1="21" x2="12" y2="23"></line>
<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
<line x1="1" y1="12" x2="3" y2="12"></line>
<line x1="21" y1="12" x2="23" y2="12"></line>
<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;

const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;

function updateIcon() {
  const svg = document.querySelector('#theme-toggle svg');
  const isLight = document.body.classList.contains('light-mode');
  svg.innerHTML = isLight ? moonIcon : sunIcon;
}

// Check if user has a saved preference
 const savedTheme = localStorage.getItem('theme') || 'dark';
 if (savedTheme === 'light') {
   document.body.classList.add('light-mode');
 }
updateIcon();

// Toggle when button clicked
 document.getElementById('theme-toggle').addEventListener('click', () => {
   document.body.classList.toggle('light-mode');
   const isLight = document.body.classList.contains('light-mode');
   localStorage.setItem('theme', isLight ? 'light' : 'dark');
   updateIcon();
 });
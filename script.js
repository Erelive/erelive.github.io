// Get the theme toggle button
const themeToggle = document.getElementById('themeToggle');

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';

// Apply the saved theme on page load
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Update button icon (not text)
    if (document.body.classList.contains('light-mode')) {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

const typingText = document.querySelector('.typing-text span');
const textArray = ['a Computer Science Graduate.', 'a Developer.', 'a Cybersecurity Enthusiast.', 'also CompTIA Security+ Certified!'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 200;

function type() {
    const currentText = textArray[textIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 75; 
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 50; 
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        typingSpeed = 2000; 
        isDeleting = true;
    } 
 
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textArray.length; 
        typingSpeed = 500; 
    }
    
    setTimeout(type, typingSpeed);
}
type();
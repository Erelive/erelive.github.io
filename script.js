//? light/dark theme script
const themeToggle = document.getElementById('themeToggle');

const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

//? script to create snowflakes
function createSnowflakes() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄'; 
    snowflake.style.left = Math.random() * window.innerWidth + 'px';
    snowflake.style.top = '-20px'; 
    document.body.appendChild(snowflake)
    return snowflake;
}

let snowflakes = [];

function animateSnowflakes() {
    snowflakes.forEach((flake, index) => { //? loops through every item inside snowflakes array
        let currentTop = parseFloat(flake.element.style.top); 
        currentTop += flake.speed; 
        flake.element.style.top = currentTop + 'px'; 
        if (currentTop > window.innerHeight) { 
            flake.element.remove();
            snowflakes.splice(index, 1); 
        }
    });
    requestAnimationFrame(animateSnowflakes);
}

animateSnowflakes();
setInterval(() => {
    const element = createSnowflakes();
    snowflakes.push({element: element, speed: Math.random() * 2 + 1});
}, 175);

//? Text script
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
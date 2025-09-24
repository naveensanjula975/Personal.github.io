console.log('Its working')

let theme = localStorage.getItem('theme')

if (theme == null) {
	setTheme('light')
} else {
	setTheme(theme)
}

// Load EmailJS configuration from config.js
async function loadEmailJSConfig() {
	try {
		// Try to load config.js
		const response = await fetch('./config.js');
		if (response.ok) {
			const configText = await response.text();
			// Extract the EMAILJS_CONFIG object from the file
			const configMatch = configText.match(/EMAILJS_CONFIG\s*=\s*({[\s\S]*?});/);
			if (configMatch) {
				// Simple eval of the config object (safe since it's your own code)
				const config = eval('(' + configMatch[1] + ')');
				return config;
			}
		}
	} catch (error) {
		console.warn('Could not load config.js:', error);
	}
	return null;
}

// Handle both old theme-dot class and new theme-btn class
let themeDots = document.getElementsByClassName('theme-dot')
let themeButtons = document.getElementsByClassName('theme-btn')

// Add event listeners for old theme dots (if they exist)
for (var i = 0; themeDots.length > i; i++) {
	themeDots[i].addEventListener('click', function () {
		let mode = this.dataset.mode
		console.log('Option clicked:', mode)
		setTheme(mode)
	})
}

// Add event listeners for new theme buttons
for (var i = 0; themeButtons.length > i; i++) {
	themeButtons[i].addEventListener('click', function () {
		let mode = this.dataset.mode
		console.log('Theme button clicked:', mode)
		setTheme(mode)
		updateActiveTheme(mode)
	})
}

function updateActiveTheme(activeMode) {
	// Remove active class from all theme buttons
	const allThemeButtons = document.querySelectorAll('.theme-btn')
	allThemeButtons.forEach(btn => btn.classList.remove('active'))

	// Add active class to the selected theme button
	const activeButton = document.querySelector(`[data-mode="${activeMode}"]`)
	if (activeButton && activeButton.classList.contains('theme-btn')) {
		activeButton.classList.add('active')
	}
}

function setTheme(mode) {
	if (mode == 'light') {
		document.getElementById('theme-style').href = 'default.css'
	}

	if (mode == 'blue') {
		document.getElementById('theme-style').href = 'blue.css'
	}

	if (mode == 'green') {
		document.getElementById('theme-style').href = 'green.css'
	}

	if (mode == 'purple') {
		document.getElementById('theme-style').href = 'purple.css'
	}

	localStorage.setItem('theme', mode)
	updateActiveTheme(mode)
}

// Initialize theme buttons on page load
document.addEventListener('DOMContentLoaded', function () {
	const currentTheme = localStorage.getItem('theme') || 'light'
	updateActiveTheme(currentTheme)
})

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function () {
	const navLinks = document.querySelectorAll('.nav-link')
	navLinks.forEach(link => {
		link.addEventListener('click', function (e) {
			if (this.getAttribute('href').startsWith('#')) {
				e.preventDefault()
				const targetId = this.getAttribute('href').substring(1)
				const targetSection = document.getElementById(targetId)
				if (targetSection) {
					targetSection.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					})
				}
			}
		})
	})
})

// Contact form functionality
document.addEventListener('DOMContentLoaded', function () {
	// Load EmailJS configuration
	loadEmailJSConfig().then(config => {
		if (config) {
			emailjs.init(config.PUBLIC_KEY);
		}

		const contactForm = document.getElementById('contact-form');
		const submitBtn = document.getElementById('submit-btn');

		if (contactForm) {
			contactForm.addEventListener('submit', handleFormSubmit);
		}

		// Add real-time validation to form fields
		const formFields = contactForm.querySelectorAll('.input-field');
		formFields.forEach(field => {
			field.addEventListener('blur', validateField);
			field.addEventListener('input', clearFieldError);
		});
	});
});

function handleFormSubmit(e) {
	e.preventDefault();

	const form = e.target;
	const formData = new FormData(form);

	// Clear previous errors
	clearAllErrors();

	// Validate all fields
	if (!validateForm(form)) {
		return;
	}

	// Show loading state
	showLoadingState();

	// Get form data
	const contactData = {
		name: formData.get('name').trim(),
		email: formData.get('email').trim(),
		subject: formData.get('subject').trim(),
		message: formData.get('message').trim()
	};

	// Send email with current config
	sendContactEmail(contactData);
}

function validateForm(form) {
	const name = form.querySelector('[name="name"]');
	const email = form.querySelector('[name="email"]');
	const subject = form.querySelector('[name="subject"]');
	const message = form.querySelector('[name="message"]');

	let isValid = true;

	// Validate name
	if (!name.value.trim()) {
		showFieldError(name, 'Name is required');
		isValid = false;
	} else if (name.value.trim().length < 2) {
		showFieldError(name, 'Name must be at least 2 characters');
		isValid = false;
	}

	// Validate email
	if (!email.value.trim()) {
		showFieldError(email, 'Email is required');
		isValid = false;
	} else if (!isValidEmail(email.value.trim())) {
		showFieldError(email, 'Please enter a valid email address');
		isValid = false;
	}

	// Validate subject
	if (!subject.value.trim()) {
		showFieldError(subject, 'Subject is required');
		isValid = false;
	} else if (subject.value.trim().length < 3) {
		showFieldError(subject, 'Subject must be at least 3 characters');
		isValid = false;
	}

	// Validate message
	if (!message.value.trim()) {
		showFieldError(message, 'Message is required');
		isValid = false;
	} else if (message.value.trim().length < 10) {
		showFieldError(message, 'Message must be at least 10 characters');
		isValid = false;
	}

	return isValid;
}

function validateField(e) {
	const field = e.target;
	const fieldName = field.name;
	const value = field.value.trim();

	clearFieldError(field);

	switch (fieldName) {
		case 'name':
			if (!value) {
				showFieldError(field, 'Name is required');
			} else if (value.length < 2) {
				showFieldError(field, 'Name must be at least 2 characters');
			}
			break;
		case 'email':
			if (!value) {
				showFieldError(field, 'Email is required');
			} else if (!isValidEmail(value)) {
				showFieldError(field, 'Please enter a valid email address');
			}
			break;
		case 'subject':
			if (!value) {
				showFieldError(field, 'Subject is required');
			} else if (value.length < 3) {
				showFieldError(field, 'Subject must be at least 3 characters');
			}
			break;
		case 'message':
			if (!value) {
				showFieldError(field, 'Message is required');
			} else if (value.length < 10) {
				showFieldError(field, 'Message must be at least 10 characters');
			}
			break;
	}
}

function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function showFieldError(field, message) {
	clearFieldError(field);

	const errorDiv = document.createElement('div');
	errorDiv.className = 'field-error';
	errorDiv.textContent = message;
	errorDiv.style.color = '#ff6b6b';
	errorDiv.style.fontSize = '12px';
	errorDiv.style.marginTop = '5px';

	field.style.borderColor = '#ff6b6b';
	field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
	const existingError = field.parentNode.querySelector('.field-error');
	if (existingError) {
		existingError.remove();
	}
	field.style.borderColor = '';
}

function clearAllErrors() {
	const errors = document.querySelectorAll('.field-error');
	errors.forEach(error => error.remove());

	const fields = document.querySelectorAll('.input-field');
	fields.forEach(field => field.style.borderColor = '');
}

function showLoadingState() {
	const submitBtn = document.getElementById('submit-btn');
	submitBtn.disabled = true;
	submitBtn.value = 'Sending...';
	submitBtn.style.opacity = '0.7';
	submitBtn.style.cursor = 'not-allowed';
}

function hideLoadingState() {
	const submitBtn = document.getElementById('submit-btn');
	submitBtn.disabled = false;
	submitBtn.value = 'Send';
	submitBtn.style.opacity = '1';
	submitBtn.style.cursor = 'pointer';
}

function showMessage(message, type = 'success') {
	// Remove existing messages
	const existingMessage = document.querySelector('.form-message');
	if (existingMessage) {
		existingMessage.remove();
	}

	const messageDiv = document.createElement('div');
	messageDiv.className = 'form-message';
	messageDiv.textContent = message;
	messageDiv.style.padding = '10px';
	messageDiv.style.borderRadius = '5px';
	messageDiv.style.marginTop = '10px';
	messageDiv.style.textAlign = 'center';

	if (type === 'success') {
		messageDiv.style.backgroundColor = '#d4edda';
		messageDiv.style.color = '#155724';
		messageDiv.style.border = '1px solid #c3e6cb';
	} else {
		messageDiv.style.backgroundColor = '#f8d7da';
		messageDiv.style.color = '#721c24';
		messageDiv.style.border = '1px solid #f5c6cb';
	}

	const form = document.getElementById('contact-form');
	form.appendChild(messageDiv);

	// Auto-remove message after 5 seconds
	setTimeout(() => {
		messageDiv.remove();
	}, 5000);
}

// Send email using EmailJS or fallback method
async function sendContactEmail(contactData) {
	// Load configuration
	const config = await loadEmailJSConfig();

	// EmailJS template parameters
	const templateParams = {
		from_name: contactData.name,
		from_email: contactData.email,
		subject: contactData.subject,
		message: contactData.message,
		reply_to: contactData.email,
		to_email: 'naveensanjula15@gmail.com' // Your email address
	};

	// Try EmailJS first (if config is available)
	if (config && typeof emailjs !== 'undefined') {
		try {
			await emailjs.send(config.SERVICE_ID, config.TEMPLATE_ID, templateParams);
			console.log('Email sent successfully via EmailJS');
			hideLoadingState();
			showMessage('Thank you for your message! I will get back to you soon.');
			document.getElementById('contact-form').reset();
			return;
		} catch (error) {
			console.error('EmailJS error:', error);
			// Fall through to fallback method
		}
	}

	// Fallback to mailto method
	fallbackToMailto(contactData);
}

function fallbackToMailto(contactData) {
	// Create mailto link as fallback
	const subject = encodeURIComponent(`Portfolio Contact: ${contactData.subject}`);
	const body = encodeURIComponent(
		`Name: ${contactData.name}\n` +
		`Email: ${contactData.email}\n\n` +
		`Message:\n${contactData.message}\n\n` +
		`---\nSent from portfolio contact form`
	);

	const mailtoLink = `mailto:naveensanjula15@gmail.com?subject=${subject}&body=${body}`;

	// Try to open default email client
	try {
		window.location.href = mailtoLink;
		hideLoadingState();
		showMessage('Your default email client should open. If not, please email me directly at naveensanjula15@gmail.com');
		document.getElementById('contact-form').reset();
	} catch (error) {
		console.error('Mailto error:', error);
		hideLoadingState();
		showMessage('Please email me directly at naveensanjula15@gmail.com', 'error');
	}
}
// Contact Page Functionality
class ContactPage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAnimations();
    }

    bindEvents() {
        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // FAQ functionality
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    this.toggleFAQ(item);
                });
            }
        });

        // Map button
        const viewMapBtn = document.querySelector('.view-map-btn');
        if (viewMapBtn) {
            viewMapBtn.addEventListener('click', () => {
                this.openGoogleMaps();
            });
        }

        // Social media links
        const socialIcons = document.querySelectorAll('.social-icon');
        socialIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSocialClick(icon);
            });
        });
    }

    handleFormSubmission() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-message');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            this.showSuccessMessage();
            this.resetForm();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                this.highlightError(field);
                isValid = false;
            } else if (field) {
                this.clearError(field);
            }
        });

        // Validate email
        const email = document.getElementById('email');
        if (email && email.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                this.highlightError(email);
                this.showNotification('Please enter a valid email address', 'error');
                isValid = false;
            }
        }

        // Validate phone (if provided)
        const phone = document.getElementById('phone');
        if (phone && phone.value.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
                this.highlightError(phone);
                this.showNotification('Please enter a valid phone number', 'error');
                isValid = false;
            }
        }

        return isValid;
    }

    highlightError(field) {
        field.style.borderColor = '#ff6b6b';
        field.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.2)';
        field.style.animation = 'shake 0.5s ease';
    }

    clearError(field) {
        field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        field.style.boxShadow = 'none';
        field.style.animation = 'none';
    }

    showSuccessMessage() {
        this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    }

    resetForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
        }
    }

    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            faqItem.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    }

    openGoogleMaps() {
        // In a real application, this would open Google Maps with the store location
        const address = '123 Fashion Street, Style City, SC 12345, United States';
        const encodedAddress = encodeURIComponent(address);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        
        // Open in new tab
        window.open(googleMapsUrl, '_blank');
        
        this.showNotification('Opening Google Maps...');
    }

    handleSocialClick(icon) {
        const iconClass = icon.querySelector('i').className;
        let url = '#';
        let platform = '';

        if (iconClass.includes('facebook')) {
            url = 'https://facebook.com/icaru';
            platform = 'Facebook';
        } else if (iconClass.includes('instagram')) {
            url = 'https://instagram.com/icaru';
            platform = 'Instagram';
        } else if (iconClass.includes('twitter')) {
            url = 'https://twitter.com/icaru';
            platform = 'Twitter';
        } else if (iconClass.includes('linkedin')) {
            url = 'https://linkedin.com/company/icaru';
            platform = 'LinkedIn';
        }

        // In a real application, you would open the actual social media profile
        // For now, we'll just show a notification
        this.showNotification(`Opening ${platform}...`);
        
        // Simulate opening social media
        setTimeout(() => {
            window.open(url, '_blank');
        }, 500);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const bgColor = type === 'error' ? 'linear-gradient(45deg, #ff6b6b, #ee5a52)' : 'linear-gradient(45deg, #00d4ff, #0099cc)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: #ffffff;
            padding: 1rem 2rem;
            border-radius: 25px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-weight: 600;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    initializeAnimations() {
        // Intersection Observer for contact methods
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInLeft 0.6s ease forwards';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe contact methods
        document.querySelectorAll('.contact-method').forEach((method, index) => {
            method.style.opacity = '0';
            method.style.transform = 'translateX(-30px)';
            method.style.animationDelay = `${index * 0.1}s`;
            observer.observe(method);
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.contact-hero');
            if (hero) {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }
}

// Enhanced Contact Form Features
class ContactFormEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.bindFormEvents();
        this.initializeAutoSave();
    }

    bindFormEvents() {
        // Real-time validation
        const formFields = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            field.addEventListener('input', () => {
                this.clearError(field);
            });
        });

        // Character counter for message
        const messageField = document.getElementById('message');
        if (messageField) {
            this.addCharacterCounter(messageField);
        }

        // Auto-resize textarea
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                this.autoResize(textarea);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldId = field.id;

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.highlightError(field, 'This field is required');
            return false;
        }

        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.highlightError(field, 'Please enter a valid email address');
                return false;
            }
        }

        // Phone validation
        if (fieldId === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                this.highlightError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        // Message length validation
        if (fieldId === 'message' && value) {
            if (value.length < 10) {
                this.highlightError(field, 'Message must be at least 10 characters long');
                return false;
            }
        }

        this.clearError(field);
        return true;
    }

    highlightError(field, message) {
        field.style.borderColor = '#ff6b6b';
        field.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.2)';
        field.style.animation = 'shake 0.5s ease';

        // Show error message
        this.showFieldError(field, message);
    }

    clearError(field) {
        field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        field.style.boxShadow = 'none';
        field.style.animation = 'none';

        // Remove error message
        this.removeFieldError(field);
    }

    showFieldError(field, message) {
        // Remove existing error message
        this.removeFieldError(field);

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            animation: slideInUp 0.3s ease;
        `;

        // Insert after the field
        field.parentNode.appendChild(errorDiv);
    }

    removeFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    addCharacterCounter(textarea) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            color: #888;
            font-size: 0.8rem;
            text-align: right;
            margin-top: 0.25rem;
        `;

        textarea.parentNode.appendChild(counter);

        const updateCounter = () => {
            const count = textarea.value.length;
            const maxLength = 1000; // Set maximum length
            counter.textContent = `${count}/${maxLength} characters`;

            if (count > maxLength * 0.9) {
                counter.style.color = '#f59e0b';
            } else if (count > maxLength) {
                counter.style.color = '#ff6b6b';
            } else {
                counter.style.color = '#888';
            }
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    initializeAutoSave() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Auto-save form data to localStorage
        const formFields = form.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            // Load saved data
            const savedValue = localStorage.getItem(`contact_${field.id}`);
            if (savedValue && field.type !== 'submit') {
                field.value = savedValue;
            }

            // Save on input
            field.addEventListener('input', () => {
                localStorage.setItem(`contact_${field.id}`, field.value);
            });
        });

        // Clear saved data on successful submission
        form.addEventListener('submit', () => {
            formFields.forEach(field => {
                localStorage.removeItem(`contact_${field.id}`);
            });
        });
    }
}

// Add shake animation for form validation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactPage();
    new ContactFormEnhancements();
});
// JobSetu Auto-Fill Bookmarklet
// This script runs on any job application page to auto-fill forms

(async function () {
    'use strict';

    // Configuration
    const JOBSETU_API = window.location.origin;
    const STORAGE_KEY = 'jobsetu-autofill-storage';

    // Create overlay UI
    const overlay = document.createElement('div');
    overlay.id = 'jobsetu-autofill-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 999999;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        #jobsetu-autofill-overlay button {
            background: white;
            color: #667eea;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            margin: 5px;
            transition: transform 0.2s;
        }
        #jobsetu-autofill-overlay button:hover {
            transform: scale(1.05);
        }
        .jobsetu-filled {
            background-color: #667eea !important;
            animation: pulse 0.5s;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);

    // Get user data from localStorage
    function getUserData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;
            const data = JSON.parse(stored);
            return data.state || null;
        } catch (e) {
            console.error('Error loading JobSetu data:', e);
            return null;
        }
    }

    // Field detection patterns
    const fieldPatterns = {
        firstName: /first.*name|fname|given.*name/i,
        lastName: /last.*name|lname|surname|family.*name/i,
        fullName: /full.*name|name|applicant.*name/i,
        email: /e-?mail|email.*address/i,
        phone: /phone|telephone|mobile|cell/i,
        address: /address|street/i,
        city: /city|town/i,
        state: /state|province|region/i,
        zip: /zip|postal.*code|postcode/i,
        country: /country|nation/i,
        linkedin: /linkedin|linkedin.*url|linkedin.*profile/i,
        github: /github|github.*url/i,
        portfolio: /portfolio|website|personal.*site/i,
        startDate: /start.*date|available.*date|join.*date/i,
        salary: /salary|compensation|expected.*salary/i,
        sponsorship: /sponsor|visa|work.*author/i,
        relocate: /relocate|relocation|willing.*move/i,
        remote: /remote|work.*from.*home|location.*preference/i
    };

    // Detect field type
    function detectFieldType(element) {
        const context = [
            element.name,
            element.id,
            element.placeholder,
            element.getAttribute('aria-label'),
            element.getAttribute('aria-labelledby'),
            element.className
        ].filter(Boolean).join(' ').toLowerCase();

        // Try to find label
        const label = element.labels?.[0]?.textContent ||
            document.querySelector(`label[for="${element.id}"]`)?.textContent || '';
        const fullContext = (context + ' ' + label).toLowerCase();

        for (const [type, pattern] of Object.entries(fieldPatterns)) {
            if (pattern.test(fullContext)) {
                return type;
            }
        }
        return null;
    }

    // Fill form fields
    function fillFields(userData) {
        let filledCount = 0;
        const inputs = document.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            if (input.type === 'hidden' || input.readOnly || input.disabled) return;

            const fieldType = detectFieldType(input);
            if (!fieldType) return;

            let value = '';
            const personal = userData.personalInfo || {};
            const prefs = userData.preferences || {};
            const workAuth = userData.workAuthorization || {};

            // Map field types to data
            switch (fieldType) {
                case 'firstName':
                    value = personal.firstName;
                    break;
                case 'lastName':
                    value = personal.lastName;
                    break;
                case 'fullName':
                    value = `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
                    break;
                case 'email':
                    value = personal.email;
                    break;
                case 'phone':
                    value = personal.phone;
                    break;
                case 'address':
                    value = personal.address;
                    break;
                case 'city':
                    value = personal.city;
                    break;
                case 'state':
                    value = personal.state;
                    break;
                case 'zip':
                    value = personal.zip;
                    break;
                case 'country':
                    value = personal.country;
                    break;
                case 'linkedin':
                    value = personal.linkedin;
                    break;
                case 'github':
                    value = personal.github;
                    break;
                case 'portfolio':
                    value = personal.portfolio;
                    break;
                case 'startDate':
                    value = prefs.availableStartDate;
                    break;
                case 'salary':
                    if (prefs.desiredSalary?.min) {
                        value = `${prefs.desiredSalary.min} - ${prefs.desiredSalary.max} ${prefs.desiredSalary.currency}`;
                    }
                    break;
                case 'sponsorship':
                    value = workAuth.requiresSponsorship ? 'Yes' : 'No';
                    break;
                case 'relocate':
                    value = prefs.willingToRelocate ? 'Yes' : 'No';
                    break;
                case 'remote':
                    value = prefs.remoteOnly ? 'Remote only' : 'Flexible';
                    break;
            }

            if (value) {
                // Set value based on input type
                if (input.tagName === 'SELECT') {
                    // Try to find matching option
                    const option = Array.from(input.options).find(opt =>
                        opt.value.toLowerCase().includes(value.toLowerCase()) ||
                        opt.text.toLowerCase().includes(value.toLowerCase())
                    );
                    if (option) {
                        input.value = option.value;
                        filledCount++;
                        input.classList.add('jobsetu-filled');
                    }
                } else if (input.type === 'checkbox') {
                    input.checked = value.toLowerCase() === 'yes' || value === true;
                    filledCount++;
                    input.classList.add('jobsetu-filled');
                } else if (input.type === 'radio') {
                    if (input.value.toLowerCase().includes(value.toLowerCase())) {
                        input.checked = true;
                        filledCount++;
                        input.classList.add('jobsetu-filled');
                    }
                } else {
                    input.value = value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    filledCount++;
                    input.classList.add('jobsetu-filled');
                }
            }
        });

        return filledCount;
    }

    // Main execution
    const userData = getUserData();

    if (!userData) {
        overlay.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">⚠️ No Data Found</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Please set up your auto-fill profile in JobSetu first.
            </p>
            <button onclick="window.open('${JOBSETU_API}/auto-fill', '_blank')">
                Open JobSetu
            </button>
            <button onclick="this.parentElement.remove()">Close</button>
        `;
    } else {
        const filledCount = fillFields(userData);
        overlay.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">✨ JobSetu Auto-Fill</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Filled ${filledCount} field${filledCount !== 1 ? 's' : ''}!
            </p>
            <button onclick="this.parentElement.remove()">Done</button>
            <button onclick="location.reload()">Reset</button>
        `;
    }

    document.body.appendChild(overlay);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (overlay.parentElement) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateX(100%)';
            overlay.style.transition = 'all 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        }
    }, 5000);

})();

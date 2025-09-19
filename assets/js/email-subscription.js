/**
 * Non-invasive Email Subscription Feature
 * How to use:
 * 1. Add these 2 elements to your page (fixed IDs):
 *    - Input field: <input type="email" id="subscribeEmail">
 *    - Button: <button id="subscribeBtn">Subscribe</button>
 * 2. Import this script to auto-bind functionality
 * 
 * @author Rinuo.com
 * @version 2.3.0 (Message shows inside button - American English version)
 */

class EmailSubscription {
    constructor() {
        // Fixed element IDs (these must exist on your page)
        this.ids = {
            input: 'subscribeEmail',
            button: 'subscribeBtn'
        };
        
        // Supabase configuration (using full API key)
        this.config = {
            url: "https://ibwhykivdlzuumcgcssl.supabase.co",
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2h5a2l2ZGx6dXVtY2djc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzEyOTMsImV4cCI6MjA2OTcwNzI5M30.o7zwqToKgbXnFUEIBxjQYydJkP9peP_Hul-F8xhsE20",
            functionName: "email-send-4"
        };
        
        // Message texts (American English colloquial version)
        this.messages = {
            loading: "Hang tight...",
            error: "Oops, something went wrong!",
            empty: "Don't forget your email!",
            invalid: "Please enter a valid email",
            subscribe: "Subscribe",
            ...window.subscriptionMessages // Allow overriding texts via global variable
        };

        // Debug prefix
        this.debugPrefix = '[Email Subscription Debug]';
        
        this.init();
    }
    
    // Initialize: detect elements and bind events
    init() {
        console.log(`${this.debugPrefix} Starting component initialization`);
        
        // Get elements from the page
        this.elements = {
            input: document.getElementById(this.ids.input),
            button: document.getElementById(this.ids.button)
        };
        
        // Detailed log: output element detection status
        console.log(`${this.debugPrefix} Element detection results:`, {
            input: this.elements.input ? 'Found' : 'Not found',
            button: this.elements.button ? 'Found' : 'Not found'
        });
        
        // Check if all required elements are present
        const missing = Object.entries(this.elements)
            .filter(([_, el]) => !el)
            .map(([key]) => `#${this.ids[key]}`);
        
        if (missing.length > 0) {
            console.error(`${this.debugPrefix} Initialization failed: Missing required elements ${missing.join(', ')}`);
            return;
        }
        
        // Create message container (will show inside button now)
        this.createMessageContainer();
        
        // Bind button click event
        this.elements.button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`${this.debugPrefix} Subscribe button clicked`);
            this.handleSubmit();
        });
        
        // Support submitting with Enter key
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log(`${this.debugPrefix} Enter key pressed, triggering subscription`);
                this.handleSubmit();
            }
        });
        
        console.log(`${this.debugPrefix} Component initialization complete, functionality ready`);
    }
    
    // Create message container - now using button itself as container
    createMessageContainer() {
        // Save the button's original HTML content (like icons)
        this.buttonOriginalContent = this.elements.button.innerHTML;
        
        // Use button itself as message container
        this.elements.message = this.elements.button;
        
        console.log(`${this.debugPrefix} Set button as message container`);
    }
    
    // Core submission logic
    async handleSubmit() {
        const { input, button, message } = this.elements;
        const email = input.value.trim();
        const name = input.dataset.name || ''; // Support getting name from input's data attribute
        
        console.log(`${this.debugPrefix} Starting subscription process, email: ${email}, name: ${name}`);
        
        // Email validation
        if (!email) {
            console.log(`${this.debugPrefix} Validation failed: Email is empty`);
            this.showMessage(message, this.messages.empty, 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            console.log(`${this.debugPrefix} Validation failed: Invalid email format (${email})`);
            this.showMessage(message, this.messages.invalid, 'error');
            return;
        }
        
        console.log(`${this.debugPrefix} Email validation passed (${email})`);
        
        // Prevent duplicate submissions
        button.disabled = true;
        this.showMessage(message, this.messages.loading, 'info'); // Show loading message
        
        try {
            // Check if in local development environment
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            console.log(`${this.debugPrefix} Environment check: ${isDev ? 'Local development' : 'Production'}`);
            
            // Construct request URL
            const requestUrl = `${this.config.url}/functions/v1/${this.config.functionName}`;
            console.log(`${this.debugPrefix} Preparing to send request to: ${requestUrl}`);
            
            // Debug: show first 10 and last 10 chars of API key (to confirm it's complete)
            console.log(`${this.debugPrefix} API key validation: ${this.config.key.substring(0, 10)}...${this.config.key.substring(this.config.key.length - 10)}`);
            
            // Call Supabase Cloud Function (using full API key)
            const response = await fetch(
                requestUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.key}`
                    },
                    body: JSON.stringify({ email, name }) // Send both email and name
                }
            );
            
            // Output response status info
            console.log(`${this.debugPrefix} Received response: status=${response.status}, statusText=${response.statusText}`);
            
            // Parse response content
            let result;
            try {
                result = await response.json();
                console.log(`${this.debugPrefix} Response content parsed successfully:`, result);
            } catch (jsonError) {
                console.error(`${this.debugPrefix} Failed to parse response content (not JSON format):`, jsonError);
                console.log(`${this.debugPrefix} Raw response content:`, await response.text());
                throw new Error('Server returned invalid format');
            }
            
            // Check response status
            if (!response.ok) {
                const errorMsg = result.error || `HTTP error: ${response.status}`;
                console.error(`${this.debugPrefix} Request failed: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            
            // Subscription successful - show message using API response info
            console.log(`${this.debugPrefix} Subscription successful, email: ${email}`);
            
            // Show different messages based on API response status
            if (result.isVerified) {
                // Verified user - show management links
                let messageHtml = `${result.message}<br>`;
                if (result.actions?.manageSubscription) {
                    messageHtml += `<a href="${result.actions.manageSubscription}" class="subscription-link">Manage my subscription</a> | `;
                }
                if (result.actions?.unsubscribe) {
                    messageHtml += `<a href="${result.actions.unsubscribe}" class="subscription-link">Unsubscribe</a>`;
                }
                this.showMessage(message, messageHtml, 'success', true);
            } else {
                // New/unverified user - show email check message
                let messageHtml = `${result.message}<br>`;
                if (result.actions?.resend) {
                    messageHtml += `<a href="${result.actions.resend}" class="subscription-link">Didn't get the email? Click to resend</a>`;
                }
                if (result.actions?.checkSpam) {
                    messageHtml += `<br>Please check your spam folder too`;
                }
                this.showMessage(message, messageHtml, 'success', true);
            }
            
            input.value = '';
            
        } catch (err) {
            console.error(`${this.debugPrefix} Subscription process error:`, err);
            // Use API error message if available
            const errorMsg = err.message || this.messages.error;
            this.showMessage(message, errorMsg, 'error');
        } finally {
            // Restore button state
            button.disabled = false;
            // Note: Button content will be auto-restored in showMessage's setTimeout
            console.log(`${this.debugPrefix} Subscription process ended, button state restored`);
        }
    }
    
    // Show message (supports HTML content - now displays inside button)
    showMessage(element, content, type, isHtml = false) {
        console.log(`${this.debugPrefix} Showing message: [${type}] ${content}`);
        
        // Check if element is button container
        const isButtonContainer = element === this.elements.button;
        
        // Remove all state classes
        element.classList.remove('subscription-success', 'subscription-error', 'subscription-info', 'subscription-loading');
        // Add current state class
        element.classList.add(`subscription-${type}`);
        
        // Special handling for button container
        if (isButtonContainer) {
            // Save original button text for restoration
            if (!this.buttonText) {
                this.buttonText = this.buttonOriginalContent || this.messages.subscribe;
            }
            
            // If error or loading state, show text directly on button
            if (type === 'error' || type === 'info') {
                element.innerHTML = content;
            } else if (type === 'success' && isHtml) {
                // For success state with HTML content, need special handling
                // Create temp container to parse HTML content
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = content;
                
                // Get plain text content (remove links and HTML elements)
                const textContent = tempContainer.textContent || 'Subscription successful';
                element.innerHTML = textContent;
            } else {
                element.innerHTML = content;
            }
        } else {
            // Original behavior: for non-button containers
            if (isHtml) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
        }
        
        // Auto-restore button state after 3 seconds (for success messages only)
        if (type === 'success') {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = setTimeout(() => {
                console.log(`${this.debugPrefix} Auto-restoring button state`);
                
                if (isButtonContainer) {
                    // Restore button's original content
                    element.innerHTML = this.buttonOriginalContent || this.messages.subscribe;
                } else {
                    // For traditional containers, clear content
                    element.innerHTML = '';
                }
                
                // Remove all state classes
                element.classList.remove('subscription-success', 'subscription-error', 'subscription-info', 'subscription-loading');
            }, 3000); // Adjusted to 3 seconds for better UX
        }
    }
    
    // Email format validation
    validateEmail(email) {
        const isValid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
        console.log(`${this.debugPrefix} Email format validation: ${email} => ${isValid ? 'Valid' : 'Invalid'}`);
        return isValid;
    }
}

// Auto-initialize (browser environment only)
if (typeof window !== 'undefined') {
    console.log('[Email Subscription Debug] Browser environment detected, preparing initialization');
    // Wait for DOM to be fully loaded (to ensure elements exist)
    const initWhenReady = () => {
        console.log('[Email Subscription Debug] DOM is ready, starting component instance creation');
        new EmailSubscription();
    };
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[Email Subscription Debug] DOM already loaded, initializing immediately');
        initWhenReady();
    } else {
        console.log('[Email Subscription Debug] Waiting for DOM to load before initializing');
        document.addEventListener('DOMContentLoaded', initWhenReady);
    }
}
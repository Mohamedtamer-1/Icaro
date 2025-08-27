// Cart and Checkout Functionality
class CartManager {
    constructor() {
        this.cart = [];
        this.shippingCost = 5.99;
        this.init();
    }

    init() {
        this.loadCart();
        this.bindEvents();
        this.updateCartDisplay();
        this.updateOrderSummary();
    }

    loadCart() {
        const savedCart = localStorage.getItem('icaroCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('icaroCart', JSON.stringify(this.cart));
    }

    bindEvents() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clearCart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Checkout form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
        }

        // Payment method selection (only mobile money now)
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });

        // File upload handling
        const fileUpload = document.getElementById('paymentReceipt');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        // Transfer amount validation
        const transferAmount = document.getElementById('transferAmount');
        if (transferAmount) {
            transferAmount.addEventListener('input', (e) => {
                this.validateTransferAmount(e.target.value);
            });
        }
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cartItemsContainer');
        const cartCount = document.getElementById('cartCount');
        const emptyCart = document.getElementById('emptyCart');

        if (!cartContainer) return;

        // Update cart count
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }

        // Show/hide empty cart message
        if (emptyCart) {
            if (this.cart.length === 0) {
                emptyCart.style.display = 'block';
                cartContainer.innerHTML = '';
                cartContainer.appendChild(emptyCart);
            } else {
                emptyCart.style.display = 'none';
                this.renderCartItems();
            }
        }
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cartItemsContainer');
        if (!cartContainer) return;

        cartContainer.innerHTML = '';

        this.cart.forEach((item, index) => {
            const cartItem = this.createCartItemElement(item, index);
            cartContainer.appendChild(cartItem);
        });
    }

    createCartItemElement(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.style.animationDelay = `${index * 0.1}s`;

        const price = parseFloat(item.price.replace('$', ''));
        const totalPrice = price * (item.quantity || 1);

        cartItem.innerHTML = `
            <div class="cart-item-image" style="overflow:hidden;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(245,245,235,0.06)">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:10px;"/>` : (item.name.includes('Sport') || item.name.includes('Active') ? '🩳' : '👖')}
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-size">Size: ${item.size || 'M'}</div>
                <div class="cart-item-price">$${totalPrice.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity(${index}, -1)">-</button>
                    <span class="quantity-display">${item.quantity || 1}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="cartManager.removeItem(${index})">Remove</button>
            </div>
        `;

        return cartItem;
    }

    updateQuantity(index, change) {
        if (index >= 0 && index < this.cart.length) {
            const item = this.cart[index];
            const newQuantity = (item.quantity || 1) + change;
            
            if (newQuantity > 0) {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateOrderSummary();
            } else if (newQuantity === 0) {
                this.removeItem(index);
            }
        }
    }

    removeItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartDisplay();
            this.updateOrderSummary();
            
            // Show removal animation
            this.showNotification('Item removed from cart');
        }
    }

    clearCart() {
        if (this.cart.length > 0) {
            if (confirm('Are you sure you want to clear your cart?')) {
                this.cart = [];
                this.saveCart();
                this.updateCartDisplay();
                this.updateOrderSummary();
                this.showNotification('Cart cleared');
            }
        }
    }

    updateOrderSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');

        if (!summaryItems || !subtotalElement || !totalElement) return;

        // Clear existing summary items
        summaryItems.innerHTML = '';

        let subtotal = 0;

        // Add each cart item to summary
        this.cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;
            subtotal += itemTotal;

            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <span class="item-name">${item.name} (${item.size || 'M'}) x${quantity}</span>
                <span class="item-price">$${itemTotal.toFixed(2)}</span>
            `;
            summaryItems.appendChild(summaryItem);
        });

        // Update totals
        const total = subtotal + this.shippingCost;
        
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Update transfer amount field
        const transferAmount = document.getElementById('transferAmount');
        if (transferAmount) {
            transferAmount.value = total.toFixed(2);
            transferAmount.placeholder = `Enter $${total.toFixed(2)}`;
        }
    }

    handlePaymentMethodChange(method) { /* no-op since only mobile money remains */ }

    handleFileUpload(event) {
        const file = event.target.files[0];
        const uploadArea = document.querySelector('.upload-area');
        
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                this.showNotification('Please upload a valid file (PNG, JPG, or PDF)', 'error');
                event.target.value = '';
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                this.showNotification('File size must be less than 10MB', 'error');
                event.target.value = '';
                return;
            }

            // Update upload area
            if (uploadArea) {
                uploadArea.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #00ff88;"></i>
                    <p>${file.name}</p>
                    <span>File uploaded successfully</span>
                `;
                uploadArea.style.borderColor = '#00ff88';
                uploadArea.style.background = 'rgba(0, 255, 136, 0.1)';
            }

            this.showNotification('File uploaded successfully');
        }
    }

    validateTransferAmount(amount) {
        const total = this.calculateTotal();
        const transferAmount = parseFloat(amount);
        const transferAmountField = document.getElementById('transferAmount');

        if (transferAmountField) {
            if (transferAmount < total) {
                transferAmountField.style.borderColor = '#ff6b6b';
                transferAmountField.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.2)';
            } else if (transferAmount === total) {
                transferAmountField.style.borderColor = '#00ff88';
                transferAmountField.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.2)';
            } else {
                transferAmountField.style.borderColor = '#f59e0b';
                transferAmountField.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.2)';
            }
        }
    }

    calculateTotal() {
        let subtotal = 0;
        this.cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
        });
        return subtotal + this.shippingCost;
    }

    processOrder() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Validate transfer amount
        const transferAmount = parseFloat(document.getElementById('transferAmount').value);
        const total = this.calculateTotal();

        if (transferAmount < total) {
            this.showNotification('Transfer amount must be at least the total order amount', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-order');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        // Simulate order processing
        setTimeout(() => {
            this.completeOrder();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    validateForm() {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 'address', 
            'city', 'state', 'zipCode', 'country', 'transferNumber', 'transferAmount'
        ];

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

        // Validate phone
        const phone = document.getElementById('phone');
        if (phone && phone.value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
                this.highlightError(phone);
                this.showNotification('Please enter a valid phone number', 'error');
                isValid = false;
            }
        }

        // Check payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethod) {
            this.showNotification('Please select a payment method', 'error');
            isValid = false;
        }

        // Check terms agreement
        const terms = document.getElementById('terms');
        if (terms && !terms.checked) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            isValid = false;
        }

        // Check file upload
        const fileUpload = document.getElementById('paymentReceipt');
        if (fileUpload && !fileUpload.files[0]) {
            this.showNotification('Please upload your payment receipt', 'error');
            isValid = false;
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

    completeOrder() {
        // Generate order number
        const orderNumber = `#ICARO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Update modal with order details
        const orderNumberElement = document.getElementById('orderNumber');
        const orderTotalElement = document.getElementById('orderTotal');
        
        if (orderNumberElement) {
            orderNumberElement.textContent = orderNumber;
        }
        
        if (orderTotalElement) {
            orderTotalElement.textContent = `$${this.calculateTotal().toFixed(2)}`;
        }

        // Show confirmation modal
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.classList.add('show');
        }

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();

        // Send order data (in a real app, this would go to a server)
        this.sendOrderData(orderNumber);
    }

    sendOrderData(orderNumber) {
        // Collect form data
        const formData = new FormData(document.getElementById('checkoutForm'));
        const orderData = {
            orderNumber: orderNumber,
            customer: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                country: formData.get('country')
            },
            payment: {
                method: formData.get('paymentMethod'),
                transferNumber: formData.get('transferNumber'),
                transferAmount: formData.get('transferAmount'),
                receipt: formData.get('paymentReceipt')
            },
            items: this.cart,
            total: this.calculateTotal(),
            date: new Date().toISOString()
        };

        // In a real application, you would send this data to your server
        console.log('Order Data:', orderData);
        
        // Simulate sending to server
        this.showNotification('Order submitted successfully!');
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

// Initialize cart manager when DOM is loaded
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});

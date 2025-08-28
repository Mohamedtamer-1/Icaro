// Cart and Checkout Functionality
class CartManager {
    constructor() {
        console.log('CartManager constructor called');
        this.cart = [];
        this.shippingCost = 0;
        this.init();
    }

    init() {
        console.log('CartManager init called');
        this.loadCart();
        this.bindEvents();
        this.updateCartDisplay();
        this.updateOrderSummary();
    }

    loadCart() {
        const savedCart = localStorage.getItem('icaruCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('icaruCart', JSON.stringify(this.cart));
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
            console.log('Checkout form found, adding submit event listener');
            checkoutForm.addEventListener('submit', (e) => {
                console.log('Form submitted!');
                e.preventDefault();
                this.processOrder();
            });
        } else {
            console.error('Checkout form not found!');
        }

        // Phone number validation
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                this.validatePhoneNumber(e.target.value);
            });
        }

        // Governorate change event for shipping cost
        const governorateSelect = document.getElementById('governorate');
        if (governorateSelect) {
            governorateSelect.addEventListener('change', (e) => {
                this.updateShippingCost(e.target.value);
            });
        }

        // Auto-populate product name and quantity when cart changes
        this.updateProductFields();
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

        // Update product fields
        this.updateProductFields();
    }

    updateProductFields() {
        const productNameField = document.getElementById('productName');
        const productQuantityField = document.getElementById('productQuantity');
        const productSizeField = document.getElementById('productSize');
        const multipleProductsSection = document.getElementById('multipleProductsSection');
        const productsFieldsContainer = document.getElementById('productsFieldsContainer');
        
        if (this.cart.length === 0) {
            if (productNameField) productNameField.value = '';
            if (productQuantityField) productQuantityField.value = '';
            if (productSizeField) productSizeField.value = '';
            if (multipleProductsSection) multipleProductsSection.style.display = 'none';
            return;
        }

        if (this.cart.length === 1) {
            // Single product - use the main fields
            const product = this.cart[0];
            if (productNameField) productNameField.value = product.name;
            if (productQuantityField) productQuantityField.value = product.quantity || 1;
            if (productSizeField) productSizeField.value = product.size || 'M';
            if (multipleProductsSection) multipleProductsSection.style.display = 'none';
        } else {
            // Multiple products - hide main fields and show multiple products section
            if (productNameField) productNameField.value = '';
            if (productQuantityField) productQuantityField.value = '';
            if (productSizeField) productSizeField.value = '';
            if (multipleProductsSection) multipleProductsSection.style.display = 'block';
            
            this.generateMultipleProductFields();
        }
    }

    generateMultipleProductFields() {
        const productsFieldsContainer = document.getElementById('productsFieldsContainer');
        if (!productsFieldsContainer) return;

        productsFieldsContainer.innerHTML = '';

        this.cart.forEach((item, index) => {
            const productField = document.createElement('div');
            productField.className = 'product-field';
            productField.style.cssText = 'background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.1);';

            productField.innerHTML = `
                <h4 style="color: #00d4ff; margin-bottom: 1rem; font-size: 1rem;">Product ${index + 1}</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" value="${item.name}" readonly style="background: rgba(255,255,255,0.1); color: #cccccc;">
                    </div>
                    <div class="form-group">
                        <label>Size</label>
                        <input type="text" value="${item.size || 'M'}" readonly style="background: rgba(255,255,255,0.1); color: #cccccc;">
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" value="${item.quantity || 1}" readonly style="background: rgba(255,255,255,0.1); color: #cccccc;">
                    </div>
                </div>
            `;

            productsFieldsContainer.appendChild(productField);
        });
    }

    updateShippingCost(governorate) {
        const governorateSelect = document.getElementById('governorate');
        if (!governorateSelect) return;

        const selectedOption = governorateSelect.querySelector(`option[value="${governorate}"]`);
        if (selectedOption) {
            const shippingCost = parseInt(selectedOption.getAttribute('data-shipping')) || 0;
            this.shippingCost = shippingCost;
            this.updateOrderSummary();
        }
    }

    validatePhoneNumber(phone) {
        const phoneField = document.getElementById('phone');
        if (!phoneField) return;
        
        // Check if phone starts with "01"
        if (!phone.startsWith('01')) {
            phoneField.style.borderColor = '#ff6b6b';
            phoneField.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.2)';
        } else {
            phoneField.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            phoneField.style.boxShadow = 'none';
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

        const price = parseFloat(item.price.replace(' EGP', ''));
        const totalPrice = price * (item.quantity || 1);

        cartItem.innerHTML = `
            <div class="cart-item-image" style="overflow:hidden;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(245,245,235,0.06)">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:10px;"/>` : (item.name.includes('Sport') || item.name.includes('Active') ? '🩳' : '👖')}
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-size">Size: ${item.size || 'M'}</div>
                <div class="cart-item-price">${totalPrice.toFixed(2)} EGP</div>
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
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');

        if (!summaryItems || !subtotalElement || !shippingElement || !totalElement) return;

        // Clear existing summary items
        summaryItems.innerHTML = '';

        let subtotal = 0;

        // Add each cart item to summary
        this.cart.forEach(item => {
            const price = parseFloat(item.price.replace(' EGP', ''));
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;
            subtotal += itemTotal;

            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <span class="item-name">${item.name} (${item.size || 'M'}) x${quantity}</span>
                <span class="item-price">${itemTotal.toFixed(2)} EGP</span>
            `;
            summaryItems.appendChild(summaryItem);
        });

        // Update totals
        const total = subtotal + this.shippingCost;
        
        subtotalElement.textContent = `${subtotal.toFixed(2)} EGP`;
        shippingElement.textContent = `${this.shippingCost.toFixed(2)} EGP`;
        totalElement.textContent = `${total.toFixed(2)} EGP`;
    }

    completeOrder() {
        // This method is called after order processing simulation
        // You can add any additional order completion logic here
        this.showNotification('Order completed successfully!', 'success');
    }

    calculateTotal() {
        let subtotal = 0;
        this.cart.forEach(item => {
            subtotal += (item.price * (item.quantity || 1));
        });
        return subtotal + this.shippingCost;
    }

    processOrder() {
        console.log('Processing order...');
        console.log('Cart items:', this.cart);
        console.log('Shipping cost:', this.shippingCost);
        
        // Validate form
        if (!this.validateForm()) {
            console.log('Form validation failed');
            return;
        }

        // Collect form data
        const formData = new FormData(document.getElementById('checkoutForm'));
        const selectedPaymentMethods = [];
        document.querySelectorAll('input[name="paymentMethod"]:checked').forEach(method => {
            selectedPaymentMethods.push(method.value);
        });

        // Generate order number
        const orderNumber = 'ICARU-' + Date.now();

        // Calculate total
        let subtotal = 0;
        this.cart.forEach(item => {
            const price = parseFloat(item.price.replace(' EGP', ''));
            subtotal += (price * (item.quantity || 1));
        });
        const totalAmount = subtotal + this.shippingCost;

        const orderData = {
            orderNumber: orderNumber,
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            governorate: formData.get('governorate'),
            paymentMethod: selectedPaymentMethods.join(", "),
            productName: formData.get('productName'),
            productSize: formData.get('productSize'),
            productQuantity: formData.get('productQuantity'),
            items: this.cart,
            totalAmount: totalAmount,
            date: new Date().toLocaleString()
        };

        // Update order total in modal
        const orderTotalElement = document.getElementById('orderTotal');
        if (orderTotalElement) {
            orderTotalElement.textContent = `${totalAmount.toFixed(2)} EGP`;
        }

        // Send order data
        this.sendOrderData(orderData);
    }

    validateForm() {
        // Check if cart is empty
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty. Please add items before placing an order.', 'error');
            return false;
        }

        const requiredFields = [
            'firstName', 'lastName', 'phone', 'address', 'city', 'governorate'
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

        // Validate phone starts with "01"
        const phone = document.getElementById('phone');
        if (phone && phone.value) {
            if (!phone.value.startsWith('01')) {
                this.highlightError(phone);
                this.showNotification('Phone number must start with 01', 'error');
                isValid = false;
            } else {
                this.clearError(phone);
            }
        }

        // Check payment method (only cash on delivery now)
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]:checked');
        if (paymentMethods.length === 0) {
            this.showNotification('Please select a payment method', 'error');
            isValid = false;
        }

        // Check terms agreement
        const terms = document.getElementById('terms');
        if (terms && !terms.checked) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            isValid = false;
        }

        // Check newsletter agreement (now required)
        const newsletter = document.getElementById('newsletter');
        if (newsletter && !newsletter.checked) {
            this.showNotification('Please agree to the exchange and delivery fee policy', 'error');
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

    sendOrderData(orderData) {
        // Prepare the data for EmailJS with individual fields
        const cartItemsText = orderData.items.map(item => 
            `• ${item.name} (Size: ${item.size || 'M'}, Qty: ${item.quantity || 1}, Price: ${item.price})`
        ).join('\n');

        const templateParams = {
            to_name: 'Icaru Shop',
            from_name: `${orderData.firstName} ${orderData.lastName}`,
            from_email: 'customer@icaru.com',
            customer_name: `${orderData.firstName} ${orderData.lastName}`,
            customer_phone: orderData.phone,
            customer_address: orderData.address,
            customer_city: orderData.city,
            customer_governorate: orderData.governorate,
            payment_method: orderData.paymentMethod,
            product_name: orderData.productName || 'Multiple Products',
            product_size: orderData.productSize || 'Various',
            product_quantity: orderData.productQuantity || 'Multiple',
            total_amount: `${orderData.totalAmount.toFixed(2)} EGP`,
            shipping_cost: `${this.shippingCost.toFixed(2)} EGP`,
            order_number: orderData.orderNumber,
            cart_items: cartItemsText,
            order_date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Debug: Log the template parameters
        console.log('EmailJS Template Parameters:', templateParams);
        console.log('Order Data:', orderData);

        // Also create a fallback message field in case individual fields don't work
        const fallbackMessage = `
NEW ORDER RECEIVED!

Customer Information:
- Name: ${orderData.firstName} ${orderData.lastName}
- Phone: ${orderData.phone}
- Address: ${orderData.address}
- City: ${orderData.city}
- Governorate: ${orderData.governorate}

Order Details:
- Payment Method: ${orderData.paymentMethod}
- Order Number: ${orderData.orderNumber}
- Total Amount: ${orderData.totalAmount.toFixed(2)} EGP
- Shipping Cost: ${this.shippingCost.toFixed(2)} EGP

Cart Items:
${cartItemsText}

Order Date: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}
        `.trim();

        // Add fallback message to template params
        templateParams.message = fallbackMessage;

        // Send email using EmailJS
        console.log('Sending email with EmailJS...');
        console.log('Service ID: service_icaru');
        console.log('Template ID: template_icaru');
        
        // Test if EmailJS is properly loaded
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS is not loaded!');
            this.showNotification('EmailJS not loaded. Please check configuration.', 'error');
            return;
        }
        
        emailjs.send('service_j5hc49k', 'template_4kdiezw', templateParams)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                this.showNotification('Order submitted successfully! we recieved your order and will contact you soon.', 'success');
                
                // Clear cart after successful submission
                this.cart = [];
                this.saveCart();
                this.updateCartDisplay();
                this.updateOrderSummary();
                
                // Reset form
                document.getElementById('checkoutForm').reset();
                
                // Hide multiple products section
                const multipleProductsSection = document.getElementById('multipleProductsSection');
                if (multipleProductsSection) {
                    multipleProductsSection.style.display = 'none';
                }
            })
            .catch((error) => {
                console.error('EmailJS FAILED:', error);
                console.error('Error details:', {
                    status: error.status,
                    text: error.text,
                    message: error.message
                });
                this.showNotification(`Failed to submit order: ${error.text || error.message}`, 'error');
            });
    }
    

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const bgColor = type === 'error' ? 'linear-gradient(45deg, #ff6b6b, #ee5a52)' : 'linear-gradient(45deg,rgb(9, 143, 80),rgb(38, 126, 74))';
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${bgColor};
            color: #ffffff;
            padding: 3rem 4.5rem;
            border-radius: 40px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
            font-weight: 700;
            font-size: 2rem;
            max-width: 900px;
            text-align: center;
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
    console.log('DOM loaded, initializing CartManager');
    cartManager = new CartManager();
    console.log('CartManager initialized:', cartManager);
});

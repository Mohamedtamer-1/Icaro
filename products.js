// Products Page Functionality
class ProductsPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            search: '',
            category: '',
            size: '',
            price: ''
        };
        this.init();
    }

    init() {
        this.loadProducts();
        this.bindEvents();
        this.initializeAnimations();
    }

    loadProducts() {
        // Get all product cards from the DOM
        const productCards = document.querySelectorAll('.product-card');
        this.products = Array.from(productCards).map(card => ({
            element: card,
            name: card.querySelector('h3').textContent,
            category: card.dataset.category,
            size: card.dataset.size,
            price: parseFloat(card.dataset.price),
            description: card.querySelector('.product-description').textContent
        }));
        this.filteredProducts = [...this.products];
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.applyFilters();
            });
        }

        // Size filter
        const sizeFilter = document.getElementById('sizeFilter');
        if (sizeFilter) {
            sizeFilter.addEventListener('change', (e) => {
                this.currentFilters.size = e.target.value;
                this.applyFilters();
            });
        }

        // Price filter
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.currentFilters.price = e.target.value;
                this.applyFilters();
            });
        }

        // Load more button - removed since we only have 4 products
        // const loadMoreBtn = document.getElementById('loadMoreBtn');
        // if (loadMoreBtn) {
        //     loadMoreBtn.addEventListener('click', () => {
        //         this.loadMoreProducts();
        //     });
        // }

        // Wishlist functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist')) {
                this.toggleWishlist(e.target.closest('.wishlist'));
            }
        });
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.currentFilters.search) {
                const searchMatch = product.name.toLowerCase().includes(this.currentFilters.search) ||
                                  product.description.toLowerCase().includes(this.currentFilters.search);
                if (!searchMatch) return false;
            }

            // Category filter
            if (this.currentFilters.category) {
                if (product.category !== this.currentFilters.category) return false;
            }

            // Size filter
            if (this.currentFilters.size) {
                const sizes = product.size.split(',');
                if (!sizes.includes(this.currentFilters.size)) return false;
            }

            // Price filter
            if (this.currentFilters.price) {
                const [min, max] = this.currentFilters.price.split('-').map(p => {
                    if (p === '+') return Infinity;
                    return parseFloat(p);
                });
                
                if (this.currentFilters.price === '50+') {
                    if (product.price < 50) return false;
                } else {
                    if (product.price < min || product.price > max) return false;
                }
            }

            return true;
        });

        this.updateProductDisplay();
    }

    updateProductDisplay() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        // Hide all products first
        this.products.forEach(product => {
            product.element.classList.add('filtered-out');
        });

        // Show filtered products with animation
        setTimeout(() => {
            this.filteredProducts.forEach((product, index) => {
                product.element.classList.remove('filtered-out');
                product.element.classList.add('filtered-in');
                product.element.style.animationDelay = `${index * 0.1}s`;
            });

            // Show/hide load more button based on results
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                if (this.filteredProducts.length <= 8) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-flex';
                }
            }

            // Update results count
            this.updateResultsCount();
        }, 300);
    }

    updateResultsCount() {
        const count = this.filteredProducts.length;
        const total = this.products.length;
        
        // You can add a results counter element if needed
        console.log(`Showing ${count} of ${total} products`);
    }

    // loadMoreProducts method removed since we only have 4 products

    toggleWishlist(wishlistBtn) {
        const icon = wishlistBtn.querySelector('i');
        const isActive = wishlistBtn.classList.contains('active');

        if (isActive) {
            wishlistBtn.classList.remove('active');
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.showNotification('Removed from wishlist');
        } else {
            wishlistBtn.classList.add('active');
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.showNotification('Added to wishlist');
        }

        // Add animation
        wishlistBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            wishlistBtn.style.transform = 'scale(1)';
        }, 200);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            color: #ffffff;
            padding: 1rem 2rem;
            border-radius: 25px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initializeAnimations() {
        // Intersection Observer for product cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all product cards
        document.querySelectorAll('.product-card').forEach(card => {
            observer.observe(card);
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.products-hero');
            if (hero) {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }
}

// Enhanced Product Card Interactions
class ProductCardEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.bindProductEvents();
        this.initializeImageEffects();
    }

    bindProductEvents() {
        document.addEventListener('click', (e) => {
            const quickViewBtn = e.target.closest('.quick-view');
            if (quickViewBtn) {
                e.preventDefault();
                const productCard = quickViewBtn.closest('.product-card');
                this.showQuickView(productCard);
            }

            const addToCartBtn = e.target.closest('.add-to-cart');
            if (addToCartBtn) {
                e.preventDefault();
                const productCard = addToCartBtn.closest('.product-card');
                this.addToCart(productCard);
            }
        });
    }

    showQuickView(productCard) {
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productDetails = productCard.querySelectorAll('.product-details span');
        const productimage = productCard.querySelector('.image-placeholder img');
        
        const material = productDetails[0]?.textContent || 'Premium Material';
        const fit = productDetails[1]?.textContent || 'Regular Fit';

        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${productName}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="product-preview">
                            <div class="image-placeholder">
                            <img src="${productCard.dataset.thumbnails 
    ? productCard.dataset.thumbnails.split(',')[0] 
    : productimage.src}" alt="${productName}">
                            </div>
                            <div class="product-gallery">
                                    ${(
                                        productCard.dataset.thumbnails
                                            ? productCard.dataset.thumbnails.split(',')
                                            : [productimage.src]
                                    ).map((thumb, i) => `
                                        <div class="gallery-thumb ${i === 0 ? 'active' : ''}">
                                            <img src="${thumb}" alt="Thumbnail ${i + 1}">
                                        </div>
                                    `).join('')}
                                </div>
                        </div>
                        <div class="product-details">
                            <h4>${productName}</h4>
                            <p class="price">${productPrice}</p>
                            <p class="description">${productDescription}</p>
                            <div class="product-specs">
                                <div class="spec-item">
                                    <span class="spec-label">Material:</span>
                                    <span class="spec-value">${material}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Fit:</span>
                                    <span class="spec-value">${fit}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Care:</span>
                                    <span class="spec-value">Machine Washable</span>
                                </div>
                            </div>
                            <div class="size-selector">
                                <h5>Select Size:</h5>
                                <div class="size-options">
                                    <button class="size-btn" data-size="S">S</button>
                                    <button class="size-btn" data-size="M">M</button>
                                    <button class="size-btn" data-size="L">L</button>
                                    <button class="size-btn" data-size="XL">XL</button>
                                </div>
                            </div>
                            <div class="quantity-selector">
                                <h5>Quantity:</h5>
                                <div class="quantity-controls">
                                    <button class="qty-btn" data-action="decrease">-</button>
                                    <input type="number" value="1" min="1" max="10" class="qty-input">
                                    <button class="qty-btn" data-action="increase">+</button>
                                </div>
                            </div>
                            <button class="add-to-cart-modal">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add enhanced modal styles
        const style = document.createElement('style');
        style.textContent = `
            .quick-view-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                background: #1a1a1a;
                border-radius: 20px;
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
                animation: modalSlideIn 0.3s ease;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .modal-header h3 {
                color: #00d4ff;
                margin: 0;
            }
            .close-modal {
                background: none;
                border: none;
                color: #ffffff;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            .close-modal:hover {
                color: #00d4ff;
                transform: scale(1.1);
            }
            .modal-body {
                padding: 1.5rem;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            .product-preview {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .product-preview .image-placeholder {
                width: 100%;
                height: 300px;
                background: linear-gradient(45deg, #00d4ff, #0099cc);
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .product-preview .image-placeholder img {
                max-width: 100%;
                max-height: 100%;
                border-radius: 12px;
            }
            .product-gallery {
                display: flex;
                gap: 0.5rem;
            }
            .gallery-thumb {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid transparent;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                overflow: hidden;
            }
            .gallery-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            }
            .gallery-thumb:hover,
            .gallery-thumb.active {
                border-color: #00d4ff;
                background: rgba(0, 212, 255, 0.1);
            }
            .product-details h4 {
                color: #ffffff;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            .product-details .price {
                color: #00d4ff;
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 1rem;
            }
            .product-details .description {
                color: #cccccc;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            .product-specs {
                margin-bottom: 1.5rem;
            }
            .spec-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .spec-label {
                color: #888;
                font-weight: 500;
            }
            .spec-value {
                color: #ffffff;
                font-weight: 600;
            }
            .size-selector h5,
            .quantity-selector h5 {
                color: #ffffff;
                margin-bottom: 1rem;
            }
            .size-options {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .size-btn {
                width: 50px;
                height: 50px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: transparent;
                color: #ffffff;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
            }
            .size-btn:hover,
            .size-btn.selected {
                border-color: #00d4ff;
                background: #00d4ff;
            }
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .qty-btn {
                width: 40px;
                height: 40px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: transparent;
                color: #ffffff;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
            }
            .qty-btn:hover {
                background: #00d4ff;
                border-color: #00d4ff;
            }
            .qty-input {
                width: 60px;
                height: 40px;
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                color: #ffffff;
                font-weight: 600;
            }
            .qty-input:focus {
                outline: none;
                border-color: #00d4ff;
            }
            .add-to-cart-modal {
                width: 100%;
                padding: 15px;
                background: linear-gradient(45deg, #00d4ff, #0099cc);
                color: #ffffff;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1.1rem;
            }
            .add-to-cart-modal:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 212, 255, 0.3);
            }
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Bind modal events
        this.bindModalEvents(modal, productCard);
    }

    bindModalEvents(modal, productCard) {
        const closeBtn = modal.querySelector('.close-modal');
        const overlay = modal.querySelector('.modal-overlay');
        const sizeBtns = modal.querySelectorAll('.size-btn');
        const qtyBtns = modal.querySelectorAll('.qty-btn');
        const qtyInput = modal.querySelector('.qty-input');
        const addToCartBtn = modal.querySelector('.add-to-cart-modal');
        const previewImage = modal.querySelector('.product-preview .image-placeholder img');
        const galleryThumbs = modal.querySelectorAll('.gallery-thumb img');

        closeBtn.addEventListener('click', () => this.closeModal(modal));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal(modal);
        });

        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const currentValue = parseInt(qtyInput.value);
                
                if (action === 'increase' && currentValue < 10) {
                    qtyInput.value = currentValue + 1;
                } else if (action === 'decrease' && currentValue > 1) {
                    qtyInput.value = currentValue - 1;
                }
            });
        });

        // Thumbnail gallery switching
        galleryThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                previewImage.src = thumb.src;
                modal.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.parentElement.classList.add('active');
            });
        });

        addToCartBtn.addEventListener('click', () => {
            const selectedSize = modal.querySelector('.size-btn.selected');
            const quantity = qtyInput.value;
            
            if (!selectedSize) {
                this.showNotification('Please select a size');
                return;
            }
            
            this.addToCart(productCard, {
                size: selectedSize.dataset.size,
                quantity: parseInt(quantity)
            });
            this.closeModal(modal);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal(modal);
        });
    }

    closeModal(modal) {
        modal.style.animation = 'modalSlideOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 300);
    }

    addToCart(productCard, options = {}) {
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;
        const productImgEl = productCard.querySelector('.image-placeholder img, .design-photo');
        const productImg = productImgEl ? productImgEl.src : '';
        const size = options.size || 'M';
        const quantity = options.quantity || 1;

        // Animation feedback
        const btn = productCard.querySelector('.add-to-cart');
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.background = 'linear-gradient(45deg, #00ff88, #00cc6a)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
        }, 1500);

        // Store in localStorage
        const cart = JSON.parse(localStorage.getItem('icaruCart') || '[]');
        cart.push({
            name: productName,
            price: productPrice,
            size: size,
            quantity: quantity,
            image: productImg,
            id: Date.now()
        });
        localStorage.setItem('icaruCart', JSON.stringify(cart));

        this.showNotification(`${productName} (${size}) added to cart!`);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            color: #ffffff;
            padding: 1rem 2rem;
            border-radius: 25px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initializeImageEffects() {
        // Add hover effects to product images
        document.querySelectorAll('.product-image').forEach(image => {
            image.addEventListener('mouseenter', () => {
                image.style.transform = 'scale(1.05)';
            });

            image.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1)';
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductsPage();
    new ProductCardEnhancements();
});

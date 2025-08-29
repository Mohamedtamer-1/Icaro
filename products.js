    // Products Page Functionality
    class ProductsPage {
        constructor() {
        this.products = []
        this.filteredProducts = []
        this.currentFilters = {
            search: "",
            category: "",
            size: "",
            price: "",
        }
        this.outOfStockItems = new Set()
        this.deletedProducts = new Set()
        this.init()
        }
    
        init() {
        this.loadProducts()
        this.loadAdminData()
        this.bindEvents()
        this.initializeAnimations()
        this.listenForAdminUpdates()
        }
    
        loadAdminData() {
        const adminData = localStorage.getItem("icaruProductsPageData")
        if (adminData) {
            const data = JSON.parse(adminData)
            this.outOfStockItems = new Set(data.outOfStock || [])
            this.deletedProducts = new Set(data.deletedProducts || [])
            this.updateProductsWithAdminData(data)
        }
        }
    
        listenForAdminUpdates() {
        window.addEventListener("productsUpdated", (e) => {
            this.outOfStockItems = new Set(e.detail.outOfStock || [])
            this.deletedProducts = new Set(e.detail.deletedProducts || [])
            this.updateProductsWithAdminData(e.detail)
            this.showUpdateNotification()
        })
        }
    
        updateProductsWithAdminData(data) {
        // Hide deleted products and update stock status
        const productCards = document.querySelectorAll(".product-card")
        productCards.forEach((card, index) => {
            const productName = card.querySelector("h3")?.textContent
            const productId = card.dataset.id

    
            // Check if product was deleted
            if (data.deletedProducts && data.deletedProducts.includes(productId)) {
            card.style.display = "none"
            return
            }
    
            const product = data.products.find((p) => p.name === productName)
            if (!product) {
            card.style.display = "none"
            } else {
            card.style.display = "block"
            // Update add to cart functionality with stock checking
            this.updateAddToCartButton(card, product, data.outOfStock)
            }
        })
    
        // Reload products list
        this.loadProducts()
        }
    
        updateAddToCartButton(card, product, outOfStockItems) {
        const addToCartBtn = card.querySelector(".add-to-cart")
        if (addToCartBtn) {
            // Remove existing event listeners by cloning the button
            const newBtn = addToCartBtn.cloneNode(true)
            addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn)
    
            // Add new event listener with stock checking
            newBtn.addEventListener("click", (e) => {
            e.preventDefault()
            this.showSizeSelector(product, outOfStockItems, card)
            })
        }
        }
    
        showSizeSelector(product, outOfStockItems, productCard) {
        const modal = document.createElement("div")
        modal.className = "size-selector-modal"
        modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Select Size - ${product.name}</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="size-options">
                                ${product.sizes
                                    .map((size) => {
                                    const isOutOfStock = outOfStockItems.has(`${product.id}-${size}`)
                                    return `
                                        <button class="size-btn ${isOutOfStock ? "out-of-stock" : ""}" 
                                                data-size="${size}" 
                                                ${isOutOfStock ? "disabled" : ""}>
                                            ${size}
                                            ${isOutOfStock ? '<span class="stock-status">Out of Stock</span>' : ""}
                                        </button>
                                    `
                                    })
                                    .join("")}
                            </div>
                            <button class="add-to-cart-modal" disabled>Select a size</button>
                        </div>
                    </div>
                </div>
            `
    
        // Add modal styles if not already added
        if (!document.querySelector("#size-selector-styles")) {
            const style = document.createElement("style")
            style.id = "size-selector-styles"
            style.textContent = `
                .size-selector-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                }
                .size-selector-modal .modal-content {
                    background: var(--color-surface);
                    border-radius: 20px;
                    max-width: 400px;
                    width: 90%;
                    border: 1px solid var(--color-border);
                    animation: modalSlideIn 0.3s ease;
                }
                .size-selector-modal .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .size-selector-modal .modal-header h3 {
                    color: var(--color-accent);
                    margin: 0;
                }
                .size-selector-modal .close-modal {
                    background: none;
                    border: none;
                    color: var(--color-accent);
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .size-selector-modal .modal-body {
                    padding: 1.5rem;
                }
                .size-selector-modal .size-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .size-selector-modal .size-btn {
                    padding: 15px;
                    border: 1px solid var(--color-accent);
                    background: transparent;
                    color: var(--color-accent);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    font-weight: 600;
                }
                .size-selector-modal .size-btn:hover:not(:disabled) {
                    background: var(--color-accent);
                    color: var(--color-bg);
                }
                .size-selector-modal .size-btn.selected {
                    background: var(--color-accent);
                    color: var(--color-bg);
                }
                .size-selector-modal .size-btn.out-of-stock {
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .size-selector-modal .stock-status {
                    display: block;
                    font-size: 0.7rem;
                    margin-top: 4px;
                }
                .size-selector-modal .add-to-cart-modal {
                    width: 100%;
                    padding: 15px;
                    background: transparent;
                    border: 1px solid var(--color-accent);
                    color: var(--color-accent);
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .size-selector-modal .add-to-cart-modal:not(:disabled):hover {
                    background: var(--color-accent);
                    color: var(--color-bg);
                }
                .size-selector-modal .add-to-cart-modal:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
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
            `
            document.head.appendChild(style)
        }
    
        document.body.appendChild(modal)
    
        // Bind events
        const closeBtn = modal.querySelector(".close-modal")
        const overlay = modal.querySelector(".modal-overlay")
        const sizeBtns = modal.querySelectorAll(".size-btn:not(.out-of-stock)")
        const addBtn = modal.querySelector(".add-to-cart-modal")
        let selectedSize = null
    
        closeBtn.addEventListener("click", () => document.body.removeChild(modal))
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) document.body.removeChild(modal)
        })
    
        sizeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
            sizeBtns.forEach((b) => b.classList.remove("selected"))
            btn.classList.add("selected")
            selectedSize = btn.dataset.size
            addBtn.disabled = false
            addBtn.textContent = `Add ${product.name} (${selectedSize}) to Cart`
            })
        })
    
        addBtn.addEventListener("click", () => {
            if (selectedSize) {
            // Check if size is still in stock
            const isOutOfStock = this.outOfStockItems.has(`${product.id}-${selectedSize}`)

            if (isOutOfStock) {
                alert("This size is out of stock")
                return
            }
    
            // Add to cart using existing cart functionality
            const cart = JSON.parse(localStorage.getItem("icaruCart") || "[]")
            cart.push({
                name: product.name,
                price: product.price,
                size: selectedSize,
                quantity: 1,
                image: product.image,
                id: Date.now(),
            })
            localStorage.setItem("icaruCart", JSON.stringify(cart))
    
            document.body.removeChild(modal)
            this.showNotification(`${product.name} (${selectedSize}) added to cart!`)
            }
        })
        }
    
        showNotification(message) {
        const notification = document.createElement("div")
        notification.textContent = message
        notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--color-accent);
                color: var(--color-bg);
                padding: 1rem 2rem;
                border-radius: 25px;
                z-index: 10001;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 10px 30px rgba(245, 245, 235, 0.3);
                font-weight: 600;
            `
    
        document.body.appendChild(notification)
    
        setTimeout(() => {
            notification.style.animation = "slideOutRight 0.3s ease"
            setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification)
            }
            }, 300)
        }, 3000)
        }
    
        showUpdateNotification() {
        const notification = document.createElement("div")
        notification.className = "update-notification"
        notification.innerHTML = `
                <i class="fas fa-sync-alt"></i>
                Product inventory updated
            `
        notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--color-accent);
                color: var(--color-bg);
                padding: 1rem 2rem;
                border-radius: 25px;
                z-index: 10001;
                animation: slideInDown 0.3s ease;
                box-shadow: 0 10px 30px rgba(245, 245, 235, 0.3);
                font-weight: 600;
            `
    
        document.body.appendChild(notification)
    
        setTimeout(() => {
            notification.style.animation = "slideOutUp 0.3s ease"
            setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification)
            }
            }, 300)
        }, 3000)
        }
    
        loadProducts() {
        // Get all product cards from the DOM
        const productCards = document.querySelectorAll(".product-card")
        this.products = Array.from(productCards).map((card) => ({
            element: card,
            name: card.querySelector("h3").textContent,
            category: card.dataset.category,
            size: card.dataset.size,
            price: Number.parseFloat(card.dataset.price),
            description: card.querySelector(".product-description").textContent,
        }))
        this.filteredProducts = [...this.products]
        }
    
        bindEvents() {
        // Search functionality
        const searchInput = document.getElementById("searchInput")
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
            this.currentFilters.search = e.target.value.toLowerCase()
            this.applyFilters()
            })
        }
    
        // Category filter
        const categoryFilter = document.getElementById("categoryFilter")
        if (categoryFilter) {
            categoryFilter.addEventListener("change", (e) => {
            this.currentFilters.category = e.target.value
            this.applyFilters()
            })
        }
    
        // Size filter
        const sizeFilter = document.getElementById("sizeFilter")
        if (sizeFilter) {
            sizeFilter.addEventListener("change", (e) => {
            this.currentFilters.size = e.target.value
            this.applyFilters()
            })
        }
    
        // Price filter
        const priceFilter = document.getElementById("priceFilter")
        if (priceFilter) {
            priceFilter.addEventListener("change", (e) => {
            this.currentFilters.price = e.target.value
            this.applyFilters()
            })
        }
    
        // Load more button - removed since we only have 4 products
        // const loadMoreBtn = document.getElementById('loadMoreBtn');
        // if (loadMoreBtn) {
        //     loadMoreBtn.addEventListener('click', () => {
        //         this.loadMoreProducts();
        //     });
        // }
    
        // Wishlist functionality
        document.addEventListener("click", (e) => {
            if (e.target.closest(".wishlist")) {
            this.toggleWishlist(e.target.closest(".wishlist"))
            }
        })
        }
    
        applyFilters() {
        this.filteredProducts = this.products.filter((product) => {
            // Search filter
            if (this.currentFilters.search) {
            const searchMatch =
                product.name.toLowerCase().includes(this.currentFilters.search) ||
                product.description.toLowerCase().includes(this.currentFilters.search)
            if (!searchMatch) return false
            }
    
            // Category filter
            if (this.currentFilters.category) {
            if (product.category !== this.currentFilters.category) return false
            }
    
            // Size filter
            if (this.currentFilters.size) {
            const sizes = product.size.split(",")
            if (!sizes.includes(this.currentFilters.size)) return false
            }
    
            // Price filter
            if (this.currentFilters.price) {
            const [min, max] = this.currentFilters.price.split("-").map((p) => {
                if (p === "+") return Number.POSITIVE_INFINITY
                return Number.parseFloat(p)
            })
    
            if (this.currentFilters.price === "50+") {
                if (product.price < 50) return false
            } else {
                if (product.price < min || product.price > max) return false
            }
            }
    
            return true
        })
    
        this.updateProductDisplay()
        }
    
        updateProductDisplay() {
        const productsGrid = document.getElementById("productsGrid")
        if (!productsGrid) return
    
        // Hide all products first
        this.products.forEach((product) => {
            product.element.classList.add("filtered-out")
        })
    
        // Show filtered products with animation
        setTimeout(() => {
            this.filteredProducts.forEach((product, index) => {
            product.element.classList.remove("filtered-out")
            product.element.classList.add("filtered-in")
            product.element.style.animationDelay = `${index * 0.1}s`
            })
    
            // Show/hide load more button based on results
            const loadMoreBtn = document.getElementById("loadMoreBtn")
            if (loadMoreBtn) {
            if (this.filteredProducts.length <= 8) {
                loadMoreBtn.style.display = "none"
            } else {
                loadMoreBtn.style.display = "inline-flex"
            }
            }
    
            // Update results count
            this.updateResultsCount()
        }, 300)
        }
    
        updateResultsCount() {
        const count = this.filteredProducts.length
        const total = this.products.length
    
        // You can add a results counter element if needed
        console.log(`Showing ${count} of ${total} products`)
        }
    
        // loadMoreProducts method removed since we only have 4 products
    
        toggleWishlist(wishlistBtn) {
        const icon = wishlistBtn.querySelector("i")
        const isActive = wishlistBtn.classList.contains("active")
    
        if (isActive) {
            wishlistBtn.classList.remove("active")
            icon.classList.remove("fas")
            icon.classList.add("far")
            this.showNotification("Removed from wishlist")
        } else {
            wishlistBtn.classList.add("active")
            icon.classList.remove("far")
            icon.classList.add("fas")
            this.showNotification("Added to wishlist")
        }
    
        // Add animation
        wishlistBtn.style.transform = "scale(1.2)"
        setTimeout(() => {
            wishlistBtn.style.transform = "scale(1)"
        }, 200)
        }
    
        initializeAnimations() {
        // Intersection Observer for product cards
        const observer = new IntersectionObserver(
            (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                entry.target.classList.add("animate")
                }
            })
            },
            {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
            },
        )
    
        // Observe all product cards
        document.querySelectorAll(".product-card").forEach((card) => {
            observer.observe(card)
        })
    
        // Parallax effect for hero section
        window.addEventListener("scroll", () => {
            const scrolled = window.pageYOffset
            const hero = document.querySelector(".products-hero")
            if (hero) {
            const rate = scrolled * -0.5
            hero.style.transform = `translateY(${rate}px)`
            }
        })
        }
    }
    
    // Enhanced Product Card Interactions with Stock Checking
    class ProductCardEnhancements {
        constructor() {
        this.outOfStockItems = new Set()
        this.init()
        }
    
        init() {
        this.loadOutOfStockData()
        this.bindProductEvents()
        this.initializeImageEffects()
        this.listenForAdminUpdates()
        }
    
        loadOutOfStockData() {
        const adminData = localStorage.getItem("icaruProductsPageData")
        if (adminData) {
            const data = JSON.parse(adminData)
            this.outOfStockItems = new Set(data.outOfStock || [])
        }
        }
    
        listenForAdminUpdates() {
        window.addEventListener("productsUpdated", (e) => {
            this.outOfStockItems = new Set(e.detail.outOfStock || [])
        })
        }
    
        bindProductEvents() {
        document.addEventListener("click", (e) => {
            const quickViewBtn = e.target.closest(".quick-view")
            if (quickViewBtn) {
            e.preventDefault()
            const productCard = quickViewBtn.closest(".product-card")
            this.showQuickViewModal(productCard)
            }
    
            const addToCartBtn = e.target.closest(".add-to-cart")
            if (addToCartBtn) {
            e.preventDefault()
            const productCard = addToCartBtn.closest(".product-card")
            const product = {
                name: productCard.querySelector("h3").textContent,
                price: productCard.querySelector(".price").textContent,
                sizes: productCard.dataset.size.split(","),
                image: productCard.querySelector(".image-placeholder img, .design-photo").src,
                id: productCard.dataset.id,
            }
            this.showSizeSelector(product, this.outOfStockItems, productCard)
            }
        })
        }
    
        showQuickViewModal(productCard) {
        const productName = productCard.querySelector(".product-name, h3").textContent
        const productPrice = productCard.querySelector(".product-price, .price").textContent
        const productDescription =
            productCard.querySelector(".product-description")?.textContent || "Premium quality product"
    
        const productImageEl = productCard.querySelector(".product-image img, .image-placeholder img, .design-photo")
        const productImageSrc = productImageEl ? productImageEl.src : "/diverse-products-still-life.png"
    
        const material = productCard.dataset.material || "Cotton Blend"
        const fit = productCard.dataset.fit || "Regular Fit"
    
        const modal = document.createElement("div")
        modal.className = "quick-view-modal"
    
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
                                <img src="${productCard.dataset.thumbnails ? productCard.dataset.thumbnails.split(",")[0] : productImageSrc}" alt="${productName}">
                            </div>
                            <div class="product-gallery">
                                ${(productCard.dataset.thumbnails
                                    ? productCard.dataset.thumbnails.split(",")
                                    : [productImageSrc]
                                )
                                    .map(
                                    (thumb, i) => `
                                    <div class="gallery-thumb ${i === 0 ? "active" : ""}">
                                        <img src="${thumb}" alt="Thumbnail ${i + 1}">
                                    </div>
                                `,
                                    )
                                    .join("")}
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
                                    <div class="size-options">
                                    ${["S","M","L","XL"].map(size => {
                                    const isOut = this.outOfStockItems.has(`${productCard.dataset.id}-${size}`);
                                return `
                                    <button class="size-btn ${isOut ? "out-of-stock" : ""}" 
                                        data-size="${size}" 
                                        ${isOut ? "disabled" : ""}>
                                        ${size} ${isOut ? "<span class='stock-status'>Out of Stock</span>" : ""}
                                        </button>
                                `;
                                        }).join("")}
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
        `
    
        if (!document.querySelector("#quick-view-styles")) {
            const style = document.createElement("style")
            style.id = "quick-view-styles"
            style.textContent = `
            .quick-view-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
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
                position: relative;
                background: var(--color-bg);
                border: 1px solid var(--color-border);
                border-radius: 12px;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--color-border);
            }
            .modal-header h3 {
                color: var(--color-accent);
                margin: 0;
            }
            .close-modal {
                background: none;
                border: none;
                color: var(--color-accent);
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 30px;
            }
            .product-preview .image-placeholder {
                width: 100%;
                height: 300px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            .product-preview .image-placeholder img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .product-gallery {
                display: flex;
                gap: 10px;
                overflow-x: auto;
            }
            .gallery-thumb {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: border-color 0.3s ease;
            }
            .gallery-thumb.active {
                border-color: var(--color-accent);
            }
            .gallery-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .product-details h4 {
                color: var(--color-accent);
                margin: 0 0 10px 0;
            }
            .product-details .price {
                color: var(--color-accent);
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 15px 0;
            }
            .product-details .description {
                color: var(--color-muted);
                margin: 0 0 20px 0;
                line-height: 1.6;
            }
            .product-specs {
                margin: 20px 0;
            }
            .spec-item {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid var(--color-border);
            }
            .spec-label {
                color: var(--color-muted);
            }
            .spec-value {
                color: var(--color-accent);
                font-weight: 500;
            }
            .size-selector, .quantity-selector {
                margin: 20px 0;
            }
            .size-selector h5, .quantity-selector h5 {
                color: var(--color-accent);
                margin: 0 0 10px 0;
            }
            .size-options {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .size-btn {
                padding: 10px 15px;
                border: 1px solid var(--color-accent);
                background: transparent;
                color: var(--color-accent);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .size-btn.out-of-stock {
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .size-btn.out-of-stock .stock-status {
                    display: block;
                    font-size: 0.7rem;
                    margin-top: 4px;
                    color: #ff6b6b;
    }

            .size-btn:hover, .size-btn.selected {
                background: var(--color-accent);
                color: var(--color-bg);
            }
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .qty-btn {
                width: 35px;
                height: 35px;
                border: 1px solid var(--color-accent);
                background: transparent;
                color: var(--color-accent);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
            }
            .qty-btn:hover {
                background: var(--color-accent);
                color: var(--color-bg);
            }
            .qty-input {
                width: 60px;
                padding: 8px;
                text-align: center;
                border: 1px solid var(--color-border);
                background: var(--color-surface);
                color: var(--color-accent);
                border-radius: 6px;
            }
            .add-to-cart-modal {
                width: 100%;
                padding: 15px;
                background: transparent;
                border: 1px solid var(--color-accent);
                color: var(--color-accent);
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            }
            .add-to-cart-modal:hover {
                background: var(--color-accent);
                color: var(--color-bg);
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
            @keyframes modalSlideOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.8);
                }
            }
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
                .modal-content {
                    max-width: 95%;
                    margin: 20px;
                }
            }
            `
            document.head.appendChild(style)
        }
    
        document.body.appendChild(modal)
    
        // Bind modal events
        this.bindModalEvents(modal, productCard)
        }
    
        bindModalEvents(modal, productCard) {
        const closeBtn = modal.querySelector(".close-modal")
        const overlay = modal.querySelector(".modal-overlay")
        const sizeBtns = modal.querySelectorAll(".size-btn")
        const qtyBtns = modal.querySelectorAll(".qty-btn")
        const qtyInput = modal.querySelector(".qty-input")
        const addToCartBtn = modal.querySelector(".add-to-cart-modal")
        const previewImage = modal.querySelector(".product-preview .image-placeholder img")
        const galleryThumbs = modal.querySelectorAll(".gallery-thumb img")
    
        closeBtn.addEventListener("click", () => this.closeModal(modal))
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) this.closeModal(modal)
        })
    
        sizeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
            if (btn.classList.contains("out-of-stock") || btn.disabled) {
                this.showNotification(`Size ${btn.dataset.size} is out of stock`, "error")
                return
            }
            sizeBtns.forEach((b) => b.classList.remove("selected"))
            btn.classList.add("selected")
            })
        })
        
    
        qtyBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
            const action = btn.dataset.action
            const currentValue = Number.parseInt(qtyInput.value)
    
            if (action === "increase" && currentValue < 10) {
                qtyInput.value = currentValue + 1
            } else if (action === "decrease" && currentValue > 1) {
                qtyInput.value = currentValue - 1
            }
            })
        })
    
        // Thumbnail gallery switching
        galleryThumbs.forEach((thumb) => {
            thumb.addEventListener("click", () => {
            previewImage.src = thumb.src
            modal.querySelectorAll(".gallery-thumb").forEach((t) => t.classList.remove("active"))
            thumb.parentElement.classList.add("active")
            })
        })
    
        addToCartBtn.addEventListener("click", () => {
            const selectedSize = modal.querySelector(".size-btn.selected")
            const quantity = qtyInput.value
        
            if (!selectedSize) {
                this.showNotification("Please select a size", "error")
                return
            }
        
            const size = selectedSize.dataset.size
            const productId = productCard.dataset.id
            if (this.outOfStockItems.has(`${productId}-${size}`)) {
                this.showNotification(`Size ${size} is out of stock`, "error")
                return
            }
        
            this.addToCart(productCard, {
                size: size,
                quantity: Number.parseInt(quantity),
            })
            this.closeModal(modal)
        })
        
    
        // Close on escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.closeModal(modal)
        })
        }
    
        closeModal(modal) {
        modal.style.animation = "modalSlideOut 0.3s ease"
        setTimeout(() => {
            if (modal.parentNode) {
            document.body.removeChild(modal)
            }
        }, 300)
        }
    
        addToCart(productCard, options = {}) {
        const productName = productCard.querySelector("h3").textContent
        const productPrice = productCard.querySelector(".price").textContent
        const productImgEl = productCard.querySelector(".image-placeholder img, .design-photo")
        const productImg = productImgEl ? productImgEl.src : ""
        const size = options.size || "M"
        const quantity = options.quantity || 1
    
        // Animation feedback
        const btn = productCard.querySelector(".add-to-cart")
        const originalText = btn.textContent
        btn.textContent = "Added!"
        btn.style.background = "linear-gradient(45deg, #00ff88, #00cc6a)"
    
        setTimeout(() => {
            btn.textContent = originalText
            btn.style.background = "linear-gradient(45deg, #00d4ff, #0099cc)"
        }, 1500)
    
        // Store in localStorage
        const cart = JSON.parse(localStorage.getItem("icaruCart") || "[]")
        cart.push({
            name: productName,
            price: productPrice,
            size: size,
            quantity: quantity,
            image: productImg,
            id: Date.now(),
        })
        localStorage.setItem("icaruCart", JSON.stringify(cart))
    
        this.showNotification(`
            ${productName} (${size}) added to cart!`)
        }
    
        showNotification(message, type = "success") {
        const notification = document.createElement("div")
        notification.className = "notification"
        notification.textContent = message
        notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === "success" ? "linear-gradient(45deg, #00d4ff, #0099cc)" : "linear-gradient(45deg, #ff6b6b, #cc4b4b)"};
                color: #ffffff;
                padding: 1rem 2rem;
                border-radius: 25px;
                z-index: 10001;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 10px 30px rgba(${type === "success" ? "0, 212, 255, 0.3" : "245, 245, 235, 0.3"});
                font-weight: 600;
            `
    
        document.body.appendChild(notification)
    
        setTimeout(() => {
            notification.style.animation = "slideOutRight 0.3s ease"
            setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification)
            }
            }, 300)
        }, 3000)
        }
    
        initializeImageEffects() {
        // Add hover effects to product images
        document.querySelectorAll(".product-image").forEach((image) => {
            image.addEventListener("mouseenter", () => {
            image.style.transform = "scale(1.05)"
            })
    
            image.addEventListener("mouseleave", () => {
            image.style.transform = "scale(1)"
            })
        })
        }
    }
    
    // Initialize when DOM is loaded
    document.addEventListener("DOMContentLoaded", () => {
        new ProductsPage()
        new ProductCardEnhancements()
    })
    
    // Slider Revolution Functionality
    class SliderRevolution {
        constructor() {
        this.slides = document.querySelectorAll(".slide")
        this.dots = document.querySelectorAll(".dot")
        this.currentSlide = 0
        this.slideInterval = null
        this.init()
        }
    
        init() {
        this.startAutoSlide()
        this.bindEvents()
        }
    
        startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide()
        }, 3000) // Change slide every 3 seconds
        }
    
        nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length
        this.updateSlides()
        }
    
        prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length
        this.updateSlides()
        }
    
        goToSlide(index) {
        this.currentSlide = index
        this.updateSlides()
        }
    
        updateSlides() {
        // Update slides with advanced transitions
        this.slides.forEach((slide, index) => {
            slide.classList.remove("active", "prev", "next")
    
            if (index === this.currentSlide) {
            slide.classList.add("active")
            // Trigger design animations
            this.animateDesigns(slide)
            } else if (index === (this.currentSlide - 1 + this.slides.length) % this.slides.length) {
            slide.classList.add("prev")
            } else if (index === (this.currentSlide + 1) % this.slides.length) {
            slide.classList.add("next")
            }
        })
    
        // Update dots with enhanced animation
        this.dots.forEach((dot, index) => {
            dot.classList.remove("active")
            if (index === this.currentSlide) {
            dot.classList.add("active")
            // Add pulse effect to active dot
            dot.style.animation = "none"
            setTimeout(() => {
                dot.style.animation = "dotPulse 0.6s ease-in-out"
            }, 10)
            }
        })
    
        // Update product menu with smooth transitions
        const menuItems = document.querySelectorAll(".menu-item")
        menuItems.forEach((item, index) => {
            item.classList.remove("active")
            if (index === this.currentSlide) {
            item.classList.add("active")
            // Add entrance animation
            item.style.animation = "none"
            setTimeout(() => {
                item.style.animation = "menuItemActive 0.8s ease-out"
            }, 10)
            }
        })
    
        // Add dynamic background effect
        this.updateBackgroundEffect()
    
        // Reset auto-slide timer
        clearInterval(this.slideInterval)
        this.startAutoSlide()
        }
    
        animateDesigns(slide) {
        const designItems = slide.querySelectorAll(".design-item")
        designItems.forEach((item, index) => {
            // Reset animation
            item.style.transition = "none"
            item.style.transform = item.dataset.direction === "up" ? "translateY(-100px)" : "translateY(100px)"
            item.style.opacity = "0"
    
            // Trigger animation with delay
            setTimeout(
            () => {
                item.style.transition = "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                item.style.transform = "translateY(0)"
                item.style.opacity = "1"
            },
            200 + index * 200,
            )
        })
        }
    
        updateBackgroundEffect() {
        const dystopianBg = document.querySelector(".dystopian-bg")
        if (dystopianBg) {
            dystopianBg.style.animation = "none"
            setTimeout(() => {
            dystopianBg.style.animation = "backgroundShift 1s ease-in-out"
            }, 10)
        }
        }
    
        bindEvents() {
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
            this.goToSlide(index)
            })
        })
    
        // Arrow navigation
        const prevArrow = document.querySelector(".prev-arrow")
        const nextArrow = document.querySelector(".next-arrow")
    
        if (prevArrow) {
            prevArrow.addEventListener("click", () => {
            this.prevSlide()
            })
        }
    
        if (nextArrow) {
            nextArrow.addEventListener("click", () => {
            this.nextSlide()
            })
        }
    
        // Product menu navigation
        const menuItems = document.querySelectorAll(".menu-item")
        menuItems.forEach((item, index) => {
            item.addEventListener("click", () => {
            this.goToSlide(index)
            })
        })
    
        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
            this.prevSlide()
            } else if (e.key === "ArrowRight") {
            this.nextSlide()
            }
        })
    
        // Touch/swipe support for mobile
        let startX = 0
        let endX = 0
    
        document.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX
        })
    
        document.addEventListener("touchend", (e) => {
            endX = e.changedTouches[0].clientX
            this.handleSwipe()
        })
    
        // Mouse drag support
        let isDragging = false
        let startPos = 0
    
        document.addEventListener("mousedown", (e) => {
            isDragging = true
            startPos = e.clientX
        })
    
        document.addEventListener("mouseup", (e) => {
            if (isDragging) {
            const endPos = e.clientX
            const diff = startPos - endPos
    
            if (Math.abs(diff) > 50) {
                // Minimum drag distance
                if (diff > 0) {
                this.nextSlide()
                } else {
                this.prevSlide()
                }
            }
            isDragging = false
            }
        })
    
        document.addEventListener("mouseleave", () => {
            isDragging = false
        })
    
        // Flame effect on mouse move
        this.initFlameEffect()
        }
    
        initFlameEffect() {
        const slideImages = document.querySelectorAll(".slide-image")
    
        slideImages.forEach((slideImage) => {
            slideImage.addEventListener("mousemove", (e) => {
            const flameEffect = slideImage.querySelector(".flame-effect")
            if (flameEffect) {
                const rect = slideImage.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
    
                // Create flame trail effect that follows mouse
                flameEffect.style.transform = `translateX(${x - 100}px)`
                flameEffect.style.opacity = "1"
    
                // Add a subtle glow effect
                flameEffect.style.boxShadow = `0 0 20px rgba(255,255,255,0.3)`
            }
            })
    
            slideImage.addEventListener("mouseleave", () => {
            const flameEffect = slideImage.querySelector(".flame-effect")
            if (flameEffect) {
                flameEffect.style.opacity = "0"
                flameEffect.style.boxShadow = "none"
            }
            })
        })
        }
    
        handleSwipe() {
        const diff = startX - endX
        const minSwipeDistance = 50
    
        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) {
            this.nextSlide()
            } else {
            this.prevSlide()
            }
        }
        }
    }
    
    // Mobile Navigation
    class MobileNavigation {
        constructor() {
        this.hamburger = document.querySelector(".hamburger")
        this.navMenu = document.querySelector(".nav-menu")
        this.navLinks = document.querySelectorAll(".nav-link")
        this.init()
        }
    
        init() {
        this.bindEvents()
        }
    
        bindEvents() {
        this.hamburger.addEventListener("click", () => {
            this.toggleMenu()
        })
    
        this.navLinks.forEach((link) => {
            link.addEventListener("click", () => {
            this.closeMenu()
            })
        })
    
        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
            this.closeMenu()
            }
        })
        }
    
        toggleMenu() {
        this.hamburger.classList.toggle("active")
        this.navMenu.classList.toggle("active")
    
        // Animate hamburger bars
        const bars = this.hamburger.querySelectorAll(".bar")
        bars.forEach((bar, index) => {
            if (this.hamburger.classList.contains("active")) {
            if (index === 0) bar.style.transform = "rotate(45deg) translate(5px, 5px)"
            if (index === 1) bar.style.opacity = "0"
            if (index === 2) bar.style.transform = "rotate(-45deg) translate(7px, -6px)"
            } else {
            bar.style.transform = "none"
            bar.style.opacity = "1"
            }
        })
        }
    
        closeMenu() {
        this.hamburger.classList.remove("active")
        this.navMenu.classList.remove("active")
    
        const bars = this.hamburger.querySelectorAll(".bar")
        bars.forEach((bar) => {
            bar.style.transform = "none"
            bar.style.opacity = "1"
        })
        }
    }
    
    // Smooth Scrolling
    class SmoothScrolling {
        constructor() {
        this.init()
        }
    
        init() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
            e.preventDefault()
            const target = document.querySelector(this.getAttribute("href"))
            if (target) {
                target.scrollIntoView({
                behavior: "smooth",
                block: "start",
                })
            }
            })
        })
        }
    }
    
    // Product Card Animations
    class ProductAnimations {
        constructor() {
        this.productCards = document.querySelectorAll(".product-card")
        this.init()
        }
    
        init() {
        this.bindEvents()
        this.observeCards()
        }
    
        bindEvents() {
        this.productCards.forEach((card) => {
            // Add to cart functionality
            const addToCartBtn = card.querySelector(".add-to-cart")
            if (addToCartBtn) {
            addToCartBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.addToCart(card)
            })
            }
    
            // Quick view functionality
            const quickViewBtn = card.querySelector(".quick-view")
            if (quickViewBtn) {
            quickViewBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.quickView(card)
            })
            }
        })
        }
    
        observeCards() {
        const observer = new IntersectionObserver(
            (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                entry.target.style.opacity = "1"
                entry.target.style.transform = "translateY(0)"
                }
            })
            },
            {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
            },
        )
    
        this.productCards.forEach((card) => {
            card.style.opacity = "0"
            card.style.transform = "translateY(30px)"
            card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
            observer.observe(card)
        })
        }
    
        addToCart(card) {
        const productName = card.querySelector("h3").textContent
        const productPrice = card.querySelector(".price").textContent
    
        // Animation feedback
        const btn = card.querySelector(".add-to-cart")
        const originalText = btn.textContent
        btn.textContent = "Added!"
        btn.style.background = "linear-gradient(45deg, #00ff88, #00cc6a)"
    
        setTimeout(() => {
            btn.textContent = originalText
            btn.style.background = "linear-gradient(45deg, #00d4ff, #0099cc)"
        }, 1500)
    
        // Store in localStorage (simple cart implementation)
        const cart = JSON.parse(localStorage.getItem("icaruCart") || "[]")
        cart.push({
            name: productName,
            price: productPrice,
            id: Date.now(),
        })
        localStorage.setItem("icaruCart", JSON.stringify(cart))
    
        // Show notification
        this.showNotification(`${productName} added to cart!`)
        }
    
        quickView(card) {
        const productName = card.querySelector("h3").textContent
        const productPrice = card.querySelector(".price").textContent
    
        // Create modal for quick view
        this.createQuickViewModal(productName, productPrice)
        }
    
        createQuickViewModal(name, price) {
        const modal = document.createElement("div")
        modal.className = "quick-view-modal"
        modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${name}</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                                <div class="product-preview">
            <img src="${card.querySelector(".design-photo").src}" 
                alt="${name}" 
                class="quickview-photo">
        </div>
    
                            <div class="product-details">
                                <h4>${name}</h4>
                                <p class="price">${price}</p>
                                <p class="description">Premium comfort sweetpants with exceptional fit and style. Made from high-quality materials for ultimate comfort.</p>
                                <div class="size-selector">
                                    <h5>Select Size:</h5>
                                    <div class="size-options">
                                        <button class="size-btn">S</button>
                                        <button class="size-btn">M</button>
                                        <button class="size-btn">L</button>
                                        <button class="size-btn">XL</button>
                                    </div>
                                </div>
                                <button class="add-to-cart-modal">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
    
        // Add modal styles
        const style = document.createElement("style")
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
                    max-width: 600px;
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
                }
                .modal-body {
                    padding: 1.5rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }
                .product-preview {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .product-preview .image-placeholder {
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(45deg, #00d4ff, #0099cc);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                }
                .product-details h4 {
                    color: #ffffff;
                    margin-bottom: 1rem;
                }
                .product-details .price {
                    color: #00d4ff;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                .product-details .description {
                    color: #cccccc;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }
                .size-selector h5 {
                    color: #ffffff;
                    margin-bottom: 1rem;
                }
                .size-options {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }
                .size-btn {
                    width: 40px;
                    height: 40px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    background: transparent;
                    color: #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .size-btn:hover,
                .size-btn.selected {
                    border-color: #00d4ff;
                    background: #00d4ff;
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
            `
    
        document.head.appendChild(style)
        document.body.appendChild(modal)
    
        // Bind modal events
        const closeBtn = modal.querySelector(".close-modal")
        const overlay = modal.querySelector(".modal-overlay")
        const sizeBtns = modal.querySelectorAll(".size-btn")
        const addToCartBtn = modal.querySelector(".add-to-cart-modal")
    
        closeBtn.addEventListener("click", () => this.closeModal(modal))
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) this.closeModal(modal)
        })
    
        sizeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
            sizeBtns.forEach((b) => b.classList.remove("selected"))
            btn.classList.add("selected")
            })
        })
    
        addToCartBtn.addEventListener("click", () => {
            this.addToCart({ querySelector: () => ({ textContent: name }), querySelector: () => ({ textContent: price }) })
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
            document.body.removeChild(modal)
        }, 300)
        }
    
        showNotification(message) {
        const notification = document.createElement("div")
        notification.className = "notification"
        notification.textContent = message
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
    }
    
    // Navbar Scroll Effect
    class NavbarScroll {
        constructor() {
        this.navbar = document.querySelector(".navbar")
        this.init()
        }
    
        init() {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 100) {
            this.navbar.style.background = "rgba(10, 10, 10, 0.98)"
            this.navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.3)"
            } else {
            this.navbar.style.background = "rgba(10, 10, 10, 0.95)"
            this.navbar.style.boxShadow = "none"
            }
        })
        }
    }
    
    // Initialize all components when DOM is loaded
    document.addEventListener("DOMContentLoaded", () => {
        new SliderRevolution()
        new MobileNavigation()
        new SmoothScrolling()
        // Enable guarded product interactions on homepage featured cards
        initializeHomeFeaturedInteractions()
        new NavbarScroll()
    
        // Add loading animation
        const loader = document.createElement("div")
        loader.className = "page-loader"
        loader.innerHTML = `
            <div class="loader-content">
                                <img class="loader-logo" src="ICARU_identity/beige_ong.png" alt="ICARU" />
                <div class="loader-spinner"></div>
            </div>
        `
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--color-bg);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.5s ease;
        `
    
        const loaderStyle = document.createElement("style")
        loaderStyle.textContent = `
            .loader-content {
                text-align: center;
            }
            .loader-logo { height: 110px; width: auto; display: inline-block; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.35)); margin-bottom: 2rem; }
            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(245, 245, 235, 0.25);
                border-top: 3px solid var(--color-accent);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `
    
        document.head.appendChild(loaderStyle)
        document.body.appendChild(loader)
    
        // Remove loader after page loads
        setTimeout(() => {
        loader.style.opacity = "0"
        setTimeout(() => {
            if (loader.parentNode) {
            document.body.removeChild(loader)
            }
        }, 500)
        }, 1500)
    })
    
    // Lightweight interactions for homepage featured products
    function initializeHomeFeaturedInteractions() {
        const cards = document.querySelectorAll(".featured-products .product-card")
        if (!cards.length) return
    
        cards.forEach((card) => {
        const quickBtn = card.querySelector(".quick-view")
        const name = card.querySelector("h3")?.textContent || "Product"
        const price = card.querySelector(".price")?.textContent || "0.00 EGP"
        const imgEl = card.querySelector(".image-placeholder img") || card.querySelector("img")
        const imgSrc = imgEl ? imgEl.src : ""
    
        if (quickBtn) {
            quickBtn.addEventListener("click", (e) => {
            e.preventDefault()
            openQuickViewModal({ name, price, imgSrc })
            })
        }
    
        const addBtn = card.querySelector(".add-to-cart")
        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
            e.preventDefault()
            const cart = JSON.parse(localStorage.getItem("icaruCart") || "[]")
            cart.push({ name, price, image: imgSrc, id: Date.now(), size: "M", quantity: 1 })
            localStorage.setItem("icaruCart", JSON.stringify(cart))
            showToast(`${name} added to cart!`)
            })
        }
        })
    }
    
    function openQuickViewModal({ name, price, imgSrc }) {
        const modal = document.createElement("div")
        modal.className = "quick-view-modal"
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${name}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body" style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:90vw;">
                        <div class="product-preview" style="display:flex;align-items:center;justify-content:center;">
                            <img src="${imgSrc}" alt="${name}" class="quickview-photo" style="width:100%;height:100%;max-height:60vh;object-fit:cover;border-radius:12px;"/>
                        </div>
                        <div class="product-details">
                            <h4>${name}</h4>
                            <p class="price">${price}</p>
                            <div class="size-selector">
                                <h5>Select Size:</h5>
                                <div class="size-options">
                                    <button class="size-btn">S</button>
                                    <button class="size-btn">M</button>
                                    <button class="size-btn">L</button>
                                    <button class="size-btn">XL</button>
                                </div>
                            </div>
                            <button class="add-to-cart-modal">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>`
    
        document.body.appendChild(modal)
    
        const closeBtn = modal.querySelector(".close-modal")
        const overlay = modal.querySelector(".modal-overlay")
        const addBtn = modal.querySelector(".add-to-cart-modal")
        const sizeBtns = modal.querySelectorAll(".size-btn")
        let selectedSize = "M"
        sizeBtns.forEach((btn) =>
        btn.addEventListener("click", () => {
            sizeBtns.forEach((b) => b.classList.remove("selected"))
            btn.classList.add("selected")
            selectedSize = btn.textContent
        }),
        )
        closeBtn.addEventListener("click", () => document.body.removeChild(modal))
        overlay.addEventListener("click", (e) => {
        if (e.target === overlay) document.body.removeChild(modal)
        })
        addBtn.addEventListener("click", () => {
        const cart = JSON.parse(localStorage.getItem("icaruCart") || "[]")
        cart.push({ name, price, image: imgSrc, id: Date.now(), size: selectedSize, quantity: 1 })
        localStorage.setItem("icaruCart", JSON.stringify(cart))
        document.body.removeChild(modal)
        showToast(`${name} (${selectedSize}) added to cart!`)
        })
    }
    
    function showToast(message) {
        const n = document.createElement("div")
        n.textContent = message
        n.style.cssText =
        "position:fixed;top:20px;right:20px;background:rgba(245,245,235,0.1);border:1px solid rgba(245,245,235,0.3);color:var(--color-accent);padding:10px 16px;border-radius:12px;z-index:10001;"
        document.body.appendChild(n)
        setTimeout(() => {
        if (n.parentNode) document.body.removeChild(n)
        }, 2500)
    }
    
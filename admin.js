    // Admin Panel Functionality
    class AdminPanel {
        constructor() {
        this.isLoggedIn = false
        this.credentials = {
            username: "ICARUstore@5",
            password: "@ICARU5#shop5",
        }
        this.products = []
        this.pendingChanges = []
        this.outOfStockItems = new Set()
        this.deletedProducts = new Set()
        this.init()
        }
    
        init() {
        this.loadProductData()
        this.bindEvents()
        this.checkLoginStatus()
        }
    
        async loadProductData() {
        try {
            // Check if Firebase is available
            if (!window.firestore || !window.firestoreDb) {
            console.log("Firebase not available, using localStorage");
            const savedData = localStorage.getItem("icaruProductsPageData")
            if (savedData) {
                const data = JSON.parse(savedData)
                this.products = data.products || []
                this.outOfStockItems = new Set(data.outOfStock || [])
                this.deletedProducts = new Set(data.deletedProducts || [])
            } else {
                this.fetchProductsFromPage()
            }
            return;
            }
            
            // Load products from Firestore first
            const productsSnapshot = await window.firestore.getDocs(window.firestore.collection(window.firestoreDb, 'products'));
            const outOfStockSnapshot = await window.firestore.getDocs(window.firestore.collection(window.firestoreDb, 'outOfStock'));
            const deletedProductsSnapshot = await window.firestore.getDocs(window.firestore.collection(window.firestoreDb, 'deletedProducts'));
            
            if (!productsSnapshot.empty) {
            // Load from Firestore
            this.products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.outOfStockItems = new Set(outOfStockSnapshot.docs.map(doc => doc.data().itemId));
            this.deletedProducts = new Set(deletedProductsSnapshot.docs.map(doc => doc.data().productId));
            } else {
            // Fallback to localStorage for backward compatibility
            const savedData = localStorage.getItem("icaruProductsPageData")
            if (savedData) {
                const data = JSON.parse(savedData)
                this.products = data.products || []
                this.outOfStockItems = new Set(data.outOfStock || [])
                this.deletedProducts = new Set(data.deletedProducts || [])
                // Migrate to Firestore
                await this.migrateToFirestore(data);
            } else {
                this.fetchProductsFromPage()
            }
            }
        } catch (error) {
            console.error("Error loading from Firestore:", error);
            // Fallback to localStorage
            const savedData = localStorage.getItem("icaruProductsPageData")
            if (savedData) {
            const data = JSON.parse(savedData)
            this.products = data.products || []
            this.outOfStockItems = new Set(data.outOfStock || [])
            this.deletedProducts = new Set(data.deletedProducts || [])
            } else {
            this.fetchProductsFromPage()
            }
        }
        }
    
        async fetchProductsFromPage() {
        try {
            console.log("[v0] Attempting to fetch products from products.html")
    
            const response = await fetch("products.html")
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
            }
    
            const html = await response.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, "text/html")
            const productCards = doc.querySelectorAll(".product-card")
    
            console.log("[v0] Found product cards:", productCards.length)
    
            if (productCards.length === 0) {
            throw new Error("No product cards found in products.html")
            }
    
            // Convert HTML product cards to admin product objects
            this.products = Array.from(productCards).map((card, index) => {
            const name = card.querySelector("h3")?.textContent?.trim() || `Product ${index + 1}`
            const priceElement = card.querySelector(".price")
            const price = priceElement?.textContent?.trim() || "0.00 EGP"
            const description = card.querySelector(".product-description")?.textContent?.trim() || "Premium quality product"
    
            const materialElement = card.querySelector(".material")
            const fitElement = card.querySelector(".fit")
            const material = materialElement?.textContent?.trim() || "Cotton Blend"
            const fit = fitElement?.textContent?.trim() || "Regular Fit"
    
            const category = card.dataset.category || "casual"
            const sizesData = card.dataset.size || "S,M,L,XL"
            const sizes = sizesData
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
    
            const imageElement = card.querySelector("img")
            const image = imageElement?.src || imageElement?.getAttribute("src") || "Images/placeholder.jpg"
    
            const badgeElement = card.querySelector(".product-badge")
            const badge = badgeElement?.textContent?.trim() || ""
    
            const thumbnailsData = card.dataset.thumbnails || image
            const thumbnails = thumbnailsData
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t)
    
            console.log("[v0] Parsed product:", { name, price, category, sizes })
    
            return {
                id: index + 1,
                name: name,
                price: price,
                category: category,
                sizes: sizes,
                description: description,
                image: image,
                thumbnails: thumbnails,
                material: material,
                fit: fit,
                badge: badge,
            }
            })
    
            console.log("[v0] Successfully loaded products:", this.products.length)
            this.saveProductData()
        } catch (error) {
            console.error("[v0] Failed to fetch products from page:", error)
    
            const currentPageCards = document.querySelectorAll(".product-card")
            if (currentPageCards.length > 0) {
            console.log("[v0] Found products on current page, using those instead")
            this.products = Array.from(currentPageCards).map((card, index) => {
                const name = card.querySelector("h3")?.textContent?.trim() || `Product ${index + 1}`
                const price = card.querySelector(".price")?.textContent?.trim() || "0.00 EGP"
                const description =
                card.querySelector(".product-description")?.textContent?.trim() || "Premium quality product"
                const material = card.querySelector(".material")?.textContent?.trim() || "Cotton Blend"
                const fit = card.querySelector(".fit")?.textContent?.trim() || "Regular Fit"
                const category = card.dataset.category || "casual"
                const sizes = (card.dataset.size || "S,M,L,XL").split(",").map((s) => s.trim())
                const image = card.querySelector("img")?.src || "Images/placeholder.jpg"
                const badge = card.querySelector(".product-badge")?.textContent?.trim() || ""
                const thumbnails = (card.dataset.thumbnails || image).split(",").map((t) => t.trim())
    
                return {
                id: index + 1,
                name,
                price,
                category,
                sizes,
                description,
                image,
                thumbnails,
                material,
                fit,
                badge,
                }
            })
            this.saveProductData()
            } else {
            // Only use default products as last resort
            console.log("[v0] No products found anywhere, using default products")
            this.initializeDefaultProducts()
            }
        }
        }
    
        initializeDefaultProducts() {
        this.products = [
            {
            id: 1,
            name: "Classic Comfort",
            price: "29.99 EGP",
            category: "classic",
            sizes: ["S", "M", "L", "XL"],
            description: "Premium cotton blend with perfect fit",
            image: "Images/design1.jpg",
            thumbnails: ["Images/design1a.jpg", "Images/design1b.jpg", "Images/design1c.jpg"],
            material: "100% Cotton",
            fit: "Regular Fit",
            badge: "Best Seller",
            },
            {
            id: 2,
            name: "Sport Style",
            price: "34.99 EGP",
            category: "sport",
            sizes: ["S", "M", "L", "XL"],
            description: "Lightweight and breathable for active lifestyle",
            image: "Images/design2.jpg",
            thumbnails: ["Images/design2a.jpg", "Images/design2b.jpg", "Images/design2c.jpg"],
            material: "Polyester Blend",
            fit: "Athletic Fit",
            badge: "New",
            },
            {
            id: 3,
            name: "Premium Fit",
            price: "39.99 EGP",
            category: "premium",
            sizes: ["M", "L", "XL"],
            description: "Luxury comfort with superior craftsmanship",
            image: "Images/design3.jpg",
            thumbnails: ["Images/design3a.jpg", "Images/design3b.jpg", "Images/design3c.jpg"],
            material: "Organic Cotton",
            fit: "Slim Fit",
            badge: "Premium",
            },
            {
            id: 4,
            name: "Casual Comfort",
            price: "24.99 EGP",
            category: "casual",
            sizes: ["S", "M", "L"],
            description: "Perfect for everyday wear and relaxation",
            image: "Images/design4.jpg",
            thumbnails: ["Images/design4a.jpg", "Images/design4b.jpg", "Images/design4c.jpg"],
            material: "Cotton Blend",
            fit: "Relaxed Fit",
            badge: "",
            },
        ]
        this.saveProductData()
        }
    
        async saveProductData() {
            const productsPageData = {
                products: this.products.filter(p => !this.deletedProducts.has(p.id)),
                outOfStock: [...this.outOfStockItems],
                deletedProducts: [...this.deletedProducts],
                lastUpdated: new Date().toISOString(),
            }
            
            try {
                // Check if Firebase is available
                if (!window.firestore || !window.firestoreDb) {
                console.log("Firebase not available, using localStorage only");
                localStorage.setItem("icaruProductsPageData", JSON.stringify(productsPageData))
                window.dispatchEvent(new CustomEvent("productsUpdated", { detail: productsPageData }))
                return;
                }
                
                // Save to Firestore
                await this.saveToFirestore(productsPageData);
                
                // Keep localStorage as backup
                localStorage.setItem("icaruProductsPageData", JSON.stringify(productsPageData))
                
                // Trigger update event for products page
                window.dispatchEvent(new CustomEvent("productsUpdated", { detail: productsPageData }))
            } catch (error) {
                console.error("Error saving to Firestore:", error);
                // Fallback to localStorage only
                localStorage.setItem("icaruProductsPageData", JSON.stringify(productsPageData))
                window.dispatchEvent(new CustomEvent("productsUpdated", { detail: productsPageData }))
            }
        }
        
        async saveToFirestore(productsPageData) {
        try {
            // Save products
            for (const product of productsPageData.products) {
            if (product.id) {
                await window.firestore.setDoc(
                window.firestore.doc(window.firestoreDb, 'products', product.id.toString()),
                product
                );
            }
            }
            
            // Save out of stock items
            for (const itemId of productsPageData.outOfStock) {
            await window.firestore.setDoc(
                window.firestore.doc(window.firestoreDb, 'outOfStock', itemId),
                { itemId, timestamp: new Date().toISOString() }
            );
            }
            
            // Save deleted products
            for (const productId of productsPageData.deletedProducts) {
            await window.firestore.setDoc(
                window.firestore.doc(window.firestoreDb, 'deletedProducts', productId.toString()),
                { productId, timestamp: new Date().toISOString() }
            );
            }
            
            console.log("Data saved to Firestore successfully");
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            throw error;
        }
        }
        
        async migrateToFirestore(data) {
        try {
            console.log("Migrating data to Firestore...");
            await this.saveToFirestore(data);
            console.log("Migration completed successfully");
        } catch (error) {
            console.error("Migration failed:", error);
        }
        }
    
        bindEvents() {
        // Login form
        const loginForm = document.getElementById("loginForm")
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
            e.preventDefault()
            this.handleLogin()
            })
        }
    
        // Logout button
        const logoutBtn = document.getElementById("logoutBtn")
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
            this.handleLogout()
            })
        }
    
        // Save changes button
        const saveBtn = document.getElementById("saveChanges")
        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
            this.saveChanges()
            })
        }
        }
    
        checkLoginStatus() {
        const savedLogin = localStorage.getItem("icaruAdminLogin")
        if (savedLogin === "true") {
            this.isLoggedIn = true
            this.showDashboard()
        } else {
            this.showLogin()
        }
        }
    
        handleLogin() {
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value
        const errorDiv = document.getElementById("loginError")
    
        if (username === this.credentials.username && password === this.credentials.password) {
            this.isLoggedIn = true
            localStorage.setItem("icaruAdminLogin", "true")
            this.showDashboard()
            this.showMessage("Login successful!", "success")
        } else {
            errorDiv.textContent = "Invalid username or password"
            errorDiv.style.display = "block"
            this.showMessage("Invalid credentials", "error")
        }
        }
    
        handleLogout() {
        this.isLoggedIn = false
        localStorage.removeItem("icaruAdminLogin")
        this.showLogin()
        this.showMessage("Logged out successfully", "info")
        }
    
        showLogin() {
        document.getElementById("loginScreen").style.display = "flex"
        document.getElementById("adminDashboard").style.display = "none"
        // Clear form
        document.getElementById("username").value = ""
        document.getElementById("password").value = ""
        document.getElementById("loginError").style.display = "none"
        }
    
        showDashboard() {
        document.getElementById("loginScreen").style.display = "none"
        document.getElementById("adminDashboard").style.display = "block"
        this.loadDashboard()
        }
    
        loadDashboard() {
        this.updateStats()
        this.renderProducts()
        }
    
        updateStats() {
        const activeProducts = this.products.filter((p) => !this.deletedProducts.has(p.id))
        const outOfStockCount = this.countOutOfStockItems()
    
        document.getElementById("totalProducts").textContent = activeProducts.length
        document.getElementById("outOfStock").textContent = outOfStockCount
        document.getElementById("pendingChanges").textContent = this.pendingChanges.length
        }
    
        countOutOfStockItems() {
        let count = 0
        this.products.forEach((product) => {
            if (!this.deletedProducts.has(product.id)) {
            product.sizes.forEach((size) => {
                if (this.outOfStockItems.has(`${product.id}-${size}`)) {
                count++
                }
            })
            }
        })
        return count
        }
    
        renderProducts() {
        const grid = document.getElementById("adminProductsGrid")
        grid.innerHTML = ""
    
        this.products.forEach((product) => {
            if (!this.deletedProducts.has(product.id)) {
            const productCard = this.createProductCard(product)
            grid.appendChild(productCard)
            }
        })
        }
    
        createProductCard(product) {
        const card = document.createElement("div")
        card.className = "admin-product-card"
        card.dataset.productId = product.id
    
        const badgeHtml = product.badge
            ? `<div class="product-badge ${product.badge.toLowerCase().replace(" ", "-")}">${product.badge}</div>`
            : ""
    
        card.innerHTML = `
                <div class="admin-product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${badgeHtml}
                    <button class="delete-product-btn" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="admin-product-info">
                    <h3>${product.name}</h3>
                    <p class="price">${product.price}</p>
                    <p class="product-description">${product.description}</p>
                    <div class="product-details">
                        <span class="material">${product.material}</span>
                        <span class="fit">${product.fit}</span>
                    </div>
                    <div class="size-management">
                        <h4>Size Availability:</h4>
                        <div class="size-options">
                            ${product.sizes
                                .map(
                                (size) => `
                                <button class="size-toggle ${this.outOfStockItems.has(`${product.id}-${size}`) ? "out-of-stock" : ""}" 
                                        data-product-id="${product.id}" 
                                        data-size="${size}">
                                    ${size}
                                </button>
                            `,
                                )
                                .join("")}
                        </div>
                    </div>
                </div>
            `
    
        // Bind events for this card
        this.bindProductCardEvents(card)
    
        return card
        }
    
        bindProductCardEvents(card) {
        // Delete product button
        const deleteBtn = card.querySelector(".delete-product-btn")
        deleteBtn.addEventListener("click", (e) => {
            const productId = Number.parseInt(e.target.dataset.productId)
            this.deleteProduct(productId)
        })
    
        // Size toggle buttons
        const sizeToggles = card.querySelectorAll(".size-toggle")
        sizeToggles.forEach((toggle) => {
            toggle.addEventListener("click", (e) => {
            const productId = Number.parseInt(e.target.dataset.productId)
            const size = e.target.dataset.size
            this.toggleSizeStock(productId, size, e.target)
            })
        })
        }
    
        deleteProduct(productId) {
        const product = this.products.find((p) => p.id === productId)
        if (!product) return
    
        if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            this.deletedProducts.add(productId)
            this.addPendingChange(`Delete product: ${product.name}`)
    
            // Add visual feedback
            const card = document.querySelector(`[data-product-id="${productId}"]`)
            if (card) {
            card.classList.add("deleted")
            setTimeout(() => {
                card.remove()
                this.updateStats()
            }, 300)
            }
    
            this.showMessage(`${product.name} marked for deletion`, "info")
            this.updateSaveButton()
        }
        }
    
        toggleSizeStock(productId, size, toggleElement) {
        const stockKey = `${productId}-${size}`
        const product = this.products.find((p) => p.id === productId)
    
        if (this.outOfStockItems.has(stockKey)) {
            // Mark as in stock
            this.outOfStockItems.delete(stockKey)
            toggleElement.classList.remove("out-of-stock")
            this.addPendingChange(`Mark ${product.name} size ${size} as IN STOCK`)
            this.showMessage(`${product.name} size ${size} marked as in stock`, "success")
        } else {
            // Mark as out of stock
            this.outOfStockItems.add(stockKey)
            toggleElement.classList.add("out-of-stock")
            this.addPendingChange(`Mark ${product.name} size ${size} as OUT OF STOCK`)
            this.showMessage(`${product.name} size ${size} marked as out of stock`, "info")
        }
    
        this.updateStats()
        this.updateSaveButton()
        }
    
        addPendingChange(description) {
        this.pendingChanges.push({
            id: Date.now(),
            description: description,
            timestamp: new Date().toISOString(),
        })
        }
    
        updateSaveButton() {
        const saveBtn = document.getElementById("saveChanges")
        if (this.pendingChanges.length > 0) {
            saveBtn.classList.add("has-changes")
            saveBtn.innerHTML = `<i class="fas fa-save"></i> Save Changes (${this.pendingChanges.length})`
        } else {
            saveBtn.classList.remove("has-changes")
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes'
        }
        }
    
        async updateProductsPage() {
        // Update the products page data structure
        const productsPageData = {
            products: this.products.filter((p) => !this.deletedProducts.has(p.id)),
            outOfStock: [...this.outOfStockItems],
            deletedProducts: [...this.deletedProducts],
            lastUpdated: new Date().toISOString(),
        }
    
        try {
            // Check if Firebase is available
            if (!window.firestore || !window.firestoreDb) {
            console.log("Firebase not available, using localStorage only");
            localStorage.setItem("icaruProductsPageData", JSON.stringify(productsPageData))
            window.dispatchEvent(
                new CustomEvent("productsUpdated", {
                detail: productsPageData,
                }),
            )
            return;
            }
            
            // Save to Firestore
            await this.saveToFirestore(productsPageData);
            
            // Keep localStorage as backup
            localStorage.setItem("icaruProductsPageData", JSON.stringify(productsPageData))
            
            // Trigger update event for products page
            window.dispatchEvent(
            new CustomEvent("productsUpdated", {
                detail: productsPageData,
            }),
            )
        } catch (error) {
            console.error("Error updating products page:", error);
            // Fallback to localStorage only
            localStorage.setItem("icaruProductsPageData", JSON.stringify(productsPageData))
            window.dispatchEvent(
            new CustomEvent("productsUpdated", {
                detail: productsPageData,
            }),
            )
        }
        }
    
        showMessage(message, type = "info") {
        const messageDiv = document.createElement("div")
        messageDiv.className = `admin-message ${type}`
    
        const icon =
            type === "success" ? "fas fa-check-circle" : type === "error" ? "fas fa-exclamation-circle" : "fas fa-info-circle"
    
        messageDiv.innerHTML = `<i class="${icon}"></i> ${message}`
    
        document.body.appendChild(messageDiv)
    
        setTimeout(() => {
            messageDiv.style.animation = "slideOutRight 0.3s ease"
            setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv)
            }
            }, 300)
        }, 3000)
        }
    
        async saveChanges() {
        if (this.pendingChanges.length === 0) {
            this.showMessage("No changes to save", "info")
            return
        }
    
        console.log("[v0] Saving changes:", this.pendingChanges.length)
    
        try {
            // Save all data
            await this.saveProductData()
            await this.updateProductsPage()
    
            // Show success message with details
            const changeCount = this.pendingChanges.length
            this.showMessage(`Successfully saved ${changeCount} change${changeCount > 1 ? "s" : ""}!`, "success")
    
            // Clear pending changes
            this.pendingChanges = []
            this.updateStats()
            this.updateSaveButton()
    
            console.log("[v0] Changes saved successfully")
        } catch (error) {
            console.error("[v0] Error saving changes:", error)
            this.showMessage("Error saving changes. Please try again.", "error")
        }
        }
    }
    
    // Enhanced Products Page Integration
    class ProductsPageIntegration {
        constructor() {
        this.init()
        }
    
        async init() {
        // Listen for admin updates
        window.addEventListener("productsUpdated", (e) => {
            this.handleProductsUpdate(e.detail)
        })
    
        // Load saved product data on page load
        await this.loadProductData()
        }
    
        async loadProductData() {
        try {
            // Check if Firebase is available
            if (!window.firestore || !window.firestoreDb) {
            console.log("Firebase not available, using localStorage");
            const savedData = localStorage.getItem("icaruProductsPageData")
            if (savedData) {
                const data = JSON.parse(savedData)
                this.updateProductsDisplay(data)
            }
            return;
            }
            
            // Try to load from Firestore first
            const productsSnapshot = await window.firestore.getDocs(window.firestore.collection(window.firestoreDb, 'products'));
            const outOfStockSnapshot = await window.firestore.getDocs(window.firestore.collection(window.firestoreDb, 'outOfStock'));
            const deletedProductsSnapshot = await window.firestore.getDocs(window.firestore.collection(window.firestoreDb, 'deletedProducts'));
            
            if (!productsSnapshot.empty) {
            const data = {
                products: productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                outOfStock: outOfStockSnapshot.docs.map(doc => doc.data().itemId),
                deletedProducts: deletedProductsSnapshot.docs.map(doc => doc.data().productId)
            };
            this.updateProductsDisplay(data);
            } else {
            // Fallback to localStorage
            const savedData = localStorage.getItem("icaruProductsPageData")
            if (savedData) {
                const data = JSON.parse(savedData)
                this.updateProductsDisplay(data)
            }
            }
        } catch (error) {
            console.error("Error loading from Firestore:", error);
            // Fallback to localStorage
            const savedData = localStorage.getItem("icaruProductsPageData")
            if (savedData) {
            const data = JSON.parse(savedData)
            this.updateProductsDisplay(data)
            }
        }
        }
    
        handleProductsUpdate(data) {
        this.updateProductsDisplay(data)
        this.showUpdateNotification()
        }
    
        updateProductsDisplay(data) {
        // Update product cards on products page
        const productCards = document.querySelectorAll(".product-card")
    
        productCards.forEach((card, index) => {
            const productName = card.querySelector("h3")?.textContent
            const product = data.products.find((p) => p.name === productName)
            const productId = index + 1
    
            // Check if product was deleted
            if (data.deletedProducts && data.deletedProducts.includes(productId)) {
            card.style.display = "none"
            return
            }
    
            if (!product) {
            // Product was deleted
            card.style.display = "none"
            return
            }
    
            // Show the product
            card.style.display = "block"
    
            // Update size availability and add click handlers
            this.updateSizeAvailability(card, product, data.outOfStock)
        })
        }
    
        updateSizeAvailability(card, product, outOfStockItems) {
        // Remove existing event listeners by cloning the button
        const addToCartBtn = card.querySelector(".add-to-cart")
        if (addToCartBtn) {
            const newBtn = addToCartBtn.cloneNode(true)
            addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn)
    
            // Add new event listener with stock checking
            newBtn.addEventListener("click", (e) => {
            e.preventDefault()
            this.showSizeSelector(product, outOfStockItems)
            })
        }
        }
    
        showSizeSelector(product, outOfStockItems) {
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
                                    const isOutOfStock = outOfStockItems.includes(`${product.id}-${size}`)
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
    
        // Add modal styles
        const style = document.createElement("style")
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
            const isOutOfStock = outOfStockItems.includes(`${product.id}-${selectedSize}`)
            if (isOutOfStock) {
                alert("This size is out of stock")
                return
            }
    
            // Add to cart
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
    }
    
    // Initialize admin panel when DOM is loaded
    document.addEventListener("DOMContentLoaded", async () => {
        new AdminPanel()
    
        // Initialize products page integration if we're on products page
        if (window.location.pathname.includes("products.html") || document.querySelector(".products-section")) {
        await new ProductsPageIntegration().init()
        }
    })
    
    // Add CSS animations for notifications
    const notificationStyles = document.createElement("style")
    notificationStyles.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideOutUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-50px);
            }
        }
    `
    document.head.appendChild(notificationStyles)
    
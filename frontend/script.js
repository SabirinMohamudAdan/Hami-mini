// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let cart = [];
let products = [];
let currentOrder = null;

// DOM Elements
const cartCount = document.getElementById('cartCount');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Checkout elements
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutTax = document.getElementById('checkoutTax');
const checkoutTotal = document.getElementById('checkoutTotal');

// Order confirmation elements
const orderModal = document.getElementById('orderModal');
const orderNumber = document.getElementById('orderNumber');
const orderSubtotal = document.getElementById('orderSubtotal');
const orderTax = document.getElementById('orderTax');
const orderTotal = document.getElementById('orderTotal');
const continueShopping = document.getElementById('continueShopping');
const viewOrder = document.getElementById('viewOrder');

// Search elements
const searchInput = document.getElementById('searchInput');
const cancelSearch = document.getElementById('cancelSearch');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    setupEventListeners();
    updateCartCount();
});

// Load products from backend
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products. Using offline data.');
        loadStaticProducts();
    }
}

function showLoading() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
}

// Fallback static products data
function loadStaticProducts() {
    products = [
        {
            _id: 1,
            name: "Fresh Apples",
            price: 2.99,
            category: "fruits",
            image: "https://media.gettyimages.com/id/871227828/photo/unrecognizable-woman-shops-for-produce-in-supermarket.jpg?s=612x612&w=0&k=20&c=MIvrDLHynihoCE5hOQSJbPDfXV2eMYxTPmbCe_hoaYE=",
            description: "Crisp and juicy fresh apples, perfect for snacking or baking.",
            stockQuantity: 50
        },
        {
            _id: 2,
            name: "Organic Carrots",
            price: 1.49,
            category: "vegetables",
            image: "https://media.gettyimages.com/id/1474339118/photo/carrots-for-sale-at-street-market-at-old-town-of-biel.jpg?s=612x612&w=0&k=20&c=a2VXh5kz7T3KR71v3QQ7a-iufJuPg-Oakt6SMU0DIQk=",
            description: "Fresh organic carrots, rich in vitamins and perfect for cooking.",
            stockQuantity: 40
        }
    ];
    displayProducts(products);
}

// Display products in the grid
function displayProducts(productsToDisplay) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products match your search criteria.</div>';
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${product.image}')"></div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-category">${product.category}</p>
                <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    // Add event listeners to the "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function() {
        filterProducts();
        if (this.value.length > 0) {
            cancelSearch.classList.add('active');
        } else {
            cancelSearch.classList.remove('active');
        }
    });

    cancelSearch.addEventListener('click', function() {
        searchInput.value = '';
        filterProducts();
        cancelSearch.classList.remove('active');
    });

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', filterProducts);

    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    priceFilter.addEventListener('input', filterProducts);

    // Apply filters button
    const applyFilters = document.getElementById('applyFilters');
    applyFilters.addEventListener('click', filterProducts);

    // Cart functionality
    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
        openCheckout();
    });

    // Checkout functionality
    closeCheckout.addEventListener('click', closeCheckoutModal);
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Order modal buttons
    continueShopping.addEventListener('click', function() {
        closeOrderModal();
        closeCartModal();
        closeCheckoutModal();
    });

    viewOrder.addEventListener('click', function() {
        closeOrderModal();
        showToast('Order details would be shown here in a real application');
    });

    // Close modals when clicking outside
    [cartModal, checkoutModal, orderModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                if (modal === cartModal) closeCartModal();
                if (modal === checkoutModal) closeCheckoutModal();
                if (modal === orderModal) closeOrderModal();
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Contact form validation
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // Name validation
        const nameRegex = /^[A-Za-zÀ-ÿĀ-žƁ-ɏʼ'‘\s]+$/; 
        if (nameInput.value.trim() === '' || !nameRegex.test(nameInput.value.trim())) {
            nameError.style.display = 'block';
            nameError.textContent = 'Please enter a valid name (letters only).';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailError.style.display = 'block';
            emailError.textContent = 'Please enter a valid email address.';
            isValid = false;
        } else {
            emailError.style.display = 'none';
        }

        // Message validation
        if (messageInput.value.trim() === '') {
            messageError.style.display = 'block';
            messageError.textContent = 'Please enter your message.';
            isValid = false;
        } else {
            messageError.style.display = 'none';
        }

        if (isValid) {
            alert('✅ Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        }
    });

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.section-title, .about-text, .about-image');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Filter products based on search and filter criteria
async function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const maxPrice = parseFloat(document.getElementById('priceFilter').value) || Infinity;

    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (searchTerm) params.append('search', searchTerm);
        if (maxPrice < Infinity) params.append('maxPrice', maxPrice);

        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        if (!response.ok) {
            throw new Error('Failed to filter products');
        }
        const filteredProducts = await response.json();
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
        // Fallback to client-side filtering
        const filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || product.category === category;
            const matchesPrice = product.price <= maxPrice;
            return matchesSearch && matchesCategory && matchesPrice;
        });
        displayProducts(filteredProducts);
    }
}

// Cart functionality
function addToCart(productId) {
    const product = products.find(p => p._id == productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id == productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartCount();
            updateCartDisplay();
        }
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function openCart() {
    updateCartDisplay();
    cartModal.style.display = 'flex';
}

function closeCartModal() {
    cartModal.style.display = 'none';
}

function openCheckout() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    checkoutTax.textContent = `$${tax.toFixed(2)}`;
    checkoutTotal.textContent = `$${total.toFixed(2)}`;

    checkoutModal.style.display = 'flex';
    closeCartModal();
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

// ✅ HAGAaji SAX AH: ONE VERSION OF handleCheckoutSubmit
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    // Validate form
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;

    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
        showToast('Please fill all customer information fields');
        return;
    }

    const customerInfo = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
    };
    
    const paymentMethod = document.getElementById('paymentMethod').value;
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    try {
        const orderData = {
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            customerInfo: customerInfo,
            paymentMethod: paymentMethod
        };

        console.log('Sending order data:', orderData);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const order = await response.json();
        console.log('Order created successfully:', order);
        
        // ✅ XAL SAX AH: CLEAR CART AFTER SUCCESSFUL ORDER
        clearCartAfterOrder();
        
        // Show confirmation and close modals
        showOrderConfirmation(order);
        closeCheckoutModal();
        checkoutForm.reset();

    } catch (error) {
        console.error('Error creating order:', error);
        showToast('Failed to create order: ' + error.message);
    }
}

// Function to clear cart after successful order
function clearCartAfterOrder() {
    console.log('Clearing cart after successful order...');
    
    // Clear cart array
    cart = [];
    
    // Clear localStorage
    localStorage.removeItem('cart');
    
    // Update UI
    updateCartCount();
    updateCartDisplay();
    
    console.log('Cart cleared successfully! Cart items:', cart.length);
}

function showOrderConfirmation(order) {
    if (!order) {
        console.error('No order data provided');
        showToast('Error: No order data received');
        return;
    }

    orderNumber.textContent = order.orderNumber || 'N/A';
    orderSubtotal.textContent = `$${(order.subtotal || 0).toFixed(2)}`;
    orderTax.textContent = `$${(order.tax || 0).toFixed(2)}`;
    orderTotal.textContent = `$${(order.total || 0).toFixed(2)}`;
    
    orderModal.style.display = 'flex';
}

function closeOrderModal() {
    orderModal.style.display = 'none';
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        cartSummary.innerHTML = '';
        cartTotal.textContent = 'Total: $0.00';
        return;
    }

    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        `;
        cartItems.appendChild(cartItem);
    });

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    cartSummary.innerHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (5%):</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
    `;

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;

    // Add event listeners
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });

    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            updateQuantity(productId, -1);
        });
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            updateQuantity(productId, 1);
        });
    });
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const cartData = localStorage.getItem('cart');
    cart = cartData ? JSON.parse(cartData) : [];
}
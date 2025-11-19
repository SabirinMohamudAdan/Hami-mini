
// Admin Dashboard JavaScript
        const API_BASE_URL = 'http://localhost:5000/api';

        // DOM Elements
        const pageTitle = document.getElementById('pageTitle');
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        const contentSections = document.querySelectorAll('.content-section');

        // Dashboard Elements
        const totalOrders = document.getElementById('totalOrders');
        const totalRevenue = document.getElementById('totalRevenue');
        const totalProducts = document.getElementById('totalProducts');
        const pendingOrders = document.getElementById('pendingOrders');
        const recentOrders = document.getElementById('recentOrders');
        const statusChart = document.getElementById('statusChart');

        // Chart Elements
        let categoryOrdersChart, categoryProductsChart;

        // Products Elements
        const productsTableBody = document.getElementById('productsTableBody');
        const addProductBtn = document.getElementById('addProductBtn');
        const productModal = document.getElementById('productModal');
        const productForm = document.getElementById('productForm');
        const productModalTitle = document.getElementById('productModalTitle');

        // Orders Elements
        const ordersTableBody = document.getElementById('ordersTableBody');
        const orderStatusFilter = document.getElementById('orderStatusFilter');
        const orderDateFilter = document.getElementById('orderDateFilter');
        const applyOrderFilters = document.getElementById('applyOrderFilters');

        // Order Details Elements
        const orderDetailsModal = document.getElementById('orderDetailsModal');
        const orderDetailsNumber = document.getElementById('orderDetailsNumber');
        const orderStatusSelect = document.getElementById('orderStatusSelect');

        // Global variables
        let allProducts = [];
        let allOrders = [];
        let currentEditingProduct = null;

        // Initialize admin dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeAdmin();
            setupEventListeners();
            loadDashboardData();
            loadProducts();
            loadOrders();
        });

        function initializeAdmin() {
            // Set current date for order filter
            const today = new Date().toISOString().split('T')[0];
            orderDateFilter.value = today;
        }

        function setupEventListeners() {
            // Sidebar navigation
            sidebarLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    
                    // Update active states
                    sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
                    this.parentElement.classList.add('active');
                    
                    // Show target section
                    contentSections.forEach(section => section.classList.remove('active'));
                    document.getElementById(targetId).classList.add('active');
                    
                    // Update page title
                    pageTitle.textContent = this.textContent.trim();
                    
                    // Load section-specific data
                    if (targetId === 'dashboard') {
                        loadDashboardData();
                    } else if (targetId === 'products') {
                        loadProducts();
                    } else if (targetId === 'orders') {
                        loadOrders();
                    }
                });
            });

            // Product management
            addProductBtn.addEventListener('click', openProductModal);
            
            // Modal controls
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', closeAllModals);
            });
            
            document.getElementById('cancelProduct').addEventListener('click', closeAllModals);
            document.getElementById('closeOrderDetails').addEventListener('click', closeAllModals);
            
            // Forms
            productForm.addEventListener('submit', handleProductSubmit);
            
            // Order management
            applyOrderFilters.addEventListener('click', loadOrders);
            document.getElementById('updateOrderStatus').addEventListener('click', updateOrderStatus);
            
            // Close modals when clicking outside
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        closeAllModals();
                    }
                });
            });

            // Back to store button
            document.getElementById('backToStore').addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = './index.html';
            });
        }

        function closeAllModals() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            currentEditingProduct = null;
        }

        // Dashboard functions
        async function loadDashboardData() {
            try {
                // Load order statistics
                const statsResponse = await fetch(`${API_BASE_URL}/orders/stats`);
                if (!statsResponse.ok) throw new Error('Failed to load stats');
                const stats = await statsResponse.json();
                
                // Update dashboard stats
                totalOrders.textContent = stats.totalOrders;
                totalRevenue.textContent = `$${stats.totalRevenue.toFixed(2)}`;
                pendingOrders.textContent = stats.ordersByStatus.find(s => s._id === 'pending')?.count || 0;
                
                // Load products count
                const productsResponse = await fetch(`${API_BASE_URL}/products`);
                if (productsResponse.ok) {
                    const products = await productsResponse.json();
                    totalProducts.textContent = products.length;
                }
                
                // Update recent orders
                updateRecentOrders(stats.recentOrders);
                
                // Update status chart
                updateStatusChart(stats.ordersByStatus);
                
                // Create charts
                createCharts(stats);
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                showNotification('Failed to load dashboard data', 'error');
                
                // Create sample charts for demo purposes
                createSampleCharts();
            }
        }

        function createCharts(stats) {
            // Create Orders by Category Chart
            const categoryOrdersCtx = document.getElementById('categoryOrdersChart').getContext('2d');
            
            // Calculate orders by category
            const fruitOrders = stats.recentOrders.filter(order => 
                order.items.some(item => item.category === 'fruits')
            ).length;
            
            const vegetableOrders = stats.recentOrders.filter(order => 
                order.items.some(item => item.category === 'vegetables')
            ).length;
            
            if (categoryOrdersChart) {
                categoryOrdersChart.destroy();
            }
            
            categoryOrdersChart = new Chart(categoryOrdersCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Fruits', 'Vegetables'],
                    datasets: [{
                        data: [fruitOrders, vegetableOrders],
                        backgroundColor: [
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(75, 192, 192, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 159, 64, 1)',
                            'rgba(75, 192, 192, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Orders by Category'
                        }
                    }
                }
            });
            
            // Create Products by Category Chart
            const categoryProductsCtx = document.getElementById('categoryProductsChart').getContext('2d');
            
            // Calculate products by category
            const fruitProducts = allProducts.filter(product => product.category === 'fruits').length;
            const vegetableProducts = allProducts.filter(product => product.category === 'vegetables').length;
            
            if (categoryProductsChart) {
                categoryProductsChart.destroy();
            }
            
            categoryProductsChart = new Chart(categoryProductsCtx, {
                type: 'pie',
                data: {
                    labels: ['Fruits', 'Vegetables'],
                    datasets: [{
                        data: [fruitProducts, vegetableProducts],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Products by Category'
                        }
                    }
                }
            });
        }

        function createSampleCharts() {
            // Create sample data for charts when API is not available
            const categoryOrdersCtx = document.getElementById('categoryOrdersChart').getContext('2d');
            const categoryProductsCtx = document.getElementById('categoryProductsChart').getContext('2d');
            
            // Sample Orders by Category Chart
            categoryOrdersChart = new Chart(categoryOrdersCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Fruits', 'Vegetables'],
                    datasets: [{
                        data: [65, 35],
                        backgroundColor: [
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(75, 192, 192, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 159, 64, 1)',
                            'rgba(75, 192, 192, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Orders by Category'
                        }
                    }
                }
            });
            
            // Sample Products by Category Chart
            categoryProductsChart = new Chart(categoryProductsCtx, {
                type: 'pie',
                data: {
                    labels: ['Fruits', 'Vegetables'],
                    datasets: [{
                        data: [42, 58],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Products by Category'
                        }
                    }
                }
            });
        }

        function updateRecentOrders(orders) {
            recentOrders.innerHTML = '';
            
            if (orders.length === 0) {
                recentOrders.innerHTML = '<p>No recent orders</p>';
                return;
            }
            
            orders.forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.className = 'recent-order-item';
                
                const customerName = order.customerInfo?.name || 'Unknown Customer';
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                
                orderItem.innerHTML = `
                    <div class="order-info">
                        <h4>${customerName}</h4>
                        <p>${itemCount} items • $${order.total.toFixed(2)}</p>
                    </div>
                    <div class="order-status ${getStatusClass(order.status)}">${order.status}</div>
                `;
                
                recentOrders.appendChild(orderItem);
            });
        }

        function updateStatusChart(statusData) {
            statusChart.innerHTML = '';
            
            const total = statusData.reduce((sum, item) => sum + item.count, 0);
            
            statusData.forEach(item => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                
                const statusItem = document.createElement('div');
                statusItem.className = 'status-item';
                statusItem.innerHTML = `
                    <span>${item._id}</span>
                    <div class="status-bar">
                        <div class="status-fill ${getStatusClass(item._id)}" style="width: ${percentage}%"></div>
                    </div>
                    <span>${item.count}</span>
                `;
                
                statusChart.appendChild(statusItem);
            });
        }

        function getStatusClass(status) {
            const statusClasses = {
                'pending': 'status-pending',
                'confirmed': 'status-confirmed',
                'preparing': 'status-confirmed',
                'ready': 'status-confirmed',
                'completed': 'status-completed',
                'cancelled': 'status-cancelled'
            };
            return statusClasses[status] || 'status-pending';
        }

        // Product management functions
        async function loadProducts() {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                if (!response.ok) throw new Error('Failed to load products');
                
                allProducts = await response.json();
                displayProducts(allProducts);
                
            } catch (error) {
                console.error('Error loading products:', error);
                showNotification('Failed to load products', 'error');
                
                // Create sample products for demo
                createSampleProducts();
            }
        }

        // function createSampleProducts() {
        //     allProducts = [
        //         {
        //             _id: '1',
        //             name: 'Apples',
        //             category: 'fruits',
        //             price: 2.99,
        //             stockQuantity: 50,
        //             image: 'https://via.placeholder.com/50?text=Apple'
        //         },
        //         {
        //             _id: '2',
        //             name: 'Bananas',
        //             category: 'fruits',
        //             price: 1.99,
        //             stockQuantity: 75,
        //             image: 'https://via.placeholder.com/50?text=Banana'
        //         },
        //         {
        //             _id: '3',
        //             name: 'Carrots',
        //             category: 'vegetables',
        //             price: 1.49,
        //             stockQuantity: 60,
        //             image: 'https://via.placeholder.com/50?text=Carrot'
        //         },
        //         {
        //             _id: '4',
        //             name: 'Tomatoes',
        //             category: 'vegetables',
        //             price: 3.49,
        //             stockQuantity: 40,
        //             image: 'https://via.placeholder.com/50?text=Tomato'
        //         }
        //     ];
        //     displayProducts(allProducts);
        // }

        function displayProducts(products) {
            productsTableBody.innerHTML = '';
            
            if (products.length === 0) {
                productsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            No products found. <a href="#" id="addFirstProduct" style="color: var(--primary-green);">Add your first product</a>
                        </td>
                    </tr>
                `;
                document.getElementById('addFirstProduct')?.addEventListener('click', openProductModal);
                return;
            }
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="product-image-cell">
                        <img src="${product.image}" alt="${product.name}" class="product-image-small" onerror="this.src='https://via.placeholder.com/50?text=No+Image'">
                    </td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stockQuantity}</td>
                    <td>
                        <span class="status-badge ${product.stockQuantity > 0 ? 'badge-instock' : 'badge-outstock'}">
                            ${product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-product" data-id="${product._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${product._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                productsTableBody.appendChild(row);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.edit-product').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });
        }

        function openProductModal() {
            productModalTitle.textContent = 'Add New Product';
            productForm.reset();
            currentEditingProduct = null;
            productModal.style.display = 'flex';
        }

        function editProduct(productId) {
            const product = allProducts.find(p => p._id === productId);
            if (!product) return;
            
            currentEditingProduct = product;
            
            // Fill form with product data
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productStock').value = product.stockQuantity;
            
            productModalTitle.textContent = 'Edit Product';
            productModal.style.display = 'flex';
        }

        async function handleProductSubmit(e) {
            e.preventDefault();
            
            const productData = {
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                image: document.getElementById('productImage').value,
                description: document.getElementById('productDescription').value,
                stockQuantity: parseInt(document.getElementById('productStock').value)
            };
            
            try {
                let response;
                
                if (currentEditingProduct) {
                    // Update existing product
                    response = await fetch(`${API_BASE_URL}/products/${currentEditingProduct._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });
                } else {
                    // Create new product
                    response = await fetch(`${API_BASE_URL}/products`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });
                }
                
                if (!response.ok) throw new Error('Failed to save product');
                
                const savedProduct = await response.json();
                
                showNotification(
                    `Product ${currentEditingProduct ? 'updated' : 'created'} successfully!`,
                    'success'
                );
                
                closeAllModals();
                loadProducts(); // Reload products list
                
            } catch (error) {
                console.error('Error saving product:', error);
                showNotification('Failed to save product', 'error');
            }
        }

        async function deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) throw new Error('Failed to delete product');
                
                showNotification('Product deleted successfully!', 'success');
                loadProducts(); // Reload products list
                
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Failed to delete product', 'error');
            }
        }

        // Order management functions
        async function loadOrders() {
            try {
                const status = orderStatusFilter.value;
                const date = orderDateFilter.value;
                
                let url = `${API_BASE_URL}/orders`;
                const params = new URLSearchParams();
                
                if (status !== 'all') params.append('status', status);
                if (date) params.append('date', date);
                
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
                
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to load orders');
                
                allOrders = await response.json();
                displayOrders(allOrders);
                
            } catch (error) {
                console.error('Error loading orders:', error);
                showNotification('Failed to load orders', 'error');
                
                // Create sample orders for demo
                createSampleOrders();
            }
        }

        function createSampleOrders() {
            allOrders = [
                {
                    _id: '1',
                    orderNumber: 'ORD-001',
                    customerInfo: {
                        name: 'John Doe',
                        email: 'john@example.com',
                        phone: '123-456-7890',
                        address: '123 Main St, City, State'
                    },
                    items: [
                        { name: 'Apples', price: 2.99, quantity: 2, category: 'fruits' },
                        { name: 'Carrots', price: 1.49, quantity: 1, category: 'vegetables' }
                    ],
                    total: 7.47,
                    subtotal: 7.47,
                    tax: 0,
                    status: 'completed',
                    createdAt: new Date().toISOString(),
                    paymentMethod: 'cash'
                },
                {
                    _id: '2',
                    orderNumber: 'ORD-002',
                    customerInfo: {
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        phone: '987-654-3210',
                        address: '456 Oak Ave, City, State'
                    },
                    items: [
                        { name: 'Bananas', price: 1.99, quantity: 3, category: 'fruits' },
                        { name: 'Tomatoes', price: 3.49, quantity: 2, category: 'vegetables' }
                    ],
                    total: 12.95,
                    subtotal: 12.95,
                    tax: 0,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    paymentMethod: 'card'
                }
            ];
            displayOrders(allOrders);
        }

        function displayOrders(orders) {
            ordersTableBody.innerHTML = '';
            
            if (orders.length === 0) {
                ordersTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            No orders found matching the current filters.
                        </td>
                    </tr>
                `;
                return;
            }
            
            orders.forEach(order => {
                const row = document.createElement('tr');
                const customerName = order.customerInfo?.name || 'Unknown Customer';
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const orderDate = new Date(order.createdAt).toLocaleDateString();
                
                row.innerHTML = `
                    <td>${order.orderNumber}</td>
                    <td>${customerName}</td>
                    <td>${itemCount} items</td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td>
                        <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
                    </td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-order-details" data-id="${order._id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                ordersTableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-order-details').forEach(btn => {
                btn.addEventListener('click', function() {
                    const orderId = this.getAttribute('data-id');
                    viewOrderDetails(orderId);
                });
            });
        }

        async function viewOrderDetails(orderId) {
            try {
                const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
                if (!response.ok) throw new Error('Failed to load order details');
                
                const order = await response.json();
                displayOrderDetails(order);
                
            } catch (error) {
                console.error('Error loading order details:', error);
                showNotification('Failed to load order details', 'error');
                
                // Use sample order if API fails
                const sampleOrder = allOrders.find(o => o._id === orderId);
                if (sampleOrder) {
                    displayOrderDetails(sampleOrder);
                }
            }
        }

        function displayOrderDetails(order) {
            // Update order info
            orderDetailsNumber.textContent = order.orderNumber;
            document.getElementById('customerName').textContent = order.customerInfo?.name || 'N/A';
            document.getElementById('customerEmail').textContent = order.customerInfo?.email || 'N/A';
            document.getElementById('customerPhone').textContent = order.customerInfo?.phone || 'N/A';
            document.getElementById('customerAddress').textContent = order.customerInfo?.address || 'N/A';
            document.getElementById('orderDate').textContent = new Date(order.createdAt).toLocaleString();
            document.getElementById('paymentMethod').textContent = order.paymentMethod || 'cash';
            orderStatusSelect.value = order.status;
            
            // Update order items
            const orderItemsBody = document.getElementById('orderItemsBody');
            orderItemsBody.innerHTML = '';
            
            order.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                `;
                orderItemsBody.appendChild(row);
            });
            
            // Update totals
            document.getElementById('orderDetailsSubtotal').textContent = `$${order.subtotal.toFixed(2)}`;
            document.getElementById('orderDetailsTax').textContent = `$${order.tax.toFixed(2)}`;
            document.getElementById('orderDetailsTotal').textContent = `$${order.total.toFixed(2)}`;
            
            // Store current order ID for status update
            orderStatusSelect.setAttribute('data-order-id', order._id);
            
            orderDetailsModal.style.display = 'flex';
        }

        async function updateOrderStatus() {
            const orderId = orderStatusSelect.getAttribute('data-order-id');
            const newStatus = orderStatusSelect.value;
            
            if (!orderId) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (!response.ok) throw new Error('Failed to update order status');
                
                showNotification('Order status updated successfully!', 'success');
                
                // Reload orders and dashboard data
                loadOrders();
                loadDashboardData();
                closeAllModals();
                
            } catch (error) {
                console.error('Error updating order status:', error);
                showNotification('Failed to update order status', 'error');
            }
        }

        // Utility functions
        function showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <span>${message}</span>
                <button class="close-notification">&times;</button>
            `;
            
            // Add styles
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 1001;
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            `;
            
            // Set background color based on type
            const bgColors = {
                success: '#27ae60',
                error: '#e74c3c',
                info: '#3498db',
                warning: '#f39c12'
            };
            notification.style.background = bgColors[type] || bgColors.info;
            
            // Add to page
            document.body.appendChild(notification);
            
            // Add close button functionality
            notification.querySelector('.close-notification').addEventListener('click', () => {
                notification.remove();
            });
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Export functions for global access
        window.editProduct = editProduct;
        window.deleteProduct = deleteProduct;

import { useState, useEffect } from 'react'
import './App.css'

const LOCATIONS = [
  'Warehouse A',
  'Warehouse B',
  'Store Room',
]

function App() {
  const [page, setPage] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Steel Rod',
      sku: 'SR-001',
      category: 'Raw Material',
      reorderLevel: 20,
      reorderQuantity: 50,
      stockByLocation: {
        'Warehouse A': 50,
        'Warehouse B': 0,
        'Store Room': 0,
      },
    },
    {
      id: 2,
      name: 'Office Chair',
      sku: 'OC-002',
      category: 'Furniture',
      reorderLevel: 10,
      reorderQuantity: 20,
      stockByLocation: {
        'Warehouse A': 7,
        'Warehouse B': 0,
        'Store Room': 0,
      },
    },
    {
      id: 3,
      name: 'Printer Paper',
      sku: 'PP-003',
      category: 'Office Supplies',
      reorderLevel: 10,
      reorderQuantity: 50,
      stockByLocation: {
        'Warehouse A': 0,
        'Warehouse B': 0,
        'Store Room': 5,
      },
    },
    {
      id: 4,
      name: 'Keyboard',
      sku: 'KB-004',
      category: 'Office Supplies',
      reorderLevel: 10,
      reorderQuantity: 25,
      stockByLocation: {
        'Warehouse A': 0,
        'Warehouse B': 35,
        'Store Room': 0,
      },
    },
  ])

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem(
      'stocksenseHistory'
    )

    return savedHistory
      ? JSON.parse(savedHistory)
      : []
  })

  useEffect(() => {
    localStorage.setItem(
      'stocksenseHistory',
      JSON.stringify(history)
    )
  }, [history])

  function getTotalStock(product) {
    return Object.values(
      product.stockByLocation
    ).reduce(
      (total, stock) => total + stock,
      0
    )
  }

  function isLowStock(product) {
    return (
      getTotalStock(product) <=
      product.reorderLevel
    )
  }

  function addHistory(
    type,
    product,
    quantity,
    details = ''
  ) {
    const movement = {
      id: Date.now() + Math.random(),
      date: new Date().toLocaleString(),
      type,
      product,
      quantity,
      details,
    }

    setHistory((oldHistory) => [
      movement,
      ...oldHistory,
    ])
  }

  function updateStock(
    productId,
    location,
    quantityChange
  ) {
    setProducts((oldProducts) =>
      oldProducts.map((product) => {
        if (product.id !== productId) {
          return product
        }

        return {
          ...product,
          stockByLocation: {
            ...product.stockByLocation,
            [location]:
              (product.stockByLocation[location] ||
                0) + quantityChange,
          },
        }
      })
    )
  }

  function transferStock(
    productId,
    fromLocation,
    toLocation,
    quantity
  ) {
    setProducts((oldProducts) =>
      oldProducts.map((product) => {
        if (product.id !== productId) {
          return product
        }

        const currentFromStock =
          product.stockByLocation[
            fromLocation
          ] || 0

        return {
          ...product,
          stockByLocation: {
            ...product.stockByLocation,
            [fromLocation]:
              currentFromStock - quantity,
            [toLocation]:
              (product.stockByLocation[
                toLocation
              ] || 0) + quantity,
          },
        }
      })
    )
  }

  function adjustStock(
    productId,
    location,
    physicalStock
  ) {
    setProducts((oldProducts) =>
      oldProducts.map((product) => {
        if (product.id !== productId) {
          return product
        }

        return {
          ...product,
          stockByLocation: {
            ...product.stockByLocation,
            [location]: physicalStock,
          },
        }
      })
    )
  }

  function handleLoginSuccess() {
    setIsLoggedIn(true)
    setPage('dashboard')
  }

  function handleLogout() {
    setIsLoggedIn(false)
    setPage('home')
    setAuthMode('login')
  }

  if (!isLoggedIn && page === 'login') {
    return (
      <AuthPage
        mode={authMode}
        setMode={setAuthMode}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  return (
    <div className="app">
      <header className="navbar">
        <div
          className="logo"
          onClick={() => setPage('home')}
          style={{ cursor: 'pointer' }}
        >
          StockSense
        </div>

        <nav>
          <button
            onClick={() =>
              setPage('dashboard')
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              setPage('products')
            }
          >
            Products
          </button>

          <button
            onClick={() =>
              setPage('operations')
            }
          >
            Operations
          </button>

          <button
            onClick={() =>
              setPage('history')
            }
          >
            History
          </button>
        </nav>

        {isLoggedIn ? (
          <button
            className="login-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="login-btn"
            onClick={() => {
              setAuthMode('login')
              setPage('login')
            }}
          >
            Login
          </button>
        )}
      </header>

      {page === 'home' && (
        <main className="hero-section">
          <div className="hero-content">
            <p className="tag">
              INVENTORY MANAGEMENT SYSTEM
            </p>

            <h1>
              Manage your inventory
              <br />
              <span>smarter and easier.</span>
            </h1>

            <p className="description">
              StockSense helps businesses manage
              products, stock, receipts, deliveries,
              transfers and inventory history from one
              simple platform.
            </p>

            <div className="buttons">
              <button
                className="primary-btn"
                onClick={() =>
                  setPage('dashboard')
                }
              >
                Get Started
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  setPage('dashboard')
                }
              >
                View Dashboard
              </button>
            </div>
          </div>

          <DashboardCard
            products={products}
            isLowStock={isLowStock}
          />
        </main>
      )}

      {page === 'dashboard' && (
        <Dashboard
          products={products}
          getTotalStock={getTotalStock}
          isLowStock={isLowStock}
        />
      )}

      {page === 'products' && (
        <Products
          products={products}
          setProducts={setProducts}
          getTotalStock={getTotalStock}
          isLowStock={isLowStock}
        />
      )}

      {page === 'operations' && (
        <Operations
          products={products}
          getTotalStock={getTotalStock}
          updateStock={updateStock}
          transferStock={transferStock}
          adjustStock={adjustStock}
          addHistory={addHistory}
        />
      )}

      {page === 'history' && (
        <History history={history} />
      )}
    </div>
  )
}

function AuthPage({
  mode,
  setMode,
  onSuccess,
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    if (!email || !password) {
      setMessage(
        'Please enter email and password.'
      )
      return
    }

    if (mode === 'signup') {
      if (!name) {
        setMessage('Please enter your name.')
        return
      }

      if (password.length < 6) {
        setMessage(
          'Password must contain at least 6 characters.'
        )
        return
      }

      if (password !== confirmPassword) {
        setMessage(
          'Passwords do not match.'
        )
        return
      }

      setMessage(
        'Account created successfully. You can now login.'
      )

      setTimeout(() => {
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setMessage('')
      }, 1200)

      return
    }

    if (password.length < 6) {
      setMessage(
        'Password must contain at least 6 characters.'
      )
      return
    }

    onSuccess()
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          StockSense
        </div>

        <p className="tag">
          INVENTORY MANAGEMENT SYSTEM
        </p>

        <h1>
          {mode === 'login'
            ? 'Welcome back'
            : 'Create your account'}
        </h1>

        <p className="auth-description">
          {mode === 'login'
            ? 'Login to manage your inventory.'
            : 'Create an account to start managing inventory.'}
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {mode === 'signup' && (
            <>
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </>
          )}

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {mode === 'signup' && (
            <>
              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />
            </>
          )}

          <button
            type="submit"
            className="primary-btn auth-submit"
          >
            {mode === 'login'
              ? 'Login'
              : 'Create Account'}
          </button>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setMessage('')
                }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setMessage('')
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function DashboardCard({
  products,
  isLowStock,
}) {
  const lowStock = products.filter(
    (product) => isLowStock(product)
  ).length

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2>Stock Overview</h2>
        <span>Today</span>
      </div>

      <div className="stats">
        <div className="stat">
          <p>Total Products</p>
          <h3>{products.length}</h3>
        </div>

        <div className="stat">
          <p>Low Stock</p>
          <h3>{lowStock}</h3>
        </div>

        <div className="stat">
          <p>Receipts</p>
          <h3>12</h3>
        </div>

        <div className="stat">
          <p>Deliveries</p>
          <h3>5</h3>
        </div>
      </div>
    </div>
  )
}

function Dashboard({
  products,
  getTotalStock,
  isLowStock,
}) {
  const lowStockProducts = products.filter(
    (product) => isLowStock(product)
  )

  const totalStock = products.reduce(
    (total, product) =>
      total + getTotalStock(product),
    0
  )

  return (
    <main className="dashboard-page">
      <div className="dashboard-title">
        <div>
          <p className="tag">
            INVENTORY MANAGEMENT
          </p>

          <h1>Dashboard</h1>

          <p>
            Welcome to your StockSense inventory
            overview.
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="big-stat">
          <p>Total Products</p>
          <h2>{products.length}</h2>
          <span>
            Products in inventory
          </span>
        </div>

        <div className="big-stat">
          <p>Low Stock</p>
          <h2>
            {lowStockProducts.length}
          </h2>
          <span>Need attention</span>
        </div>

        <div className="big-stat">
          <p>Total Stock</p>
          <h2>{totalStock}</h2>
          <span>Total units</span>
        </div>

        <div className="big-stat">
          <p>Locations</p>
          <h2>{LOCATIONS.length}</h2>
          <span>
            Storage locations
          </span>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="panel">
          <h2>Current Stock</h2>

          <div className="table-row table-head">
            <span>Product</span>
            <span>Location</span>
            <span>Stock</span>
          </div>

          {products.map((product) => (
            <div
              className="table-row"
              key={product.id}
            >
              <span>{product.name}</span>

              <span>
                {LOCATIONS.map(
                  (location) => (
                    <div key={location}>
                      {location}:{' '}
                      {product.stockByLocation[
                        location
                      ] || 0}
                    </div>
                  )
                )}
              </span>

              <span
                className={
                  isLowStock(product)
                    ? 'status-low'
                    : 'status-ok'
                }
              >
                {getTotalStock(product)}
              </span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Low Stock Alert</h2>

          {lowStockProducts.length === 0 ? (
            <p>
              No low stock products.
            </p>
          ) : (
            lowStockProducts.map(
              (product) => (
                <div
                  className="alert-item"
                  key={product.id}
                >
                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    {getTotalStock(product)}{' '}
                    units left
                    <br />
                    Reorder at:{' '}
                    {product.reorderLevel}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </div>
    </main>
  )
}

function Products({
  products,
  setProducts,
  getTotalStock,
  isLowStock,
}) {
  const [showForm, setShowForm] =
    useState(false)

  const [editingId, setEditingId] =
    useState(null)

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] =
    useState('')
  const [stock, setStock] =
    useState('')
  const [location, setLocation] =
    useState('Warehouse A')
  const [reorderLevel, setReorderLevel] =
    useState('')
  const [reorderQuantity, setReorderQuantity] =
    useState('')
  const [search, setSearch] =
    useState('')
  const [filterCategory, setFilterCategory] =
    useState('All Categories')

  function clearForm() {
    setName('')
    setSku('')
    setCategory('')
    setStock('')
    setLocation('Warehouse A')
    setReorderLevel('')
    setReorderQuantity('')
    setEditingId(null)
  }

  function saveProduct() {
    if (
      !name ||
      !sku ||
      !category ||
      stock === '' ||
      reorderLevel === '' ||
      reorderQuantity === ''
    ) {
      alert(
        'Please fill all fields'
      )
      return
    }

    const productData = {
      name,
      sku,
      category,
      reorderLevel: Number(
        reorderLevel
      ),
      reorderQuantity: Number(
        reorderQuantity
      ),
    }

    if (editingId !== null) {
      setProducts(
        (oldProducts) =>
          oldProducts.map(
            (product) =>
              product.id === editingId
                ? {
                    ...product,
                    ...productData,
                  }
                : product
          )
      )
    } else {
      setProducts(
        (oldProducts) => [
          ...oldProducts,
          {
            id: Date.now(),
            ...productData,
            stockByLocation: {
              'Warehouse A':
                location ===
                'Warehouse A'
                  ? Number(stock)
                  : 0,

              'Warehouse B':
                location ===
                'Warehouse B'
                  ? Number(stock)
                  : 0,

              'Store Room':
                location ===
                'Store Room'
                  ? Number(stock)
                  : 0,
            },
          },
        ]
      )
    }

    clearForm()
    setShowForm(false)
  }

  function editProduct(product) {
    const totalStock =
      getTotalStock(product)

    const currentLocation =
      LOCATIONS.find(
        (item) =>
          (product.stockByLocation[
            item
          ] || 0) > 0
      ) || 'Warehouse A'

    setName(product.name)
    setSku(product.sku)
    setCategory(product.category)
    setStock(String(totalStock))
    setLocation(currentLocation)
    setReorderLevel(
      String(product.reorderLevel)
    )
    setReorderQuantity(
      String(product.reorderQuantity)
    )
    setEditingId(product.id)
    setShowForm(true)
  }

  function deleteProduct(id) {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this product?'
      )

    if (!confirmed) {
      return
    }

    setProducts(
      (oldProducts) =>
        oldProducts.filter(
          (product) =>
            product.id !== id
        )
    )
  }

  const filteredProducts =
    products.filter((product) => {
      const searchText =
        search.toLowerCase()

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.sku
          .toLowerCase()
          .includes(searchText)

      const matchesCategory =
        filterCategory ===
          'All Categories' ||
        product.category ===
          filterCategory

      return (
        matchesSearch &&
        matchesCategory
      )
    })

  return (
    <main className="products-page">
      <div className="products-header">
        <div>
          <p className="tag">
            INVENTORY MANAGEMENT
          </p>

          <h1>Products</h1>

          <p>
            Manage products and reorder rules.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            if (showForm) {
              clearForm()
            }

            setShowForm(!showForm)
          }}
        >
          {showForm
            ? 'Cancel'
            : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="product-form">
          <h2>
            {editingId !== null
              ? 'Edit Product'
              : 'Add New Product'}
          </h2>

          <div className="form-grid">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="SKU"
              value={sku}
              onChange={(e) =>
                setSku(e.target.value)
              }
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Category
              </option>

              <option value="Raw Material">
                Raw Material
              </option>

              <option value="Office Supplies">
                Office Supplies
              </option>

              <option value="Furniture">
                Furniture
              </option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Initial Stock"
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
            />

            <select
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            >
              {LOCATIONS.map(
                (item) => (
                  <option key={item}>
                    {item}
                  </option>
                )
              )}
            </select>

            <input
              type="number"
              min="0"
              placeholder="Reorder Level"
              value={reorderLevel}
              onChange={(e) =>
                setReorderLevel(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="1"
              placeholder="Reorder Quantity"
              value={reorderQuantity}
              onChange={(e) =>
                setReorderQuantity(
                  e.target.value
                )
              }
            />
          </div>

          <button
            className="primary-btn"
            onClick={saveProduct}
          >
            {editingId !== null
              ? 'Update Product'
              : 'Save Product'}
          </button>
        </div>
      )}

      <div className="product-tools">
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(
              e.target.value
            )
          }
        >
          <option>
            All Categories
          </option>
          <option>
            Raw Material
          </option>
          <option>
            Office Supplies
          </option>
          <option>
            Furniture
          </option>
        </select>
      </div>

      <div className="product-table">
        <div className="product-row product-head">
          <span>Product</span>
          <span>SKU</span>
          <span>Stock</span>
          <span>
            Reorder Level
          </span>
          <span>Status</span>
        </div>

        {filteredProducts.length ===
        0 ? (
          <div className="no-products">
            No products found.
          </div>
        ) : (
          filteredProducts.map(
            (product) => (
              <div
                className="product-row"
                key={product.id}
              >
                <span>
                  {product.name}
                </span>

                <span>
                  {product.sku}
                </span>

                <span>
                  {getTotalStock(
                    product
                  )}
                </span>

                <span>
                  {product.reorderLevel}
                </span>

                <span
                  className={
                    isLowStock(
                      product
                    )
                      ? 'status-low'
                      : 'status-ok'
                  }
                >
                  {isLowStock(
                    product
                  )
                    ? 'Reorder Required'
                    : 'Stock OK'}
                </span>
              </div>
            )
          )
        )}
      </div>

      <div className="product-table">
        <div className="product-row product-head">
          <span>Product</span>
          <span>Category</span>
          <span>
            Reorder Qty
          </span>
          <span>Actions</span>
        </div>

        {filteredProducts.map(
          (product) => (
            <div
              className="product-row"
              key={`action-${product.id}`}
            >
              <span>
                {product.name}
              </span>

              <span>
                {product.category}
              </span>

              <span>
                {product.reorderQuantity}
              </span>

              <span className="product-actions">
                <button
                  className="edit-btn"
                  onClick={() =>
                    editProduct(
                      product
                    )
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteProduct(
                      product.id
                    )
                  }
                >
                  Delete
                </button>
              </span>
            </div>
          )
        )}
      </div>
    </main>
  )
}

function Operations({
  products,
  getTotalStock,
  updateStock,
  transferStock,
  adjustStock,
  addHistory,
}) {
  const [operation, setOperation] =
    useState('receipt')

  const [productId, setProductId] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [
    adjustmentStock,
    setAdjustmentStock,
  ] = useState('')

  const [location, setLocation] =
    useState('')

  const [
    fromLocation,
    setFromLocation,
  ] = useState('')

  const [
    toLocation,
    setToLocation,
  ] = useState('')

  const [message, setMessage] =
    useState('')

  function resetForm() {
    setProductId('')
    setQuantity('')
    setAdjustmentStock('')
    setLocation('')
    setFromLocation('')
    setToLocation('')
  }

  function handleOperation() {
    setMessage('')

    const selectedProduct =
      products.find(
        (product) =>
          product.id ===
          Number(productId)
      )

    if (!selectedProduct) {
      setMessage(
        'Please select a product.'
      )
      return
    }

    if (operation === 'adjustment') {
      const physicalStock =
        Number(adjustmentStock)

      if (
        adjustmentStock === '' ||
        Number.isNaN(
          physicalStock
        ) ||
        physicalStock < 0
      ) {
        setMessage(
          'Please enter a valid physical stock count.'
        )
        return
      }

      if (!location) {
        setMessage(
          'Please select a location.'
        )
        return
      }

      const oldStock =
        selectedProduct
          .stockByLocation[
          location
        ] || 0

      const difference =
        physicalStock -
        oldStock

      adjustStock(
        selectedProduct.id,
        location,
        physicalStock
      )

      addHistory(
        'Adjustment',
        selectedProduct.name,
        Math.abs(
          difference
        ),
        `${location}: ${oldStock} → ${physicalStock}`
      )

      setMessage(
        `Stock adjusted successfully. ${location} stock is now ${physicalStock}.`
      )

      resetForm()
      return
    }

    const amount =
      Number(quantity)

    if (!amount || amount <= 0) {
      setMessage(
        'Please enter a quantity greater than 0.'
      )
      return
    }

    if (
      operation === 'receipt' ||
      operation === 'delivery'
    ) {
      if (!location) {
        setMessage(
          'Please select a location.'
        )
        return
      }
    }

    if (operation === 'receipt') {
      updateStock(
        selectedProduct.id,
        location,
        amount
      )

      addHistory(
        'Receipt',
        selectedProduct.name,
        amount,
        `Incoming stock → ${location}`
      )

      const oldStock =
        selectedProduct
          .stockByLocation[
          location
        ] || 0

      setMessage(
        `${amount} units received at ${location}. New stock: ${oldStock + amount}`
      )

      resetForm()
      return
    }

    if (operation === 'delivery') {
      const availableStock =
        selectedProduct
          .stockByLocation[
          location
        ] || 0

      if (
        amount >
        availableStock
      ) {
        setMessage(
          `Not enough stock at ${location}. Available stock: ${availableStock}`
        )
        return
      }

      updateStock(
        selectedProduct.id,
        location,
        -amount
      )

      addHistory(
        'Delivery',
        selectedProduct.name,
        amount,
        `Outgoing stock ← ${location}`
      )

      setMessage(
        `${amount} units delivered from ${location}. New stock: ${availableStock - amount}`
      )

      resetForm()
      return
    }

    if (operation === 'transfer') {
      if (
        !fromLocation ||
        !toLocation
      ) {
        setMessage(
          'Please select both locations.'
        )
        return
      }

      if (
        fromLocation ===
        toLocation
      ) {
        setMessage(
          'From and To locations must be different.'
        )
        return
      }

      const availableStock =
        selectedProduct
          .stockByLocation[
          fromLocation
        ] || 0

      if (
        amount >
        availableStock
      ) {
        setMessage(
          `Not enough stock at ${fromLocation}. Available stock: ${availableStock}`
        )
        return
      }

      transferStock(
        selectedProduct.id,
        fromLocation,
        toLocation,
        amount
      )

      addHistory(
        'Transfer',
        selectedProduct.name,
        amount,
        `${fromLocation} → ${toLocation}`
      )

      setMessage(
        `${amount} units transferred from ${fromLocation} to ${toLocation}.`
      )

      resetForm()
    }
  }

  const selectedProduct =
    products.find(
      (product) =>
        product.id ===
        Number(productId)
    )

  return (
    <main className="operations-page">
      <div className="operations-header">
        <div>
          <p className="tag">
            STOCK OPERATIONS
          </p>

          <h1>Operations</h1>

          <p>
            Manage receipts, deliveries,
            transfers and stock adjustments.
          </p>
        </div>
      </div>

      <div className="operation-tabs">
        <button
          className={
            operation === 'receipt'
              ? 'operation-tab active'
              : 'operation-tab'
          }
          onClick={() => {
            setOperation(
              'receipt'
            )
            setMessage('')
            resetForm()
          }}
        >
          Receipt
        </button>

        <button
          className={
            operation === 'delivery'
              ? 'operation-tab active'
              : 'operation-tab'
          }
          onClick={() => {
            setOperation(
              'delivery'
            )
            setMessage('')
            resetForm()
          }}
        >
          Delivery
        </button>

        <button
          className={
            operation === 'transfer'
              ? 'operation-tab active'
              : 'operation-tab'
          }
          onClick={() => {
            setOperation(
              'transfer'
            )
            setMessage('')
            resetForm()
          }}
        >
          Internal Transfer
        </button>

        <button
          className={
            operation ===
            'adjustment'
              ? 'operation-tab active'
              : 'operation-tab'
          }
          onClick={() => {
            setOperation(
              'adjustment'
            )
            setMessage('')
            resetForm()
          }}
        >
          Stock Adjustment
        </button>
      </div>

      <div className="operation-card">
        <h2>
          {operation ===
            'receipt' &&
            'Add Incoming Stock'}

          {operation ===
            'delivery' &&
            'Record Outgoing Stock'}

          {operation ===
            'transfer' &&
            'Transfer Stock'}

          {operation ===
            'adjustment' &&
            'Adjust Physical Stock'}
        </h2>

        <div className="operation-form">
          <label>
            Product
          </label>

          <select
            value={productId}
            onChange={(e) =>
              setProductId(
                e.target.value
              )
            }
          >
            <option value="">
              Select Product
            </option>

            {products.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} —{' '}
                  {getTotalStock(
                    item
                  )}{' '}
                  total units
                </option>
              )
            )}
          </select>

          {operation ===
          'adjustment' ? (
            <>
              <label>
                Location
              </label>

              <select
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select location
                </option>

                {LOCATIONS.map(
                  (item) => (
                    <option
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              {selectedProduct &&
                location && (
                  <div className="operation-message">
                    Current stock at{' '}
                    {location}:{' '}
                    {selectedProduct
                      .stockByLocation[
                      location
                    ] || 0}
                  </div>
                )}

              <label>
                Physical Stock Count
              </label>

              <input
                type="number"
                min="0"
                placeholder="Enter actual physical stock"
                value={
                  adjustmentStock
                }
                onChange={(e) =>
                  setAdjustmentStock(
                    e.target.value
                  )
                }
              />
            </>
          ) : (
            <>
              <label>
                Quantity
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />
            </>
          )}

          {(
            operation ===
              'receipt' ||
            operation ===
              'delivery'
          ) && (
            <>
              <label>
                Location
              </label>

              <select
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select location
                </option>

                {LOCATIONS.map(
                  (item) => (
                    <option
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              {selectedProduct &&
                location && (
                  <div className="operation-message">
                    Available at{' '}
                    {location}:{' '}
                    {selectedProduct
                      .stockByLocation[
                      location
                    ] || 0}{' '}
                    units
                  </div>
                )}
            </>
          )}

          {operation ===
            'transfer' && (
            <>
              <label>
                From Location
              </label>

              <select
                value={fromLocation}
                onChange={(e) =>
                  setFromLocation(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select location
                </option>

                {LOCATIONS.map(
                  (item) => (
                    <option
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              {selectedProduct &&
                fromLocation && (
                  <div className="operation-message">
                    Available at{' '}
                    {fromLocation}:{' '}
                    {selectedProduct
                      .stockByLocation[
                      fromLocation
                    ] || 0}{' '}
                    units
                  </div>
                )}

              <label>
                To Location
              </label>

              <select
                value={toLocation}
                onChange={(e) =>
                  setToLocation(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select location
                </option>

                {LOCATIONS.map(
                  (item) => (
                    <option
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </>
          )}

          <button
            className="primary-btn operation-submit"
            onClick={
              handleOperation
            }
          >
            {operation ===
              'receipt' &&
              'Record Receipt'}

            {operation ===
              'delivery' &&
              'Record Delivery'}

            {operation ===
              'transfer' &&
              'Transfer Stock'}

            {operation ===
              'adjustment' &&
              'Adjust Stock'}
          </button>

          {message && (
            <div className="operation-message">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function History({ history }) {
  return (
    <main className="history-page">
      <div className="history-header">
        <p className="tag">
          INVENTORY MANAGEMENT
        </p>

        <h1>
          Stock History
        </h1>

        <p>
          Complete record of inventory
          movements.
        </p>
      </div>

      <div className="history-table">
        <div className="history-row history-head">
          <span>Date</span>
          <span>Product</span>
          <span>Type</span>
          <span>Quantity</span>
          <span>Details</span>
        </div>

        {history.length === 0 ? (
          <div className="no-history">
            No stock movements yet.
          </div>
        ) : (
          history.map(
            (item) => (
              <div
                className="history-row"
                key={item.id}
              >
                <span>
                  {item.date}
                </span>

                <span>
                  {item.product}
                </span>

                <span>
                  {item.type}
                </span>

                <span>
                  {item.quantity}
                </span>

                <span>
                  {item.details}
                </span>
              </div>
            )
          )
        )}
      </div>
    </main>
  )
}

export default App
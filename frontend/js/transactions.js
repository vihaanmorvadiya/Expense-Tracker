const API_URL = 'http://localhost:5000/api'
let editingId = null
let incomeChartInstance = null
let expenseChartInstance = null

const getToken = () => localStorage.getItem('token')

if (!getToken()) {
    window.location.href = 'index.html'
}

const user = JSON.parse(localStorage.getItem('user'))
if (user) {
    document.getElementById('user-name').textContent = `Hi, ${user.name}`
}

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = 'index.html'
}

// THEME TOGGLE
function toggleTheme() {
    const html = document.documentElement
    const current = html.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', next)
    document.getElementById('theme-btn').textContent = next === 'dark' ? '☀ Light' : '☾ Dark'
}

// OPEN / CLOSE ADD MODAL
function openAddModal() {
    document.getElementById('add-modal').style.display = 'flex'
}

function closeAddModal() {
    document.getElementById('add-modal').style.display = 'none'
    document.getElementById('form-error').textContent = ''
}

// OPEN / CLOSE EDIT MODAL
function openEdit(id, title, amount, type, category, date) {
    editingId = id
    document.getElementById('edit-title').value = title
    document.getElementById('edit-amount').value = amount
    document.getElementById('edit-type').value = type
    document.getElementById('edit-category').value = category
    document.getElementById('edit-date').value = new Date(date).toISOString().split('T')[0]
    document.getElementById('edit-modal').style.display = 'flex'
}

function closeModal() {
    editingId = null
    document.getElementById('edit-modal').style.display = 'none'
}

// LOAD ALL TRANSACTIONS
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })

        const transactions = await response.json()

        if (!response.ok) {
            console.error(transactions.message)
            return
        }

        renderTransactions(transactions)
        updateSummary(transactions)
        renderCharts(transactions)

    } catch (error) {
        console.error('Failed to load transactions', error)
    }
}

// RENDER TRANSACTION LIST
function renderTransactions(transactions) {
    const list = document.getElementById('transaction-list')

    if (transactions.length === 0) {
        list.innerHTML = '<div class="empty-state">No transactions yet.<br>Click "+ Add Transaction" to get started.</div>'
        return
    }

    list.innerHTML = transactions.map(t => `
    <div class="transaction-item">
      <div class="transaction-info">
        <h4>${t.title}</h4>
        <p>${t.category} • ${new Date(t.date).toLocaleDateString()}</p>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'}₹${t.amount}
        </span>
        <div class="transaction-actions">
          <button class="btn-edit" onclick="openEdit('${t._id}', '${t.title}', ${t.amount}, '${t.type}', '${t.category}', '${t.date}')">Edit</button>
          <button class="btn-delete" onclick="deleteTransaction('${t._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('')
}

// UPDATE SUMMARY CARDS
function updateSummary(transactions) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    document.getElementById('total-income').textContent = `₹${income}`
    document.getElementById('total-expense').textContent = `₹${expense}`
    document.getElementById('balance').textContent = `₹${income - expense}`
}

// RENDER BOTH CHARTS
function renderCharts(transactions) {
    const incomeData = {}
    const expenseData = {}

    transactions.forEach(t => {
        if (t.type === 'income') {
            incomeData[t.category] = (incomeData[t.category] || 0) + t.amount
        } else {
            expenseData[t.category] = (expenseData[t.category] || 0) + t.amount
        }
    })

    renderBarChart(
        'incomeChart',
        'incomeChartInstance',
        incomeData,
        '#22c55e',
        'Income by category'
    )

    renderBarChart(
        'expenseChart',
        'expenseChartInstance',
        expenseData,
        '#ef4444',
        'Expense by category'
    )
}

function renderBarChart(canvasId, instanceKey, data, color, label) {
    const ctx = document.getElementById(canvasId).getContext('2d')
    const keys = Object.keys(data)
    const values = Object.values(data)

    if (instanceKey === 'incomeChartInstance' && incomeChartInstance) {
        incomeChartInstance.destroy()
    }
    if (instanceKey === 'expenseChartInstance' && expenseChartInstance) {
        expenseChartInstance.destroy()
    }

    if (keys.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.font = '14px Segoe UI'
        ctx.fillStyle = '#aaa'
        ctx.textAlign = 'center'
        ctx.fillText('No data to display', ctx.canvas.width / 2, 60)
        return
    }

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: keys,
            datasets: [{
                label: label,
                data: values,
                backgroundColor: color + '99',
                borderColor: color,
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Category',
                        font: { size: 11, family: 'Space Mono' },
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-text').trim()
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-text').trim(),
                        font: { size: 11 }
                    },
                    grid: { display: false },
                    border: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--border').trim()
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount (₹)',
                        font: { size: 11, family: 'Space Mono' },
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-text').trim()
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-text').trim(),
                        font: { size: 11 }
                    },
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-grid').trim()
                    },
                    border: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--border').trim()
                    }
                }
            }
        }
    })

    if (instanceKey === 'incomeChartInstance') incomeChartInstance = chart
    if (instanceKey === 'expenseChartInstance') expenseChartInstance = chart
}

// ADD TRANSACTION
async function addTransaction() {
    const title = document.getElementById('title').value
    const amount = document.getElementById('amount').value
    const type = document.getElementById('type').value
    const category = document.getElementById('category').value
    const date = document.getElementById('date').value

    if (!title || !amount || !category || !date) {
        document.getElementById('form-error').textContent = 'Please fill all fields'
        return
    }

    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title, amount: Number(amount), type, category, date })
        })

        const data = await response.json()

        if (!response.ok) {
            document.getElementById('form-error').textContent = data.message
            return
        }

        document.getElementById('title').value = ''
        document.getElementById('amount').value = ''
        document.getElementById('category').value = ''
        document.getElementById('date').value = ''
        document.getElementById('form-error').textContent = ''

        closeAddModal()
        loadTransactions()

    } catch (error) {
        document.getElementById('form-error').textContent = 'Something went wrong'
    }
}

// DELETE TRANSACTION
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        })

        if (response.ok) loadTransactions()

    } catch (error) {
        console.error('Failed to delete', error)
    }
}

// SAVE EDIT
async function saveEdit() {
    const title = document.getElementById('edit-title').value
    const amount = document.getElementById('edit-amount').value
    const type = document.getElementById('edit-type').value
    const category = document.getElementById('edit-category').value
    const date = document.getElementById('edit-date').value

    try {
        const response = await fetch(`${API_URL}/transactions/${editingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title, amount: Number(amount), type, category, date })
        })

        if (response.ok) {
            closeModal()
            loadTransactions()
        }

    } catch (error) {
        console.error('Failed to update', error)
    }
}

loadTransactions()
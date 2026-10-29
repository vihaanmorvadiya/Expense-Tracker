const Transaction = require('../models/Transaction')

// CREATE - Add new transaction
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date
    })

    res.status(201).json(transaction)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// READ ALL - Get all transactions for logged in user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })

    res.json(transactions)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// READ ONE - Get a single transaction
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    // Make sure the transaction belongs to the logged in user
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(transaction)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// UPDATE - Edit a transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.json(updatedTransaction)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE - Remove a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await Transaction.findByIdAndDelete(req.params.id)

    res.json({ message: 'Transaction removed' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
}
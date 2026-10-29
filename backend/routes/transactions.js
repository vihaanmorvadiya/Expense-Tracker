const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController')

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction)

router.route('/:id')
  .get(protect, getTransaction)
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction)

module.exports = router
const express = require('express')
const { authMiddleware } = require('../middleware/auth.middleware')

const {  addInventory, updateInventory, deleteInventory, getInventorySumByPeriod, getInventoryGeneralSums, getAllInventoryByShop } = require('./controllers')

const { getRecentlySoldItems, getRecentlyRefilledItems,
    searchInventory,
    getInventoryByItemId } = require('./controllers2')


const router = express.Router()

// All inventory routes require authentication
router.use(authMiddleware)

router.get('/shops/:shopId', getAllInventoryByShop)
router.get('/general-sums', getInventoryGeneralSums)

router.get('/recently-sold/shops/:shopId', getRecentlySoldItems)

router.get('/recently-refilled/shops/:shopId', getRecentlyRefilledItems)

router.get('/search/shops/:shopId', searchInventory)

// router.get('/search', searchInventory)

router.get('/by-item-id/:itemId', getInventoryByItemId)


router.post('', addInventory)
router.post('/sell', addInventory)
router.post('/refill', addInventory)


router.put('/:id', updateInventory)

router.delete('/:id', deleteInventory)

//search for an item






module.exports = router;
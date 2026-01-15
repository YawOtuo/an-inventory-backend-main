const express = require('express')
const app = express()
const cors = require('cors'); // Import the 'cors' package
const cookieParser = require('cookie-parser');
const models = require('./models')
const itemRoutes = require('./src/item/item.routes');
const inventoryRoutes = require('./src/inventory/routes');
const userRoutes = require('./src/user/user.routes');
const shopRoutes = require('./src/shop/shop.routes');
const notificationRoutes = require('./src/notifications/notification.routes');
const authRoutes = require('./src/auth/auth.routes');


const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')


app.use(cors());
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3002',
        'http://localhost:3001',
        "https://an-inventory.vercel.app"


    ];

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Add other CORS headers for credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

require('dotenv').config();

app.use(express.json({ extended: false }))
app.use(cookieParser());

// Auth routes (public)
app.use('/auth', authRoutes);

// Protected routes
app.use('/items', itemRoutes)
app.use('/inventories', inventoryRoutes)
app.use('/shops', shopRoutes)
app.use('/users', userRoutes)
app.use('/notifications', notificationRoutes)



app.get('/', (req, res) => {
    res.send('Hello World!')
})

models.sequelize.sync().then((req) => {
    app.listen(process.env.PORT, () => {
        console.log(`server is running on http://localhost:${process.env.PORT}`)
    })
})

module.exports = app;
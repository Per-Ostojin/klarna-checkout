import express from 'express';
import { config } from 'dotenv';
import { getProducts, getProduct } from './services/api.js';
import { createOrder, retriveOrder } from './services/klarna.js';

config();
const app = express();

app.get('/', async (req, res) => {
    try {
        const products = await getProducts();
        const markup = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        background-color: #f2f2f2;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 750px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .product {
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        padding: 10px;
                        background-color: #fff;
                        text-align: center;
                    }
                    .product img {
                        max-width: 200px;
                        max-height: 200px;
                        display: block;
                        margin: 0 auto 10px;
                    }
                    .product a {
                        color: #333;
                        text-decoration: none;
                    }
                    .product h3 {
                        margin: 0;
                    }
                    .product p {
                        margin: 5px 0;
                    }
                    .buy-now-button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #000;
                        color: #ffffff !important;  /* Använd !important för att åsidosätta andra regler */
                        text-decoration: none;
                        border-radius: 4px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 16px;
                        
}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 style="text-align: center; margin-bottom: 20px;">"BUFU" - By US For You!</h1>
                    ${products.map(p => `
                        <div class="product">
                            <a href="/products/${p.id}" class="product-link">
                                <img src="${p.image}" alt="${p.title}">
                                <div>
                                    <h3>${p.title}</h3>
                                    <p>Price: ${p.price} kr</p>
                                </div>
                            </a>
                            <a href="/checkout/${p.id}" class="buy-now-button">Köp nu</a>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
        res.send(markup);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.send('<h1>Could not fetch products</h1>');
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProduct(id);
        const klarnaResponse = await createOrder(product);

        const markup = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        background-color: #f2f2f2;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .checkout-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px;
                    }
                    .product-image {
                        width: 200px;
                        height: auto;
                        margin-bottom: 20px;
                    }
                    #klarna-checkout-container {
                        width: 100%;
                    }
                    iframe {
                        width: 100%;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <div class="checkout-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <div id="klarna-checkout-container">${klarnaResponse.html_snippet}</div>
                </div>
            </body>
            </html>
        `;
        res.send(markup);
    } catch (error) {
        console.error('Error:', error);
        res.send(`<h1>${error.message}</h1>`);
    }
});

app.get('/checkout/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProduct(id);
        const klarnaResponse = await createOrder(product);

        const markup = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        background-color: #f2f2f2;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .checkout-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px;
                    }
                    .product-image {
                        width: 200px;
                        height: auto;
                        margin-bottom: 20px;
                    }
                    #klarna-checkout-container {
                        width: 100%;
                    }
                    iframe {
                        width: 100%;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <div class="checkout-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <div id="klarna-checkout-container">${klarnaResponse.html_snippet}</div>
                </div>
            </body>
            </html>
        `;
        res.send(markup);
    } catch (error) {
        console.error('Error:', error);
        res.send(`<h1>${error.message}</h1>`);
    }
});

app.get('/confirmation', async (req, res) => {
    try {
        const { order_id } = req.query;
        if (!order_id) {
            throw new Error('Order ID is missing');
        }

        const klarnaResponse = await retriveOrder(order_id);
        const { html_snippet } = klarnaResponse;
        if (!html_snippet) {
            throw new Error('No HTML snippet found in Klarna response');
        }

        res.send(html_snippet);
    } catch (error) {
        res.status(500).send('Error retrieving Klarna order');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

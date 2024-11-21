import User from "../models/User.js";
import Product from "../models/Product.js";
import connectDB from "./mongoDB.js";
import Stripe from 'stripe';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { buffer } from 'micro';

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
connectDB();

export const config = {
    api: {
      bodyParser: false,
    },
  };

export default async function handler(req, res) {
    console.log('Webhook handler invoked');
    
    if (req.method === 'POST') {
        console.log('Received POST request');
        const rawBody = await buffer(req);
        
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            console.log('Verifying webhook signature...');
            event = stripe.webhooks.constructEvent(rawBody.toString(), sig, endpointSecret);
            console.log('Webhook verified successfully:', event.type);
        } catch (err) {
            console.error('Ошибка при верификации webhook:', err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            console.log('Processing checkout.session.completed event');
            const session = event.data.object;
            const userId = session.metadata.userId;
            const cart = JSON.parse(session.metadata.cart);
            console.log('User ID:', userId);
            console.log('Cart:', cart);

            try {
                console.log('Fetching user by ID:', userId);
                const user = await User.findById(new mongoose.Types.ObjectId(userId));
                console.log('User fetched:', user);

                const purchaseDate = new Date().toLocaleDateString('en-GB');
                console.log('Purchase date:', purchaseDate);

                const historyItems = await Promise.all(cart.map(async item => {
                    console.log('Processing cart item:', item);

                    const productId = mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : null;
                    console.log('Product ID:', productId);

                    if (productId) {
                        console.log('Fetching product by ID:', productId);
                        const product = await Product.findByIdAndDelete(new mongoose.Types.ObjectId(productId));
                        console.log('Product fetched and deleted:', product);

                        if (product) {
                            if (!product.price || !product.image) {
                                console.warn('Product missing price or image:', product);
                                return null;
                            }

                            console.log('Fetching owner by ID:', product.ownerId);
                            const owner = await User.findById(product.ownerId);

                            if (owner) {
                                console.log('Owner fetched:', owner);

                                const productIndex = owner.myProducts.findIndex(p => p.productId.toString() === product._id.toString());
                                if (productIndex !== -1) {
                                    console.log('Marking product as sold for owner');
                                    owner.myProducts[productIndex].isSold = true;
                                    await owner.save();
                                }
                            }

                            return {
                                productId: product._id,
                                price: product.price,
                                name: product.name,
                                image: product.image,
                                purchaseDate: purchaseDate,
                            };
                        }
                    } else {
                        console.warn('Invalid productId:', item.productId);
                        return null;
                    }
                }));

                const validHistoryItems = historyItems.filter(item => item !== null);
                console.log('Valid history items:', validHistoryItems);

                if (validHistoryItems.length > 0) {
                    console.log('Updating user history and clearing cart');
                    user.historyPay.push(...validHistoryItems);
                    user.cart = [];
                    await user.save();
                    console.log('User history and cart updated');
                }

                res.status(200).json({ message: 'Payment successful, cart updated and history saved.' });
            } catch (error) {
                console.error('Ошибка при обработке успешной оплаты:', error);
                res.status(500).json({ error: 'Ошибка при обработке успешной оплаты' });
            }
        } else {
            console.log('Unhandled event type:', event.type);
            res.status(400).end();
        }
    } else {
        console.log('Unsupported request method:', req.method);
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
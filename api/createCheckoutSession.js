import express from "express";
import connectDB from "./mongoDB.js";
import dotenv from "dotenv";
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';

dotenv.config();

const app = express();
app.use(express.json());
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
connectDB();

const verifyToken = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(403).json({ message: "Нет авторизации" });
        return false;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return true;
    } catch (err) {
        res.status(401).json({ message: "Неверный токен" });
        return false;
    }
};

export default async function handler(req, res) {
    if (!verifyToken(req, res)) {
        return;
    }

    const token = req.headers['authorization']?.split(' ')[1];
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    if (req.method === 'POST') {
        const { cart, totalPrice } = req.body;

        if (!cart || !totalPrice) {
            return res.status(400).json({ error: "Отсутствуют данные корзины или общая цена" });
        }

        try {
            const productIds = cart.map(item => item.productId);
            const products = await Product.find({ _id: { $in: productIds } });

            if (products.length !== cart.length) {
                return res.status(400).json({ error: "Некоторые продукты не найдены в базе" });
            }

            const lineItems = cart.map(item => {
                const product = products.find(p => p._id.toString() === item.productId);
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            images: [product.image],
                        },
                        unit_amount: Math.round(product.price * 100),
                    },
                    quantity: item.quantity
                };
            });

            const successUrl = `https://market-place-test-von1.vercel.app/components/paySuccessfull?token=${token}`;
            const cancelUrl = `https://market-place-test-von1.vercel.app/components/payFailed?token=${token}`;

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: { userId: userId, cart: JSON.stringify(cart) }
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error("Ошибка при создании сеанса Stripe:", error);
            res.status(500).json({ error: "Ошибка на сервере при создании сеанса" });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
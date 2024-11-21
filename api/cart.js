import User from '../models/User.js';
import Product from "../models/Product.js";
import connectDB from "./mongoDB.js";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';

dotenv.config();
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

    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    if (req.method === 'POST') {
        const { productId } = req.body;
        console.log("Добавление товара в корзину. userId:", userId, "productId:", productId);

        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: "Пользователь не найден" });

            const existingProduct = user.cart.find(item => item.productId.toString() === productId);
            if (existingProduct) return res.json({ success: true, status: "-", cart: user.cart });

            user.cart.push({ productId, quantity: 1 });
            await user.save();
            res.json({ success: true, status: "+", cart: user.cart });
        } catch (error) {
            console.error("Ошибка при добавлении товара в корзину:", error);
            res.status(500).json({ success: false, error: "Ошибка при обработке корзины" });
        }
    } else if (req.method === 'GET') {
        try {
            const user = await User.findById(userId).populate('cart.productId');
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            let cart = user.cart || [];
            const productIds = cart
                .filter(item => item.productId)
                .map(item => item.productId._id);

            if (productIds.length === 0) {
                await User.updateOne({ _id: userId }, { $set: { cart: [] } });
                return res.status(200).json({ cart: [] });
            }

            const existingProducts = await Product.find({ '_id': { $in: productIds } }).select('_id');
            const existingProductIds = existingProducts.map(product => product._id.toString());
            cart = cart.filter(item => item.productId && existingProductIds.includes(item.productId._id.toString()));

            await User.updateOne(
                { _id: userId },
                { $set: { cart } }
            );

            res.status(200).json({ cart });
        } catch (error) {
            console.error('Ошибка при получении корзины:', error);
            res.status(500).json({ error: 'Ошибка на сервере' });
        }
    } else if (req.method === 'DELETE') {
        const { cartItemId } = req.body;

        if (!cartItemId) {
            return res.status(400).json({ error: "ID товара в корзине не передан" });
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            user.cart = user.cart.filter(item => item._id.toString() !== cartItemId);
            await user.save();

            res.status(200).json({ success: true, cart: user.cart });
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            res.status(500).json({ error: 'Ошибка при обработке корзины' });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
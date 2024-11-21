import express from "express";
import User from '../models/User.js';
import connectDB from "./mongoDB.js";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
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

    if (req.method === 'GET') {
        try {
            const user = await User.findById(userId).populate('myProducts');

            if (!user) {
                console.log('Пользователь не найден');
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            res.status(200).json({ products: user.myProducts });
        } catch (error) {
            console.error('Ошибка при получении продуктов пользователя:', error);
            res.status(500).json({ error: 'Ошибка на сервере при получении продуктов пользователя' });
        }
    } else if (req.method === 'DELETE') {
        const { productId } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            user.myProducts = user.myProducts.filter(item => item.productId.toString() !== productId);
            await user.save();

            res.status(200).json({ message: "Продукт успешно удален из списка пользователя" });
        } catch (error) {
            console.error("Ошибка при удалении продукта из myProducts:", error);
            res.status(500).json({ error: "Ошибка сервера при удалении продукта из списка пользователя" });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
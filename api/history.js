import express from "express";
import User from '../models/User.js';
import connectDB from "./mongoDB.js";
import dotenv from "dotenv";
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
connectDB();

const verifyToken = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.error('Нет авторизации: токен отсутствует');
        res.status(403).json({ message: "Нет авторизации" });
        return false;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return true;
    } catch (err) {
        console.error('Неверный токен:', err);
        res.status(401).json({ message: "Неверный токен" });
        return false;
    }
};

export default async function handler(req, res) {
    console.log('Webhook handler invoked');
    
    if (!verifyToken(req, res)) {
        return;
    }

    const userId = req.user?.userId;
    console.log('User ID:', userId);

    if (req.method === 'GET') {
        try {
            console.log('Начинаем поиск пользователя по ID:', userId);
            const user = await User.findById(userId).populate('historyPay.productId');
            console.log('Пользователь найден:', user);

            if (!user) {
                console.error('Пользователь не найден с ID:', userId);
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const history = user.historyPay || [];
            console.log('История покупок пользователя:', history);

            if (!Array.isArray(history)) {
                console.error('Некорректная структура данных истории покупок:', history);
                return res.status(500).json({ error: 'Некорректная структура данных истории покупок' });
            }

            res.status(200).json({ history });
        } catch (error) {
            console.error('Ошибка при получении истории покупок:', error);
            res.status(500).json({ error: 'Ошибка на сервере при получении истории покупок' });
        }
    } else {
        console.error('Метод не поддерживается:', req.method);
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
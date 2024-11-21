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
        const { name, price, image } = req.body;

        if (!name || !price || !image) {
            return res.status(400).json({ error: "Все поля должны быть заполнены" });
        }

        try {
            const newProduct = new Product({
                name,
                price,
                image,
                ownerId: userId,
            });
            await newProduct.save();

            const user = await User.findById(userId);
            if (!user) {
                console.error("Пользователь не найден");
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            user.myProducts.push({
                productId: newProduct._id,
                image: newProduct.image,
                price: newProduct.price,
                name: newProduct.name,
            });
            await user.save();

            res.status(201).json({ message: "Продукт успешно создан", product: newProduct });
        } catch (error) {
            console.error("Ошибка при создании продукта:", error);
            res.status(500).json({ error: "Ошибка сервера при создании продукта" });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
import express from "express";
import mongoose from 'mongoose';
import connectDB from "./mongoDB.js";
import dotenv from "dotenv";
import Product from "../models/Product.js";
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
    if (req.method === 'GET') {
        try {
            const { page = 1, limit = 6, minPrice, maxPrice, search } = req.query;

            const filters = {};
            if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
            if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };
            if (search) filters.name = { $regex: search, $options: "i" };

            const products = await Product.find(filters)
                .skip((page - 1) * limit)
                .limit(Number(limit));

            const totalProducts = await Product.countDocuments(filters);
            const totalPages = Math.ceil(totalProducts / limit);

            res.json({ products, totalPages });
        } catch (error) {
            console.error("Ошибка при запросе продуктов:", error);
            res.status(500).json({ message: "Ошибка сервера", error: error.message });
        }
    } else if (req.method === 'DELETE') {
        if (!verifyToken(req, res)) {
            return;
        }

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "ID продукта не передан" });
        }

        try {
            const product = await Product.findByIdAndDelete(new mongoose.Types.ObjectId(productId));

            if (!product) {
                return res.status(404).json({ error: "Продукт не найден" });
            }
            res.status(200).json({ message: "Продукт успешно удален" });
        } catch (error) {
            console.error("Ошибка при удалении продукта:", error);
            res.status(500).json({ error: "Ошибка сервера при удалении продукта" });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
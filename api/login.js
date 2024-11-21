// api/register.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from "./mongoDB.js";
import User from '../models/User.js';

const app = express();
app.use(express.json());
connectDB();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ message: "Пользователь не найден" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: "Неверный пароль" });

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.status(200).json({ message: "Успешный вход", token });
        } catch (error) {
            console.error("Ошибка при входе:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
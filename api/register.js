import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './mongoDB.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
connectDB();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Пожалуйста, предоставьте все необходимые данные' });
        }

        try {
            console.log('Проверка существования пользователя...');
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log('Пользователь уже существует');
                return res.status(400).json({ message: 'Пользователь уже существует' });
            }

            console.log('Хеширование пароля...');
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({ email, password: hashedPassword });
            console.log('Сохранение нового пользователя...');
            await newUser.save();

            console.log('Создание JWT токена...');
            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({ message: 'Пользователь зарегистрирован', token });
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            res.status(500).json({ message: 'Ошибка сервера', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Метод не поддерживается' });
    }
}
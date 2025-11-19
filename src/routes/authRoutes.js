import express from 'express';
import {body, validationResult} from 'express-validator';
import prisma from '../config/db.js';
import {hashPassword, verifyPassword, generateToken} from '../utils/auth.js';

const router = express.Router();

//input validation for registration
const validateRegistration = [
    body ('username')
        .isLength({min: 3})
        .withMessage('Username must be at least 3 characters long')
        .isAlphanumeric()
        .withMessage('Username must be alphanumeric'),
    body ('email')
        .isEmail()
        .withMessage('Invalid email address'),
    body ('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long')
];

//input validation for login
const validateLogin = [
    body ('email')
        .isEmail()
        .withMessage('Invalid email address'),
    body ('password')
        .notEmpty()
        .withMessage('Password is required')
];

//post /register route
router.post('/register', validateRegistration, async (req, res, next) => {
    try{
        const errors = validationResult (req);
        if (!errors.isEmpty()){
            return res.status (400).json({errors: errors.array()});
        }

        const {username, email, password} = req.body;
        
        //check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {OR: [{username}, {email}]}
        });

        if (existingUser){
            return res.status(409).json({error: 'Username or email already in use'});
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'user'
            },
            select: {id: true, username: true, email: true, role: true}
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

//post /login route
router.post('/login', validateLogin, async (req, res, next) => {
    try {
        //check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        //find user by email
        const user = await prisma.user.findUnique({
            where: {email}
        });

        if (!user){
            return res.status(401).json({error: 'Invalid email or password'});
        }

        //verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid){
            return res.status(401).json({error: 'Invalid email or password'});
        }

        //generate JWT token
        const token = generateToken({userId: user.id });
        res.json({token, user:
            {id: user.id, username: user.username, email: user.email, role: user.role}});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
export default router;
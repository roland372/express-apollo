import jwt from 'jsonwebtoken';
export const auth = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

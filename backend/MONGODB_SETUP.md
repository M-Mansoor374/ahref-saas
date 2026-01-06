# MongoDB Atlas Setup Guide

## Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

```env
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://muhammadmansoorayub89_db_user:H6NrIKlvzRI3kIL2@cluster0.vzplx2n.mongodb.net/your-database-name?retryWrites=true&w=majority

# JWT Secret Key (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Important Notes

1. Replace `your-database-name` in MONGO_URI with your actual database name
2. Change JWT_SECRET to a strong random string in production
3. Make sure `.env` is in `.gitignore` to avoid committing credentials

## Connection String Format

```
mongodb+srv://username:password@cluster0.vzplx2n.mongodb.net/database-name?retryWrites=true&w=majority
```


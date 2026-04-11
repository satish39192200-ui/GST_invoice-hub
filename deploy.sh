#!/bin/bash

echo "🚀 Starting deployment..."

# Deploy Backend (Railway)
echo "📡 Deploying backend to Railway..."
cd backend
railway up

# Deploy Frontend (Netlify)
echo "🌐 Deploying frontend to Netlify..."
cd ../frontend
npm run build
netlify deploy --prod

echo "✅ Deployment complete!"
echo ""
echo "🔗 Frontend: https://your-app.netlify.app"
echo "🔗 Backend: https://your-app.up.railway.app"

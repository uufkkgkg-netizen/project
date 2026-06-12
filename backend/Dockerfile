FROM node:20-alpine AS builder
WORKDIR /app

# نسخ ملفات الحزم
COPY package.json ./
COPY package-lock.json* ./
COPY prisma ./prisma/

# تثبيت الحزم — install (وليس ci) لتجنب تعارض lock file
RUN npm install --legacy-peer-deps

# نسخ باقي المشروع والبناء
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- مرحلة التشغيل ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 10000
ENV NODE_ENV=production
ENV PORT=10000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]

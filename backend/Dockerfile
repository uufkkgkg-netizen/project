# ---- مرحلة البناء (Builder) ----
FROM node:20-alpine AS builder
WORKDIR /app

# تثبيت OpenSSL الضروري لعمل Prisma
RUN apk add --no-cache openssl

# نسخ ملفات الحزم
COPY package.json ./
COPY package-lock.json* ./
COPY prisma ./prisma/

# تثبيت الحزم
RUN npm install --legacy-peer-deps

# نسخ باقي المشروع
COPY . .

# توليد Prisma client
RUN npx prisma generate

# بناء التطبيق
RUN npm run build

# ---- مرحلة التشغيل (Runner) ----
FROM node:20-alpine AS runner
WORKDIR /app

# تثبيت OpenSSL في مرحلة التشغيل أيضاً لضمان استقرار Prisma
RUN apk add --no-cache openssl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 10000
ENV NODE_ENV=production
ENV PORT=10000

# التشغيل مع التأكد من إعداد قاعدة البيانات
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node dist/src/main.js"]

FROM node:20-alpine AS builder
WORKDIR /app

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

# بناء التطبيق (NestJS يُخرج إلى dist/src/main.js)
RUN npm run build

# تحقق إخراج البناء (للتشخيص في حال فشل لاحقاً)
RUN ls -la dist/ && ls -la dist/src/ || true

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

# ⭐ التغيير الحاسم: dist/src/main.js وليس dist/main.js
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node dist/src/main.js"]

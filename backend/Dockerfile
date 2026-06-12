#Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# نسخ ملفات الحزم أولاً ومجلد prisma لضمان توليد أداة Prisma Client بشكل صحيح
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت الحزم بنسخة نظيفة ومتوافقة
RUN npm ci

# نسخ باقي ملفات المشروع وبناء التطبيق
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# نسخ الملفات التنفيذية والمجلدات المطلوبة فقط لتقليل حجم الحاوية
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# أمر تشغيل خادم NestJS الخلفي
CMD ["node", "dist/main"]

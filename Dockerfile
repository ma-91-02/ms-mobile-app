# ============================================================================
#  تطبيق المستخدم (PWA) — بناء Expo للويب ثم تقديمه عبر nginx
#
#  نفس الشيفرة تُخرِج iOS و Android عبر EAS لاحقًا؛ لا شيء هنا يمنع ذلك.
# ============================================================================

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# عنوان الخادم يُضمَّن وقت البناء — تغييره يستلزم إعادة بناء لا إعادة تشغيل
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npx expo export --platform web

# ---------- التقديم ----------
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

FROM node:24-bookworm-slim AS base
RUN npm install --location=global npm pnpm
RUN apt-get update && apt-get install --no-install-recommends -qy locales tzdata \
  && ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime \
  && dpkg-reconfigure -f noninteractive tzdata \
  && apt-get autoclean -qy \
  && apt-get autoremove -qy --purge \
  && apt-get clean \
  && apt-get remove -qy --purge locales tzdata \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /.cache/*
WORKDIR /usr/workdir
COPY ["package.json", "pnpm-lock.yaml", "./"]
COPY . .
EXPOSE 4111

FROM base AS production
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile \
  && rm -rf /usr/lib/node_modules/.cache \
  && rm -rf /usr/lib/node_modules/pnpm/store \
  && rm -rf /usr/lib/node_modules
CMD ["pnpm", "mastra:dev"]

FROM base AS development
ENV NODE_ENV=development
RUN pnpm install \
  && rm -rf /usr/lib/node_modules/.cache \
  && rm -rf /usr/lib/node_modules/pnpm/store \
  && rm -rf /usr/lib/node_modules
CMD ["pnpm", "mastra:dev"]

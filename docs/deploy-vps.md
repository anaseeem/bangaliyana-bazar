# Running the bazar on your own server (VPS)

One small server is enough: 1 vCPU, 1 GB RAM, 20 GB disk, Ubuntu 24.04. Everything runs in Docker: the app (shop and API in one Node process), Postgres, and Caddy, which fetches the HTTPS certificate by itself.

```
internet → Caddy :443 → app :3001 (serves dist/ and /api) → Postgres
```

## Before you start

- A domain, with an A record pointing to the server's IP address.
- SSH access to the server.

## First install

```bash
# on the server
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER && newgrp docker

git clone <your repo url> bazar && cd bazar
cp .env.example .env
nano .env          # set DOMAIN, DB_PASSWORD, JWT_SECRET, ADMIN_PHONE, ADMIN_PASSWORD
docker compose up -d --build
```

Make the two secrets long and random: `openssl rand -hex 32` prints a good one.

Open `https://your-domain`. Log in at `/admin` with the admin phone and password from `.env`. The first start fills the database with the products, the nine artisans, three stories and the help pages.

## Updating

```bash
cd bazar && git pull && docker compose up -d --build
```

The database and uploaded photos live in the `db` volume and survive this.

## Backups

Everything worth keeping is in Postgres (orders, accounts, products, stories, and the uploaded photos).

```bash
# save
docker compose exec -T db pg_dump -U bazar bazar | gzip > backup-$(date +%F).sql.gz
# bring back
gunzip -c backup-2026-11-11.sql.gz | docker compose exec -T db psql -U bazar bazar
```

Put the save line in cron (`crontab -e`, for example `0 3 * * *`) and copy the files off the server now and then.

## Good to know

- Logs: `docker compose logs -f app`.
- Health: `https://your-domain/api/health` should say `"store":"pg"`. If it says `"file"`, `DATABASE_URL` did not reach the app.
- The admin from `.env` is created on first start. Changing `ADMIN_PASSWORD` later does not change an existing admin's password; use the ক্রেতা tab or log in and change it.
- Without Docker it also works: install Node 24 and Postgres, run `pnpm install && pnpm build`, then start `NODE_ENV=production SERVE_DIST=1 HOST=127.0.0.1 DATABASE_URL=... JWT_SECRET=... SITE_URL=https://your-domain node server/index.js` under systemd, with Caddy or nginx in front.
- On the VPS the Node server writes the page title, description, share image and product data into the HTML for product, story and shop pages. Search engines and WhatsApp or Facebook previews get the right card for each link. On Vercel this does not happen (every link shows the general site card), which is one more reason to move to the VPS.
- When you move, point the domain at the VPS and switch off the Vercel and Render projects, so there is one copy of the data.

# RentalSawari Admin: setup and how it works

The admin lives at **rentalsawari.com/admin**. It has one user (the site owner) and one password.

## Going live on Hostinger (one time)

### 1. Create the database
1. In hPanel, go to **Databases → MySQL Databases**.
2. Create a database and a database user. Give the user all privileges on that database.
3. Write down four things: the database name, the user name, the password, and the host. On Hostinger the host is usually `localhost` for apps on the same account. hPanel shows the exact value.

You don't need phpMyAdmin. On its first connection the app creates its own tables and copies the 1,418 current listings into them.

### 2. Add the settings
In hPanel, go to **Websites → your Node.js app → Environment variables**, add these, then redeploy:

| Variable | Required | What it is |
|---|---|---|
| `ADMIN_PASSWORD` | yes | The admin password. Make it long. |
| `DB_HOST` | yes | Database host from step 1 (often `localhost`) |
| `DB_USER` | yes | Database user |
| `DB_PASSWORD` | yes | Database user's password |
| `DB_NAME` | yes | Database name |
| `DB_PORT` | no | Defaults to `3306` |
| `ADMIN_SECRET` | no | A separate random string for signing the login cookie. If it isn't set, the password is used, so changing the password logs every device out. |
| `TRACKING_START` | no | Leave unset. Stats count from the day the app first connects to the database. |
| `ADMIN_DEMO` | no | Leave unset. Set to `off` before the first connect to skip the demo data. |
| `SMTP_USER`, `SMTP_PASS` | already used by the forms | Also used for the "new request / claim / report" emails to `hello@rentalsawari.com` |

### 3. Check it
1. Open `/admin` and log in.
2. The Overview should load with 1,418 listings live. If no database is connected, the admin shows a red warning at the top.
   The first connect also adds **demo data** for learning the admin: 8 listings named "… (Demo)" (never shown on the public site), 90 days of made-up stats and a few sample inbox items. When you're done, press **Kill switch: delete demo data** at the top of the Overview. It deletes only the demo rows, keeps every real visit, and the demo never comes back.
3. Visit a few listing pages on the public site in another browser or a private window. Your own browser is never counted after you log in. Within a minute or so, the visits appear in the admin.

## Where things live

| Thing | Where |
|---|---|
| Listings (the source of truth) | `listings` table. `data/companies.ts` is only the starting snapshot, plus the fallback the site uses if the database can't be reached. |
| Change history and undo | `listing_versions`. Every change, with the listing before and after. |
| Old page addresses | `listing_redirects`. A renamed listing's old URL redirects to the new one. |
| New-listing requests, claims, problem reports | `listing_requests`, `claims`, `reports` |
| Logos | `media` (stored in the database, because the app folder is replaced on every deploy) |
| Stats | `stat_events` (opens, contacts, website clicks) and `stat_shown` (daily card-view counters) |

The database code is in `lib/admin/db` (driver, schema, SQL), the business rules are in `lib/admin/repo`, and the pages are in `app/(admin)/admin`.

## What's counted

- **Shown:** a listing card was at least half visible on a list page.
- **Opened:** someone opened the listing's page. Refreshes within 30 minutes count once.
- **Contacted:** a WhatsApp click, a Call click or an inquiry form sent.
- **Website clicks:** clicks on the company's own website link. These are counted separately, not as contacts.

What is never counted:
- bots;
- your own browser (the `rs_admin` cookie set when you log in);
- automated browsers.

No IP address is stored. Each browser is a random id, hashed per day, so a person is counted once per day and can't be followed across days.

## Local development

There's no MySQL locally. Without `DB_HOST`, the app uses a JSON file at `.data/admin-store.json` (git-ignored) holding exactly the same tables. Put `ADMIN_PASSWORD=…` in `.env.local` and run `npm run dev`. Never run production on the file store: the next deploy erases it, and the admin warns about this.

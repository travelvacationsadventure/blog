# Travel Vacation Adventure — Firebase Publishing Setup

This site includes a secure Firebase admin panel at `admin.html`. Administrators can create, edit, publish, unpublish and delete articles, and upload featured images.

## 1. Create the Firebase services

In the Firebase Console:

1. Create a project and add a **Web app**.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Open **Authentication → Users** and create your admin email/password.
4. Create a **Cloud Firestore** database.
5. Enable **Storage**.
6. The supplied Firebase Web app configuration is already saved in `firebase-config.js`.

Firebase's web configuration is designed to be public. Security comes from Authentication and the included rules—not from hiding the API key.

## 2. Grant your account administrator permission

Custom admin claims must be set from a trusted environment, never from the website.

1. Firebase Console → Project settings → Service accounts → **Generate new private key**.
2. Save it temporarily in this folder as `serviceAccountKey.json`.
3. Run:

```bash
npm install
npm run make-admin -- your-email@example.com
```

4. Delete `serviceAccountKey.json` after the command succeeds. It is excluded by `.gitignore` and Firebase Hosting, but it must never be shared or uploaded.

## 3. Deploy security rules and website

Install the Firebase CLI, sign in and deploy:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy
```

Then open `/admin.html` on your domain and sign in.

The dashboard includes total/published/draft counts, article search and filtering, rich-text formatting, paragraph justification, image uploads, preview, editing, deletion and links to live articles.

## Publishing workflow

1. Sign in at `https://your-domain.com/admin.html`.
2. Add the title, slug, category, excerpt and article content.
3. Upload a featured image or paste an image URL.
4. Add the SEO title and meta description.
5. Select **Published** and press **Save article**.

Use a blank line between paragraphs. Begin a section heading with `## `.

## SEO note

The six included example articles are static, fully crawlable pages. New Firebase articles load in the browser and are accessible to search engines that render JavaScript, but client-rendering does not guarantee fast or complete indexing. For strongest SEO, add server-side rendering/static generation or generate a static HTML file and sitemap entry during publishing. Do not claim guaranteed indexing; Google makes the final indexing decision.

Before launch, update all `travelvacationadventure.com` canonical URLs if your domain is different and submit `/sitemap.xml` in Google Search Console.

(function () {
  "use strict";

  const ADMIN_EMAIL = "travelvacationsadventure@gmail.com";
  const $ = (id) => document.getElementById(id);
  const config = window.FIREBASE_CONFIG;

  if (!config) {
    console.error("FIREBASE_CONFIG is missing.");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  let cache = [];
  let unsubscribeArticles = null;

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  function message(id, text, isError = false) {
    const element = $(id);

    if (!element) {
      return;
    }

    element.textContent = text;
    element.className = `status ${isError ? "error" : "success"}`;
  }

  function updateCounts() {
    $("totalCount").textContent = cache.length;

    $("publishedCount").textContent = cache.filter(
      (article) => article.status === "published"
    ).length;

    $("draftCount").textContent = cache.filter(
      (article) => article.status === "draft"
    ).length;
  }

  function updateCounters() {
    $("titleCount").textContent = `${$("title").value.length}/100`;
    $("excerptCount").textContent = `${$("excerpt").value.length}/220`;
    $("seoCount").textContent = `${$("seoTitle").value.length}/60`;
    $("metaCount").textContent =
      `${$("metaDescription").value.length}/160`;
  }

  ["title", "excerpt", "seoTitle", "metaDescription"].forEach((id) => {
    $(id)?.addEventListener("input", updateCounters);
  });

  $("title")?.addEventListener("input", () => {
    if (!$("articleId").value) {
      $("slug").value = slugify($("title").value);
    }
  });

  // ---------------------------------------------------
  // EMAIL/PASSWORD LOGIN
  // ---------------------------------------------------

  $("loginForm").onsubmit = async (event) => {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    if (!email || !password) {
      message(
        "loginStatus",
        "Enter your email address and password.",
        true
      );
      return;
    }

    message("loginStatus", "Signing in...");

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error("Firebase authentication error:", error);

      let errorMessage = "Unable to sign in. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          errorMessage = "Incorrect email address or password.";
          break;

        case "auth/invalid-email":
          errorMessage = "Enter a valid email address.";
          break;

        case "auth/too-many-requests":
          errorMessage =
            "Too many failed attempts. Wait a few minutes and try again.";
          break;

        case "auth/network-request-failed":
          errorMessage =
            "Network error. Check your internet connection.";
          break;

        case "auth/operation-not-allowed":
          errorMessage =
            "Email/password login is not enabled in Firebase.";
          break;
      }

      message("loginStatus", errorMessage, true);
    }
  };

  $("logout").onclick = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  // ---------------------------------------------------
  // ADMIN AUTHORIZATION
  // ---------------------------------------------------

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      if (unsubscribeArticles) {
        unsubscribeArticles();
        unsubscribeArticles = null;
      }

      $("loginPanel").classList.remove("hidden");
      $("adminPanel").classList.add("hidden");
      return;
    }

    const signedInEmail = (user.email || "").trim().toLowerCase();

    if (signedInEmail !== ADMIN_EMAIL.toLowerCase()) {
      await auth.signOut();

      message(
        "loginStatus",
        "This Firebase account is not authorized to access the admin panel.",
        true
      );

      return;
    }

    $("loginPanel").classList.add("hidden");
    $("adminPanel").classList.remove("hidden");

    message("loginStatus", "");
    watchArticles();
  });

  // ---------------------------------------------------
  // LOAD AND DISPLAY ARTICLES
  // ---------------------------------------------------

  function watchArticles() {
    if (unsubscribeArticles) {
      unsubscribeArticles();
    }

    unsubscribeArticles = db
      .collection("articles")
      .orderBy("updatedAt", "desc")
      .onSnapshot(
        (snapshot) => {
          cache = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
          }));

          updateCounts();
          renderArticles();
        },
        (error) => {
          console.error("Firestore loading error:", error);

          message(
            "saveStatus",
            `Unable to load articles: ${error.message}`,
            true
          );
        }
      );
  }

  function renderArticles() {
    const searchValue = $("searchArticles").value
      .trim()
      .toLowerCase();

    const selectedStatus = $("filterStatus").value;

    const filteredArticles = cache.filter((article) => {
      const matchesStatus =
        selectedStatus === "all" ||
        article.status === selectedStatus;

      const searchableText = [
        article.title,
        article.category,
        article.slug
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(searchValue)
      );
    });

    if (!filteredArticles.length) {
      $("articles").innerHTML =
        "<p>No matching articles.</p>";
      return;
    }

    $("articles").innerHTML = filteredArticles
      .map((article) => {
        const liveView =
          article.status === "published"
            ? `
              <a
                class="ghost"
                href="post.html?slug=${encodeURIComponent(article.slug)}"
                target="_blank"
                rel="noopener"
              >
                Live view ↗
              </a>
            `
            : "";

        return `
          <article class="article">
            <span class="badge ${escapeHtml(article.status)}">
              ${escapeHtml(article.status)}
            </span>

            <h3>${escapeHtml(article.title)}</h3>

            <p>
              /${escapeHtml(article.slug)}
              ·
              ${escapeHtml(article.category)}
            </p>

            <button
              class="ghost edit"
              type="button"
              data-id="${article.id}"
            >
              Edit
            </button>

            ${liveView}

            <button
              class="ghost danger delete"
              type="button"
              data-id="${article.id}"
            >
              Delete
            </button>
          </article>
        `;
      })
      .join("");

    document.querySelectorAll(".edit").forEach((button) => {
      button.onclick = () => editArticle(button.dataset.id);
    });

    document.querySelectorAll(".delete").forEach((button) => {
      button.onclick = () => deleteArticle(button.dataset.id);
    });
  }

  $("searchArticles").oninput = renderArticles;
  $("filterStatus").onchange = renderArticles;

  // ---------------------------------------------------
  // RICH-TEXT EDITOR
  // ---------------------------------------------------

  document.querySelectorAll(".tool").forEach((button) => {
    button.onclick = () => {
      $("contentEditor").focus();

      if (button.dataset.block) {
        document.execCommand(
          "formatBlock",
          false,
          button.dataset.block
        );
        return;
      }

      if (button.dataset.cmd === "createLink") {
        const url = window.prompt(
          "Enter the complete link, including https://"
        );

        if (url) {
          document.execCommand("createLink", false, url);
        }

        return;
      }

      document.execCommand(
        button.dataset.cmd,
        false,
        null
      );
    };
  });

  // ---------------------------------------------------
  // IMAGE UPLOAD
  // ---------------------------------------------------

  async function uploadImage() {
    const file = $("imageFile").files[0];

    if (!file) {
      return $("imageUrl").value.trim();
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("The selected file must be an image.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("The image must be smaller than 8 MB.");
    }

    const safeFilename = slugify(
      file.name.replace(/\.[^.]+$/, "")
    );

    const extension =
      file.name.split(".").pop().toLowerCase();

    const storageReference = storage.ref(
      `article-images/${Date.now()}-${safeFilename}.${extension}`
    );

    const uploadTask = storageReference.put(file);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percentage = Math.round(
            snapshot.bytesTransferred /
            snapshot.totalBytes *
            100
          );

          $("uploadBar").style.width = `${percentage}%`;
        },
        reject,
        resolve
      );
    });

    return storageReference.getDownloadURL();
  }

  // ---------------------------------------------------
  // CREATE OR UPDATE ARTICLE
  // ---------------------------------------------------

  $("articleForm").onsubmit = async (event) => {
    event.preventDefault();

    const contentHtml =
      $("contentEditor").innerHTML.trim();

    const contentText =
      $("contentEditor").innerText.trim();

    if (!contentText) {
      message(
        "saveStatus",
        "Write the article body before saving.",
        true
      );
      return;
    }

    $("saveButton").disabled = true;
    message("saveStatus", "Saving article...");

    try {
      const articleId = $("articleId").value;
      const slug = slugify($("slug").value);

      if (!slug) {
        throw new Error("Enter a valid article URL slug.");
      }

      $("slug").value = slug;

      const duplicateSnapshot = await db
        .collection("articles")
        .where("slug", "==", slug)
        .get();

      const duplicateExists =
        duplicateSnapshot.docs.some(
          (document) => document.id !== articleId
        );

      if (duplicateExists) {
        throw new Error(
          "This URL slug is already used by another article."
        );
      }

      const imageUrl = await uploadImage();

      if (!imageUrl) {
        throw new Error(
          "Choose a featured image or paste an image URL."
        );
      }

      const selectedDate = $("publishedAt").value
        ? new Date($("publishedAt").value)
        : new Date();

      if (Number.isNaN(selectedDate.getTime())) {
        throw new Error("Select a valid publication date.");
      }

      const articleData = {
        title: $("title").value.trim(),
        slug,
        category: $("category").value,
        excerpt: $("excerpt").value.trim(),
        contentHtml,
        imageUrl,
        seoTitle:
          $("seoTitle").value.trim() ||
          $("title").value.trim(),
        metaDescription:
          $("metaDescription").value.trim() ||
          $("excerpt").value.trim(),
        status: $("articleStatus").value,
        publishedAt:
          firebase.firestore.Timestamp.fromDate(selectedDate),
        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      };

      if (articleId) {
        await db
          .collection("articles")
          .doc(articleId)
          .update(articleData);
      } else {
        await db.collection("articles").add({
          ...articleData,
          createdAt:
            firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      resetEditor();

      message(
        "saveStatus",
        "Article saved successfully."
      );
    } catch (error) {
      console.error("Article saving error:", error);

      message(
        "saveStatus",
        error.message || "Unable to save the article.",
        true
      );
    } finally {
      $("saveButton").disabled = false;
    }
  };

  // ---------------------------------------------------
  // EDIT ARTICLE
  // ---------------------------------------------------

  function editArticle(id) {
    const article = cache.find(
      (item) => item.id === id
    );

    if (!article) {
      return;
    }

    $("articleId").value = id;
    $("title").value = article.title || "";
    $("slug").value = article.slug || "";
    $("excerpt").value = article.excerpt || "";
    $("seoTitle").value = article.seoTitle || "";
    $("metaDescription").value =
      article.metaDescription || "";

    $("category").value =
      article.category || "Sri Lanka Guide";

    if (article.contentHtml) {
      $("contentEditor").innerHTML =
        article.contentHtml;
    } else {
      $("contentEditor").innerHTML = String(
        article.content || ""
      )
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map(
          (paragraph) =>
            `<p>${escapeHtml(paragraph)}</p>`
        )
        .join("");
    }

    $("imageUrl").value = article.imageUrl || "";
    $("imageFile").value = "";
    $("articleStatus").value =
      article.status || "draft";

    const publicationDate =
      article.publishedAt?.toDate();

    if (publicationDate) {
      const localDate = new Date(
        publicationDate.getTime() -
        publicationDate.getTimezoneOffset() * 60000
      );

      $("publishedAt").value =
        localDate.toISOString().slice(0, 16);
    } else {
      $("publishedAt").value = "";
    }

    $("formHeading").textContent = "Edit article";
    $("cancelEdit").classList.remove("hidden");

    updateCounters();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // ---------------------------------------------------
  // DELETE ARTICLE
  // ---------------------------------------------------

  async function deleteArticle(id) {
    const article = cache.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Delete “${article?.title || "this article"}” permanently?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await db
        .collection("articles")
        .doc(id)
        .delete();

      message(
        "saveStatus",
        "Article deleted successfully."
      );
    } catch (error) {
      console.error("Delete error:", error);

      message(
        "saveStatus",
        `Unable to delete article: ${error.message}`,
        true
      );
    }
  }

  // ---------------------------------------------------
  // RESET EDITOR
  // ---------------------------------------------------

  function resetEditor() {
    $("articleForm").reset();
    $("articleId").value = "";
    $("contentEditor").innerHTML = "";
    $("formHeading").textContent = "Create article";
    $("cancelEdit").classList.add("hidden");
    $("uploadBar").style.width = "0%";

    updateCounters();
  }

  $("cancelEdit").onclick = resetEditor;

  $("newArticle").onclick = () => {
    resetEditor();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // ---------------------------------------------------
  // PREVIEW
  // ---------------------------------------------------

  $("previewButton").onclick = () => {
    const previewDocument =
      $("previewFrame").contentDocument;

    const title =
      $("title").value.trim() || "Untitled article";

    const category =
      $("category").value || "Sri Lanka Guide";

    const excerpt =
      $("excerpt").value.trim();

    const imageUrl =
      $("imageUrl").value.trim();

    previewDocument.open();

    previewDocument.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">

          <style>
            body {
              margin: 0;
              color: #263b34;
              font: 18px/1.8 Georgia, serif;
            }

            .hero {
              padding: 60px 8%;
              color: white;
              background: #0b2821;
            }

            .hero small {
              text-transform: uppercase;
              letter-spacing: 0.14em;
            }

            .hero h1 {
              margin: 15px 0;
              font-size: 52px;
              line-height: 1.05;
            }

            .body {
              max-width: 760px;
              margin: 40px auto;
              padding: 0 25px;
            }

            .body img {
              width: 100%;
              max-height: 430px;
              object-fit: cover;
            }

            .body h2 {
              font-size: 32px;
            }

            @media (max-width: 650px) {
              .hero h1 {
                font-size: 36px;
              }
            }
          </style>
        </head>

        <body>
          <section class="hero">
            <small>${escapeHtml(category)}</small>
            <h1>${escapeHtml(title)}</h1>
            <p>${escapeHtml(excerpt)}</p>
          </section>

          <main class="body">
            ${
              imageUrl
                ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}">`
                : ""
            }

            ${$("contentEditor").innerHTML}
          </main>
        </body>
      </html>
    `);

    previewDocument.close();

    $("previewModal").classList.remove("hidden");
  };

  $("closePreview").onclick = () => {
    $("previewModal").classList.add("hidden");
  };

  updateCounters();
})();

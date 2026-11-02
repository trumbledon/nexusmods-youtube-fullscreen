// ==UserScript==
// @name         Nexus Mods: Enable YouTube Fullscreen
// @description  Enables the fullscreen button on YouTube videos embedded in Nexus Mods mod pages.
// @version      5.0.1
// @match        https://www.nexusmods.com/*
// @match        https://nexusmods.com/*
// @run-at       document-start
// @grant        none
// @namespace    local.nexusmods-youtube-fullscreen
// @homepageURL  https://github.com/trumbledon/nexusmods-youtube-fullscreen
// @supportURL   https://github.com/trumbledon/nexusmods-youtube-fullscreen/issues
// @downloadURL  https://raw.githubusercontent.com/trumbledon/nexusmods-youtube-fullscreen/main/nexusmods-youtube-fullscreen.user.js
// @updateURL    https://raw.githubusercontent.com/trumbledon/nexusmods-youtube-fullscreen/main/nexusmods-youtube-fullscreen.meta.js
// ==/UserScript==

(() => {
  "use strict";

  const managedFrames = new WeakSet();
  const FULLSCREEN_DIRECTIVE = /^fullscreen(?:\s|$)/i;

  function isYouTubeEmbed(iframe) {
    if (!(iframe instanceof HTMLIFrameElement)) {
      return false;
    }

    const source = iframe.getAttribute("src");
    if (!source) {
      return false;
    }

    try {
      const url = new URL(source, document.baseURI);
      const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
      const isYouTubeHost =
        hostname === "youtube.com" ||
        hostname.endsWith(".youtube.com") ||
        hostname === "youtube-nocookie.com" ||
        hostname.endsWith(".youtube-nocookie.com");

      return (
        (url.protocol === "https:" || url.protocol === "http:") &&
        isYouTubeHost &&
        (url.pathname === "/embed" || url.pathname.startsWith("/embed/"))
      );
    } catch {
      return false;
    }
  }

  function enableFullscreen(iframe) {
    if (!isYouTubeEmbed(iframe)) {
      return;
    }

    const allowDirectives = (iframe.getAttribute("allow") ?? "")
      .split(";")
      .map((directive) => directive.trim())
      .filter(Boolean);
    const fullscreenDirectives = allowDirectives.filter((directive) =>
      FULLSCREEN_DIRECTIVE.test(directive),
    );
    const hasReliablePermission =
      iframe.hasAttribute("allowfullscreen") &&
      (fullscreenDirectives.length === 0 ||
        (fullscreenDirectives.length === 1 &&
          /^fullscreen\s+\*$/i.test(fullscreenDirectives[0])));

    if (managedFrames.has(iframe) && hasReliablePermission) {
      return;
    }

    if (!iframe.parentNode) {
      return;
    }

    // Detaching destroys the old child browsing context. Reinserting the same
    // element creates a new one with fullscreen permission already present,
    // without losing event listeners or references held by Nexus.
    const placeholder = document.createComment(
      "Tampermonkey: enabling YouTube fullscreen",
    );
    iframe.replaceWith(placeholder);
    iframe.setAttribute("allowfullscreen", "");

    // An explicit fullscreen directive overrides allowfullscreen. Replace any
    // restrictive version while preserving every unrelated permission.
    if (fullscreenDirectives.length > 0) {
      const nextAllow = [
        ...allowDirectives.filter(
          (directive) => !FULLSCREEN_DIRECTIVE.test(directive),
        ),
        "fullscreen *",
      ].join("; ");
      iframe.setAttribute("allow", nextAllow);
    }

    managedFrames.add(iframe);
    placeholder.replaceWith(iframe);
  }

  function scan(node) {
    if (!(node instanceof Element)) {
      return;
    }

    enableFullscreen(node);
    node.querySelectorAll("iframe").forEach(enableFullscreen);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        enableFullscreen(mutation.target);
        continue;
      }

      mutation.addedNodes.forEach(scan);
    }
  });

  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "allow", "allowfullscreen"],
  });

  if (document.documentElement) {
    scan(document.documentElement);
  }

  // Re-check pages restored from the back/forward cache.
  window.addEventListener("pageshow", () => {
    if (document.documentElement) {
      scan(document.documentElement);
    }
  });
})();

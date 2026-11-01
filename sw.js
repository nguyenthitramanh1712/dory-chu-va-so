/* Service worker - On tap Toan 2, Giua hoc ki 1 (PWA)
   Luu trang va cac tep cua web vao may de mo nhanh o cac lan sau.
   Giong doc online (Google TTS) KHONG di qua cache nay - van phat truc
   tiep qua mang nhu binh thuong, dung nguyen hanh vi hien tai cua web. */
"use strict";

var CACHE = "dory-chu-va-so-v3";
var SHELL = [
  "../index.html",
  "../",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "favicon-32.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* addAll tung tep rieng le de 1 tep loi khong lam hong ca luot cai */
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  /* Giong doc va moi dich vu doc truc tuyen: luon lay thang tu mang,
     khong cache, khong can thiep (giu nguyen cach doc hien tai). */
  if (url.hostname.indexOf("translate.google") !== -1 ||
      url.hostname.indexOf("googleapis.com") !== -1) return;

  /* Mo trang (dieu huong): uu tien MANG truoc de luon thay ban moi nhat
     khi co mang; chi khi mat mang moi dung ban da luu (offline van hoc
     duoc). Cach nay tranh thay ban cu o lan mo dau tien sau moi cap nhat. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put("../index.html", copy); });
        }
        return res;
      }).catch(function () {
        return caches.match("../index.html", { ignoreSearch: true });
      })
    );
    return;
  }

  /* Tep tinh cung nguon (icon, manifest) va font Google: stale-while-revalidate */
  if (url.origin === self.location.origin ||
      url.hostname === "fonts.googleapis.com" ||
      url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        }).catch(function () { return hit; });
        return hit || net;
      })
    );
  }
});

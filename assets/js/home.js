/* =====================================================
   Trinetra Nursery — Homepage Helpers (index.html)
   Global navigation + loader helpers consumed by the
   dc-runtime component lifecycle on the homepage.
   ===================================================== */

function goToPlant(href, name) {
  const loader = document.getElementById("tn-loader");
  const loaderName = document.getElementById("tn-loader-name");
  if (loaderName) loaderName.textContent = name;
  if (loader) loader.style.display = "flex";
  setTimeout(function () { window.location.href = href; }, 500);
}

function tnToggleMenu() {
  const nav = document.getElementById("tn-nav");
  if (nav) nav.classList.toggle("tn-menu-open");
}

function tnCloseMenu() {
  const nav = document.getElementById("tn-nav");
  if (nav) nav.classList.remove("tn-menu-open");
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    const loader = document.getElementById("tn-loader");
    if (loader) loader.style.display = "none";
  }
});

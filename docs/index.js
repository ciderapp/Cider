document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    document.querySelector(".cider-splash").setAttribute("hidden", "true");
    document.querySelector("#app-main").removeAttribute("hidden");
  }, 1000);
});
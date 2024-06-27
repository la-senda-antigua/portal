function toggleNavigation() {
  var mobileMenu = document.getElementById("menu-opened");

  if (mobileMenu.style.display === "flex") {
    mobileMenu.style.opacity = 0;
    mobileMenu.style.left = "100%";

    setTimeout(() => {
      mobileMenu.style.display = "none";
    }, 400);
  } else {
    mobileMenu.style.display = "flex";

    setTimeout(() => {
      mobileMenu.style.opacity = 1;
      mobileMenu.style.left = 0;
    }, 10);
  }
}

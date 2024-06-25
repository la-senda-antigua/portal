function showNavMenu(event, menuId) {
  event.stopPropagation();
  var menu = document.getElementById(menuId);
  menu.style.display = "block";
  setTimeout(() => {
    menu.style.opacity = 1;
  }, 10);
}

function hideNavMenu(menuId) {
  var menu = document.getElementById(menuId);
  menu.style.opacity = 0;
  setTimeout(() => {
    menu.style.display = "none";
  }, 400);
}

(function () {
  /* Keep everything in BG variable
        augment existing variable if it exists.
    */
  if (!window.BG || typeof window.BG !== "object") {
    window.BG = {};
  }
  var BG = window.BG;

  BG.votdWriteCallback = function (json) {
    var votd = json.votd;
    var votd_html = "";
    votd_html +=
      '<div class="poweredby"> <p class="poweredby" >El verso del d&#237;a, por <a rel="nofollow" href="https://www.biblegateway.com/">BibleGateway.com</a> </p> </div>';
    votd_html +=
      '<div class="quote"><p class="text"> &ldquo;' +
      votd.content +
      '&rdquo;</p><a class="reference" href="' +
      votd.permalink +
      '"> &#8212; ' +
      votd.display_ref +
      "</a></div>";

    votd_html +=
      '<div class="legal"> <a class="copyright" href="' +
      votd.copyrightlink +
      '">' +
      votd.version +
      "</a></div>";
    document.write(votd_html);
  };

  window.BG = BG;
})();

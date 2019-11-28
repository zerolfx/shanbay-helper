setInterval(function() {
  const s1 = $("div[class^='index_UserNotesWrap']").parent();
  const s2 = $("div[class^='index_myNotesWrap']").parent();
  if (s1.length > 0) {
    s2.removeAttr('class');
    $(s2).after($(s1));
  }
}, 3000);

(function(){
  var dialog=document.getElementById('clan-apply-dialog');
  var trigger=document.getElementById('clan-apply-open');
  if(!dialog||!trigger)return;
  trigger.addEventListener('click',function(){switchTab('apply');});
  document.getElementById('clan-apply-close').addEventListener('click',function(){dialog.close();});
  dialog.addEventListener('click',function(event){
    if(event.target!==dialog)return;
    var box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
  dialog.addEventListener('close',function(){trigger.focus();});
})();

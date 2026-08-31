(function(){
  if(typeof MutationObserver==='undefined')return;
  function fixCommentNodeData(c){
    if(c&&c.nodeType===8&&c.data&&c.data.indexOf('&amp;')!==-1){
      c.data=c.data.replace(/&amp;/g,'&');
    }
  }
  var o=new MutationObserver(function(ms){
    for(var i=0;i<ms.length;i++){
      var ns=ms[i].addedNodes;
      for(var j=0;j<ns.length;j++){
        var n=ns[j];
        fixCommentNodeData(n);
        if(n.nodeType===1){
          var w=document.createTreeWalker(n,128);
          while(w.nextNode()){fixCommentNodeData(w.currentNode);}
        }
      }
    }
  });
  o.observe(document,{childList:true,subtree:true});
  var w=document.createTreeWalker(document,128);
  while(w.nextNode()){fixCommentNodeData(w.currentNode);}
  // Final sweep at DOMContentLoaded covers anything the observer queued but
  // hadn't flushed before the parser finished, then disconnect — the parser
  // is done, no more corrupted markers can appear.
  document.addEventListener('DOMContentLoaded',f...
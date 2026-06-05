(function(){
  function normalizeAddress(){
    if(location.protocol.startsWith("http")){
      history.replaceState(history.state||{}, "", "/");
    }
  }

  function initPage(hash){
    const nav=document.getElementById("nav");
    if(nav){
      nav.classList.toggle("scrolled",scrollY>10);
    }

    const items=document.querySelectorAll(".fade");
    if("IntersectionObserver" in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },{threshold:0.1});
      items.forEach(item=>observer.observe(item));
    }else{
      items.forEach(item=>item.classList.add("in"));
    }

    if(hash){
      requestAnimationFrame(()=>{
        const target=document.getElementById(hash.slice(1));
        if(target){
          target.scrollIntoView();
        }else{
          scrollTo({top:0});
        }
      });
    }else{
      scrollTo({top:0});
    }
  }

  async function loadInternalPage(url){
    try{
      const response=await fetch(url.pathname+url.search,{headers:{"X-Requested-With":"fetch"}});
      if(!response.ok){
        throw new Error(`Could not load ${url.pathname}`);
      }

      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,"text/html");
      document.title=doc.title;
      document.body.innerHTML=doc.body.innerHTML;
      normalizeAddress();
      initPage(url.hash);
    }catch(error){
      location.href=url.href;
    }
  }

  window.addEventListener("scroll",()=>{
    const nav=document.getElementById("nav");
    if(nav){
      nav.classList.toggle("scrolled",scrollY>10);
    }
  },{passive:true});

  document.addEventListener("click",event=>{
    const link=event.target.closest("a[href]");
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey){
      return;
    }

    const url=new URL(link.getAttribute("href"),location.href);
    const isHtmlPage=url.origin===location.origin&&(/\.html$/.test(url.pathname)||url.pathname==="/"||url.pathname.endsWith("/"));
    if(!isHtmlPage||link.target||link.hasAttribute("download")){
      return;
    }

    event.preventDefault();
    loadInternalPage(url);
  });

  document.addEventListener("DOMContentLoaded",()=>{
    normalizeAddress();
    initPage(location.hash);
  });
})();

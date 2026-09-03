// Per-member revote reset flow.
(function(){
  let votedNames=new Set();
  const originalRenderCollective=window.renderCollective;

  window.renderCollective=function(votes){
    votedNames=new Set(votes.map(v=>v.voter));
    originalRenderCollective(votes);
  };

  async function deleteVote(name){
    if(!backendReady())throw new Error('backend-not-ready');
    const res=await fetch(`${CONFIG.supabaseUrl}/rest/v1/band_votes?voter=eq.${encodeURIComponent(name)}`,{
      method:'DELETE',headers:apiHeaders({'Prefer':'return=minimal'})
    });
    if(!res.ok){const body=await res.text();throw new Error(`vote delete ${res.status}: ${body}`);}
  }

  document.querySelectorAll('.name-btn').forEach(btn=>{
    btn.addEventListener('click',async event=>{
      const name=btn.dataset.name;
      if(!votedNames.has(name))return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const ok=window.confirm(`${name}님은 이미 투표했습니다.\n\n기존 결과를 삭제하고 처음부터 다시 투표할까요?`);
      if(!ok)return;
      btn.disabled=true;
      try{
        await deleteVote(name);
        votedNames.delete(name);
        voterName=name;
        document.querySelectorAll('.name-btn').forEach(b=>b.classList.toggle('selected',b.dataset.name===name));
        toast(`${name}님의 기존 투표를 삭제했어요.`);
        await refreshCollective();
        start();
      }catch(err){
        console.error(err);
        toast('기존 투표 삭제에 실패했어요.');
      }finally{btn.disabled=false;}
    },true);
  });

  refreshCollective();
})();
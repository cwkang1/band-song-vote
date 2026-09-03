// Per-member revote reset flow + full reset.
(function(){
  let votedNames=new Set();
  const originalRenderCollective=window.renderCollective;

  window.renderCollective=function(votes){
    votedNames=new Set(votes.map(v=>v.voter));
    originalRenderCollective(votes);
    const box=document.getElementById('collectiveBox');
    if(!box||!votes.length)return;
    const resetAll=document.createElement('button');
    resetAll.id='resetAllVotesBtn';
    resetAll.className='secondary-btn';
    resetAll.type='button';
    resetAll.style.marginTop='10px';
    resetAll.textContent='전체 투표 초기화';
    resetAll.addEventListener('click',resetAllVotes);
    box.appendChild(resetAll);
  };

  async function deleteVote(name){
    if(!backendReady())throw new Error('backend-not-ready');
    const res=await fetch(`${CONFIG.supabaseUrl}/rest/v1/band_votes?voter=eq.${encodeURIComponent(name)}`,{
      method:'DELETE',headers:apiHeaders({'Prefer':'return=minimal'})
    });
    if(!res.ok){const body=await res.text();throw new Error(`vote delete ${res.status}: ${body}`);}
  }

  async function resetAllVotes(){
    if(!backendReady())return toast('공용 저장소가 연결되지 않았어요.');
    const ok=window.confirm('5명의 기존 투표를 전부 삭제하고 0/5명부터 다시 시작할까요?\n\n이 작업은 되돌릴 수 없습니다.');
    if(!ok)return;
    const btn=document.getElementById('resetAllVotesBtn');
    if(btn){btn.disabled=true;btn.textContent='전체 투표 삭제 중…';}
    try{
      const res=await fetch(`${CONFIG.supabaseUrl}/rest/v1/band_votes?voter=not.is.null`,{
        method:'DELETE',headers:apiHeaders({'Prefer':'return=minimal'})
      });
      if(!res.ok){const body=await res.text();throw new Error(`all vote delete ${res.status}: ${body}`);}
      votedNames.clear();
      voterName='';
      document.querySelectorAll('.name-btn').forEach(b=>{b.classList.remove('selected','already-voted');b.disabled=false;});
      startBtn.disabled=true;
      startBtn.textContent='이름을 선택하세요';
      toast('전체 투표를 초기화했어요.');
      await refreshCollective();
    }catch(err){
      console.error(err);
      toast('전체 투표 초기화에 실패했어요.');
      if(btn){btn.disabled=false;btn.textContent='전체 투표 초기화';}
    }
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
// Fair final-results viewer: no rankings before all five members vote.
(function(){
  const originalRenderCollective = window.renderCollective;

  window.renderCollective = function(votes){
    const box=document.getElementById('collectiveBox');
    if(!box)return;
    if(!backendReady()){
      box.innerHTML='<div class="collective-note">5명 공용 집계 저장소 연결 대기중</div>';
      return;
    }
    const voted=new Set(votes.map(v=>v.voter));
    const status=MEMBERS.map(name=>`<span class="member-chip ${voted.has(name)?'done':''}">${voted.has(name)?'✓ ':''}${name}</span>`).join('');
    const complete=votes.length>=MEMBERS.length;
    const action=complete
      ? '<div class="collective-note">5/5명 투표 완료 · 최종 결과가 공개됐습니다.</div><button id="viewFinalBtn" class="primary-btn" type="button">최종 결과 보기</button>'
      : `<div class="collective-note">투표 현황 ${votes.length}/5명 · 결과는 5명 모두 완료 후 공개</div>`;
    box.innerHTML=`<div class="member-status">${status}</div>${action}`;
    document.querySelectorAll('.name-btn').forEach(btn=>btn.classList.toggle('already-voted',voted.has(btn.dataset.name)));
    const btn=document.getElementById('viewFinalBtn');
    if(btn)btn.addEventListener('click',()=>showAggregatePage(votes));
  };

  window.showAggregatePage = function(votes){
    if(votes.length<MEMBERS.length)return;
    const scored=scoreVotes(votes);
    introView.classList.add('hidden');
    gameView.classList.add('hidden');
    resultView.classList.remove('hidden');
    document.querySelector('.result-head .pill').textContent='FINAL RESULT';
    document.getElementById('resultOwner').textContent='5명 종합';
    document.querySelector('.result-head h2').textContent='공연곡 최종 결과';
    document.getElementById('saveStatus').textContent='5/5명 투표 완료';
    document.getElementById('resultList').innerHTML='';
    document.getElementById('aggregateResult').innerHTML=`<div class="aggregate-head"><strong>최종 TOP 5</strong><span>전체 순위 · 점수</span></div><ol class="aggregate-list">${scored.map((s,i)=>`<li class="${i<5?'in':''}"><b>${i+1}</b><span><strong>${s.title}</strong><small>${s.artist}</small></span><em>${s.score}점</em></li>`).join('')}</ol>`;
    document.getElementById('shareBtn').style.display='none';
    document.getElementById('restartBtn').textContent='처음으로';
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const originalShowResults = window.showResults;
  window.showResults = async function(){
    document.querySelector('.result-head .pill').textContent='MY FINAL 5';
    document.querySelector('.result-head h2').textContent='내 투표 완료';
    document.getElementById('shareBtn').style.display='';
    document.getElementById('restartBtn').textContent='다른 멤버 투표';
    return originalShowResults();
  };

  refreshCollective();
})();
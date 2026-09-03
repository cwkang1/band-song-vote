// One-step-at-a-time undo for an in-progress vote.
(function(){
  let history=[];

  const undoRow=document.createElement('div');
  undoRow.className='undo-row';
  undoRow.innerHTML='<button id="undoVoteBtn" class="undo-btn" type="button" disabled>← 이전 선택</button>';
  gameView.insertBefore(undoRow,matchArea);
  const undoBtn=document.getElementById('undoVoteBtn');

  function snapshot(){
    return JSON.parse(JSON.stringify(state));
  }

  function updateUndo(){
    undoBtn.disabled=history.length===0;
  }

  function renderRestoredState(){
    if(state.stage==='first')renderFirstRound();
    else if(state.stage==='revival')renderRevival();
    else if(state.stage==='elimination')renderElimination();
    updateUndo();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  const originalStart=window.start;
  window.start=function(){
    history=[];
    originalStart();
    updateUndo();
  };

  const originalChooseFirst=window.chooseFirst;
  window.chooseFirst=function(id){
    history.push(snapshot());
    originalChooseFirst(id);
    updateUndo();
  };

  const originalChooseRevival=window.chooseRevival;
  window.chooseRevival=function(id){
    history.push(snapshot());
    originalChooseRevival(id);
    updateUndo();
  };

  undoBtn.addEventListener('click',()=>{
    if(!history.length)return;
    destroyPlayers();
    state=history.pop();
    renderRestoredState();
  });

  updateUndo();
})();
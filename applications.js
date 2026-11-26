(function(){
  'use strict';
  var unsubscribe=null,viewer='',version=0,records=[],limit=50,submitting=false;
  var labels={new:'New',reviewing:'Reviewing',accepted:'Accepted',declined:'Declined'};
  function el(id){return document.getElementById(id);}
  function user(){return typeof firebase!=='undefined'&&firebase.auth?firebase.auth().currentUser:null;}
  function allowed(){var current=user();return Boolean(current&&current.emailVerified&&typeof isStaffUser==='function'&&isStaffUser(current));}
  function db(){return typeof firebase!=='undefined'&&firebase.firestore?firebase.firestore():null;}
  function message(id,text,error){var node=el(id);node.textContent=text;node.dataset.error=String(Boolean(error));}
  function applicationLink(){var url=new URL(window.location.href);url.hash='apply';return url.href;}
  function readApplication(){
    var value={playerName:el('application-name').value.trim(),country:el('application-country').value.trim(),race:el('application-race').value,mmr:Number(el('application-mmr').value),discord:el('application-discord').value.trim(),battleNet:el('application-bnet').value.trim(),shieldBattery:el('application-shieldbattery').value.trim(),comment:el('application-comment').value.trim()};
    if(!value.country||value.country.length>80||!/^\d{1,5}$/.test(el('application-mmr').value)||!Number.isInteger(value.mmr)||value.mmr<0||value.mmr>10000||!value.playerName||value.playerName.length>80||!value.discord||value.discord.length>100||!['Terran','Zerg','Protoss','Random'].includes(value.race)||value.battleNet.length>100||value.shieldBattery.length>100||value.comment.length>2000||!el('application-consent').checked)return null;
    return value;
  }
  el('wd-application-form').addEventListener('submit',async function(event){
    event.preventDefault();if(submitting)return;
    if(el('application-website').value){message('application-message','Please leave the website field empty.',true);return;}
    var data=readApplication();if(!data){message('application-message','Please complete the required fields and confirm your consent.',true);return;}
    if(!db()){message('application-message','The application service is unavailable. Please use our clan contacts.',true);return;}
    var last=0;try{last=Number(localStorage.getItem('wd_application_last_sent')||0);}catch(ignore){}
    if(Date.now()-last<60000){message('application-message','Please wait a minute before sending another application.',true);return;}
    submitting=true;el('application-submit').disabled=true;message('application-message','Sending your application…');
    Object.assign(data,{status:'new',consent:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    try{
      await db().collection('clan_applications').add(data);
      el('wd-application-form').reset();try{localStorage.setItem('wd_application_last_sent',String(Date.now()));}catch(ignore){}
      message('application-message','Application received. A clan admin can contact you on Discord. Thank you!');
    }catch(error){message('application-message',error&&error.code==='permission-denied'?'Applications are not available yet. Please contact a clan admin on Discord.':'Your application could not be sent. Please try again or use our clan contacts.',true);}
    finally{submitting=false;el('application-submit').disabled=false;}
  });
  el('application-copy-link').addEventListener('click',async function(){
    if(!allowed())return;try{await navigator.clipboard.writeText(applicationLink());message('application-admin-message','Application link copied: '+applicationLink());}catch(error){prompt('Copy the application link:',applicationLink());}
  });
  el('application-status-filter').addEventListener('change',render);
  el('application-load-more').addEventListener('click',function(){if(!allowed())return;limit+=50;listen();});
  function text(tag,value){var node=document.createElement(tag);node.textContent=value;return node;}
  function render(){
    var list=el('application-admin-list');list.replaceChildren();if(!allowed())return;
    var filter=el('application-status-filter').value;
    var items=records.filter(function(record){return filter==='all'||record.data.status===filter;});
    if(!items.length){list.appendChild(text('p','No applications in this view.'));return;}
    items.forEach(function(record){
      var data=record.data,card=document.createElement('article');card.className='application-review';card.appendChild(text('h4',data.playerName||'Player'));
      var time=text('time',data.createdAt&&typeof data.createdAt.toDate==='function'?data.createdAt.toDate().toLocaleString('en-GB'):'Date unavailable');card.appendChild(time);
      var details=document.createElement('dl');[['Status',labels[data.status]||data.status],['Country of residence',typeof data.country==='string'&&data.country?data.country:'Not provided'],['Race',data.race],['MMR',Number.isInteger(data.mmr)?String(data.mmr):'Not provided'],['Discord',data.discord],['Battle.net',data.battleNet||'Not provided'],['ShieldBattery',data.shieldBattery||'Not provided'],['Comment',data.comment||'No comment']].forEach(function(pair){details.append(text('dt',pair[0]),text('dd',pair[1]));});card.appendChild(details);
      var select=document.createElement('select');select.setAttribute('aria-label','Application status for '+data.playerName);Object.keys(labels).forEach(function(status){var option=text('option',labels[status]);option.value=status;select.appendChild(option);});select.value=data.status||'new';
      var note=document.createElement('textarea');note.rows=2;note.maxLength=2000;note.value=typeof data.adminNote==='string'?data.adminNote:'';var noteId='application-note-'+record.id;note.id=noteId;var label=text('label','Internal admin note');label.htmlFor=noteId;card.append(label,note);
      var actions=document.createElement('div');actions.className='application-review-actions';var save=text('button','Save review');save.type='button';save.className='winter-primary';var remove=text('button','Delete');remove.type='button';remove.className='application-delete';
      save.addEventListener('click',async function(){
        if(!allowed())return;var current=user(),token=version;save.disabled=true;
        try{await db().collection('clan_applications').doc(record.id).update({status:select.value,adminNote:note.value.trim(),reviewedAt:firebase.firestore.FieldValue.serverTimestamp(),reviewedBy:current.uid});if(token===version&&allowed())message('application-admin-message','Review saved.');}
        catch(error){if(token===version&&allowed())message('application-admin-message','Could not save the review. Check your permissions and retry.',true);}finally{save.disabled=false;}
      });
      remove.addEventListener('click',async function(){if(!allowed()||!confirm('Permanently delete this application?'))return;var token=version;remove.disabled=true;try{await db().collection('clan_applications').doc(record.id).delete();if(token===version&&allowed())message('application-admin-message','Application deleted.');}catch(error){if(token===version&&allowed())message('application-admin-message','Could not delete the application.',true);}finally{remove.disabled=false;}});
      actions.append(select,save,remove);card.appendChild(actions);list.appendChild(card);
    });
  }
  function listen(){
    if(unsubscribe){unsubscribe();unsubscribe=null;}var token=++version;
    if(!allowed()||!db())return;
    message('application-admin-message','Loading applications…');
    unsubscribe=db().collection('clan_applications').orderBy('createdAt','desc').limit(limit).onSnapshot(function(snapshot){
      if(token!==version||!allowed())return;records=[];snapshot.forEach(function(doc){records.push({id:doc.id,data:doc.data()});});el('application-load-more').hidden=snapshot.size<limit;message('application-admin-message',records.length+' applications loaded.');render();
    },function(error){if(token!==version||!allowed())return;records=[];el('application-admin-list').replaceChildren();el('application-load-more').hidden=true;message('application-admin-message','Could not load applications. Publish the application rules and check admin access.',true);});
  }
  window.wdRefreshApplicationsAccess=function(){
    if(!allowed()){
      ++version;if(unsubscribe){unsubscribe();unsubscribe=null;}viewer='';records=[];limit=50;el('application-admin-list').replaceChildren();el('application-load-more').hidden=true;el('application-admin-message').textContent='';el('wd-console-applications').hidden=true;el('application-console-tab').hidden=true;return;
    }
    el('application-console-tab').hidden=false;var current=user();
    if(viewer!==current.uid||!unsubscribe){viewer=current.uid;listen();}
  };
  wdRefreshApplicationsAccess();
})();

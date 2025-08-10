(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=t(e);fetch(e.href,r)}})();async function f(){return(await fetch("/players.json")).json()}function p(o,n){const t=o.querySelectorAll("th[data-sort-key]");let s=null,e=!0;t.forEach(r=>{r.addEventListener("click",()=>{const a=r.getAttribute("data-sort-key");s===a?e=!e:(s=a,e=!0);const u=[...n].sort((y,h)=>{const c=y[a],d=h[a];return e?c-d:d-c}),i=o.querySelector("tbody");i&&o.removeChild(i),o.appendChild(l(u))})})}function l(o){const n=document.createElement("tbody");return o.forEach(t=>{const s=document.createElement("tr");s.innerHTML=`
      <td><a href="${t.liquipediaUrl??"#"}" target="_blank">${t.name}</a></td>
      <td>${t.country??""}</td>
      <td>${t.races.join(", ")}</td>
      <td>${t.participantCount}</td>
      <td>${t.ro16Count}</td>
      <td>${t.ro8Count}</td>
      <td>${t.ro4Count}</td>
      <td>${t.finalistCount}</td>
      <td>${t.championCount}</td>
      <td>${t.lastParticipation.season}/${t.lastParticipation.year}</td>
    `,n.appendChild(s)}),n}function m(o){const n=document.getElementById("app");n.innerHTML="";const t=document.createElement("table");t.innerHTML=`
    <thead>
      <tr>
        <th>Player</th>
        <th>Country</th>
        <th>Races</th>
        <th data-sort-key="participantCount" style="cursor:pointer">Participations ▲▼</th>
        <th data-sort-key="ro16Count" style="cursor:pointer">Ro16 ▲▼</th>
        <th data-sort-key="ro8Count" style="cursor:pointer">Ro8 ▲▼</th>
        <th data-sort-key="ro4Count" style="cursor:pointer">Ro4 ▲▼</th>
        <th data-sort-key="finalistCount" style="cursor:pointer">Finals ▲▼</th>
        <th data-sort-key="championCount" style="cursor:pointer">Wins ▲▼</th>
        <th>Last Participation</th>
      </tr>
    </thead>
  `,t.appendChild(l(o)),n.appendChild(t),p(t,o)}(async()=>{const o=await f();m(o)})();

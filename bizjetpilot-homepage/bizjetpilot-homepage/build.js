const { generateThumbnail } = require('./generate-thumbnails');
const fs=require('fs'),path=require('path');
const root=__dirname, out=path.join(root,'dist');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
for (const file of fs.readdirSync(root).filter(name => /^google[a-z0-9]+\.html$/.test(name))) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
const site='BizJet Pilot', desc='Independent business jet flight simulation news, reviews, tutorials and live streams for MSFS 2024 and X-Plane 12.';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
function md(s) {
  const inline = text => esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  const lines = String(s || '').split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let list = null;

  function closeParagraph() {
    if (paragraph.length) {
      output.push('<p>' + paragraph.map(inline).join('<br>') + '</p>');
      paragraph = [];
    }
  }

  function closeList() {
    if (list) {
      output.push('</' + list + '>');
      list = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeList();
      continue;
    }
    const image = trimmed.match(/^!\[([^\]]*)\]\(<?(\/?assets\/[^)>]+\.(?:png|jpg|jpeg|webp|gif))>?\)$/i);
if (image && !image[2].startsWith('/')) image[2] = '/' + image[2];

    if (image) {
      closeParagraph();
      closeList();

      output.push(
        '<figure class="article-image">' +
        '<img src="' + esc(image[2]) + '" alt="' + esc(image[1]) + '" loading="lazy">' +
        '</figure>'
      );

      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      output.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);

    if (bullet || numbered) {
      closeParagraph();

      const type = bullet ? 'ul' : 'ol';

      if (list !== type) {
        closeList();
        output.push('<' + type + '>');
        list = type;
      }

      output.push('<li>' + inline((bullet || numbered)[1]) + '</li>');
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  closeParagraph();
  closeList();

  return output.join('\n');
}
function read(type){return fs.readdirSync(path.join(root,'content',type)).filter(x=>x.endsWith('.json')).map(f=>{let x=JSON.parse(fs.readFileSync(path.join(root,'content',type,f)));x.slug=slug(x.slug||f.replace('.json',''));x.type=type;return x}).filter(x=>x.status==='published').sort((a,b)=>(b.date||'').localeCompare(a.date||''));}
const all={news:read('news'),reviews:read('reviews'),tutorials:read('tutorials'),streams:read('streams')};
async function buildStreamThumbnails() {
  for (const stream of all.streams) {
    stream.generatedThumbnail = await generateThumbnail(stream);
  }
}
async function buildWebsite() {
  await buildStreamThumbnails();
const nav=[['Home','/'],['Live Streams','/live-streams/'],['News','/news/'],['Reviews','/reviews/'],['Tutorials','/tutorials/'],['Resources','/resources/'],['Contact','/contact/']];
function shell(title,body,active='',description=desc){let links=nav.map(([n,u])=>`<a class="${active===n?'active':''}" href="${u}">${n}</a>`).join('');return `<!doctype html><html lang="en-GB"><head><meta name="google-site-verification" content="ybESyQcJPcGFHkgLvpm7PgGR7NfqB8Ahd6WCESGbWaI" /><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#062c32"><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)} | ${site}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:image" content="https://bizjetpilot.me/assets/bizjetpilot-logo.png"><title>${esc(title)} | ${site}</title><link rel="icon" href="/assets/bizjetpilot-logo.png"><link rel="stylesheet" href="/styles.css"><script defer src="/script.js"></script></head><body><a class="skip" href="#main">Skip to content</a><header class="header"><div class="wrap headrow"><a class="brand" href="/"><img src="/assets/bizjetpilot-logo.png" alt="BizJet Pilot logo"><span><strong>BizJet<span class="green">Pilot</span></strong><small>BUSINESS AVIATION · VIRTUAL FLYING</small></span></a><button class="menu" aria-expanded="false" aria-controls="nav" aria-label="Toggle navigation">☰ Menu</button><nav id="nav" aria-label="Main navigation">${links}</nav></div></header><main id="main">${body}</main><footer><div class="wrap footergrid"><div><a class="brand" href="/"><img src="/assets/bizjetpilot-logo.png" alt=""><span><strong>BizJet<span class="green">Pilot</span></strong><small>Business Aviation in the Virtual World</small></span></a><p>Independent coverage of business aviation in flight simulation.</p></div><div><h3>Explore</h3><a href="/news/">News</a><a href="/reviews/">Reviews</a><a href="/tutorials/">Tutorials</a><a href="/live-streams/">Live Streams</a></div><div><h3>Information</h3><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><p>© ${new Date().getFullYear()} BizJet Pilot</p></div></div></footer></body></html>`}
function write(url,html){const dest=path.join(out,url==='/'?'':url.replace(/^\//,''));fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'index.html'),html)}
const pill=(x)=>`<span class="pill">${esc(x)}</span>`;

function card(x){const urls={news:'news',reviews:'reviews',tutorials:'tutorials',streams:'live-streams'};const media=x.thumbnail?`<img src="${esc(x.thumbnail)}" alt="${esc(x.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`:x.type==='streams'?`<img src="${esc(x.generatedThumbnail || '/assets/livestream-template.png')}" alt="BizJet Pilot live stream artwork">`:`<div class="mediaicon">${{news:'✈',reviews:'★',tutorials:'◈'}[x.type]}</div>`;return `<a class="card" href="/${urls[x.type]}/${x.slug}/"><div class="cardmedia">${media}</div><div class="cardbody">${pill(x.category||x.type)}<h3>${esc(x.title)}</h3><p>${esc(x.summary||'')}</p><div class="news-date">${x.date ? new Date(x.date+'T12:00:00').toLocaleDateString('en-GB',{month:'long',day:'numeric',year:'numeric'}).toUpperCase() : ''}</div><span class="cardmore">Read more →</span></div></a>`}
const section=(heading,items,url)=>`<section class="section"><div class="sectionhead"><h2>${heading}</h2><a href="${url}">View all →</a></div><div class="cards">${items.length?items.slice(0,3).map(card).join(''):'<div class="empty">New content is coming soon. Check back for updates.</div>'}</div></section>`;
let hero=`<section class="hero"><div class="wrap herogrid"><div class="herotext"><span class="eyebrow">LIVE STREAMS · NEWS · REVIEWS · TUTORIALS</span><h1>Business Aviation <em>in the Virtual World</em></h1><p>News, reviews, live streams and practical tutorials covering Business&nbsp;Jets in Microsoft Flight Simulator 2024 and X-Plane 12.</p><div class="actions"><a class="btn" href="/news/">Latest news →</a><a class="btn outline" href="/live-streams/">Upcoming live streams →</a></div></div></div></section>`;
let streamFeature=`<section class="section streamfeature"><div><span class="eyebrow">FLIGHT DECK LIVE</span><h2>Join the next flight</h2><p>Route briefings, aircraft systems, online ATC and real-time flights. Stream details will appear here as broadcasts are scheduled.</p><a class="btn" href="/live-streams/">See live-stream schedule →</a></div><a href="/live-streams/"><img src="/assets/livestream-template.png" alt="BizJet Pilot live stream announcement artwork"></a></section>`;
write('/',shell('Home',hero+`<div class="wrap"><div class="quicklinks"><a href="/news/">✈ <b>Latest News</b><small>Sim and aviation updates</small></a><a href="/reviews/">☆ <b>In-depth Reviews</b><small>Aircraft and add-ons</small></a><a href="/tutorials/">◈ <b>Tutorials</b><small>Procedures and systems</small></a><a href="/live-streams/">◉ <b>Live Streams</b><small>Fly along on YouTube and Twitch</small></a></div>${section('Latest News',all.news,'/news/')}${section('Featured Reviews',all.reviews,'/reviews/')}${streamFeature}${section('Tutorials',all.tutorials,'/tutorials/')}</div>`,'Home'));
function listing(type,title,subtitle){const items=all[type];return `<div class="wrap interior"><div class="pagetop"><span class="eyebrow">BIZJET PILOT</span><h1>${title}</h1><p>${subtitle}</p></div><div class="filterrow"><label for="search">Search ${esc(title.toLowerCase())}</label><input id="search" type="search" placeholder="Search articles…" data-filter></div><div class="cards" data-list>${items.length?items.map(card).join(''):'<p>No published posts yet. Check back soon.</p>'}</div><p class="noresults" hidden>No matching articles found.</p></div>`}
for(const [type,title,subtitle] of [['news','News','Updates from business jet flight simulation, developers, aircraft and scenery releases.'],['reviews','Reviews','Independent assessments of aircraft, airports, software and flight simulation hardware.'],['tutorials','Tutorials','Practical guides to flight planning, avionics, aircraft operation and online flying.']]){write('/'+type+'/',shell(title,listing(type,title,subtitle),title));for(const x of all[type]){const body=`<div class="wrap article"><a class="back" href="/${type}/">← All ${type}</a><span class="eyebrow">${esc(x.category||type)}</span><h1>${esc(x.title)}</h1><p class="lede">${esc(x.summary||'')}</p><div class="meta">${esc(x.date||'')} ${x.simulator?' · '+esc(x.simulator):''}</div><div class="articlebody">${md(x.body)}${x.article_image?`<figure style="margin:2rem 0"><img src="${esc(x.article_image)}" alt="${esc(x.image_caption||x.title)}" style="display:block;width:100%;height:auto;border-radius:12px">${x.image_caption?`<figcaption style="margin-top:.75rem;text-align:center;font-size:.9rem;color:#64748b">${esc(x.image_caption)}</figcaption>`:''}</figure>`:''}</div>${x.youtube_url?`<p><a class="btn" rel="noopener noreferrer" target="_blank" href="${esc(x.youtube_url)}">Watch on YouTube ↗</a></p>`:''}<a class="back" href="/${type}/">← Back to ${type}</a></div>`;write('/'+type+'/'+x.slug+'/',shell(x.title,body,title,x.summary||desc));}}
write('/live-streams/',shell('Live Streams',`<div class="wrap interior"><div class="pagetop"><span class="eyebrow">FLIGHT DECK LIVE</span><h1>Live Streams</h1><p>Weekly business jet flying, flight planning, online ATC and general flying chat.</p></div><div class="streamfeature standalone"><div><h2>Next departure</h2><p>Upcoming flights will be announced here, with the route, aircraft, simulator, date and UTC time.</p><p>Follow BizJet Pilot on YouTube and Twitch for live notifications.</p></div><img src="/assets/livestream-template.png" alt="Branded stream announcement template"></div><h2>Scheduled broadcasts</h2><div class="cards">${all.streams.length?all.streams.map(card).join(''):'<p class="empty">No broadcasts announced yet.</p>'}</div></div>`,'Live Streams'));
for(const x of all.streams){write('/live-streams/'+x.slug+'/',shell(x.title,`<div class="wrap article"><a class="back" href="/live-streams/">← Live Streams</a><h1>${esc(x.title)}</h1><img class="wideimage" src="${esc(x.generatedThumbnail || '/assets/livestream-template.png')}" alt="Live stream artwork"><p>${esc(x.summary)}</p><dl class="flightdata"><dt>From</dt><dd>${esc(x.from)}</dd><dt>To</dt><dd>${esc(x.to)}</dd><dt>Aircraft</dt><dd>${esc(x.aircraft)}</dd><dt>Simulator</dt><dd>${esc(x.simulator)}</dd><dt>Date / UTC</dt><dd>${esc(x.date)} ${esc(x.time_utc)}</dd></dl>${x.youtube_url?`<a class="btn" href="${esc(x.youtube_url)}">Watch on YouTube ↗</a>`:''}${x.twitch_url?`<a class="btn outline" href="${esc(x.twitch_url)}">Watch on Twitch ↗</a>`:''}</div>`,'Live Streams'))}
write('/resources/',shell('Resources',`<div class="wrap interior"><div class="pagetop"><span class="eyebrow">FLIGHT SIM TOOLKIT</span><h1>Resources</h1><p>Useful starting points for business jet flight simulation. External services are independent of BizJet Pilot.</p></div><div class="cards">${[['Microsoft Flight Simulator','https://www.flightsimulator.com/','Official Microsoft Flight Simulator news and updates.'],['X-Plane','https://www.x-plane.com/','Official X-Plane simulator information.'],['SimBrief','https://www.simbrief.com/','Flight planning and operational flight plans.'],['VATSIM','https://vatsim.net/','Online air traffic control network.'],['Navigraph','https://navigraph.com/','Navigation charts and data services.'],['Little Navmap','https://albar965.github.io/littlenavmap.html','Free flight planning and moving-map software.']].map(([t,u,d])=>`<a class="card resource" href="${u}" target="_blank" rel="noopener noreferrer"><div class="cardbody"><h3>${t} ↗</h3><p>${d}</p></div></a>`).join('')}</div></div>`,'Resources'));
write('/contact/',shell('Contact',`<div class="wrap interior narrow"><div class="pagetop"><span class="eyebrow">GET IN TOUCH</span><h1>Contact BizJet Pilot</h1><p>News tips, review enquiries, developer announcements, collaboration opportunities or feedback are all welcome.</p></div><div class="panel"><h2>Send an enquiry</h2><p>Contact details are being finalised. Until then, please use the contact information published on BizJet Pilot's official YouTube or Twitch channel.</p><p class="note">A secure contact form will be added once a form service and destination email are configured. This page does not currently collect or submit personal information.</p></div></div>`,'Contact'));
write('/privacy/',shell('Privacy',`<div class="wrap interior narrow">
<h1>Privacy Policy</h1>
<p><strong>BizJet Pilot</strong> is a flight simulation website covering business aviation, livestreams, news, reviews and tutorials.</p>

<h2>Website hosting</h2>
<p>This website is hosted by Cloudflare Pages. Cloudflare may process technical information, including IP addresses and request logs, to deliver, secure and operate the website.</p>

<h2>Google and YouTube integration</h2>
<p>BizJet Pilot uses the YouTube Data API to manage livestreams on the BizJet Pilot YouTube channel. The integration is operated by the website owner and is not available for visitors to connect their own YouTube accounts.</p>
<p>When the website owner authorises the integration through Google, the application may access YouTube channel information and create or manage scheduled livestreams, including their titles, descriptions, scheduled times and thumbnails.</p>
<p>Google OAuth authorisation credentials are used to authenticate these requests. They are not displayed to website visitors or intentionally published in the website's source code.</p>
<p>The integration does not request access to visitors' Google accounts. Visitors do not need to sign in with Google to use this website.</p>

<h2>Data sharing and retention</h2>
<p>Authorisation credentials are used only to operate the YouTube integration. They are not sold or used for advertising. Credentials are retained while the integration is authorised and may be deleted when the integration is disconnected.</p>

<h2>Third-party services</h2>
<p>Links to YouTube, Twitch and other external services are subject to their respective privacy policies. Visitors who use those services should review the applicable policies.</p>
<p>Google's privacy policy is available at <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.</p>

<h2>Contact</h2>
<p>For questions about this privacy policy or the YouTube integration, please use the contact information provided on the BizJet Pilot website.</p>

<h2>Updates</h2>
<p>This policy may be updated when website features or data-processing practices change.</p>
</div>`,'Privacy'));
fs.copyFileSync(path.join(root,'styles.css'),path.join(out,'styles.css'));fs.copyFileSync(path.join(root,'script.js'),path.join(out,'script.js'));
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\n');console.log('Built '+Object.values(all).flat().length+' published posts into '+out);
}

buildWebsite().catch(error => {
  console.error('Website build failed:', error);
  process.exitCode = 1;
});

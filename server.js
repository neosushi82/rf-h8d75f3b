const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const TOKEN=process.env.TOKEN,DIR=process.env.DATA_DIR||'/data',USERS=['fred','fabien'];
fs.mkdirSync(DIR,{recursive:true});
const page=fs.readFileSync(path.join(__dirname,'index.html'));
const file=u=>path.join(DIR,u+'.json');
const read=u=>{try{return fs.readFileSync(file(u),'utf8')}catch{return '{}'}};
http.createServer((req,res)=>{
  const q=url.parse(req.url,true),p=q.pathname,u=q.query.u;
  const json=(c,b)=>{res.writeHead(c,{'content-type':'application/json','cache-control':'no-store'});res.end(b)};
  if(p==='/'||p==='/index.html'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(page)}
  if(!TOKEN||(req.headers['x-token']||q.query.token)!==TOKEN)return json(403,'{"error":"forbidden"}');
  if(p==='/api/export'){const o={};USERS.forEach(x=>o[x]=JSON.parse(read(x)));return json(200,JSON.stringify(o,null,1))}
  if(p==='/api/answers'&&USERS.includes(u)){
    if(req.method==='GET')return json(200,read(u));
    if(req.method==='PUT'){let b='';req.on('data',c=>{b+=c;if(b.length>2e6)req.destroy()});req.on('end',()=>{try{JSON.parse(b);fs.writeFileSync(file(u)+'.tmp',b);fs.renameSync(file(u)+'.tmp',file(u));json(200,'{"ok":true}')}catch{json(400,'{"error":"bad"}')}});return}
  }
  json(404,'{}');
}).listen(process.env.PORT||80);

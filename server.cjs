const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2'};
const server = http.createServer((req,res)=>{
  let name;
  try {name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Solicitud no válida');return;}
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Acceso denegado');return;}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end('Archivo no encontrado');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

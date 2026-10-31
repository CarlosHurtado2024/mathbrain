// Servidor de desarrollo: sirve la app compilada en dist/ (ejecuta antes «npm run build» o usa «npm run dev»).
// Con --red escucha en todas las interfaces para abrir la app desde el celular conectado a la misma Wi-Fi.
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 4173;
const network = process.argv.includes('--red');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.webmanifest':'application/manifest+json','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2'};
if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('No existe dist/. Ejecuta «npm run build» o «npm run dev».');
  process.exit(1);
}
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
server.listen(port, network ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Zuka en este equipo: http://localhost:${port}`);
  if (!network) return;
  const addresses = Object.values(os.networkInterfaces()).flat().filter(item => item && item.family === 'IPv4' && !item.internal);
  for (const item of addresses) console.log(`Desde el celular (misma Wi-Fi): http://${item.address}:${port}`);
  console.log('Por Wi-Fi la app no se puede instalar (no es HTTPS). Para instalarla usa el cable USB con «adb reverse» o el enlace de Vercel.');
});

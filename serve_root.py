import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

class RootIndexHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # Se a rota for raiz, tenta servir RootIndex.html antes de index.html
        if self.path in ('', '/'):
            if os.path.exists('RootIndex.html'):
                self.path = '/RootIndex.html'
            elif os.path.exists('index.html'):
                self.path = '/index.html'
        return super().send_head()

if __name__ == '__main__':
    # Garante que o servidor sirva arquivos a partir desta pasta
    os.chdir(os.path.dirname(__file__))
    port = 5500
    server = HTTPServer(('0.0.0.0', port), RootIndexHandler)
    print(f"Serving frontend at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
        print('\nServer stopped')

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Visualizador de Script</title>
  <style>
    body {
      background: #111;
      color: #0f0;
      font-family: monospace;
      padding: 2rem;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h2>📜 Conteúdo do script.lua:</h2>
  <pre id="output">Carregando...</pre>

  <script>
    fetch("script.lua")
      .then(response => response.text())
      .then(text => {
        document.getElementById("output").textContent = text;
      })
      .catch(err => {
        document.getElementById("output").textContent = "Erro ao carregar script.lua.";
        console.error(err);
      });
  </script>
</body>
</html>

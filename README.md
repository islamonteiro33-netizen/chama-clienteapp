# Chama Cliente Premium 1.0

App cliente em Expo/React Native com visual premium inspirado no mockup: tela inicial, categorias, produtos, carrinho, acompanhamento de pedido e perfil.

## Rodar local
```bash
npm install
npm start
```

## Gerar APK no Codemagic
1. Envie este ZIP para um repositório GitHub.
2. Conecte o repositório no Codemagic.
3. Use o workflow `android-apk` do arquivo `codemagic.yaml`.
4. Gere o APK.

## Onde configurar API
Edite `src/services/api.js` e ajuste `API_URL`.

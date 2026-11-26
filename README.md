# Web Neuron

Sitio web de Web Neuron, estudio de diseño y desarrollo web. Es un sitio estático (HTML, CSS y JavaScript sin proceso de compilación) con animaciones hechas con [GSAP](https://gsap.com/).

## Estructura

```
index.html          Contenido de la página
404.html            Página de error
css/styles.css      Estilos
js/main.js          Comportamiento y animaciones GSAP
vendor/gsap/        GSAP 3.13 (core, ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText)
assets/video/       Videos (hero y proceso)
assets/img/         Fotografías
assets/brand/       Logotipos originales, marca transparente y favicons
```

Todas las rutas son relativas, así que el sitio funciona igual en `usuario.github.io/repositorio/` que en un dominio propio.

## Ver el sitio en tu computadora

Abre una terminal en esta carpeta y ejecuta:

```powershell
python -m http.server 5173
```

Luego entra a <http://localhost:5173>. (Conviene usar un servidor local en lugar de abrir `index.html` directamente, para que los videos y las fuentes carguen igual que en línea.)

## Configurar el formulario de contacto

En `js/main.js`, al inicio, rellena **una** de estas constantes:

```js
const CONTACT_WHATSAPP = "5215512345678"; // número con lada de país, solo dígitos
const CONTACT_EMAIL = "hola@tudominio.com";
```

El formulario abre WhatsApp o tu correo con el mensaje ya redactado. Si ambas quedan vacías, el formulario valida los campos pero avisa que falta configurar el destino.

> GitHub Pages solo sirve archivos estáticos: no puede recibir formularios por sí mismo. Si más adelante quieres que el formulario envíe sin abrir WhatsApp o el correo del visitante, se puede conectar a un servicio como Formspree o Web3Forms.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `web-neuron`).
2. Desde esta carpeta:

   ```powershell
   git add .
   git commit -m "Primera versión del sitio de Web Neuron"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/web-neuron.git
   git push -u origin main
   ```

3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`, y pulsa **Save**.
4. En uno o dos minutos el sitio estará en `https://TU-USUARIO.github.io/web-neuron/`.

Para usar un dominio propio, agrégalo en **Settings → Pages → Custom domain**.

## Créditos y licencias

- Animaciones: [GSAP](https://gsap.com/) (gratuito, incluidos sus plugins, incluso para uso comercial).
- Tipografía: [Inter](https://rsms.me/inter/) vía Google Fonts.
- Fotografías y videos: [Pexels](https://www.pexels.com/license/) (licencia libre, uso comercial permitido y sin atribución obligatoria).
  - Videos: 11274330 y 13522087.
  - Fotos: 7622004, 2050137, 8534385, 39190497 y 30234378.
- Logotipo de Web Neuron: © Web Neuron.

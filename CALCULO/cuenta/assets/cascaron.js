/* Cascarón de las puertas de Reyes Connect (v3): 1 Tu momento · 2 Regístrate · 3 Tu cuenta · 4 Tu hoja.
   La herramienta se enchufa (assets/herramientas/<id>.js). Este archivo no sabe de casas ni de hijos.
   Lo único que sale del teléfono es el registro (nombre, contacto, Florida sí/no, ZIP, el permiso y el momento
   que eligió la persona), y solo si la persona lo envía. Los números de la cuenta no salen nunca. Sin analítica ni cookies. */
(function () {
  "use strict";
  var CFG = window.RC_PUERTA;               // lo pone cada index.html
  var lang = CFG.lang === "en" ? "en" : "es";
  var H = window.RC.herramientas[CFG.herramienta];
  var CLAVE = "rc-puerta-" + H.id + "-v1";
  // Raíz de la página: «/calculo/» en reyesconnectapp.com, o la carpeta donde viva en otro sitio (la calcula index.html).
  var RAIZ = window.RC_RAIZ || "./";
  // En reyesconnectapp.com el registro va a la misma dirección y se lee la respuesta. En otro dominio, como en v1b.
  var MISMA = /(^|\.)reyesconnectapp\.com$/i.test(location.hostname);
  var API_MISMA = "/api/leads/mortgage-protection";

  /* Permiso de servicio: copia EXACTA de TEXTO_CONSENT_MP_SERVICIO y CONSENT_MP_VERSION
     (reyes-connect-web/lib/seguros/mortgage-protection.ts). Si la app cambia el texto, sube la versión y se copia otra vez. */
  var PERMISO = {
    version: "mortgage-protection-web-v1-2026-08-17",
    es: "Autorizo a Reyes Connect Insurance LLC (agencia licenciada en Florida, Lic. L134385 · NPN 22085367; " +
      "agente de récord Lazaro Reyes, Lic. FL G298682 · NPN 22061550) a enviarme notificaciones de servicio sobre mi solicitud de protección " +
      "hipotecaria / seguro de vida (confirmaciones, recordatorios de cita y seguimiento) por teléfono, " +
      "llamadas con asistente de voz (incluida voz automatizada/AI), mensajes de texto (SMS/WhatsApp) y " +
      "email al número y correo que proporciono. La frecuencia de mensajes puede variar; pueden aplicar " +
      "tarifas estándar de mensajes y datos. El consentimiento no es condición de compra. Puedo responder " +
      "BAJA/STOP para cancelar los textos o darme de baja del email en cualquier momento.",
    en: "I authorize Reyes Connect Insurance LLC (Florida-licensed agency, Lic. L134385 · NPN 22085367; " +
      "agent of record Lazaro Reyes, FL Lic. G298682 · NPN 22061550) to send me service notifications about my mortgage-protection / " +
      "life-insurance request (confirmations, appointment reminders and follow-up) by phone, calls with a " +
      "voice assistant (including automated/AI voice), text messages (SMS/WhatsApp) and email at the number " +
      "and address I provide. Message frequency may vary; standard message & data rates may apply. Consent " +
      "is not a condition of purchase. I may reply STOP to cancel texts or unsubscribe from email at any time."
  };

  /* El momento de la persona (la entrevista del primer paso).
     plazo y campana viajan en el registro sin cambiar la API: plazo ya existe («Ahora | 30 días | Explorando»)
     y campana_id es una etiqueta estable para filtrar. «Ya tengo casa» no lleva plazo. */
  var MOMENTOS = {
    tengo:     { compra: false, plazo: "",           campana: "calculo-tengo-casa" },
    comprando: { compra: true,  plazo: "Ahora",      campana: "calculo-comprando" },
    voy:       { compra: true,  plazo: "30 días",    campana: "calculo-va-a-comprar" },
    aprender:  { compra: false, plazo: "Explorando", campana: "calculo-aprendiendo" }
  };
  var ORDEN = ["tengo", "comprando", "voy", "aprender"];

  /* ---------- Textos del cascarón ---------- */
  var TX = {
    es: {
      pasos: ["Tu momento", "Regístrate", "Tu cuenta", "Tu hoja"],
      p0Ante: "Comentaste CALCULO",
      p0Entrada: "Una pregunta y hacemos tu cuenta a tu medida. Tu hoja te la llevas al final.",
      p0Pregunta: "¿En qué momento estás?",
      momento: {
        tengo: ["Ya tengo casa", "Haz la cuenta con lo que debes hoy."],
        comprando: ["Estoy comprando", "Mira lo que deberías por la casa que buscas."],
        voy: ["Voy a comprar", "Prepara tu cuenta antes de comprar."],
        aprender: ["Quiero aprender", "Empieza con un ejemplo y juega con los números."]
      },
      // Para la hoja y el antetítulo: cómo se lee el momento.
      momentoLinea: { tengo: "Ya tienes casa", comprando: "Estás comprando casa", voy: "Vas a comprar casa", aprender: "Estás aprendiendo cómo funciona" },
      // Para el WhatsApp del cierre.
      momentoWa: { tengo: "ya tengo casa", comprando: "estoy comprando casa", voy: "voy a comprar casa", aprender: "quiero aprender cómo funciona" },
      cambiar: "Cambiar",
      p1Tit: "Regístrate",
      p1Entrada: {
        tengo: "Con tu registro, tu cuenta y tu hoja quedan listas en este teléfono.",
        comprando: "Con tu registro hacemos la cuenta de la casa que buscas y te llevas tu hoja.",
        voy: "Con tu registro preparas tu cuenta antes de comprar y te llevas tu hoja.",
        aprender: "Con tu registro abres el ejemplo, juegas con los números y te llevas tu hoja."
      },
      registrar: "Regístrate",
      registrarPorQue: "Así un agente con licencia del equipo de Reyes Connect puede repasar tu cuenta contigo si lo pides.",
      nombre: "Tu nombre",
      tel: "Teléfono o WhatsApp",
      correo: "Correo",
      contactoAyuda: "Teléfono o correo: con uno de los dos basta.",
      florida: "¿Vives en Florida?",
      si: "Sí",
      no: "No",
      zip: "ZIP",
      zipAyuda: "Opcional. 5 números.",
      errNombre: "Escribe tu nombre.",
      errContacto: "Pon un teléfono o un correo; con uno basta.",
      errTel: "Revisa el teléfono: van 10 números.",
      errCorreo: "Revisa el correo.",
      errFlorida: "Dinos si vives en Florida.",
      errZip: "El ZIP son 5 números, o déjalo en blanco.",
      errPermiso: "Para registrarte, marca la casilla de permiso.",
      enviando: "Enviando…",
      noEnvio: "No se pudo enviar. Revisa tu conexión y vuelve a tocar «Regístrate».",
      noGuardo: "Tu registro no se pudo guardar. Toca «Regístrate» otra vez.",
      sinRegistro: "¿Prefieres ver tus números primero? También puedes. Tu hoja sale cuando te registres.",
      primero: "Ver mis números primero",
      soloConRegistro: "Tu hoja sale cuando te registres. Es un minuto.",
      soloConRegistroEnlace: "Para bajar tu hoja en este navegador, regístrate aquí. Es un minuto.",
      privacidad: "Tus números se quedan en tu teléfono. En el registro solo pedimos tu nombre y cómo contactarte.",
      gracias: "Registro enviado. Ahora tu cuenta.",
      p2Ante: "Tu cuenta",
      ejemplo: "Ver con el ejemplo del video",
      ejemploCompra: "Ver con un ejemplo",
      ejemploRot: "Ejemplo · familia inventada",
      miHoja: "Mi hoja",
      faltaHoja: "Primero pon tus números en «Tu cuenta».",
      p3Ante: "Tu hoja",
      p3Tit: "Tu hoja",
      indicacion: "Mantén el dedo sobre la hoja para guardarla.",
      pdf: "Descargar PDF",
      compartir: "Compartir",
      pdfAyuda: "El PDF se baja a tu teléfono. Si no lo ves, mantén el dedo sobre la hoja para guardarla.",
      pdfBajando: "Bajando el PDF. Si no lo ves en tus descargas, mantén el dedo sobre la hoja para guardarla.",
      pdfPestana: "El PDF se abrió en otra pestaña. Guárdalo desde ahí, o mantén el dedo sobre la hoja.",
      compartirListo: "Listo.",
      pdfNo: "Este navegador no deja bajar el archivo. Mantén el dedo sobre la hoja para guardarla.",
      pdfEnApp: "Aquí dentro, mantén el dedo sobre la hoja para guardarla.",
      enApp: "Estás dentro de Instagram o Facebook. Aquí no se puede bajar el archivo: mantén el dedo sobre la hoja para guardarla. Para el PDF, abre la página en tu navegador:",
      abrirNav: "Copiar el enlace con mis números",
      abrirNavAyuda: "O toca ••• arriba y elige «Abrir en el navegador». Tus números van en el enlace, después del #, y esa parte no nos llega. Allá te registras y bajas el PDF.",
      copiado: "Copiado. Abre Safari o Chrome y pega el enlace.",
      noCopiado: "No se pudo copiar. Toca ••• arriba y elige «Abrir en el navegador».",
      barraHoy: "Hoy",
      cierreTit: "Tu hoja ya es tuya.",
      cierrePregunta: "¿Qué quieres hacer ahora?",
      cierreFlorida: "Para enseñarte el camino que te toca: ¿vives en Florida?",
      cierreA: "Repasarla con un agente con licencia",
      cierreANota: "Se abre WhatsApp con el equipo de Reyes Connect, con tu mensaje ya escrito.",
      cierreFuera: "Nuestra licencia es de Florida. Para tu estado te conviene un agente con licencia allí. Tu hoja es tuya igual.",
      cierreB: "Me quedo con mi hoja",
      cierreListo: "Listo. Tu hoja es tuya.",
      waTexto: "Hola. Hice mi cuenta en la página de Reyes Connect y quiero repasarla con un agente con licencia",
      waY: ", y ",
      registrarOtra: "¿Aún no te registras?",
      borrar: "Borrar mis números de este teléfono",
      borrado: "Listo. Se borraron de este teléfono.",
      nota: "Es un cálculo educativo hecho con tus números, para que veas tu cuenta clara.",
      licencia: "Reyes Connect Insurance · FL License #G298682 · NPN #22061550. No afiliado al gobierno.",
      contacto: "hello@reyesconnectapp.com · WhatsApp +1 305-910-7614",
      otroIdioma: "English", otroHref: "en/",
      hoja: {
        fecha: function (d) { return d.toLocaleDateString("es-US", { day: "numeric", month: "long", year: "numeric" }); },
        para: "Para: ",
        numeros: "Tus números",
        grafica: "Cómo baja, año por año",
        totales: "Lo que tu familia tendría que cubrir si faltas",
        aprendisteTit: "Hoy aprendiste",
        aprendiste: "Lo que tu familia tendría que cubrir si faltas baja cada año. Tu cuenta se saca con los números de hoy. Revisa tu cuenta cuando cambie tu vida.",
        aviso: "Cálculo educativo hecho en tu teléfono con tus números.",
        pedir: "Para repasarla con un agente con licencia en Florida: equipo de Reyes Connect, WhatsApp +1 305-910-7614 o hello@reyesconnectapp.com.",
        archivo: "mi-cuenta-de-hoy.pdf"
      }
    },
    en: {
      pasos: ["Your moment", "Sign up", "Your number", "Your sheet"],
      p0Ante: "You commented CALCULO",
      p0Entrada: "One question and we tailor your number to you. You keep your sheet at the end.",
      p0Pregunta: "Where are you right now?",
      momento: {
        tengo: ["I already own a home", "Run your number with what you owe today."],
        comprando: ["I'm buying", "See what you would owe on the home you're looking for."],
        voy: ["I'm going to buy", "Get your number ready before you buy."],
        aprender: ["I want to learn", "Start with an example and play with the numbers."]
      },
      momentoLinea: { tengo: "You already own a home", comprando: "You're buying a home", voy: "You're going to buy a home", aprender: "You're learning how it works" },
      momentoWa: { tengo: "I already own a home", comprando: "I'm buying a home", voy: "I'm going to buy a home", aprender: "I want to learn how it works" },
      cambiar: "Change",
      p1Tit: "Sign up",
      p1Entrada: {
        tengo: "Once you sign up, your number and your sheet are ready on this phone.",
        comprando: "Once you sign up, we run the number for the home you're looking for and you keep your sheet.",
        voy: "Once you sign up, you get your number ready before you buy and you keep your sheet.",
        aprender: "Once you sign up, you open the example, play with the numbers and keep your sheet."
      },
      registrar: "Sign up",
      registrarPorQue: "That way a licensed agent on the Reyes Connect team can go over your number with you if you ask.",
      nombre: "Your name",
      tel: "Phone or WhatsApp",
      correo: "Email",
      contactoAyuda: "Phone or email: one of the two is enough.",
      florida: "Do you live in Florida?",
      si: "Yes",
      no: "No",
      zip: "ZIP",
      zipAyuda: "Optional. 5 digits.",
      errNombre: "Write your name.",
      errContacto: "Enter a phone or an email; one is enough.",
      errTel: "Check the phone: it takes 10 digits.",
      errCorreo: "Check the email.",
      errFlorida: "Tell us whether you live in Florida.",
      errZip: "The ZIP is 5 digits, or leave it blank.",
      errPermiso: "To sign up, check the permission box.",
      enviando: "Sending…",
      noEnvio: "It couldn't be sent. Check your connection and tap «Sign up» again.",
      noGuardo: "Your sign-up couldn't be saved. Tap «Sign up» again.",
      sinRegistro: "Would you rather see your numbers first? You can. Your sheet comes once you sign up.",
      primero: "See my numbers first",
      soloConRegistro: "Your sheet comes once you sign up. It takes a minute.",
      soloConRegistroEnlace: "To download your sheet in this browser, sign up here. It takes a minute.",
      privacidad: "Your numbers stay on your phone. The sign-up only asks for your name and how to reach you.",
      gracias: "Sign-up sent. Now your number.",
      p2Ante: "Your number",
      ejemplo: "See it with the video's example",
      ejemploCompra: "See it with an example",
      ejemploRot: "Example · made-up family",
      miHoja: "My sheet",
      faltaHoja: "First enter your numbers in «Your number».",
      p3Ante: "Your sheet",
      p3Tit: "Your sheet",
      indicacion: "Press and hold the sheet to save it.",
      pdf: "Download PDF",
      compartir: "Share",
      pdfAyuda: "The PDF downloads to your phone. If you don't see it, press and hold the sheet to save it.",
      pdfBajando: "Downloading the PDF. If you don't see it in your downloads, press and hold the sheet to save it.",
      pdfPestana: "The PDF opened in another tab. Save it from there, or press and hold the sheet.",
      compartirListo: "Done.",
      pdfNo: "This browser won't download the file. Press and hold the sheet to save it.",
      pdfEnApp: "In here, press and hold the sheet to save it.",
      enApp: "You're inside Instagram or Facebook. The file can't be downloaded in here: press and hold the sheet to save it. For the PDF, open the page in your browser:",
      abrirNav: "Copy the link with my numbers",
      abrirNavAyuda: "Or tap ••• at the top and choose «Open in browser». Your numbers travel in the link, after the #, and that part does not reach us. There you sign up and download the PDF.",
      copiado: "Copied. Open Safari or Chrome and paste the link.",
      noCopiado: "Couldn't copy. Tap ••• at the top and choose «Open in browser».",
      barraHoy: "Today",
      cierreTit: "Your sheet is yours now.",
      cierrePregunta: "What do you want to do now?",
      cierreFlorida: "To show you the path that fits you: do you live in Florida?",
      cierreA: "Go over it with a licensed agent",
      cierreANota: "WhatsApp opens with the Reyes Connect team, with your message already written.",
      cierreFuera: "Our license is in Florida. For your state, a licensed agent there is the better fit. Your sheet is still yours.",
      cierreB: "I'll keep my sheet",
      cierreListo: "Done. Your sheet is yours.",
      waTexto: "Hi. I ran my numbers on the Reyes Connect page and I would like to go over them with a licensed agent",
      waY: ", and ",
      registrarOtra: "Haven't signed up yet?",
      borrar: "Delete my numbers from this phone",
      borrado: "Done. They were deleted from this phone.",
      nota: "This is an educational calculation made with your numbers, so you can see your number clearly.",
      licencia: "Reyes Connect Insurance · FL License #G298682 · NPN #22061550. Not affiliated with the government.",
      contacto: "hello@reyesconnectapp.com · WhatsApp +1 305-910-7614",
      otroIdioma: "Español", otroHref: "",
      hoja: {
        fecha: function (d) { return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }); },
        para: "For: ",
        numeros: "Your numbers",
        grafica: "How it goes down, year by year",
        totales: "What your family would have to cover if you were gone",
        aprendisteTit: "What you learned today",
        aprendiste: "What your family would have to cover if you were gone goes down every year. Your number is run with today's numbers. Review your number when your life changes.",
        aviso: "Educational calculation made on your phone with your numbers.",
        pedir: "To go over it with a licensed agent in Florida: the Reyes Connect team, WhatsApp +1 305-910-7614 or hello@reyesconnectapp.com.",
        archivo: "todays-number.pdf"
      }
    }
  };
  var T = TX[lang], TH = H.textos[lang];

  /* ---------- Memoria en este teléfono (puede no existir) ---------- */
  function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || null; } catch (e) { return null; } }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin memoria: sigue igual */ } }
  var estado = leer() || {};
  if (estado.momento && !MOMENTOS[estado.momento]) delete estado.momento;
  estado.entradas = estado.entradas || H.vacio();
  if (estado.paso == null) estado.paso = estado.momento ? 1 : 0;
  estado.anio = estado.anio || 0;
  // Versión anterior: «registro» marcaba solo que abrió el formulario. Eso no es un registro.
  if (estado.registro && !estado.registro.confirmado && !estado.registro.enviado) { estado.abrioRegistro = estado.registro.abierto; delete estado.registro; }

  // Dentro de Instagram o Facebook las descargas casi nunca funcionan: no se promete el PDF.
  var EN_APP = /Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent || "");
  var WHATSAPP = "13059107614"; // el WhatsApp del equipo de Reyes Connect (botón A del cierre)

  /* Solo cuenta el registro que salió de este formulario. En reyesconnectapp.com, solo el que el servidor confirmó
     con ok:true (via «misma-direccion»). La dirección no puede marcar a nadie como registrado: ni r=1 en el #
     ni ?registrado=1 cuentan. Un registro guardado por versiones anteriores con esas marcas se descarta. */
  function registroValido(r) {
    if (!r || !r.enviado) return false;
    return MISMA ? r.via === "misma-direccion" && !!r.confirmado : (r.via === "pagina" || r.via === "misma-direccion");
  }
  if (estado.registro && !registroValido(estado.registro)) delete estado.registro;
  // Números que llegan en el # (desde «Abrir en el navegador» o un enlace copiado). El # no viaja al servidor.
  // Además del cálculo, el # lleva el momento (m); nunca el nombre, el contacto ni el registro.
  var dePaso = null, delHash = null;
  try {
    var qh = {};
    String(location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) qh[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
    if (MOMENTOS[qh.m]) estado.momento = qh.m;
    delHash = H.deHash ? H.deHash(location.hash) : null;
    if (delHash) {
      estado.entradas = delHash; estado.anio = 0;
      dePaso = calc(delHash).falta ? 2 : 3;
      estado.paso = dePaso;
    }
  } catch (e) {}
  // Limpia la dirección: sin números ni marcas a la vista (tampoco un ?registrado=1, que no cuenta).
  var marcaVieja = /[#&]r=/.test(location.hash) || /[?&]registrado=/.test(location.search);
  if (delHash || marcaVieja || /[#&]m=/.test(location.hash)) { try { history.replaceState(null, "", location.pathname); } catch (e) {} }

  /* El cálculo no cambia: para quien compra, la herramienta pone la resta (precio menos entrada) como lo que debería. */
  function calc(e) { var r = H.calcular(H.preparar ? H.preparar(e) : e); r.compra = !!(e && e.compra); return r; }
  function momento() { return MOMENTOS[estado.momento] ? estado.momento : null; }

  // El astronauta de la marca: se carga una vez y sirve para la pantalla y para la hoja.
  var ASTRO_SRC = RAIZ + "assets/astronauta.png";
  var astro = new Image();
  astro.onload = function () { if (estado.paso === 3 && lienzo) pintarHoja(); };
  astro.src = ASTRO_SRC;

  /* ---------- Esqueleto ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var app = $("#app");
  app.innerHTML =
    '<header class="cabecera"><div class="ancho"><a class="marca" href="' + RAIZ + (lang === "en" ? "en/" : "") + '"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#101016"/><path d="M14 30 32 15l18 15v19H14z" fill="none" stroke="#e7b35c" stroke-width="4" stroke-linejoin="round"/><rect x="27" y="36" width="10" height="13" fill="#4da3ff"/></svg><span>Reyes <span class="oro">Connect</span></span></a>' +
    '<a class="idioma" href="' + RAIZ + T.otroHref + '" hreflang="' + (lang === "es" ? "en" : "es") + '">' + T.otroIdioma + "</a></div></header>" +
    '<nav class="pasos" aria-label="Pasos"><div class="ancho"><ol>' +
    T.pasos.map(function (p, i) { return '<li><button type="button" data-paso="' + i + '"><span class="num">' + (i + 1) + '</span><span class="rot">' + p + "</span></button></li>"; }).join("") +
    "</ol></div></nav>" +
    '<main class="ancho">' +
    // Paso 0: la entrevista
    '<section class="pantalla" id="paso-0" aria-labelledby="t0">' +
    '<div class="saludo"><img class="astronauta" src="' + ASTRO_SRC + '" alt="" width="512" height="512">' +
    '<div><p class="antetitulo">' + T.p0Ante + "</p><h1>" + TH.titulo + "</h1></div></div>" +
    '<p class="entrada">' + T.p0Entrada + "</p>" +
    '<h2 class="pregunta-momento" id="t0">' + T.p0Pregunta + "</h2>" +
    '<div class="momentos" role="group" aria-labelledby="t0">' +
    ORDEN.map(function (m) { return '<button type="button" data-momento="' + m + '" aria-pressed="false"><b>' + T.momento[m][0] + "</b><span>" + T.momento[m][1] + "</span></button>"; }).join("") +
    "</div></section>" +
    // Paso 1: registro
    '<section class="pantalla" id="paso-1" aria-labelledby="t1" hidden>' +
    '<p class="momento-elegido"><span id="momento-1"></span><button type="button" class="boton-texto" data-paso="0">' + T.cambiar + "</button></p>" +
    '<h2 id="t1">' + T.p1Tit + "</h2>" +
    '<p class="entrada" id="entrada-1"></p>' +
    '<p class="chico" style="margin:14px 0 0">' + T.registrarPorQue + "</p>" +
    '<form class="registro" id="form-registro" novalidate>' +
    '<div class="campo"><label for="r-nombre">' + T.nombre + '</label><div class="entrada-num"><input id="r-nombre" type="text" autocomplete="name" maxlength="80" required></div></div>' +
    '<div class="campo"><label for="r-tel">' + T.tel + '<span class="ayuda">' + T.contactoAyuda + '</span></label><div class="entrada-num"><input id="r-tel" type="tel" inputmode="tel" autocomplete="tel" maxlength="20"></div></div>' +
    '<div class="campo"><label for="r-correo">' + T.correo + '</label><div class="entrada-num"><input id="r-correo" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="120"></div></div>' +
    '<div class="campo"><span class="etiqueta" id="et-florida">' + T.florida + '</span><div class="botones-opcion" role="group" aria-labelledby="et-florida">' +
    '<button type="button" data-florida="si" aria-pressed="false">' + T.si + '</button><button type="button" data-florida="no" aria-pressed="false">' + T.no + "</button></div></div>" +
    '<div class="campo"><label for="r-zip">' + T.zip + '<span class="ayuda">' + T.zipAyuda + '</span></label><div class="entrada-num zip"><input id="r-zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5"></div></div>' +
    '<label class="permiso"><input type="checkbox" id="r-permiso"><span id="r-permiso-texto">' + PERMISO[lang] + "</span></label>" +
    '<div class="errores" id="r-errores" role="alert" hidden></div>' +
    '<div class="acciones"><button class="boton boton-miel" id="registrar" type="submit">' + T.registrar + "</button></div>" +
    "</form>" +
    '<p class="chico" style="text-align:center;margin:18px 0 0">' + T.sinRegistro + "</p>" +
    '<button class="boton-texto" id="primero" type="button" style="margin-top:0">' + T.primero + "</button>" +
    '<p class="chico" style="margin-top:16px">' + T.privacidad + "</p>" +
    "</section>" +
    // Paso 2: la cuenta
    '<section class="pantalla" id="paso-2" aria-labelledby="t2" hidden>' +
    '<div class="aviso-ok" id="gracias" hidden>' + T.gracias + "</div>" +
    '<p class="antetitulo" style="margin-top:14px" id="ante-2">' + T.p2Ante + "</p><h2 id=\"t2\">" + TH.titulo + "</h2>" +
    '<p class="entrada" id="bajada-2"></p>' +
    '<button class="boton boton-linea" id="ejemplo" type="button" style="margin-top:16px"></button>' +
    '<p class="aviso-suave" id="rot-ejemplo" hidden>' + T.ejemploRot + "</p>" +
    '<div id="formulario"></div>' +
    '<div class="resultado" id="resultado" aria-live="polite"></div>' +
    '<div class="acciones"><button class="boton boton-miel" id="ir-hoja" type="button">' + T.miHoja + "</button></div>" +
    '<div class="barra-fija" id="barra" hidden><div class="ancho"><span class="hoy"><small>' + T.barraHoy + '</small><b id="barra-total"></b></span>' +
    '<button class="boton boton-miel" id="barra-hoja" type="button">' + T.miHoja + "</button></div></div>" +
    "</section>" +
    // Paso 3: la hoja
    '<section class="pantalla" id="paso-3" aria-labelledby="t3" hidden>' +
    '<p class="antetitulo">' + T.p3Ante + "</p><h2 id=\"t3\">" + T.p3Tit + "</h2>" +
    '<div id="hoja-caja"></div>' +
    '<div class="tarjeta" id="en-app" hidden><p style="margin:0">' + T.enApp + '</p><div class="acciones"><button class="boton boton-linea" id="copiar-enlace" type="button">' + T.abrirNav + "</button></div>" +
    '<p class="chico" id="estado-copia">' + T.abrirNavAyuda + "</p></div>" +
    '<div class="acciones" id="caja-pdf"><button class="boton boton-miel" id="pdf" type="button">' + T.pdf + "</button>" +
    '<button class="boton boton-linea" id="compartir" type="button" hidden>' + T.compartir + "</button></div>" +
    '<p class="estado-pdf" id="estado-pdf">' + T.pdfAyuda + "</p>" +
    '<section class="tarjeta cierre" id="cierre" aria-labelledby="t-cierre"><h3 id="t-cierre">' + T.cierreTit + "</h3>" +
    '<p class="cierre-pregunta">' + T.cierrePregunta + "</p>" +
    '<div id="cierre-florida" hidden><p class="chico" id="et-cierre-florida">' + T.cierreFlorida + "</p>" +
    '<div class="botones-opcion" role="group" aria-labelledby="et-cierre-florida"><button type="button" data-cierre-florida="si">' + T.si + '</button><button type="button" data-cierre-florida="no">' + T.no + "</button></div></div>" +
    '<div id="cierre-a" hidden><div class="acciones"><a class="boton boton-miel" id="cierre-wa" target="_blank" rel="noopener noreferrer" href="#">' + T.cierreA + "</a></div>" +
    '<p class="chico cierre-nota">' + T.cierreANota + "</p>" +
    '<p class="chico cierre-licencia">' + T.licencia + "</p></div>" +
    '<p class="cierre-fuera" id="cierre-fuera" hidden>' + T.cierreFuera + "</p>" +
    '<div class="acciones"><button class="boton boton-linea" id="cierre-b" type="button">' + T.cierreB + "</button></div>" +
    '<div class="aviso-ok" id="cierre-listo" role="status" hidden>' + T.cierreListo + "</div></section>" +
    '<div class="tarjeta" id="registro-otra" hidden><h3>' + T.registrarOtra + '</h3><div class="acciones"><button class="boton boton-miel" id="registrar-2" type="button">' + T.registrar + "</button></div></div>" +
    '<button class="boton-texto" id="borrar" type="button">' + T.borrar + "</button>" +
    "</section>" +
    "</main>" +
    '<footer class="pie"><div class="ancho">' +
    '<p class="nota">' + T.nota + "</p>" +
    '<p class="licencia">' + T.licencia + "</p><p>" + T.contacto + "</p></div></footer>";

  /* ---------- Pasos ---------- */
  /* Cada paso entra al historial: el «atrás» del teléfono vuelve al paso anterior en vez de cerrar la página. */
  function irA(n, sinSubir, desdeHistorial) {
    if (!desdeHistorial && n !== estado.paso) { try { history.pushState({ paso: n }, ""); } catch (e) {} }
    estado.paso = n;
    guardar();
    if (n !== 3 && EN_APP && location.hash) { try { history.replaceState(history.state, "", location.pathname + location.search); } catch (e) {} }
    [0, 1, 2, 3].forEach(function (i) { $("#paso-" + i).hidden = i !== n; });
    document.querySelectorAll(".pasos button").forEach(function (b) {
      var i = +b.getAttribute("data-paso");
      if (i === n) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("hecho", (i === 0 && !!momento()) || (i === 1 && !!estado.registro) || (i === 2 && n === 3));
    });
    if (n !== 2) { $("#barra").hidden = true; document.body.classList.remove("con-barra"); }
    if (n === 0) pintarEntrevista();
    if (n === 1) pintarRegistro();
    if (n === 2) pintarCuenta();
    if (n === 3) pintarHoja();
    $("#registro-otra").hidden = !!estado.registro || !!estado.seQueda;
    if (!sinSubir) window.scrollTo(0, 0);
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest(".pasos button[data-paso], .momento-elegido button[data-paso]");
    if (b) irA(+b.getAttribute("data-paso"));
  });
  window.addEventListener("popstate", function (ev) {
    var n = ev.state && ev.state.paso;
    if (n >= 0 && n <= 3) irA(n, false, true);
  });

  /* ---------- Paso 0: la entrevista ---------- */
  function pintarEntrevista() {
    var m = momento();
    document.querySelectorAll("button[data-momento]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-momento") === m)); });
  }
  function vacias(e) { return !(e.deuda || e.precio || e.entrada || e.gasto || e.otras || e.tiene || e.hijos); }
  $("#paso-0").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-momento]");
    if (!b) return;
    var m = b.getAttribute("data-momento"), cfg = MOMENTOS[m], e = estado.entradas;
    estado.momento = m;
    // Personaliza lo que sigue: quien compra pone precio y entrada; quien aprende arranca con el ejemplo puesto.
    if (cfg.compra && !e.compra) estado.entradas = H.vacioCompra();
    else if (!cfg.compra && e.compra) estado.entradas = m === "aprender" ? H.ejemplo() : H.vacio();
    else if (m === "aprender" && vacias(e)) estado.entradas = H.ejemplo();
    estado.anio = 0;
    guardar();
    pintarEntrevista();
    irA(estado.registro ? 2 : 1);
  });

  /* ---------- Paso 1: registro dentro de la página ----------
     En reyesconnectapp.com va a /api/leads/mortgage-protection en la misma dirección y se lee la respuesta:
     solo se dice «Registro enviado» si el servidor contestó que sí. En otro dominio se manda como en v1b (a ciegas).
     La respuesta de la entrevista viaja en plazo y campana_id. Nunca se piden ni se mandan seguro social, fecha de
     nacimiento, dirección, banco, tarjeta, estatus migratorio ni los números de la cuenta. */
  function pintarRegistro() {
    var m = momento();
    $("#momento-1").textContent = m ? T.momento[m][0] : "";
    $(".momento-elegido").hidden = !m;
    $("#entrada-1").textContent = T.p1Entrada[m || "tengo"];
  }
  var florida = null; // "si" | "no"; ninguno marcado al empezar
  $("#form-registro").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-florida]");
    if (!b) return;
    florida = b.getAttribute("data-florida");
    document.querySelectorAll("button[data-florida]").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
    // Solo en este teléfono: decide qué camino enseña el cierre. No cambia lo que manda el registro.
    estado.florida = florida; guardar();
  });
  function telValido(t) {
    var d = t.replace(/\D/g, "");
    if (/^\s*\+/.test(t)) return d.length >= 8 && d.length <= 15;
    return d.length === 10 || (d.length === 11 && d.charAt(0) === "1");
  }
  function validar() {
    var nombre = $("#r-nombre").value.trim(), tel = $("#r-tel").value.trim(), correo = $("#r-correo").value.trim(), zip = $("#r-zip").value.trim();
    var errores = [], malos = [];
    if (!nombre) { errores.push(T.errNombre); malos.push("#r-nombre"); }
    if (!tel && !correo) { errores.push(T.errContacto); malos.push("#r-tel"); }
    if (tel && !telValido(tel)) { errores.push(T.errTel); malos.push("#r-tel"); }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) { errores.push(T.errCorreo); malos.push("#r-correo"); }
    if (!florida) { errores.push(T.errFlorida); malos.push('button[data-florida="si"]'); }
    if (zip && !/^\d{5}$/.test(zip)) { errores.push(T.errZip); malos.push("#r-zip"); }
    if (!$("#r-permiso").checked) { errores.push(T.errPermiso); malos.push("#r-permiso"); }
    ["#r-nombre", "#r-tel", "#r-correo", "#r-zip", "#r-permiso"].forEach(function (s) {
      if (malos.indexOf(s) >= 0) $(s).setAttribute("aria-invalid", "true"); else $(s).removeAttribute("aria-invalid");
    });
    return { errores: errores, primero: malos[0], datos: { nombre: nombre, telefono: tel, email: correo, zip: zip } };
  }
  function mostrarErrores(lista) {
    var caja = $("#r-errores");
    caja.hidden = !lista.length;
    caja.innerHTML = lista.length ? "<ul>" + lista.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ul>" : "";
  }
  $("#form-registro").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var boton = $("#registrar");
    if (boton.disabled) return;
    var v = validar();
    mostrarErrores(v.errores);
    if (v.errores.length) { var f = $(v.primero); if (f && f.focus) f.focus(); return; }
    var m = momento();
    // Solo estos campos. Los vacíos no se mandan.
    var datos = { nombre: v.datos.nombre.slice(0, 80) };
    if (v.datos.telefono) datos.telefono = v.datos.telefono.slice(0, 20);
    if (v.datos.email) datos.email = v.datos.email.slice(0, 120);
    datos.estado_residencia = florida === "si" ? "FL" : "otro"; // lib/seguros/atendible.ts: «FL» = Florida; «otro» = fuera de Florida
    if (v.datos.zip) datos.zip = v.datos.zip;
    datos.consent_servicio = true;
    datos.consent_promocional = false;
    datos.idioma = lang;
    datos.campana_id = m ? MOMENTOS[m].campana : "calculo";
    if (m && MOMENTOS[m].plazo) datos.plazo = MOMENTOS[m].plazo;
    datos.utm_source = "instagram";
    datos.utm_medium = "dm";
    datos.utm_campaign = "responsabilidad-decreciente";
    boton.disabled = true; boton.textContent = T.enviando;
    function listo(leadId) {
      estado.registro = {
        enviado: new Date().toISOString(), via: MISMA ? "misma-direccion" : "pagina", campana: datos.campana_id, idioma: lang,
        consentimiento: PERMISO.version, textoPermiso: PERMISO[lang],
        // El nombre de pila solo se guarda en este teléfono, para poner «Para: …» en la hoja.
        nombrePila: v.datos.nombre.split(/\s+/)[0].slice(0, 30)
      };
      if (MISMA) { estado.registro.confirmado = estado.registro.enviado; estado.registro.leadId = leadId == null ? null : leadId; }
      guardar();
      boton.disabled = false; boton.textContent = T.registrar;
      irA(2); $("#gracias").hidden = false;
    }
    function fallo(msg) { boton.disabled = false; boton.textContent = T.registrar; mostrarErrores([msg]); }
    try {
      if (MISMA) {
        fetch(API_MISMA, {
          method: "POST", credentials: "same-origin",
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
        }).then(function (r) {
          return r.json().catch(function () { return null; }).then(function (j) {
            if (r.ok && j && j.ok === true) listo(j.leadId); else fallo(T.noGuardo);
          });
        }, function () { fallo(T.noEnvio); });
      } else {
        fetch(CFG.registroApi, {
          method: "POST", mode: "no-cors", keepalive: true,
          headers: { "Content-Type": "text/plain" }, body: JSON.stringify(datos)
        }).then(function () { listo(null); }, function () { fallo(T.noEnvio); });
      }
    } catch (e) { fallo(T.noEnvio); }
  });
  $("#registrar-2").addEventListener("click", function () { irA(1); });
  $("#primero").addEventListener("click", function () { irA(2); });

  // Despierta el servidor para que el registro no tarde: pide un ícono estático (no toca la base; no manda datos).
  try { if (CFG.despertar && !MISMA) { var despierta = new Image(); despierta.src = CFG.despertar; } } catch (e) {}

  /* ---------- Paso 2: la herramienta ---------- */
  var res = null;
  function recalcular() {
    res = calc(estado.entradas);
    if (!res.falta && estado.anio > res.T) estado.anio = 0;
    var caja = $("#resultado");
    caja.alCambiarAnio = function (a) { estado.anio = a; guardar(); };
    H.pintarResultado(caja, res, lang, estado.anio);
    $("#rot-ejemplo").hidden = !estado.entradas.ejemplo;
    // Barra fija abajo con el total de hoy y «Mi hoja», en cuanto hay resultado.
    var barra = $("#barra");
    barra.hidden = !!res.falta || estado.paso !== 2;
    document.body.classList.toggle("con-barra", !barra.hidden);
    if (!res.falta) $("#barra-total").textContent = "$" + Math.round(res.hoy).toLocaleString("en-US");
    guardar();
  }
  function pintarCuenta() {
    var m = momento(), compra = !!estado.entradas.compra;
    $("#ante-2").textContent = m ? T.momento[m][0] : T.p2Ante;
    $("#bajada-2").textContent = compra ? TH.compra.bajada : TH.bajada;
    $("#ejemplo").textContent = compra ? T.ejemploCompra : T.ejemplo;
    H.pintarFormulario($("#formulario"), estado.entradas, lang, recalcular);
    recalcular();
  }
  $("#ejemplo").addEventListener("click", function () {
    estado.entradas = estado.entradas.compra ? H.ejemploCompra() : H.ejemplo();
    estado.anio = 0;
    pintarCuenta();
    // Que se vea que algo pasó: baja hasta las cifras.
    var destino = $("#frase-resultado") || $("#resultado");
    var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (destino && destino.scrollIntoView) destino.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
  });
  $("#ir-hoja").addEventListener("click", function () { irA(3); });
  $("#barra-hoja").addEventListener("click", function () { irA(3); });

  /* ---------- Paso 3: la hoja ---------- */
  var lienzo = null;
  function pintarHoja() {
    var caja = $("#hoja-caja");
    res = calc(estado.entradas);
    if (res.falta) {
      caja.innerHTML = '<div class="aviso-suave">' + T.faltaHoja + '</div><div class="acciones"><button class="boton boton-linea" type="button" id="volver-2">' + T.pasos[2] + "</button></div>";
      $("#volver-2").onclick = function () { irA(2); };
      $("#pdf").disabled = true;
      $("#en-app").hidden = true; $("#cierre").hidden = true; $("#compartir").hidden = true;
      lienzo = null;
      return;
    }
    // Opción de index.html: la hoja solo después del registro.
    if (CFG.hojaSoloConRegistro && !estado.registro) {
      // Si llegó con sus números en el enlace (por ejemplo, desde Instagram al navegador), se le dice cómo sigue aquí.
      caja.innerHTML = '<div class="aviso-suave" id="hoja-espera">' + (dePaso ? T.soloConRegistroEnlace : T.soloConRegistro) + "</div>";
      $("#pdf").disabled = true; $("#en-app").hidden = true; $("#caja-pdf").hidden = true; $("#estado-pdf").hidden = true;
      $("#cierre").hidden = true;
      lienzo = null;
      return;
    }
    $("#caja-pdf").hidden = false; $("#estado-pdf").hidden = false;
    $("#pdf").disabled = false;
    lienzo = dibujarHoja(H.resumenHoja(res, lang, H.preparar ? estado.entradas : undefined), res.ejemplo);
    var url;
    try { url = lienzo.toDataURL("image/png"); } catch (e) { url = ""; }
    caja.innerHTML = '<p class="indicacion">' + T.indicacion + '</p><img class="hoja-img" id="hoja-img" alt="' + TH.titulo + '" src="' + url + '">';
    // Dentro de Instagram o Facebook no se promete descarga: sin botón de PDF, con la indicación del dedo.
    // Los números (y el momento) se ponen en el # para que «Abrir en el navegador» los lleve.
    $("#en-app").hidden = !EN_APP;
    $("#pdf").hidden = EN_APP;
    $("#estado-pdf").textContent = EN_APP ? T.pdfEnApp : T.pdfAyuda;
    $("#compartir").hidden = !puedeCompartir();
    $("#compartir").className = EN_APP ? "boton boton-miel" : "boton boton-linea";
    if (EN_APP && H.aHash) { try { history.replaceState(history.state, "", location.pathname + location.search + "#" + hashCompleto()); } catch (e) {} }
    pintarCierre();
  }
  function hashCompleto() {
    var h = H.aHash ? H.aHash(estado.entradas) : "";
    if (momento()) h += (h ? "&" : "") + "m=" + momento();
    return h;
  }

  /* ---------- Cierre con decisión: habla la empresa ----------
     A (solo si vive en Florida): WhatsApp del equipo en pestaña nueva, con el texto ya escrito (incluye su momento).
     B: se queda con su hoja; se baja con la misma regla del botón de PDF. Nada de esto manda datos desde la página. */
  function textoWa() {
    var m = momento();
    return T.waTexto + (m ? T.waY + T.momentoWa[m] : "") + ".";
  }
  function pintarCierre() {
    var fl = estado.florida === "si" || estado.florida === "no" ? estado.florida : null;
    $("#cierre").hidden = false;
    $("#cierre-wa").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(textoWa());
    $("#cierre-florida").hidden = !!fl;
    $("#cierre-a").hidden = fl !== "si";
    $("#cierre-fuera").hidden = fl !== "no";
    $("#cierre-b").className = fl === "si" ? "boton boton-linea" : "boton boton-miel";
    $("#cierre-listo").hidden = !estado.seQueda;
    $("#registro-otra").hidden = !!estado.registro || !!estado.seQueda;
  }
  $("#cierre").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-cierre-florida]");
    if (!b) return;
    estado.florida = b.getAttribute("data-cierre-florida");
    guardar();
    pintarCierre();
  });
  $("#cierre-b").addEventListener("click", function () {
    estado.seQueda = true; guardar();
    if (!EN_APP) bajarPdf();
    var listo = $("#cierre-listo");
    listo.textContent = EN_APP ? T.cierreListo + " " + T.indicacion : T.cierreListo;
    pintarCierre();
  });
  function enlaceConNumeros() {
    return location.origin + location.pathname + "#" + hashCompleto();
  }
  $("#copiar-enlace").addEventListener("click", function () {
    var est = $("#estado-copia"), u = enlaceConNumeros();
    function ok() { est.textContent = T.copiado; }
    function no() {
      // Último recurso: el enlace queda escrito para copiarlo a mano.
      est.innerHTML = T.noCopiado + '<br><input class="enlace-copia" readonly value="' + u.replace(/"/g, "") + '">';
      var i = est.querySelector("input"); if (i) { i.focus(); i.select(); }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok, no);
      else no();
    } catch (e) { no(); }
  });

  function envolver(ctx, texto, x, y, ancho, alto) {
    var palabras = texto.split(" "), linea = "", yy = y;
    palabras.forEach(function (p) {
      var prueba = linea ? linea + " " + p : p;
      if (ctx.measureText(prueba).width > ancho && linea) { ctx.fillText(linea, x, yy); linea = p; yy += alto; }
      else linea = prueba;
    });
    if (linea) { ctx.fillText(linea, x, yy); yy += alto; }
    return yy;
  }

  /* Carta a 150 ppp: 1275 × 1650. Papel blanco para que se imprima bien; banda oscura arriba con el astronauta.
     Debajo de la banda: «Para: <nombre de pila>» y su momento. Si con una familia grande no cabe, se prueba la misma
     hoja con la letra un poco menor. Lo que sobra de alto se le da a la gráfica, así la licencia queda abajo. */
  var hojaInfo = null;
  function dibujarHoja(r, esEjemplo) {
    var LIMITE = 1650 - 48, escalas = [1, 0.94, 0.88, 0.82, 0.76], p = null;
    for (var i = 0; i < escalas.length; i++) {
      p = pintarHoja1(r, esEjemplo, escalas[i], 0);
      if (p.fin <= LIMITE) { var q = pintarHoja1(r, esEjemplo, escalas[i], Math.min(LIMITE - p.fin, 520)); hojaInfo = { escala: q.escala, fin: q.fin, astronauta: q.astronauta }; return q.c; }
    }
    hojaInfo = { escala: p.escala, fin: p.fin, astronauta: p.astronauta };
    return p.c;
  }
  function pintarHoja1(r, esEjemplo, s, extra) {
    var W = 1275, Hh = 1650, M = 72, c = document.createElement("canvas");
    c.width = W; c.height = Hh;
    var x = c.getContext("2d"), S = "Helvetica, Arial, sans-serif", TT = T.hoja;
    function F(n) { return Math.round(n * s); }
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, Hh);
    x.fillStyle = "#08080c"; x.fillRect(0, 0, W, 196);
    // El astronauta, a la derecha de la banda, con un halo cian suave detrás.
    var conAstro = false, AS = 186, ax = W - M - AS + 20, ay = 6;
    if (astro.complete && astro.naturalWidth > 0) {
      var halo = x.createRadialGradient(ax + AS / 2, ay + AS / 2, 10, ax + AS / 2, ay + AS / 2, AS / 2 + 6);
      halo.addColorStop(0, "rgba(34,211,238,.28)"); halo.addColorStop(1, "rgba(34,211,238,0)");
      x.fillStyle = halo; x.fillRect(ax - 10, 0, AS + 20, 196);
      try { x.drawImage(astro, ax, ay, AS, AS); conAstro = true; } catch (e) {}
    }
    var gr = x.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, "#e7b35c"); gr.addColorStop(1, "#22d3ee");
    x.fillStyle = gr; x.fillRect(0, 192, W, 6);
    x.textBaseline = "alphabetic"; x.textAlign = "left";
    x.fillStyle = "#e7b35c"; x.font = "bold 30px " + S; x.fillText("REYES CONNECT", M, 72);
    x.fillStyle = "#f5eedf"; x.font = "bold 66px " + S; x.fillText(r.titulo, M, 150);
    x.textAlign = "right"; x.fillStyle = "#cfc7b6"; x.font = "28px " + S; x.fillText(TT.fecha(new Date()), ax - 24, 72);
    x.textAlign = "left";
    var y = 256;
    // Para quién es y en qué momento está.
    var pila = estado.registro && estado.registro.nombrePila, m = momento();
    if (pila || m) {
      x.fillStyle = "#08080c"; x.font = "bold " + F(36) + "px " + S;
      var linea = (pila ? TT.para + pila : "") + (pila && m ? " · " : "") + (m ? T.momentoLinea[m] : "");
      y = envolver(x, linea, M, y, W - 2 * M, F(44)) - F(44) + F(56);
    }
    if (esEjemplo) {
      x.fillStyle = "#fbf1de"; x.fillRect(M, y - 40, W - 2 * M, 58);
      x.fillStyle = "#8a5a00"; x.font = "bold " + F(32) + "px " + S; x.fillText(T.ejemploRot, M + 18, y);
      y += 62;
    }
    // Tus números: cada fila se parte en dos líneas si no cabe.
    x.fillStyle = "#08080c"; x.font = "bold " + F(38) + "px " + S; x.fillText(TT.numeros, M, y); y += F(8);
    r.filas.forEach(function (f) {
      var lh = F(44);
      y += F(50);
      x.fillStyle = "#2a2a33"; x.textAlign = "left"; x.font = F(36) + "px " + S;
      var fin = envolver(x, f[0], M, y, W - 2 * M - (f[1] ? F(290) : 0), lh);
      if (f[1]) { x.textAlign = "right"; x.font = "bold " + F(36) + "px " + S; x.fillText(f[1], W - M, y); x.textAlign = "left"; }
      y = fin - lh;
      x.strokeStyle = "#e6e6ea"; x.lineWidth = 1; x.beginPath(); x.moveTo(M, y + F(16)); x.lineTo(W - M, y + F(16)); x.stroke();
    });
    x.textAlign = "left";
    y += F(78);
    // Gráfica
    x.fillStyle = "#08080c"; x.font = "bold " + F(38) + "px " + S; x.fillText(TT.grafica, M, y);
    var altoG = (r.altoMinimo || 260) + extra;
    r.dibujar(x, M, y + 20, W - 2 * M, altoG);
    y += 20 + altoG + F(52);
    // Totales
    x.fillStyle = "#08080c"; x.font = "bold " + F(36) + "px " + S;
    y = envolver(x, TT.totales, M, y, W - 2 * M, F(42)) - F(42) + F(22);
    var bw = (W - 2 * M - 40) / 3, alto = F(166);
    r.totales.forEach(function (t, i) {
      var bx = M + i * (bw + 20);
      x.strokeStyle = i === 0 ? "#e7b35c" : "#22d3ee"; x.lineWidth = 4;
      x.strokeRect(bx, y, bw, alto);
      x.fillStyle = "#55555f"; x.font = "bold " + F(30) + "px " + S;
      envolver(x, t[0], bx + 16, y + F(42), bw - 32, F(34));
      x.fillStyle = "#08080c"; x.font = "bold " + F(50) + "px " + S; x.fillText(t[1], bx + 16, y + alto - F(22));
    });
    y += alto + F(62);
    // Hoy aprendiste
    x.fillStyle = "#0e7f93"; x.font = "bold " + F(36) + "px " + S; x.fillText(TT.aprendisteTit, M, y); y += F(46);
    x.fillStyle = "#2a2a33"; x.font = F(33) + "px " + S;
    y = envolver(x, TT.aprendiste, M, y, W - 2 * M, F(42)) + F(8);
    // Nota educativa corta y contacto
    x.fillStyle = "#8a5a00"; x.font = "bold " + F(31) + "px " + S;
    y = envolver(x, TT.aviso, M, y, W - 2 * M, F(39));
    x.fillStyle = "#2a2a33"; x.font = F(31) + "px " + S;
    y = envolver(x, TT.pedir, M, y + 4, W - 2 * M, F(39));
    // Licencia, abajo
    y += F(8);
    x.strokeStyle = "#d5d5db"; x.lineWidth = 2; x.beginPath(); x.moveTo(M, y); x.lineTo(W - M, y); x.stroke();
    y += F(44);
    x.fillStyle = "#55555f"; x.font = F(28) + "px " + S;
    y = envolver(x, T.licencia, M, y, W - 2 * M, F(36));
    return { c: c, fin: y - F(36) + F(10), escala: s, astronauta: conAstro };
  }

  /* ---------- PDF sin librería: la hoja como imagen JPEG en una página carta ---------- */
  function pdfDesdeLienzo(c) {
    var jpg = c.toDataURL("image/jpeg", 0.9).split(",")[1];
    var bin = atob(jpg), img = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) img[i] = bin.charCodeAt(i);
    var partes = [], largo = 0, offs = [];
    function ascii(s) { var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; }
    function poner(u) { if (typeof u === "string") u = ascii(u); partes.push(u); largo += u.length; }
    function obj(n, cuerpo) { offs[n] = largo; poner(n + " 0 obj\n" + cuerpo + "\nendobj\n"); }
    var contenido = "q 612 0 0 792 0 0 cm /Im0 Do Q";
    poner("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
    offs[4] = largo;
    poner("4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + c.width + " /Height " + c.height +
      " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + img.length + " >>\nstream\n");
    poner(img);
    poner("\nendstream\nendobj\n");
    obj(5, "<< /Length " + contenido.length + " >>\nstream\n" + contenido + "\nendstream");
    obj(6, "<< /Title (" + (lang === "en" ? "Today's number" : "Tu cuenta de hoy").replace(/'/g, "\\'") + ") /Producer (Reyes Connect) >>");
    var xref = largo, tabla = "xref\n0 7\n0000000000 65535 f \n";
    for (var n = 1; n <= 6; n++) tabla += ("0000000000" + offs[n]).slice(-10) + " 00000 n \n";
    poner(tabla + "trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
    var out = new Uint8Array(largo), p = 0;
    partes.forEach(function (u) { out.set(u, p); p += u.length; });
    return out;
  }

  function blobPdf() {
    if (!lienzo) pintarHoja();
    if (!lienzo) return null;
    return new Blob([pdfDesdeLienzo(lienzo)], { type: "application/pdf" });
  }
  /* «Descargar PDF» descarga: enlace con «download» sobre el blob. Si el navegador no tiene «download»
     o el clic falla, el PDF se abre en una pestaña nueva. No sabemos si bajó: no se dice «Listo» a ciegas. */
  function bajarPdf() {
    var est = $("#estado-pdf"), blob = blobPdf(), nombre = T.hoja.archivo;
    if (!blob) return;
    var u;
    try { u = URL.createObjectURL(blob); } catch (e) { est.textContent = T.pdfNo; return; }
    setTimeout(function () { try { URL.revokeObjectURL(u); } catch (e) {} }, 60000);
    function enPestana() {
      var w = null;
      try { w = window.open(u, "_blank"); } catch (e) {}
      est.textContent = w === null ? T.pdfNo : T.pdfPestana;
    }
    var a = document.createElement("a");
    if (!("download" in a)) { enPestana(); return; }
    try {
      a.href = u; a.download = nombre; a.rel = "noopener"; a.style.display = "none";
      document.body.appendChild(a); a.click(); a.remove();
      est.textContent = T.pdfBajando;
    } catch (e) { enPestana(); }
  }
  $("#pdf").addEventListener("click", bajarPdf);

  /* «Compartir» es otro botón: solo se enseña si el teléfono tiene la ventana de compartir con archivos. */
  function archivoPdf(blob) {
    try { return new File([blob || new Blob([""], { type: "application/pdf" })], T.hoja.archivo, { type: "application/pdf" }); } catch (e) { return null; }
  }
  function puedeCompartir() {
    try { var f = archivoPdf(); return !!(f && navigator.share && navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; }
  }
  $("#compartir").addEventListener("click", function () {
    var est = $("#estado-pdf"), blob = blobPdf(), archivo = blob && archivoPdf(blob);
    if (!archivo || !puedeCompartir()) { est.textContent = EN_APP ? T.pdfEnApp : T.pdfAyuda; return; }
    try {
      navigator.share({ files: [archivo], title: TH.titulo }).then(function () { est.textContent = T.compartirListo; }, function () {});
    } catch (e) {}
  });

  $("#borrar").addEventListener("click", function () {
    try { localStorage.removeItem(CLAVE); } catch (e) {}
    var reg = estado.registro, m = estado.momento, compra = !!estado.entradas.compra;
    estado = { entradas: compra ? H.vacioCompra() : H.vacio(), paso: 0, anio: 0 };
    if (reg) estado.registro = reg; // la marca del registro, sin números
    if (m) estado.momento = m;
    lienzo = null;
    guardar();
    try { history.replaceState(history.state, "", location.pathname + location.search); } catch (e) {}
    $("#en-app").hidden = true; $("#cierre").hidden = true; $("#compartir").hidden = true;
    $("#hoja-caja").innerHTML = '<div class="aviso-ok">' + T.borrado + "</div>";
    $("#pdf").disabled = true;
  });

  // Para pruebas locales (no envía nada): construye el PDF y lo devuelve en bytes.
  window.RC.puerta = { estado: function () { return estado; }, hoja: function () { return hojaInfo; }, pdf: function () { if (!lienzo) pintarHoja(); return lienzo ? pdfDesdeLienzo(lienzo) : null; }, irA: irA, misma: MISMA, raiz: RAIZ };

  try { history.replaceState({ paso: estado.paso }, ""); } catch (e) {}
  irA(estado.paso, true, true);
})();

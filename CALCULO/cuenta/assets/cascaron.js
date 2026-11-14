/* Cascarón de las puertas de Reyes Connect: 1 Regístrate · 2 Tu cuenta · 3 Tu hoja.
   La herramienta se enchufa (assets/herramientas/<id>.js). Este archivo no sabe de casas ni de hijos.
   Lo único que sale del teléfono es el registro del paso 1 (nombre, contacto, Florida sí/no, ZIP y el permiso),
   y solo si la persona lo envía. Los números de la cuenta no salen nunca. Sin analítica ni cookies. */
(function () {
  "use strict";
  var CFG = window.RC_PUERTA;               // lo pone cada index.html
  var lang = CFG.lang === "en" ? "en" : "es";
  var H = window.RC.herramientas[CFG.herramienta];
  var CLAVE = "rc-puerta-" + H.id + "-v1";

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

  /* ---------- Textos del cascarón ---------- */
  var TX = {
    es: {
      pasos: ["Regístrate", "Tu cuenta", "Tu hoja"],
      p1Ante: "Comentaste CALCULO",
      p1Entrada: "Tres pasos, en este mismo teléfono. Tu hoja te la llevas al final.",
      registrar: "Regístrate",
      registrarPorQue: "Así Lázaro, el agente con licencia, puede repasar tu cuenta contigo si lo pides.",
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
      sinRegistro: "Sin registro también puedes hacer tu cuenta.",
      primero: "Prefiero hacer mi cuenta primero",
      soloConRegistro: "Tu hoja sale cuando te registres. Es un minuto.",
      privacidad: "Tus números de la cuenta se quedan en tu teléfono; no nos llegan. En el registro pedimos lo mínimo y nunca seguro social, fecha de nacimiento, dirección, banco, tarjeta ni estatus migratorio.",
      gracias: "Registro enviado. Ahora tu cuenta.",
      p2Ante: "Paso 2",
      ejemplo: "Ver con el ejemplo del video",
      ejemploRot: "Ejemplo · familia inventada",
      miHoja: "Mi hoja",
      faltaHoja: "Primero pon tus números en el paso 2.",
      p3Ante: "Paso 3",
      p3Tit: "Tu hoja",
      indicacion: "Mantén el dedo sobre la hoja para guardarla en tus fotos.",
      pdf: "Descargar PDF",
      pdfAyuda: "Si no ves el archivo, guarda la imagen con el dedo.",
      pdfListo: "Listo. Si no ves el archivo, guarda la imagen con el dedo.",
      pdfNo: "Este navegador no deja bajar el archivo. Guarda la imagen con el dedo.",
      enApp: "Estás dentro de Instagram. Aquí lo seguro es guardar la imagen con el dedo. Para el PDF, abre la página en tu navegador:",
      abrirNav: "Copiar el enlace con mis números",
      abrirNavAyuda: "O toca ••• arriba y elige «Abrir en el navegador». Tus números van en el enlace, después del #, y esa parte no nos llega.",
      copiado: "Copiado. Abre Safari o Chrome y pega el enlace.",
      noCopiado: "No se pudo copiar. Toca ••• arriba y elige «Abrir en el navegador».",
      barraHoy: "Hoy",
      llamadaTit: "¿Quieres repasar tu cuenta con Lázaro?",
      llamada: "Escríbenos LLAMADA por mensaje directo en Instagram.",
      registrarOtra: "¿Aún no te registras?",
      borrar: "Borrar mis números de este teléfono",
      borrado: "Listo. Se borraron de este teléfono.",
      avisoCalc: "Este es un cálculo educativo con tus propios números. No es una cotización, ni una oferta, ni una recomendación de producto o de monto. No promete nada. Tu cuenta cambia cuando cambia tu vida. Para ver qué te conviene, habla con un agente con licencia.",
      noDatos: "No nos mandes datos personales ni de salud por mensaje; eso se ve en la llamada.",
      licencia: "Reyes Connect Insurance · Lázaro Reyes, agente de seguros de vida y salud con licencia en Florida · FL License #G298682 · NPN #22061550. No afiliado al gobierno.",
      contacto: "hello@reyesconnectapp.com · +1 786-835-2214",
      otroIdioma: "English", otroHref: "en/",
      hoja: {
        fecha: function (d) { return d.toLocaleDateString("es-US", { day: "numeric", month: "long", year: "numeric" }); },
        numeros: "Tus números",
        grafica: "Cómo baja, año por año",
        totales: "Lo que tu familia tendría que cubrir si faltas",
        aprendisteTit: "Hoy aprendiste",
        aprendiste: "Lo que tu familia tendría que cubrir si faltas baja cada año. Tu cuenta se saca con los números de hoy. Revisa tu cuenta cuando cambie tu vida.",
        aviso: "Cálculo educativo con tus propios números. No es una cotización ni una recomendación.",
        tuTelefono: "Estos números se hicieron en tu teléfono; no nos llegaron.",
        pedir: "¿Quieres repasarla con Lázaro? Escribe LLAMADA en el chat de Instagram de Reyes Connect, por WhatsApp al +1 786-835-2214, o a hello@reyesconnectapp.com.",
        archivo: "mi-cuenta-de-hoy.pdf"
      }
    },
    en: {
      pasos: ["Sign up", "Your number", "Your sheet"],
      p1Ante: "You commented CALCULO",
      p1Entrada: "Three steps, right on this phone. You keep your sheet at the end.",
      registrar: "Sign up",
      registrarPorQue: "That way Lázaro, the licensed agent, can go over your number with you if you ask.",
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
      sinRegistro: "You can also run your number without signing up.",
      primero: "I'd rather run my number first",
      soloConRegistro: "Your sheet comes once you sign up. It takes a minute.",
      privacidad: "The numbers you enter stay on your phone; they don't reach us. The sign-up asks for the minimum and never your Social Security number, date of birth, address, bank, card or immigration status.",
      gracias: "Sign-up sent. Now your number.",
      p2Ante: "Step 2",
      ejemplo: "See it with the video's example",
      ejemploRot: "Example · made-up family",
      miHoja: "My sheet",
      faltaHoja: "First enter your numbers in step 2.",
      p3Ante: "Step 3",
      p3Tit: "Your sheet",
      indicacion: "Press and hold the sheet to save it to your photos.",
      pdf: "Download PDF",
      pdfAyuda: "If you don't see the file, save the image by pressing and holding it.",
      pdfListo: "Done. If you don't see the file, save the image by pressing and holding it.",
      pdfNo: "This browser won't download the file. Save the image by pressing and holding it.",
      enApp: "You're inside Instagram. The safe way here is to save the image by pressing and holding it. For the PDF, open the page in your browser:",
      abrirNav: "Copy the link with my numbers",
      abrirNavAyuda: "Or tap ••• at the top and choose «Open in browser». Your numbers travel in the link, after the #, and that part does not reach us.",
      copiado: "Copied. Open Safari or Chrome and paste the link.",
      noCopiado: "Couldn't copy. Tap ••• at the top and choose «Open in browser».",
      barraHoy: "Today",
      llamadaTit: "Want to go over your number with Lázaro?",
      llamada: "Send us LLAMADA by direct message on Instagram.",
      registrarOtra: "Haven't signed up yet?",
      borrar: "Delete my numbers from this phone",
      borrado: "Done. They were deleted from this phone.",
      avisoCalc: "This is an educational calculation using your own numbers. It is not a quote, an offer, or a recommendation of any product or amount. It promises nothing. Your number changes when your life changes. To see what fits you, talk to a licensed agent.",
      noDatos: "Please don't send personal or health details by message; we cover that on the call.",
      licencia: "Reyes Connect Insurance · Lázaro Reyes, licensed life and health insurance agent in Florida · FL License #G298682 · NPN #22061550. Not affiliated with the government.",
      contacto: "hello@reyesconnectapp.com · +1 786-835-2214",
      otroIdioma: "Español", otroHref: "../",
      hoja: {
        fecha: function (d) { return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }); },
        numeros: "Your numbers",
        grafica: "How it goes down, year by year",
        totales: "What your family would have to cover if you were gone",
        aprendisteTit: "What you learned today",
        aprendiste: "What your family would have to cover if you were gone goes down every year. Your number is run with today's numbers. Review your number when your life changes.",
        aviso: "Educational calculation using your own numbers. Not a quote or a recommendation.",
        tuTelefono: "These numbers were made on your phone; they did not reach us.",
        pedir: "Want to go over it with Lázaro? Send LLAMADA in the Reyes Connect Instagram chat, on WhatsApp at +1 786-835-2214, or email hello@reyesconnectapp.com.",
        archivo: "todays-number.pdf"
      }
    }
  };
  var T = TX[lang], TH = H.textos[lang];

  /* ---------- Memoria en este teléfono (puede no existir) ---------- */
  function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || null; } catch (e) { return null; } }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin memoria: sigue igual */ } }
  var estado = leer() || {};
  estado.entradas = estado.entradas || H.vacio();
  estado.paso = estado.paso || 1;
  estado.anio = estado.anio || 0;
  // Versión anterior: «registro» marcaba solo que abrió el formulario. Eso no es un registro.
  if (estado.registro && !estado.registro.confirmado && !estado.registro.enviado) { estado.abrioRegistro = estado.registro.abierto; delete estado.registro; }

  // Dentro de Instagram o Facebook las descargas casi nunca funcionan: no se promete el PDF.
  var EN_APP = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(navigator.userAgent || "");

  // Números que llegan en el # (desde «Abrir en el navegador» o un enlace copiado). El # no viaja al servidor.
  var dePaso = null;
  try {
    var delHash = H.deHash ? H.deHash(location.hash) : null;
    if (delHash) {
      estado.entradas = delHash; estado.anio = 0;
      dePaso = H.calcular(delHash).falta ? 2 : 3;
      estado.paso = dePaso;
    }
  } catch (e) {}
  // Vuelta confirmada desde la página de gracias del formulario (cuando la app lo tenga): ?registrado=1
  var volvioRegistrado = false;
  try { volvioRegistrado = new URLSearchParams(location.search).get("registrado") === "1"; } catch (e) {}
  function marcarRegistro(via) {
    estado.registro = {
      confirmado: new Date().toISOString(), via: via, campana: "calculo",
      consentimiento: PERMISO.version, abierto: estado.abrioRegistro || null
    };
    guardar();
  }
  if (volvioRegistrado) { marcarRegistro("enlace"); estado.paso = 2; }
  // Limpia la dirección: sin números ni marcas a la vista.
  if (delHash || volvioRegistrado) { try { history.replaceState(null, "", location.pathname); } catch (e) {} }

  /* ---------- Esqueleto ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var app = $("#app");
  app.innerHTML =
    '<header class="cabecera"><div class="ancho"><a class="marca" href="./"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#101016"/><path d="M14 30 32 15l18 15v19H14z" fill="none" stroke="#e7b35c" stroke-width="4" stroke-linejoin="round"/><rect x="27" y="36" width="10" height="13" fill="#4da3ff"/></svg><span>Reyes <span class="oro">Connect</span></span></a>' +
    '<a class="idioma" href="' + T.otroHref + '" hreflang="' + (lang === "es" ? "en" : "es") + '">' + T.otroIdioma + "</a></div></header>" +
    '<nav class="pasos" aria-label="Pasos"><div class="ancho"><ol>' +
    T.pasos.map(function (p, i) { return '<li><button type="button" data-paso="' + (i + 1) + '"><span class="num">' + (i + 1) + "</span>" + p + "</button></li>"; }).join("") +
    "</ol></div></nav>" +
    '<main class="ancho">' +
    // Paso 1
    '<section class="pantalla" id="paso-1" aria-labelledby="t1">' +
    '<p class="antetitulo">' + T.p1Ante + "</p><h1 id=\"t1\">" + TH.titulo + "</h1>" +
    '<p class="entrada">' + T.p1Entrada + "</p>" +
    '<div class="casa-portada">' + H.casaSVG(0.62, TH.casaTit) + "</div>" +
    '<p class="leyenda"><span><i style="background:#e7b35c"></i>' + TH.casaLey[0] + '</span><span><i style="background:#4da3ff"></i>' + TH.casaLey[1] + "</span></p>" +
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
    // Paso 2
    '<section class="pantalla" id="paso-2" aria-labelledby="t2" hidden>' +
    '<div class="aviso-ok" id="gracias" hidden>' + T.gracias + "</div>" +
    '<p class="antetitulo" style="margin-top:14px">' + T.p2Ante + "</p><h2 id=\"t2\">" + TH.titulo + "</h2>" +
    '<p class="entrada">' + TH.bajada + "</p>" +
    '<button class="boton boton-linea" id="ejemplo" type="button" style="margin-top:16px">' + T.ejemplo + "</button>" +
    '<p class="aviso-suave" id="rot-ejemplo" hidden>' + T.ejemploRot + "</p>" +
    '<div id="formulario"></div>' +
    '<div class="resultado" id="resultado" aria-live="polite"></div>' +
    '<p class="aviso-calculo">' + T.avisoCalc + "</p>" +
    '<div class="acciones"><button class="boton boton-miel" id="ir-hoja" type="button">' + T.miHoja + "</button></div>" +
    '<div class="barra-fija" id="barra" hidden><div class="ancho"><span class="hoy"><small>' + T.barraHoy + '</small><b id="barra-total"></b></span>' +
    '<button class="boton boton-miel" id="barra-hoja" type="button">' + T.miHoja + "</button></div></div>" +
    "</section>" +
    // Paso 3
    '<section class="pantalla" id="paso-3" aria-labelledby="t3" hidden>' +
    '<p class="antetitulo">' + T.p3Ante + "</p><h2 id=\"t3\">" + T.p3Tit + "</h2>" +
    '<div id="hoja-caja"></div>' +
    '<div class="tarjeta" id="en-app" hidden><p style="margin:0">' + T.enApp + '</p><div class="acciones"><button class="boton boton-linea" id="copiar-enlace" type="button">' + T.abrirNav + "</button></div>" +
    '<p class="chico" id="estado-copia">' + T.abrirNavAyuda + "</p></div>" +
    '<div class="acciones" id="caja-pdf"><button class="boton boton-miel" id="pdf" type="button">' + T.pdf + "</button></div>" +
    '<p class="estado-pdf" id="estado-pdf">' + T.pdfAyuda + "</p>" +
    '<div class="tarjeta"><h3>' + T.llamadaTit + "</h3><p>" + T.llamada + "</p></div>" +
    '<div class="tarjeta" id="registro-otra" hidden><h3>' + T.registrarOtra + '</h3><div class="acciones"><button class="boton boton-miel" id="registrar-2" type="button">' + T.registrar + "</button></div></div>" +
    '<button class="boton-texto" id="borrar" type="button">' + T.borrar + "</button>" +
    "</section>" +
    "</main>" +
    '<footer class="pie"><div class="ancho">' +
    "<p>" + T.avisoCalc + "</p><p>" + T.privacidad + "</p><p>" + T.noDatos + "</p>" +
    '<p class="licencia">' + T.licencia + "</p><p>" + T.contacto + "</p></div></footer>";

  /* ---------- Pasos ---------- */
  /* Cada paso entra al historial: el «atrás» del teléfono vuelve al paso anterior en vez de cerrar la página. */
  function irA(n, sinSubir, desdeHistorial) {
    if (!desdeHistorial && n !== estado.paso) { try { history.pushState({ paso: n }, ""); } catch (e) {} }
    estado.paso = n;
    guardar();
    if (n !== 3 && EN_APP && location.hash) { try { history.replaceState(history.state, "", location.pathname + location.search); } catch (e) {} }
    [1, 2, 3].forEach(function (i) { $("#paso-" + i).hidden = i !== n; });
    document.querySelectorAll(".pasos button").forEach(function (b) {
      var i = +b.getAttribute("data-paso");
      if (i === n) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("hecho", (i === 1 && !!estado.registro) || (i === 2 && n === 3));
    });
    if (n !== 2) { $("#barra").hidden = true; document.body.classList.remove("con-barra"); }
    if (n === 2) pintarCuenta();
    if (n === 3) pintarHoja();
    $("#registro-otra").hidden = !!estado.registro;
    if (!sinSubir) window.scrollTo(0, 0);
  }
  document.querySelector(".pasos").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-paso]");
    if (b) irA(+b.getAttribute("data-paso"));
  });
  window.addEventListener("popstate", function (ev) {
    var n = ev.state && ev.state.paso;
    if (n >= 1 && n <= 3) irA(n, false, true);
  });

  /* ---------- Paso 1: registro dentro de la página ----------
     Va directo a /api/leads/mortgage-protection, que guarda el lead y el permiso (texto, versión, IP, navegador) en rc_consent.
     Ese punto no tiene CORS: el envío es a ciegas y la respuesta no se puede leer. Por eso se dice «Registro enviado»,
     nunca «confirmado». Nunca se piden ni se mandan seguro social, fecha de nacimiento, dirección, banco, tarjeta,
     estatus migratorio ni los números de la cuenta. */
  var florida = null; // "si" | "no"; ninguno marcado al empezar
  $("#form-registro").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-florida]");
    if (!b) return;
    florida = b.getAttribute("data-florida");
    document.querySelectorAll("button[data-florida]").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
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
    // Solo estos campos. Los vacíos no se mandan.
    var datos = { nombre: v.datos.nombre.slice(0, 80) };
    if (v.datos.telefono) datos.telefono = v.datos.telefono.slice(0, 20);
    if (v.datos.email) datos.email = v.datos.email.slice(0, 120);
    datos.estado_residencia = florida === "si" ? "FL" : "otro"; // lib/seguros/atendible.ts: «FL» = Florida; «otro» = fuera de Florida
    if (v.datos.zip) datos.zip = v.datos.zip;
    datos.consent_servicio = true;
    datos.consent_promocional = false;
    datos.idioma = lang;
    datos.campana_id = "calculo";
    datos.utm_source = "instagram";
    datos.utm_medium = "dm";
    datos.utm_campaign = "responsabilidad-decreciente";
    boton.disabled = true; boton.textContent = T.enviando;
    function listo() {
      estado.registro = {
        enviado: new Date().toISOString(), via: "pagina", campana: "calculo", idioma: lang,
        consentimiento: PERMISO.version, textoPermiso: PERMISO[lang]
      };
      guardar();
      boton.disabled = false; boton.textContent = T.registrar;
      irA(2); $("#gracias").hidden = false;
    }
    try {
      fetch(CFG.registroApi, {
        method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain" }, body: JSON.stringify(datos)
      }).then(listo, function () {
        boton.disabled = false; boton.textContent = T.registrar;
        mostrarErrores([T.noEnvio]);
      });
    } catch (e) { boton.disabled = false; boton.textContent = T.registrar; mostrarErrores([T.noEnvio]); }
  });
  $("#registrar-2").addEventListener("click", function () { irA(1); });
  $("#primero").addEventListener("click", function () { irA(2); });

  // Despierta el servidor para que el registro no tarde: pide un ícono estático (no toca la base; no manda datos).
  try { if (CFG.despertar) { var despierta = new Image(); despierta.src = CFG.despertar; } } catch (e) {}

  /* ---------- Paso 2: la herramienta ---------- */
  var res = null;
  function recalcular() {
    res = H.calcular(estado.entradas);
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
    H.pintarFormulario($("#formulario"), estado.entradas, lang, recalcular);
    recalcular();
  }
  $("#ejemplo").addEventListener("click", function () {
    estado.entradas = H.ejemplo();
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
    res = H.calcular(estado.entradas);
    if (res.falta) {
      caja.innerHTML = '<div class="aviso-suave">' + T.faltaHoja + '</div><div class="acciones"><button class="boton boton-linea" type="button" id="volver-2">' + T.pasos[1] + "</button></div>";
      $("#volver-2").onclick = function () { irA(2); };
      $("#pdf").disabled = true;
      $("#en-app").hidden = true;
      return;
    }
    // Opción que decide Lázaro (index.html): la hoja solo después del registro confirmado.
    if (CFG.hojaSoloConRegistro && !estado.registro) {
      caja.innerHTML = '<div class="aviso-suave">' + T.soloConRegistro + "</div>";
      $("#pdf").disabled = true; $("#en-app").hidden = true; $("#caja-pdf").hidden = true; $("#estado-pdf").hidden = true;
      lienzo = null;
      return;
    }
    $("#caja-pdf").hidden = false; $("#estado-pdf").hidden = false;
    $("#pdf").disabled = false;
    lienzo = dibujarHoja(H.resumenHoja(res, lang), res.ejemplo);
    var url;
    try { url = lienzo.toDataURL("image/png"); } catch (e) { url = ""; }
    caja.innerHTML = '<p class="indicacion">' + T.indicacion + '</p><img class="hoja-img" id="hoja-img" alt="' + TH.titulo + '" src="' + url + '">';
    // Dentro de Instagram: los números se ponen en el # para que «Abrir en el navegador» los lleve.
    $("#en-app").hidden = !EN_APP;
    $("#pdf").className = EN_APP ? "boton boton-linea" : "boton boton-miel";
    if (EN_APP && H.aHash) { try { history.replaceState(history.state, "", location.pathname + location.search + "#" + H.aHash(estado.entradas)); } catch (e) {} }
  }
  function enlaceConNumeros() {
    return location.origin + location.pathname + "#" + (H.aHash ? H.aHash(estado.entradas) : "");
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

  /* Carta a 150 ppp: 1275 × 1650. Papel blanco para que se imprima bien; banda de la casa arriba. */
  function dibujarHoja(r, esEjemplo) {
    var W = 1275, Hh = 1650, M = 80, c = document.createElement("canvas");
    c.width = W; c.height = Hh;
    var x = c.getContext("2d"), S = "Helvetica, Arial, sans-serif", TT = T.hoja;
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, Hh);
    x.fillStyle = "#08080c"; x.fillRect(0, 0, W, 210);
    var gr = x.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, "#e7b35c"); gr.addColorStop(1, "#22d3ee");
    x.fillStyle = gr; x.fillRect(0, 206, W, 6);
    x.textBaseline = "alphabetic"; x.textAlign = "left";
    x.fillStyle = "#e7b35c"; x.font = "bold 30px " + S; x.fillText("REYES CONNECT", M, 78);
    x.fillStyle = "#f5eedf"; x.font = "bold 66px " + S; x.fillText(r.titulo, M, 160);
    x.textAlign = "right"; x.fillStyle = "#cfc7b6"; x.font = "26px " + S; x.fillText(TT.fecha(new Date()), W - M, 78);
    x.textAlign = "left";
    var y = 270;
    if (esEjemplo) {
      x.fillStyle = "#fbf1de"; x.fillRect(M, y - 38, W - 2 * M, 54);
      x.fillStyle = "#8a5a00"; x.font = "bold 28px " + S; x.fillText(T.ejemploRot, M + 18, y - 2);
      y += 50;
    }
    // Tus números
    x.fillStyle = "#08080c"; x.font = "bold 32px " + S; x.fillText(TT.numeros, M, y); y += 14;
    x.font = "26px " + S;
    r.filas.forEach(function (f) {
      y += 42;
      x.fillStyle = "#2a2a33"; x.textAlign = "left";
      var maxAncho = W - 2 * M - (f[1] ? 220 : 0), txt = f[0];
      while (x.measureText(txt).width > maxAncho && txt.length > 4) txt = txt.slice(0, -2);
      if (txt !== f[0]) txt = txt.replace(/\s*\S*$/, "") + "…";
      x.fillText(txt, M, y);
      if (f[1]) { x.textAlign = "right"; x.font = "bold 26px " + S; x.fillText(f[1], W - M, y); x.font = "26px " + S; }
      x.strokeStyle = "#e6e6ea"; x.lineWidth = 1; x.beginPath(); x.moveTo(M, y + 14); x.lineTo(W - M, y + 14); x.stroke();
    });
    x.textAlign = "left";
    y += 70;
    // Gráfica
    x.fillStyle = "#08080c"; x.font = "bold 32px " + S; x.fillText(TT.grafica, M, y);
    var altoG = Math.max(r.altoMinimo || 260, 1000 - y);
    r.dibujar(x, M, y + 20, W - 2 * M, altoG);
    y += 20 + altoG + 40;
    // Totales
    x.fillStyle = "#08080c"; x.font = "bold 30px " + S; x.fillText(TT.totales, M, y); y += 20;
    var bw = (W - 2 * M - 40) / 3;
    r.totales.forEach(function (t, i) {
      var bx = M + i * (bw + 20);
      x.strokeStyle = i === 0 ? "#e7b35c" : "#22d3ee"; x.lineWidth = 4;
      x.strokeRect(bx, y, bw, 120);
      x.fillStyle = "#55555f"; x.font = "bold 22px " + S;
      envolver(x, t[0], bx + 16, y + 36, bw - 32, 26);
      x.fillStyle = "#08080c"; x.font = "bold 40px " + S; x.fillText(t[1], bx + 16, y + 104);
    });
    y += 170;
    // Hoy aprendiste
    x.fillStyle = "#0e7f93"; x.font = "bold 28px " + S; x.fillText(TT.aprendisteTit, M, y); y += 38;
    x.fillStyle = "#2a2a33"; x.font = "26px " + S;
    y = envolver(x, TT.aprendiste, M, y, W - 2 * M, 34) + 10;
    // Avisos y pie
    x.fillStyle = "#8a5a00"; x.font = "bold 24px " + S;
    y = envolver(x, TT.aviso, M, y, W - 2 * M, 30);
    x.fillStyle = "#2a2a33"; x.font = "24px " + S;
    y = envolver(x, TT.tuTelefono, M, y, W - 2 * M, 30);
    y = envolver(x, TT.pedir, M, y + 6, W - 2 * M, 30);
    var pieY = Math.max(y + 20, Hh - 110);
    x.strokeStyle = "#d5d5db"; x.lineWidth = 2; x.beginPath(); x.moveTo(M, pieY - 32); x.lineTo(W - M, pieY - 32); x.stroke();
    x.fillStyle = "#55555f"; x.font = "21px " + S;
    envolver(x, T.licencia, M, pieY, W - 2 * M, 28);
    return c;
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

  $("#pdf").addEventListener("click", function () {
    var est = $("#estado-pdf");
    if (!lienzo) pintarHoja();
    if (!lienzo) return;
    var bytes = pdfDesdeLienzo(lienzo), nombre = T.hoja.archivo;
    var blob = new Blob([bytes], { type: "application/pdf" });
    var archivo = null;
    try { archivo = new File([blob], nombre, { type: "application/pdf" }); } catch (e) {}
    var telefono = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent || "");
    if (telefono && archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) {
      navigator.share({ files: [archivo], title: TH.titulo }).then(function () { est.textContent = T.pdfListo; })
        .catch(function (e) { if (e && e.name !== "AbortError") bajar(); });
      return;
    }
    bajar();
    function bajar() {
      try {
        var u = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
        // No sabemos si bajó: no se dice «Listo» a ciegas.
        est.textContent = EN_APP ? T.pdfNo : T.pdfAyuda;
      } catch (e) { est.textContent = T.pdfNo; }
    }
  });

  $("#borrar").addEventListener("click", function () {
    try { localStorage.removeItem(CLAVE); } catch (e) {}
    var reg = estado.registro;
    estado = { entradas: H.vacio(), paso: 1, anio: 0 };
    if (reg) estado.registro = reg; // solo la marca de que abrió el registro, sin números
    lienzo = null;
    guardar();
    try { history.replaceState(history.state, "", location.pathname + location.search); } catch (e) {}
    $("#en-app").hidden = true;
    $("#hoja-caja").innerHTML = '<div class="aviso-ok">' + T.borrado + "</div>";
    $("#pdf").disabled = true;
  });

  // Para pruebas locales (no envía nada): construye el PDF y lo devuelve en bytes.
  window.RC.puerta = { estado: function () { return estado; }, pdf: function () { if (!lienzo) pintarHoja(); return lienzo ? pdfDesdeLienzo(lienzo) : null; }, irA: irA };

  try { history.replaceState({ paso: estado.paso }, ""); } catch (e) {}
  irA(estado.paso, true, true);
  if (volvioRegistrado) $("#gracias").hidden = false;
})();
